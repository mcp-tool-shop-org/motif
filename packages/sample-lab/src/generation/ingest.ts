import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import type {
  AudioAsset,
  Cue,
  GeneratedCueRecord,
  GenerationParams,
  GenerationStemLayer,
  GenerationStemRole,
  MeasuredAudioFacts,
  Scene,
  Stem,
} from "@motif-studio/schema";
import {
  MUSIC_BED_TARGET_LUFS,
  RESAMPLER_NAME,
  RESAMPLER_QUALITY,
  RUNTIME_SAMPLE_RATE_HZ,
  SFX_CEILING_LUFS,
} from "./constants.js";
import { decodeFlacPcm, type FlacDecoderFn, type FlacPcm } from "./decode.js";
import { GenerationError } from "./errors.js";
import { durationMsFromStreamInfo, parseFlacStreamInfo } from "./flac-header.js";
import { sha256Hex } from "./hash.js";
import { durationBarsFromSeconds, parseBeatsPerBar, parseKeyscale } from "./keyscale.js";
import { parseIntegratedLufs } from "./lufs.js";
import { applyGain, ingestGainDb, resolveSharedGain, scalePlanar } from "./normalize.js";
import { resamplePlanar, resampledSampleCount } from "./resample.js";
import { scanRunArtifact } from "./scan.js";
import {
  assertStemDurationsMatchMix,
  assertStemSampleCountsEqual,
  isNearSilent,
  rmsOf,
} from "./stems.js";
import { encodeWav24 } from "./wav.js";

export interface IngestOptions {
  id: string;
  name?: string;
  destDir: string;
  generation: GenerationParams;
  /**
   * Ingest loudness target written into the cue record and used for gain.
   * Music: bed target (default −14). SFX: ceiling, never boost (default −14).
   */
  targetLufs?: number;
  /** When true (default), [inst] vocals that are not near-silent throw VOCAL_BLEED. */
  failOnVocalBleed?: boolean;
  /**
   * Re-decode and re-write even when a previous ingest of the same inputs is on
   * disk. The cache keys on input hashes, so this is only needed to prove the
   * pipeline still reproduces its own output.
   */
  force?: boolean;
  /** Called instead of the work when a take is served from a previous ingest. */
  onCacheHit?: (id: string) => void;
  decodeFlac?: FlacDecoderFn;
  now?: () => string;
}

export interface IngestResult {
  record: GeneratedCueRecord;
  assets: AudioAsset[];
  stems: Stem[];
  scene?: Scene;
  cue?: Cue;
}

const STEM_ROLES: GenerationStemRole[] = ["bass", "drums", "other", "vocals"];

const STEM_TO_MOTIF_ROLE: Record<GenerationStemRole, Stem["role"]> = {
  bass: "base",
  drums: "accent",
  other: "accent",
  vocals: "accent",
};

function mergeGeneration(
  dirFile: string | undefined,
  given: GenerationParams,
): GenerationParams {
  let fromFile: Partial<GenerationParams> = {};
  if (dirFile) {
    fromFile = JSON.parse(readFileSync(dirFile, "utf-8")) as Partial<GenerationParams>;
  }
  const merged: GenerationParams = {
    ...fromFile,
    ...given,
    seed: given.seed ?? fromFile.seed!,
    workflowId: given.workflowId || fromFile.workflowId!,
    jobId: given.jobId || fromFile.jobId!,
  };
  if (merged.seed == null || !merged.workflowId || !merged.jobId) {
    throw new GenerationError(
      "GENERATION_IDENTITY",
      "generation record needs seed, workflowId, and jobId",
    );
  }
  return merged;
}

function factsFrom(
  bytes: Uint8Array,
  filename: string,
  lufs?: number,
): MeasuredAudioFacts {
  const info = parseFlacStreamInfo(bytes);
  return {
    durationSec: info.durationSec,
    durationSamples: info.totalSamples,
    sampleRateHz: info.sampleRateHz,
    channels: info.channels,
    bitDepth: info.bitDepth,
    integratedLufs: lufs,
    sha256: sha256Hex(bytes),
    sourceFilename: basename(filename),
  };
}

