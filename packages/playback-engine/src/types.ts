// ────────────────────────────────────────────
// @motif/playback-engine — types
// ────────────────────────────────────────────

/** Load state for the asset cache */
export type LoadState = "idle" | "loading" | "loaded" | "error";

/** Individual stem playback handle */
export interface StemHandle {
  stemId: string;
  assetId: string;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  muted: boolean;
  solo: boolean;
  userGainDb: number;
  playing: boolean;
}

/** Overall transport state */
export type TransportState = "stopped" | "playing" | "loading" | "error";

/** Playback engine state snapshot */
export interface PlaybackSnapshot {
  transport: TransportState;
  currentSceneId: string | null;
  stemHandles: ReadonlyMap<string, StemHandle>;
  loadState: LoadState;
  loadProgress: number; // 0..1
  errorMessage: string | null;
}

/** Options for scene playback */
export interface PlaySceneOptions {
  sceneId: string;
  /** If true, skip transition logic and hard-cut */
  immediate?: boolean;
}

/** Sequence playback state */
export interface SequencePlaybackState {
  playing: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

/** Event types emitted by the engine */
export type PlaybackEventType =
  | "transport-change"
  | "scene-change"
  | "stem-change"
  | "load-progress"
  | "sequence-step"
  | "error"
  | "cue-section"
  | "cue-bar"
  | "cue-end"
  | "cue-loop"
  | "capture-start"
  | "capture-event"
  | "capture-stop"
  | "transition-start"
  | "metronome-change";

export interface PlaybackEvent {
  type: PlaybackEventType;
  detail?: unknown;
}

export type PlaybackListener = (event: PlaybackEvent) => void;
