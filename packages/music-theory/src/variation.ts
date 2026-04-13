// ────────────────────────────────────────────
// Variation tools — controlled mutation of note patterns
// ────────────────────────────────────────────

import type { NoteEvent, Key } from "./types.js";
import { snapToScale } from "./scales.js";

/** Duplicate with rhythmic variation — shift some start positions */
export function rhythmicVariation(notes: readonly NoteEvent[], amount: number): NoteEvent[] {
  return notes.map((n, i) => {
    const nudge = ((i * 17 + 5) % 7 - 3) * amount;
    return {
      ...n,
      startTick: Math.max(0, n.startTick + Math.round(nudge)),
    };
  });
}

/** Duplicate with melodic variation — shift some pitches within range */
export function melodicVariation(notes: readonly NoteEvent[], range: number, key?: Key): NoteEvent[] {
  return notes.map((n, i) => {
    const offset = ((i * 13 + 7) % 5 - 2) * Math.ceil(range / 2);
    let newPitch = Math.max(0, Math.min(127, n.pitch + offset));
    if (key) newPitch = snapToScale(newPitch, key);
    return { ...n, pitch: newPitch };
  });
}

/** Thin out notes — remove every Nth note */
export function thinNotes(notes: readonly NoteEvent[], keepEveryN: number): NoteEvent[] {
  if (keepEveryN < 1) return [...notes];
  return notes.filter((_, i) => i % keepEveryN === 0);
}

/** Densify — duplicate each note with slight time offset */
export function densifyNotes(
  notes: readonly NoteEvent[],
  subdivisions: number,
  tickSpacing: number,
): NoteEvent[] {
  const result: NoteEvent[] = [];
  for (const n of notes) {
    result.push(n);
    for (let s = 1; s < subdivisions; s++) {
      result.push({
        ...n,
        startTick: n.startTick + s * tickSpacing,
        velocity: Math.max(1, n.velocity - s * 15),
      });
    }
  }
  return result;
}

/** Accent every Nth step — boost velocity of regular positions */
export function accentEveryN(notes: readonly NoteEvent[], n: number, boost: number): NoteEvent[] {
  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
  return sorted.map((note, i) => ({
    ...note,
    velocity: i % n === 0
      ? Math.min(127, note.velocity + boost)
      : note.velocity,
  }));
}

/** Add ghost hits for drums — insert low-velocity notes between existing hits */
export function addGhostHits(
  notes: readonly NoteEvent[],
  ghostVelocity: number,
  tickOffset: number,
): NoteEvent[] {
  const result = [...notes];
  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);

  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].startTick - sorted[i].startTick;
    if (gap > tickOffset * 2) {
      result.push({
        pitch: sorted[i].pitch,
        startTick: sorted[i].startTick + tickOffset,
        durationTicks: Math.min(sorted[i].durationTicks, tickOffset),
        velocity: Math.max(1, Math.min(ghostVelocity, sorted[i].velocity - 20)),
      });
    }
  }

  return result.sort((a, b) => a.startTick - b.startTick);
}

/** Remove ghost hits — filter notes below a velocity threshold */
export function removeGhostHits(notes: readonly NoteEvent[], threshold: number): NoteEvent[] {
  return notes.filter((n) => n.velocity >= threshold);
}