async function toRuntimePcm(
  bytes: Uint8Array,
  headerRate: number,
  decode: FlacDecoderFn,
): Promise<Float32Array[]> {
  const pcm: FlacPcm = await decode(bytes);
  const planar = pcm.channelData;
  if (pcm.sampleRate !== headerRate) {
    throw new GenerationError(
      "FLAC_RATE_MISMATCH",
      `Decoder rate ${pcm.sampleRate} != STREAMINFO ${headerRate}`,
    );
  }
  if (pcm.sampleRate === RUNTIME_SAMPLE_RATE_HZ) return planar;
  return resamplePlanar(planar, pcm.sampleRate, RUNTIME_SAMPLE_RATE_HZ);
}

function writeMaster(destDir: string, filename: string, channels: Float32Array[]): string {
  const masters = join(destDir, "masters");
  mkdirSync(masters, { recursive: true });
  const src = join(masters, filename);
  writeFileSync(src, encodeWav24(channels, RUNTIME_SAMPLE_RATE_HZ));
  return src.replace(/\\/g, "/");
}

const RECORD_FILENAME = "cue.json";

function writeRecord(destDir: string, record: GeneratedCueRecord): void {
  writeFileSync(
    join(destDir, RECORD_FILENAME),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf-8",
  );
}

/** Master path this ingest would write for a stored `masterSrc`, wherever destDir is now. */
function masterPathFor(destDir: string, storedSrc: string): string {
  return join(destDir, "masters", basename(storedSrc));
}

/**
 * Reuse a previous ingest of the same inputs, or return undefined.
 *
 * The expensive half of an ingest — decode, resample, gain, 24-bit encode, five
 * ~17 MB writes — is a pure function of the input FLACs and the loudness target.
 * Every one of those inputs is already content-addressed in the persisted
 * record: `facts.sha256` per FLAC, plus the generation identity and
 * `targetLufs`. So a run whose inputs hash the same, whose target matches, and
 * whose masters are all still on disk has nothing to recompute.
 *
 * Hashing the inputs costs one sequential read of the source FLACs; the work it
 * skips costs a decode and roughly 86 MB of writes. Any mismatch — a re-pointed
 * job id, a different target, one deleted master — falls through to a full
 * ingest, so the cache can only ever be a speed-up, never a source of truth.
 */
function loadCachedIngest(
  destDir: string,
  id: string,
  name: string,
  scanned: ReturnType<typeof scanRunArtifact>,
  generation: GenerationParams,
  targetLufs: number,
): GeneratedCueRecord | undefined {
  const recordPath = join(destDir, RECORD_FILENAME);
  if (!existsSync(recordPath)) return undefined;

  let record: GeneratedCueRecord;
  try {
    record = JSON.parse(readFileSync(recordPath, "utf-8")) as GeneratedCueRecord;
  } catch {
    return undefined; // Truncated by an interrupted run — redo it.
  }

  // Ids and the display name are baked into every derived asset, stem, scene
  // and cue, so a record written under a different id or name cannot be reused
  // under this one.
  if (record.id !== id || record.name !== name) return undefined;
  if (record.kind !== scanned.kind) return undefined;
  if (record.targetLufs !== targetLufs) return undefined;
  if (
    record.generation?.jobId !== generation.jobId ||
    record.generation?.seed !== generation.seed ||
    record.generation?.workflowId !== generation.workflowId
  ) {
    return undefined;
  }
  if (record.runtimeSampleRateHz !== RUNTIME_SAMPLE_RATE_HZ) return undefined;
  if (record.resampler?.name !== RESAMPLER_NAME) return undefined;
  if (record.resampler?.quality !== RESAMPLER_QUALITY) return undefined;

  // Every output still present, and every input still hashing the same.
  const pairs: Array<{ sourcePath: string; storedSha: string; storedSrc: string }> = [];
  if (record.kind === "sfx") {
    if (!record.sfx || !scanned.sfx) return undefined;
    pairs.push({
      sourcePath: scanned.sfx,
      storedSha: record.sfx.facts.sha256,
      storedSrc: record.sfx.masterSrc,
    });
  } else {
    if (!record.mix || !record.stems || !scanned.mix || !scanned.stems) return undefined;
    if (record.stems.length !== STEM_ROLES.length) return undefined;
    pairs.push({
      sourcePath: scanned.mix,
      storedSha: record.mix.facts.sha256,
      storedSrc: record.mix.masterSrc,
    });
    for (const layer of record.stems) {
      const sourcePath = scanned.stems[layer.role];
      if (!sourcePath) return undefined;
      pairs.push({
        sourcePath,
        storedSha: layer.facts.sha256,
        storedSrc: layer.masterSrc,
      });
    }
  }

  const rebound: Record<string, string> = {};
  for (const { sourcePath, storedSha, storedSrc } of pairs) {
    const masterPath = masterPathFor(destDir, storedSrc);
    if (!existsSync(masterPath) || !existsSync(sourcePath)) return undefined;
    if (!storedSha) return undefined;
    if (sha256Hex(new Uint8Array(readFileSync(sourcePath))) !== storedSha) return undefined;
    rebound[storedSrc] = masterPath.replace(/\\/g, "/");
  }

  // Re-point masters at this destDir so a moved or renamed checkout still resolves.
  const bind = (src: string): string => rebound[src] ?? src;
  return {
    ...record,
    generation,
    ...(record.sfx ? { sfx: { ...record.sfx, masterSrc: bind(record.sfx.masterSrc) } } : {}),
    ...(record.mix ? { mix: { ...record.mix, masterSrc: bind(record.mix.masterSrc) } } : {}),
    ...(record.stems
      ? { stems: record.stems.map((s) => ({ ...s, masterSrc: bind(s.masterSrc) })) }
      : {}),
  };
}

