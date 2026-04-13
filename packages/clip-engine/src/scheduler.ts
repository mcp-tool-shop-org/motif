// ────────────────────────────────────────────
// Clip Scheduler — converts tick positions to AudioContext time
// ────────────────────────────────────────────

import type { ClipNote, QuantizeMode } from "@motif-studio/schema";
import { TICKS_PER_BEAT } from "./types.js";

/** Resolved note with real-time positions (seconds) */
export interface ScheduledNote {
  pitch: number;
  velocity: number;
  /** AudioContext time to start */
  startTime: number;
  /** Duration in seconds */
  duration: number;
}

/**
 * Convert tick-based clip notes to absolute AudioContext times.
 *
 * @param notes Clip notes (tick-based)
 * @param bpm Beats per minute
 * @param startTime AudioContext time corresponding to tick 0
 * @returns Notes with resolved start/duration in seconds
 */
export function scheduleNotes(
  notes: readonly ClipNote[],
  bpm: number,
  startTime: number,
): ScheduledNote[] {
  const secondsPerTick = 60 / (bpm * TICKS_PER_BEAT);
  return notes.map((n) => ({
    pitch: n.pitch,
    velocity: n.velocity,
    startTime: startTime + n.startTick * secondsPerTick,
    duration: n.durationTicks * secondsPerTick,
  }));
}

/**
 * Get the length of a clip in seconds.
 */
export function clipLengthSeconds(bpm: number, lengthBeats: number): number {
  return (lengthBeats / bpm) * 60;
}

/**
 * Calculate the next quantized launch time.
 *
 * @param currentTime Current AudioContext time
 * @param bpm Tempo
 * @param mode Quantize mode: "none" returns currentTime, "beat" snaps to next beat, "bar" snaps to next bar
 * @param beatsPerBar Beats per bar (default 4)
 * @returns The quantized AudioContext time (always >= currentTime)
 */
export function quantizedLaunchTime(
  currentTime: number,
  bpm: number,
  mode: QuantizeMode,
  beatsPerBar: number = 4,
): number {
  if (mode === "none") return currentTime;

  const secondsPerBeat = 60 / bpm;

  if (mode === "beat") {
    // Snap to the next beat boundary
    const beatIndex = Math.ceil(currentTime / secondsPerBeat);
    return Math.max(currentTime, beatIndex * secondsPerBeat);
  }

  // mode === "bar"
  const secondsPerBar = secondsPerBeat * beatsPerBar;
  const barIndex = Math.ceil(currentTime / secondsPerBar);
  return Math.max(currentTime, barIndex * secondsPerBar);
}
