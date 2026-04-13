// ────────────────────────────────────────────
// @motif/clip-engine — types
// ────────────────────────────────────────────

export type ClipPlaybackState = "stopped" | "playing" | "scheduled";

/** Handle to a playing clip, allowing stop/state queries */
export interface ClipPlaybackHandle {
  clipId: string;
  state: ClipPlaybackState;
  stop: () => void;
}

/** Timing constants */
export const TICKS_PER_BEAT = 480;
export const TICKS_PER_16TH = 120;
export const TICKS_PER_8TH = 240;
