import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

  if (scanned.kind === "sfx" && scanned.sfx) {
    const bytes = new Uint8Array(readFileSync(scanned.sfx));
    const facts = factsFrom(bytes, scanned.sfx, lufs);
    const pcm = await toRuntimePcm(bytes, facts.sampleRateHz, decode);
    const gained = applyGain(pcm, gainDb);
    const masterSrc = writeMaster(options.destDir, `${options.id}.wav`, gained.channels);
    const durationMs = durationMsFromStreamInfo({
      sampleRateHz: facts.sampleRateHz,
      channels: facts.channels,
      bitDepth: facts.bitDepth,
      totalSamples: facts.durationSamples,
      durationSec: facts.durationSec,
    });
    const asset = makeAsset(
      `${options.id}-sfx`,
      name,
      masterSrc,
      durationMs,
      generation,
      "oneshot",
      "fx",
      ["generation:sfx"],
    );
    const record: GeneratedCueRecord = {
      id: options.id,
      name,
      kind: "sfx",
      generation,
      sfx: { assetId: asset.id, facts, masterSrc },
      targetLufs,
      gainDb,
      actualGainDb: gained.actualGainDb,
      peakLimited: gained.peakLimited,
      resampler: { name: RESAMPLER_NAME, quality: RESAMPLER_QUALITY },
      runtimeSampleRateHz: RUNTIME_SAMPLE_RATE_HZ,
      createdAt,
    };
    writeFileSync(
      join(options.destDir, "cue.json"),
      `${JSON.stringify(record, null, 2)}\n`,
      "utf-8",
    );
    return { record, assets: [asset], stems: [] };
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
  const assets: AudioAsset[] = [];
  const motifStems: Stem[] = [];

  const mixDurationMs = durationMsFromStreamInfo({
    sampleRateHz: mixFacts.sampleRateHz,
    channels: mixFacts.channels,
    bitDepth: mixFacts.bitDepth,
    totalSamples: mixFacts.durationSamples,
    durationSec: mixFacts.durationSec,
  });

  const mixAsset = makeAsset(
    `${options.id}-mix`,
    `${name} mix`,
    mixMaster,
    mixDurationMs,
    generation,
    "loop",
    "tonal",
    ["generation:mix"],
  );
  assets.push(mixAsset);

  for (const { stem, pcm, resampled } of preparedStems) {
    const gained = scalePlanar(pcm, shared.actualLinear);
    const masterSrc = writeMaster(
      options.destDir,
      `${options.id}-${stem.role}.wav`,
      gained,
    );
    const durationMs = durationMsFromStreamInfo({
      sampleRateHz: stem.facts.sampleRateHz,
      channels: stem.facts.channels,
      bitDepth: stem.facts.bitDepth,
      totalSamples: stem.facts.durationSamples,
      durationSec: stem.facts.durationSec,
    });
    const assetId = `${options.id}-${stem.role}`;
    const nearSilent =
      stem.role === "vocals"
        ? isNearSilent(gained, mixRms)
        : isNearSilent(gained);
    assets.push(
      makeAsset(
        assetId,
        `${name} ${stem.role}`,
        masterSrc,
        durationMs,
        generation,
        "loop",
        stem.role === "drums" ? "drums" : stem.role === "other" ? "texture" : "tonal",
        [`generation:${stem.role}`],
      ),
    );
    motifStems.push({
      id: `${options.id}-stem-${stem.role}`,
      name: `${name} ${stem.role}`,
      assetId,
      role: STEM_TO_MOTIF_ROLE[stem.role],
      loop: true,
      mutedByDefault: stem.role === "vocals",
      tags: ["generation", `generation:${stem.role}`],
    });
    layers.push({
      role: stem.role,
      assetId,
      facts: stem.facts,
      resampledSampleCount: resampled,
      nearSilent,
      masterSrc,
    });
  }

  const vocals = layers.find((l) => l.role === "vocals");
  if (generation.lyricsTag === "[inst]" && vocals && !vocals.nearSilent) {
    throw new GenerationError(
      "VOCAL_BLEED",
      "Instrumental track expected a near-silent vocals stem (bleed check failed)",
    );
  }

  const sceneId = `${options.id}-scene`;
  const cueId = `${options.id}-cue`;
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
    id: cueId,
    name,
    bpm,
    keyRoot: parsedKey?.keyRoot,
    keyScale: parsedKey?.keyScale,
    beatsPerBar,
    sections: [
      {
        id: `${options.id}-body`,
        name: "body",
        role: "body",
        durationBars: durationBarsFromSeconds(mixFacts.durationSec, bpm, beatsPerBar),
        sceneId,
      },
    ],
    tags: ["generation"],
  };

  const record: GeneratedCueRecord = {
    id: options.id,
    name,
    kind: "music",
    generation,
    mix: { assetId: mixAsset.id, facts: mixFacts, masterSrc: mixMaster },
    stems: layers,
    cueId,
    sceneId,
    targetLufs,
    gainDb,
    actualGainDb: shared.actualGainDb,
    peakLimited: shared.peakLimited,
    resampler: { name: RESAMPLER_NAME, quality: RESAMPLER_QUALITY },
    runtimeSampleRateHz: RUNTIME_SAMPLE_RATE_HZ,
    createdAt,
  };

  writeFileSync(
    join(options.destDir, "cue.json"),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf-8",
  );

  return { record, assets, stems: motifStems, scene, cue };
}
