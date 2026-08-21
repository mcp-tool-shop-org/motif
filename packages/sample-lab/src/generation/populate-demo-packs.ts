import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RUNTIME_SAMPLE_RATE_HZ } from "./constants.js";
import { decodeFlacPcm, type FlacDecoderFn } from "./decode.js";
import { GenerationError } from "./errors.js";
import { peakOf, scalePlanar } from "./normalize.js";
import { resamplePlanar } from "./resample.js";
import { encodeWav16 } from "./wav.js";

/**
 * Library-build day-1 artifact roots (canonical, gitignored, hashed).
 * Music takes: `<take>/<take>-track_mix.flac` + 4 `-stem_<role>.flac`.
 * SFX one-shots: flat `<id>.flac` + `<id>-lufs.txt`.
 */
export const LIBRARY_DAY1_MUSIC_ROOT =
  "E:\\AI\\readouts\\model-knowledge\\generated\\library-day1";

export const LIBRARY_DAY1_SFX_ROOT =
  "E:\\AI\\readouts\\model-knowledge\\generated\\library-day1-sfx";

/**
 * Mixdown ceiling: −1 dBFS linear. Summed stems are only ever scaled DOWN
 * to this peak — a quieter sum is never boosted.
 */
export const MIXDOWN_PEAK_LIMIT = 10 ** (-1 / 20);

/** A source layer of a mixdown: the full track mix or one demucs stem. */
export type MixSource = "mix" | "bass" | "drums" | "other" | "vocals";

/** Demo-pack folder names under `public/audio/library/`. */
export type DemoPackDir = "combat-escalation" | "starter" | "minimal";

export interface MixdownSpec {
  pack: DemoPackDir;
  /** Output WAV filename inside the pack folder. */
  file: string;
  /** Take folder (and filename prefix) under the music artifact root. */
  take: string;
  /** Sources summed sample-wise into this layer. */
  sources: MixSource[];
}

/**
 * Demo-pack mixdown plan — A-takes (odd seeds) only; B-takes stay
 * artifact-only for curation.
 */
export const DEMO_PACK_MIXDOWNS: MixdownSpec[] = [
  // combat-escalation (ce-* A-takes)
  { pack: "combat-escalation", file: "patrol-base.wav", take: "ce-patrol-s1001", sources: ["bass", "other", "vocals"] },
  { pack: "combat-escalation", file: "patrol-perc.wav", take: "ce-patrol-s1001", sources: ["drums"] },
  { pack: "combat-escalation", file: "skirmish-base.wav", take: "ce-skirmish-s1003", sources: ["bass", "drums"] },
  { pack: "combat-escalation", file: "skirmish-strings.wav", take: "ce-skirmish-s1003", sources: ["other", "vocals"] },
  { pack: "combat-escalation", file: "boss-base.wav", take: "ce-boss-s1005", sources: ["bass", "drums", "other"] },
  { pack: "combat-escalation", file: "boss-choir.wav", take: "ce-boss-s1005", sources: ["vocals"] },
  // starter (st-* A-takes)
  { pack: "starter", file: "explore-base.wav", take: "st-explore-s1101", sources: ["bass", "drums", "other"] },
  { pack: "starter", file: "explore-accent.wav", take: "st-explore-s1101", sources: ["vocals"] },
  { pack: "starter", file: "tension-base.wav", take: "st-tension-s1103", sources: ["mix"] },
  { pack: "starter", file: "combat-base.wav", take: "st-combat-s1105", sources: ["bass", "drums"] },
  { pack: "starter", file: "combat-danger.wav", take: "st-combat-s1105", sources: ["other", "vocals"] },
  { pack: "starter", file: "safe-ambient.wav", take: "st-safe-s1107", sources: ["mix"] },
  // minimal
  { pack: "minimal", file: "drone.wav", take: "mn-drone-s1201", sources: ["mix"] },
];

/** One-shots decoded straight to 48 kHz WAV (no mixing, no gain). */
export const DEMO_PACK_SFX_IDS = [
  "gr-stinger-ambush",
  "gr-stinger-casualty",
  "gr-stinger-verdict",
  "gr-stinger-keth",
  "gr-stinger-discovery",
  "gr-stinger-patrol",
  "gr-stinger-victory",
  "gr-stinger-threshold",
  "ce-stinger-engage",
  "ce-stinger-boss",
  "ce-victory-fanfare",
  "st-stinger-combat",
  "st-victory-fanfare",
] as const;

export interface WrittenWav {
  /** Path relative to `public/audio/library/` (forward slashes). */
  relPath: string;
  absPath: string;
  bytes: number;
  /** 48 kHz sample frames. */
  samples: number;
  durationMs: number;
  /** Peak of the (summed) signal before any limiting. */
  peakBefore: number;
  /** True when the sum exceeded −1 dBFS and was scaled down. */
  peakLimited: boolean;
}

export interface PopulateOptions {
  /** `apps/studio/public/audio` — mixdowns land under `library/` inside it. */
  publicAudioRoot: string;
  musicRoot?: string;
  sfxRoot?: string;
  decodeFlac?: FlacDecoderFn;
}