/** Instrumental runs must demux to a near-silent vocals stem; anything else is bleed. */
function assertNoVocalBleed(
  stems: GenerationStemLayer[] | undefined,
  lyricsTag: string | undefined,
  enabled: boolean,
): void {
  if (!enabled || lyricsTag !== "[inst]") return;
  const vocals = stems?.find((l) => l.role === "vocals");
  if (vocals && !vocals.nearSilent) {
    throw new GenerationError(
      "VOCAL_BLEED",
      "Instrumental track expected a near-silent vocals stem (bleed check failed)",
    );
  }
}

function makeAsset(
  id: string,
  name: string,
  src: string,
  durationMs: number,
  generation: GenerationParams,
  kind: AudioAsset["kind"],
  sourceType: AudioAsset["sourceType"],
  extraTags: string[],
): AudioAsset {
  return {
    id,
    name,
    src,
    kind,
    durationMs,
    bpm: generation.bpm,
    key: generation.keyscale,
    imported: true,
    originalFilename: basename(src),
    sourceType,
    tags: ["generation", ...extraTags],
  };
}

/**
 * Rebuild everything an ingest returns besides the record itself.
 *
 * Assets, stems, the scene and the cue are pure functions of the record — ids
 * are templated off `record.id`, durations come from the measured facts the
 * record already carries, and `nearSilent` was decided at normalization time
 * and stored on the layer. Deriving them in one place is what lets a cached
 * ingest reuse a persisted `cue.json` without the fresh and cached paths
 * drifting apart: both call this, so there is only one definition.
 */
