// ────────────────────────────────────────────
// Mixer types — mix surface, FX, buses, render
// ────────────────────────────────────────────

/** Available FX types */
export type FxType = "eq" | "delay" | "reverb" | "compressor" | "chorus" | "distortion" | "phaser" | "limiter";

/** Parameters for each FX type */
export interface EqParams {
  type: BiquadFilterType;
  frequency: number;
  gain: number;
  Q: number;
}

export interface DelayParams {
  delayTime: number; // seconds
  feedback: number; // 0..1
  mix: number; // 0..1 dry/wet
}

export interface ReverbParams {
  decayTime: number; // seconds (impulse length)
  mix: number; // 0..1 dry/wet
}

export interface CompressorParams {
  threshold: number; // dB
  ratio: number;
  attack: number; // seconds
  release: number; // seconds
  knee: number; // dB
}

export interface ChorusParams {
  rate: number; // Hz, 0.1-10
  depth: number; // ms, 0-20
  mix: number; // 0-1 dry/wet
}

/** Distortion curve algorithm */
export type DistortionCurve = "soft-clip" | "hard-clip" | "tube";

export interface DistortionParams {
  drive: number; // 0-100
  tone: number; // Hz, filter cutoff post-distortion
  mix: number; // 0-1 dry/wet
  curve: DistortionCurve;
}

export interface PhaserParams {
  rate: number; // Hz, LFO speed
  depth: number; // 0-1
  stages: 2 | 4 | 6; // number of allpass stages
  feedback: number; // 0-0.95
}

export interface LimiterParams {
  ceiling: number; // dBFS, -3 to 0
}

export type FxParams = EqParams | DelayParams | ReverbParams | CompressorParams | ChorusParams | DistortionParams | PhaserParams | LimiterParams;

/** A single FX slot on a bus */
export interface FxSlotState {
  type: FxType;
  params: FxParams;
  bypassed: boolean;
}

/** Bus identifier — includes well-known buses with autocomplete, plus any custom string */
export type BusId = "drums" | "music" | "master" | (string & {});

/** Per-stem mixer state */
export interface StemMixState {
  stemId: string;
  gainDb: number;
  pan: number; // -1 (left) to +1 (right)
  muted: boolean;
  solo: boolean;
  bus: BusId;
  fxSlots?: FxSlotState[];
}

/** Per-bus state */
export interface BusState {
  id: BusId;
  gainDb: number;
  muted: boolean;
  fxSlots: FxSlotState[];
}

/** Full mixer snapshot */
export interface MixerSnapshot {
  stems: StemMixState[];
  buses: BusState[];
  masterGainDb: number;
}

/** Render preset type */
export type RenderPreset = "full-cue" | "loop-only" | "preview-sequence";

/** Supported WAV bit depths */
export type WavBitDepth = 16 | 24 | 32;

/** Supported sample rates */
export type WavSampleRate = 44100 | 48000 | 96000;

/** Export mode: mixed master, individual stems, or both */
export type ExportMode = "mixed" | "stems" | "both";

/** Role tag for a stem in the mix (for engine-side adaptive mixing) */
export type StemExportRole =
  | "melody"
  | "bass"
  | "pad"
  | "percussion"
  | "fx"
  | "accent"
  | "vocal";

/** Metadata for an exported stem file */
export interface StemExportEntry {
  stemId: string;
  stemName: string;
  /** File path relative to pack root (e.g. "stems/sc-explore_bass-line.wav") */
  filePath: string;
  /** Musical role of this stem */
  role: StemExportRole;
  /** Default volume in dB (from the stem's gainDb) */
  defaultGainDb: number;
  /** Default pan position (-1 to 1) */
  defaultPan: number;
  /** Scene this stem belongs to */
  sceneId: string;
}

/** Manifest of all exported stems for a scene */
export interface StemExportManifest {
  sceneId: string;
  sceneName: string;
  mode: ExportMode;
  /** Mixed master file (only if mode is "mixed" or "both") */
  mixedFilePath?: string;
  /** Individual stem files (only if mode is "stems" or "both") */
  stems: StemExportEntry[];
  /** Render settings used */
  sampleRate: WavSampleRate;
  bitDepth: WavBitDepth;
  channels: number;
}

/** Options for cue rendering */
export interface RenderOptions {
  preset: RenderPreset;
  sceneId: string;
  /** Duration in seconds (required for loop-only, optional for full-cue) */
  durationSeconds?: number;
  /** Sample rate for output (default 48000) */
  sampleRate?: WavSampleRate;
  /** Number of channels (default 2) */
  channels?: number;
  /** WAV bit depth: 16, 24, or 32 (float). Default 24. */
  bitDepth?: WavBitDepth;
  /** Export mode: mixed (default), stems, or both */
  exportMode?: ExportMode;
}

/** Result of a cue render */
export interface RenderResult {
  buffer: AudioBuffer;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
}

/** Default FX parameters */
export const DEFAULT_EQ_PARAMS: EqParams = {
  type: "peaking",
  frequency: 1000,
  gain: 0,
  Q: 1,
};

export const DEFAULT_DELAY_PARAMS: DelayParams = {
  delayTime: 0.25,
  feedback: 0.3,
  mix: 0.2,
};

export const DEFAULT_REVERB_PARAMS: ReverbParams = {
  decayTime: 1.5,
  mix: 0.2,
};

export const DEFAULT_COMPRESSOR_PARAMS: CompressorParams = {
  threshold: -24,
  ratio: 4,
  attack: 0.003,
  release: 0.25,
  knee: 30,
};

export const DEFAULT_CHORUS_PARAMS: ChorusParams = {
  rate: 1.5,
  depth: 5,
  mix: 0.5,
};

export const DEFAULT_DISTORTION_PARAMS: DistortionParams = {
  drive: 30,
  tone: 3000,
  mix: 0.5,
  curve: "tube",
};

export const DEFAULT_PHASER_PARAMS: PhaserParams = {
  rate: 0.5,
  depth: 0.6,
  stages: 4,
  feedback: 0.5,
};

export const DEFAULT_LIMITER_PARAMS: LimiterParams = {
  ceiling: -1,
};

export function defaultParamsForFx(type: FxType): FxParams {
  switch (type) {
    case "eq":
      return { ...DEFAULT_EQ_PARAMS };
    case "delay":
      return { ...DEFAULT_DELAY_PARAMS };
    case "reverb":
      return { ...DEFAULT_REVERB_PARAMS };
    case "compressor":
      return { ...DEFAULT_COMPRESSOR_PARAMS };
    case "chorus":
      return { ...DEFAULT_CHORUS_PARAMS };
    case "distortion":
      return { ...DEFAULT_DISTORTION_PARAMS };
    case "phaser":
      return { ...DEFAULT_PHASER_PARAMS };
    case "limiter":
      return { ...DEFAULT_LIMITER_PARAMS };
  }
}
