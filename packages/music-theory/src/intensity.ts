// ────────────────────────────────────────────
// Intensity transforms — derive low/mid/high versions
// ────────────────────────────────────────────

import type { NoteEvent, Key, IntensityTier } from "./types.js";
import { snapToScale } from "./scales.js";
import { thinNotes, densifyNotes, accentEveryN, addGhostHits, removeGhostHits } from "./variation.js";
import { octaveShift } from "./motif.js";

export interface IntensityOptions {
  key?: Key;
  /** Ticks per 16th note (default 120) */
  ticksPer16th?: number;
}

/** Derive a low-intensity version: thin, soft, no ghosts */
export function lowIntensity(notes: readonly NoteEvent[]): NoteEvent[] {
  let result = removeGhostHits([...notes], 50);
  result = thinNotes(result, 2);
  // Soften velocity
  result = result.map((n) => ({
    ...n,
    velocity: Math.max(1, Math.round(n.velocity * 0.65)),
  }));
  return result;
}

/** Derive a mid-intensity version: original with slight accent */
export function midIntensity(notes: readonly NoteEvent[]): NoteEvent[] {
  let result = [...notes];
  result = accentEveryN(result, 4, 10);
  return result;
}

/** Derive a high-intensity version: add octave doubling, density, ghosts */
export function highIntensity(notes: readonly NoteEvent[], opts?: IntensityOptions): NoteEvent[] {
  const ticks16 = opts?.ticksPer16th ?? 120;
  let result = [...notes];

  // Add octave doublings
  const doubled = octaveShift(notes, 1).map((n) => ({
    ...n,
    velocity: Math.max(1, n.velocity - 15),
  }));
  result = [...result, ...doubled];

  // Add density (subdivide some)
  result = densifyNotes(result, 2, ticks16);

  // Accent heavily
  result = accentEveryN(result, 2, 20);

  // Add ghost hits for flavor
  result = addGhostHits(result, 40, Math.round(ticks16 / 2));

  // Snap to key if provided
  const key = opts?.key;
  if (key) {
    result = result.map((n) => ({
      ...n,
      pitch: snapToScale(n.pitch, key),
    }));
  }

  // Clamp all values
  return result.map((n) => ({
    ...n,
    pitch: Math.max(0, Math.min(127, n.pitch)),
    velocity: Math.max(1, Math.min(127, n.velocity)),
    startTick: Math.max(0, n.startTick),
    durationTicks: Math.max(1, n.durationTicks),
  }));
}

/** Derive a version at a given intensity tier */
export function deriveIntensity(
  notes: readonly NoteEvent[],
  tier: IntensityTier,
  opts?: IntensityOptions,
): NoteEvent[] {
  switch (tier) {
    case "low":  return lowIntensity(notes);
    case "mid":  return midIntensity(notes);
    case "high": return highIntensity(notes, opts);
  }
}

/** Increase chord tension: raise 5th by a semitone for mild dissonance */
export function addTension(notes: readonly NoteEvent[], factor: number): NoteEvent[] {
  // Lift some pitches by 1 semitone based on position density
  return notes.map((n, i) => {
    if (i % Math.max(1, Math.round(4 / factor)) === 0) {
      return { ...n, pitch: Math.min(127, n.pitch + 1) };
    }
    return n;
  });
}

/** Brighten / open filter: simulate by boosting velocity of higher notes */
export function brighten(notes: readonly NoteEvent[], amount: number): NoteEvent[] {
  const median = notes.length > 0
    ? notes.reduce((s, n) => s + n.pitch, 0) / notes.length
    : 60;
  return notes.map((n) => ({
    ...n,
    velocity: n.pitch > median
      ? Math.min(127, n.velocity + Math.round(amount))
      : n.velocity,
  }));
}