export function deriveIngestResult(record: GeneratedCueRecord): IngestResult {
  const { id, name, generation } = record;
  const durationMsOf = (facts: MeasuredAudioFacts): number =>
    durationMsFromStreamInfo({
      sampleRateHz: facts.sampleRateHz,
      channels: facts.channels,
      bitDepth: facts.bitDepth,
      totalSamples: facts.durationSamples,
      durationSec: facts.durationSec,
    });

  if (record.kind === "sfx") {
    if (!record.sfx) {
      throw new GenerationError("ARTIFACT_LAYOUT", "sfx record is missing its sfx asset");
    }
    const asset = makeAsset(
      `${id}-sfx`,
      name,
      record.sfx.masterSrc,
      durationMsOf(record.sfx.facts),
      generation,
      "oneshot",
      "fx",
      ["generation:sfx"],
    );
    return { record, assets: [asset], stems: [] };
  }

  if (!record.mix || !record.stems) {
    throw new GenerationError("ARTIFACT_LAYOUT", "music record needs mix + stems");
  }

  const assets: AudioAsset[] = [
    makeAsset(
      `${id}-mix`,
      `${name} mix`,
      record.mix.masterSrc,
      durationMsOf(record.mix.facts),
      generation,
      "loop",
      "tonal",
      ["generation:mix"],
    ),
  ];
  const motifStems: Stem[] = [];

  for (const layer of record.stems) {
    const assetId = `${id}-${layer.role}`;
    assets.push(
      makeAsset(
        assetId,
        `${name} ${layer.role}`,
        layer.masterSrc,
        durationMsOf(layer.facts),
        generation,
        "loop",
        layer.role === "drums" ? "drums" : layer.role === "other" ? "texture" : "tonal",
        [`generation:${layer.role}`],
      ),
    );
    motifStems.push({
      id: `${id}-stem-${layer.role}`,
      name: `${name} ${layer.role}`,
      assetId,
      role: STEM_TO_MOTIF_ROLE[layer.role],
      loop: true,
      mutedByDefault: layer.role === "vocals",
      tags: ["generation", `generation:${layer.role}`],
    });
  }

  const sceneId = record.sceneId ?? `${id}-scene`;
  const scene: Scene = {
    id: sceneId,
    name: `${name} scene`,
    category: "exploration",
    layers: motifStems.map((s) => ({ stemId: s.id })),
    tags: ["generation"],
  };

  const beatsPerBar = parseBeatsPerBar(generation.timesignature);
  const parsedKey = generation.keyscale ? parseKeyscale(generation.keyscale) : undefined;
  const bpm = generation.bpm!;
  const cue: Cue = {
    id: record.cueId ?? `${id}-cue`,
    name,
    bpm,
    keyRoot: parsedKey?.keyRoot,
    keyScale: parsedKey?.keyScale,
    beatsPerBar,
    sections: [
      {
        id: `${id}-body`,
        name: "body",
        role: "body",
        durationBars: durationBarsFromSeconds(record.mix.facts.durationSec, bpm, beatsPerBar),
        sceneId,
      },
    ],
    tags: ["generation"],
  };

  return { record, assets, stems: motifStems, scene, cue };
}

/**
 * Consume a run-artifact folder (mix + stems + SFX FLACs + LUFS txt)
 * and emit 48 kHz normalized masters plus a GeneratedCueRecord.
 */
