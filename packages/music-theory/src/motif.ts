// ────────────────────────────────────────────
// Motif transforms — transpose, invert, reverse, stretch
// ────────────────────────────────────────────

import type { NoteEvent, Key } from "./types.js";
import { snapToScale, transposeDiatonic } from "./scales.js";

/** Transpose all notes by semitones */
export function transpose(notes: readonly NoteEvent[], semitones: number): NoteEvent[] {
  return notes.map((n) => ({
    ...n,
    pitch: Math.max(0, Math.min(127, n.pitch + semitones)),
  }));
}

/** Transpose within a key by scale degrees (diatonic transposition) */
export function transposeInKey(notes: readonly NoteEvent[], degrees: number, key: Key): NoteEvent[] {
  return notes.map((n) => ({
    ...n,
    pitch: transposeDiatonic(n.pitch, degrees, key),
  }));
}

/** Invert melodically around a pivot pitch */
export function invert(notes: readonly NoteEvent[], pivot?: number): NoteEvent[] {
  if (notes.length === 0) return [];
  const p = pivot ?? notes[0].pitch;
  return notes.map((n) => ({
    ...n,
    pitch: Math.max(0, Math.min(127, 2 * p - n.pitch)),
  }));
}

/** Reverse the order of notes in time (mirror start positions) */
export function reverse(notes: readonly NoteEvent[]): NoteEvent[] {
  if (notes.length === 0) return [];
  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
  const first = sorted[0].startTick;
  const last = sorted[sorted.length - 1].startTick + sorted[sorted.length - 1].durationTicks;
  const totalLen = last - first;

  return sorted.map((n) => ({
    ...n,
    startTick: first + totalLen - (n.startTick - first) - n.durationTicks,
  }));
}

/** Octave shift — move all notes up/down by octaves */
export function octaveShift(notes: readonly NoteEvent[], octaves: number): NoteEvent[] {
  return transpose(notes, octaves * 12);
}

/** Rhythm stretch/compress — multiply all tick positions and durations */
export function rhythmScale(notes: readonly NoteEvent[], factor: number): NoteEvent[] {
  return notes.map((n) => ({
    ...n,
    startTick: Math.round(n.startTick * factor),
    durationTicks: Math.max(1, Math.round(n.durationTicks * factor)),
  }));
}

/** Duplicate with variation: slight pitch offset + velocity jitter */
export function duplicateWithVariation(
  notes: readonly NoteEvent[],
  options?: { pitchJitter?: number; velocityJitter?: number; timingJitter?: number },
): NoteEvent[] {
  const pj = options?.pitchJitter ?? 0;
  const vj = options?.velocityJitter ?? 10;
  const tj = options?.timingJitter ?? 0;

  // Deterministic pseudo-random based on note index
  return notes.map((n, i) => {
    const seed = ((i * 7 + 13) * 31) % 100;
    const pitchOffset = pj > 0 ? Math.round((seed / 100 - 0.5) * 2 * pj) : 0;
    const velOffset = Math.round(((seed / 100) - 0.5) * 2 * vj);
    const timeOffset = tj > 0 ? Math.round(((seed / 100) - 0.5) * 2 * tj) : 0;
    return {
      ...n,
      pitch: Math.max(0, Math.min(127, n.pitch + pitchOffset)),
      velocity: Math.max(1, Math.min(127, n.velocity + velOffset)),
      startTick: Math.max(0, n.startTick + timeOffset),
    };
  });
}

/** Transpose + snap: transpose then snap all notes back to a key */
export function transposeAndSnap(notes: readonly NoteEvent[], semitones: number, key: Key): NoteEvent[] {
  return transpose(notes, semitones).map((n) => ({
    ...n,
    pitch: snapToScale(n.pitch, key),
  }));
}
