// ────────────────────────────────────────────
// ClipPlayer — plays a single clip through the instrument rack
// ────────────────────────────────────────────

import type { Clip, ClipNote } from "@motif-studio/schema";
import type { InstrumentRack } from "@motif-studio/instrument-rack";
import type { Voice } from "@motif-studio/instrument-rack";
import { scheduleNotes, clipLengthSeconds } from "./scheduler.js";
import type { ClipPlaybackState } from "./types.js";

/**
 * Resolve which notes to play for a clip, considering variant selection.
 */
export function resolveClipNotes(clip: Clip, variantId?: string): readonly ClipNote[] {
  if (!variantId) return clip.notes;
  const variant = clip.variants?.find((v) => v.id === variantId);
  return variant ? variant.notes : clip.notes;
}

/**
 * Plays a single clip at a scheduled AudioContext time,
 * routing notes through the InstrumentRack voice resolved from the clip's instrumentId.
 * Handles looping by re-scheduling the clip when each iteration ends.
 */
export class ClipPlayer {
  private activeVoices: Voice[] = [];
  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private _state: ClipPlaybackState = "stopped";
  private _variantId: string | undefined;

  get state(): ClipPlaybackState {
    return this._state;
  }

  /**
   * Play the clip starting at `startTime` (AudioContext time).
   * If clip.loop is true, re-schedules automatically.
   *
   * @param variantId Optional variant ID to use instead of main notes
   */
  play(
    ctx: AudioContext,
    clip: Clip,
    rack: InstrumentRack,
    output: AudioNode,
    startTime?: number,
    variantId?: string,
  ): void {
    this.stop();

    const voice = rack.getVoice(clip.instrumentId);
    if (!voice) return;

    this._variantId = variantId;
    const now = startTime ?? ctx.currentTime;
    this._state = "playing";

    const notes = resolveClipNotes(clip, variantId);
    this.scheduleClipNotes(ctx, notes, clip.bpm, voice, output, now);

    if (clip.loop) {
      this.scheduleLoop(ctx, clip, rack, output, now);
    }
  }

  /** Stop playback and cancel any pending loop */
  stop(): void {
    for (const v of this.activeVoices) {
      try {
        v.stop();
      } catch {
        // Voice may already be stopped
      }
    }
    this.activeVoices = [];

    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this._state = "stopped";
  }

  private scheduleClipNotes(
    ctx: AudioContext,
    notes: readonly ClipNote[],
    bpm: number,
    instrumentVoice: { playNote: (ctx: AudioContext, pitch: number, velocity: number, startTime: number, duration: number, output: AudioNode) => Voice },
    output: AudioNode,
    startTime: number,
  ): void {
    const scheduled = scheduleNotes(notes, bpm, startTime);

    for (const note of scheduled) {
      const v = instrumentVoice.playNote(
        ctx,
        note.pitch,
        note.velocity,
        note.startTime,
        note.duration,
        output,
      );
      this.activeVoices.push(v);
    }
  }

  private scheduleLoop(
    ctx: AudioContext,
    clip: Clip,
    rack: InstrumentRack,
    output: AudioNode,
    loopStartTime: number,
  ): void {
    const clipDuration = clipLengthSeconds(clip.bpm, clip.lengthBeats);
    // Schedule next iteration slightly before it's needed
    const msUntilNextLoop = (loopStartTime + clipDuration - ctx.currentTime) * 1000;

    // Don't schedule if it's in the past (shouldn't happen but be safe)
    if (msUntilNextLoop < 0) return;

    this.loopTimer = setTimeout(() => {
      if (this._state !== "playing") return;

      const voice = rack.getVoice(clip.instrumentId);
      if (!voice) return;

      const nextStartTime = loopStartTime + clipDuration;
      const notes = resolveClipNotes(clip, this._variantId);
      this.scheduleClipNotes(ctx, notes, clip.bpm, voice, output, nextStartTime);
      this.scheduleLoop(ctx, clip, rack, output, nextStartTime);
    }, Math.max(0, msUntilNextLoop - 100)); // 100ms lookahead
  }
}