function sourceFile(musicRoot: string, take: string, source: MixSource): string {
  const suffix = source === "mix" ? "track_mix" : `stem_${source}`;
  return join(musicRoot, take, `${take}-${suffix}.flac`);
}

async function decodeTo48k(
  path: string,
  decode: FlacDecoderFn,
): Promise<Float32Array[]> {
  const bytes = new Uint8Array(readFileSync(path));
  const pcm = await decode(bytes);
  if (pcm.sampleRate === RUNTIME_SAMPLE_RATE_HZ) return pcm.channelData;
  return resamplePlanar(pcm.channelData, pcm.sampleRate, RUNTIME_SAMPLE_RATE_HZ);
}

/** Fold any channel count to stereo: mono duplicates, extras are dropped. */
function toStereo(channels: Float32Array[]): [Float32Array, Float32Array] {
  const left = channels[0];
  if (!left) {
    throw new GenerationError("MIXDOWN_EMPTY", "Decoded PCM has no channels");
  }
  return [left, channels[1] ?? left];
}

function sumStereo(layers: Array<[Float32Array, Float32Array]>): Float32Array[] {
  const length = layers[0]![0].length;
  for (const layer of layers) {
    if (layer[0].length !== length) {
      throw new GenerationError(
        "MIXDOWN_MISALIGN",
        `Mixdown sources disagree on length (${layers.map((l) => l[0].length).join(", ")})`,
      );
    }
  }
  const out = [new Float32Array(length), new Float32Array(length)];
  for (const layer of layers) {
    for (let ch = 0; ch < 2; ch++) {
      const src = layer[ch]!;
      const dst = out[ch]!;
      for (let i = 0; i < length; i++) dst[i]! += src[i]!;
    }
  }
  return out;
}

function writeWav(
  absPath: string,
  relPath: string,
  channels: Float32Array[],
  peakBefore: number,
  peakLimited: boolean,
): WrittenWav {
  const wav = encodeWav16(channels, RUNTIME_SAMPLE_RATE_HZ);
  writeFileSync(absPath, wav);
  const samples = channels[0]!.length;
  return {
    relPath,
    absPath: absPath.replace(/\\/g, "/"),
    bytes: wav.byteLength,
    samples,
    durationMs: Math.round((samples / RUNTIME_SAMPLE_RATE_HZ) * 1000),
    peakBefore,
    peakLimited,
  };
}

/** Decode the listed sources, sum them, peak-limit to −1 dBFS (never boost), write 16-bit stereo WAV. */
export async function renderMixdown(
  spec: MixdownSpec,
  options: PopulateOptions,
): Promise<WrittenWav> {
  const musicRoot = options.musicRoot ?? LIBRARY_DAY1_MUSIC_ROOT;
  const decode = options.decodeFlac ?? decodeFlacPcm;
  const layers: Array<[Float32Array, Float32Array]> = [];
  for (const source of spec.sources) {
    const pcm = await decodeTo48k(sourceFile(musicRoot, spec.take, source), decode);
    layers.push(toStereo(pcm));
  }
  let summed = sumStereo(layers);
  const peakBefore = peakOf(summed);
  const peakLimited = peakBefore > MIXDOWN_PEAK_LIMIT;
  if (peakLimited) {
    summed = scalePlanar(summed, MIXDOWN_PEAK_LIMIT / peakBefore);
  }
  const destDir = join(options.publicAudioRoot, "library", spec.pack);
  mkdirSync(destDir, { recursive: true });
  return writeWav(
    join(destDir, spec.file),
    `${spec.pack}/${spec.file}`,
    summed,
    peakBefore,
    peakLimited,
  );
}

/** Straight decode → 48 kHz → 16-bit stereo WAV. No mixing, no gain. */
export async function renderSfx(
  id: string,
  options: PopulateOptions,
): Promise<WrittenWav> {
  const sfxRoot = options.sfxRoot ?? LIBRARY_DAY1_SFX_ROOT;
  const decode = options.decodeFlac ?? decodeFlacPcm;
  const pcm = toStereo(await decodeTo48k(join(sfxRoot, `${id}.flac`), decode));
  const destDir = join(options.publicAudioRoot, "library", "stingers");
  mkdirSync(destDir, { recursive: true });
  return writeWav(
    join(destDir, `${id}.wav`),
    `stingers/${id}.wav`,
    [pcm[0], pcm[1]],
    peakOf([pcm[0], pcm[1]]),
    false,
  );
}

/**
 * Render every demo-pack mixdown plus all 13 stinger/fanfare one-shots into
 * `<publicAudioRoot>/library/`. Returns the written files in plan order.
 */
export async function populateDemoPacks(
  options: PopulateOptions,
): Promise<WrittenWav[]> {
  const written: WrittenWav[] = [];
  for (const spec of DEMO_PACK_MIXDOWNS) {
    written.push(await renderMixdown(spec, options));
  }
  for (const id of DEMO_PACK_SFX_IDS) {
    written.push(await renderSfx(id, options));
  }
  return written;
}