export async function ingestRunArtifact(
  artifactDir: string,
  options: IngestOptions,
): Promise<IngestResult> {
  const scanned = scanRunArtifact(artifactDir);
  const generation = mergeGeneration(scanned.generationJson, options.generation);
  const decode = options.decodeFlac ?? decodeFlacPcm;
  const createdAt = options.now?.() ?? new Date().toISOString();
  const name = options.name ?? options.id;
  mkdirSync(options.destDir, { recursive: true });

  const lufs = parseIntegratedLufs(readFileSync(scanned.lufs, "utf-8"));
  const targetLufs =
    options.targetLufs ??
    (scanned.kind === "music" ? MUSIC_BED_TARGET_LUFS : SFX_CEILING_LUFS);
  const gainDb = ingestGainDb(scanned.kind, lufs, targetLufs, targetLufs);

  if (scanned.kind === "music" && !(generation.bpm != null && generation.bpm > 0)) {
    throw new GenerationError(
      "GENERATION_BPM",
      "music ingest requires authored bpm (generation identity, not a 120 fallback)",
    );
  }

  if (!options.force) {
    const cached = loadCachedIngest(
      options.destDir,
      options.id,
      name,
      scanned,
      generation,
      targetLufs,
    );
    if (cached) {
      assertNoVocalBleed(cached.stems, generation.lyricsTag, options.failOnVocalBleed ?? true);
      options.onCacheHit?.(options.id);
      return deriveIngestResult(cached);
    }
  }

  if (scanned.kind === "sfx" && scanned.sfx) {
    const bytes = new Uint8Array(readFileSync(scanned.sfx));
    const facts = factsFrom(bytes, scanned.sfx, lufs);
    const pcm = await toRuntimePcm(bytes, facts.sampleRateHz, decode);
    const gained = applyGain(pcm, gainDb);
    const masterSrc = writeMaster(options.destDir, `${options.id}.wav`, gained.channels);
    const record: GeneratedCueRecord = {
      id: options.id,
      name,
      kind: "sfx",
      generation,
      sfx: { assetId: `${options.id}-sfx`, facts, masterSrc },
      targetLufs,
      gainDb,
      actualGainDb: gained.actualGainDb,
      peakLimited: gained.peakLimited,
      ...(gained.boostCapped ? { boostCapped: true } : {}),
      resampler: { name: RESAMPLER_NAME, quality: RESAMPLER_QUALITY },
      runtimeSampleRateHz: RUNTIME_SAMPLE_RATE_HZ,
      createdAt,
    };
    writeRecord(options.destDir, record);
    return deriveIngestResult(record);
  }

  if (!scanned.mix || !scanned.stems) {
    throw new GenerationError("ARTIFACT_LAYOUT", "Music ingest needs mix + 4 stems");
  }

  const mixBytes = new Uint8Array(readFileSync(scanned.mix));
  const mixFacts = factsFrom(mixBytes, scanned.mix, lufs);

  const stemEntries: Array<{
    role: GenerationStemRole;
    path: string;
    bytes: Uint8Array;
    facts: MeasuredAudioFacts;
  }> = STEM_ROLES.map((role) => {
    const path = scanned.stems![role];
    const bytes = new Uint8Array(readFileSync(path));
    return { role, path, bytes, facts: factsFrom(bytes, path) };
  });

  assertStemSampleCountsEqual(
    stemEntries.map((s) => ({ role: s.role, samples: s.facts.durationSamples })),
  );
  assertStemDurationsMatchMix(
    mixFacts.durationSec,
    stemEntries.map((s) => ({ role: s.role, durationSec: s.facts.durationSec })),
  );

  const mixPcm = await toRuntimePcm(mixBytes, mixFacts.sampleRateHz, decode);
  const preparedStems: Array<{
    stem: (typeof stemEntries)[number];
    pcm: Float32Array[];
    resampled: number;
  }> = [];
  for (const stem of stemEntries) {
    const pcm = await toRuntimePcm(stem.bytes, stem.facts.sampleRateHz, decode);
    const resampled = resampledSampleCount(
      stem.facts.durationSamples,
      stem.facts.sampleRateHz,
      RUNTIME_SAMPLE_RATE_HZ,
    );
    if (pcm[0]!.length !== resampled) {
      throw new GenerationError(
        "RESAMPLE_COUNT",
        `${stem.role} resampled to ${pcm[0]!.length}, expected ${resampled}`,
      );
    }
    preparedStems.push({ stem, pcm, resampled });
  }

  const shared = resolveSharedGain(
    [mixPcm, ...preparedStems.map((s) => s.pcm)],
    gainDb,
  );
  const mixGained = scalePlanar(mixPcm, shared.actualLinear);
  const mixMaster = writeMaster(options.destDir, `${options.id}-mix.wav`, mixGained);
  const mixRms = rmsOf(mixGained);

  const layers: GenerationStemLayer[] = [];

  for (const { stem, pcm, resampled } of preparedStems) {
    const gained = scalePlanar(pcm, shared.actualLinear);
    const masterSrc = writeMaster(
      options.destDir,
      `${options.id}-${stem.role}.wav`,
      gained,
    );
    const nearSilent =
      stem.role === "vocals"
        ? isNearSilent(gained, mixRms)
        : isNearSilent(gained);
    layers.push({
      role: stem.role,
      assetId: `${options.id}-${stem.role}`,
      facts: stem.facts,
      resampledSampleCount: resampled,
      nearSilent,
      masterSrc,
    });
  }

  assertNoVocalBleed(layers, generation.lyricsTag, options.failOnVocalBleed ?? true);

  const record: GeneratedCueRecord = {
    id: options.id,
    name,
    kind: "music",
    generation,
    mix: { assetId: `${options.id}-mix`, facts: mixFacts, masterSrc: mixMaster },
    stems: layers,
    cueId: `${options.id}-cue`,
    sceneId: `${options.id}-scene`,
    targetLufs,
    gainDb,
    actualGainDb: shared.actualGainDb,
    peakLimited: shared.peakLimited,
    ...(shared.boostCapped ? { boostCapped: true } : {}),
    resampler: { name: RESAMPLER_NAME, quality: RESAMPLER_QUALITY },
    runtimeSampleRateHz: RUNTIME_SAMPLE_RATE_HZ,
    createdAt,
  };

  writeRecord(options.destDir, record);
  return deriveIngestResult(record);
}
