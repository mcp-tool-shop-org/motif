// ────────────────────────────────────────────
// Scale math — pitch classes, scale degrees, snapping
// ────────────────────────────────────────────

import type { PitchClass, ScaleDefinition, Key, NoteEvent, NoteName } from "./types.js";
import { NOTE_NAMES } from "./types.js";

// ── Built-in scales ──

export const SCALES: Record<string, ScaleDefinition> = {
  major:            { name: "Major (Ionian)",      intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor:            { name: "Natural Minor",       intervals: [0, 2, 3, 5, 7, 8, 10] },
  "harmonic-minor": { name: "Harmonic Minor",      intervals: [0, 2, 3, 5, 7, 8, 11] },
  "melodic-minor":  { name: "Melodic Minor (asc)", intervals: [0, 2, 3, 5, 7, 9, 11] },
  dorian:           { name: "Dorian",              intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian:         { name: "Phrygian",            intervals: [0, 1, 3, 5, 7, 8, 10] },
  lydian:           { name: "Lydian",              intervals: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian:       { name: "Mixolydian",          intervals: [0, 2, 4, 5, 7, 9, 10] },
  pentatonic:       { name: "Major Pentatonic",    intervals: [0, 2, 4, 7, 9] },
  "minor-penta":    { name: "Minor Pentatonic",    intervals: [0, 3, 5, 7, 10] },
  blues:            { name: "Blues",               intervals: [0, 3, 5, 6, 7, 10] },
  chromatic:        { name: "Chromatic",           intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
};

export const SCALE_NAMES = Object.keys(SCALES);

// ── Pitch utilities ──

/** Get the pitch class (0–11) of a MIDI note */
export function pitchClass(midi: number): PitchClass {
  return ((midi % 12) + 12) % 12 as PitchClass;
}

/** Get the octave of a MIDI note */
export function octave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/** Build MIDI note from pitch class + octave */
export function midiNote(pc: PitchClass, octave: number): number {
  return (octave + 1) * 12 + pc;
}

/** Note name string (e.g. "C4", "F#5") */
export function noteName(midi: number): string {
  return `${NOTE_NAMES[pitchClass(midi)]}${octave(midi)}`;
}

/** Parse note name to MIDI ("C4" → 60, "A#3" → 58).
 *  Returns -1 if the name cannot be parsed — callers should check for this. */
export function parseMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return -1;
  const idx = NOTE_NAMES.indexOf(match[1] as NoteName);
  if (idx < 0) return -1;
  return (parseInt(match[2]) + 1) * 12 + idx;
}

// ── Scale operations ──

/** Get all pitch classes in a key */
export function scalePitchClasses(key: Key): PitchClass[] {
  const def = SCALES[key.scale];
  if (!def) return [];
  return def.intervals.map((i) => ((key.root + i) % 12) as PitchClass);
}

/** Check if a MIDI note is in a given key */
export function isInScale(midi: number, key: Key): boolean {
  const pcs = scalePitchClasses(key);
  return pcs.includes(pitchClass(midi));
}

/** Snap a MIDI note to the nearest pitch in the key, preserving octave proximity */
export function snapToScale(midi: number, key: Key): number {
  if (isInScale(midi, key)) return midi;
  const pcs = scalePitchClasses(key);
  if (pcs.length === 0) return midi;

  let bestDist = Infinity;
  let bestPitch = midi;

  for (const pc of pcs) {
    // Check nearest octave variants
    const base = midiNote(pc, octave(midi));
    for (const candidate of [base - 12, base, base + 12]) {
      const dist = Math.abs(candidate - midi);
      if (dist < bestDist) {
        bestDist = dist;
        bestPitch = candidate;
      }
    }
  }
  return Math.max(0, Math.min(127, bestPitch));
}

/** Snap all notes to a key */
export function snapNotesToScale(notes: readonly NoteEvent[], key: Key): NoteEvent[] {
  return notes.map((n) => ({ ...n, pitch: snapToScale(n.pitch, key) }));
}

/** Find out-of-scale notes (returns indices) */
export function findOutOfScale(notes: readonly NoteEvent[], key: Key): number[] {
  return notes.reduce<number[]>((acc, n, i) => {
    if (!isInScale(n.pitch, key)) acc.push(i);
    return acc;
  }, []);
}

/** Transpose within key by scale degrees (diatonic) */
export function transposeDiatonic(midi: number, degrees: number, key: Key): number {
  const pcs = scalePitchClasses(key);
  if (pcs.length === 0) return midi;

  const pc = pitchClass(midi);
  const oct = octave(midi);
  let degreeIdx = pcs.indexOf(pc);

  // If not in scale, snap first
  if (degreeIdx < 0) {
    const snapped = snapToScale(midi, key);
    const snappedPc = pitchClass(snapped);
    degreeIdx = pcs.indexOf(snappedPc);
    if (degreeIdx < 0) return midi;
  }

  const newDegree = degreeIdx + degrees;
  const octShift = Math.floor(newDegree / pcs.length);
  const degInScale = ((newDegree % pcs.length) + pcs.length) % pcs.length;
  const newPc = pcs[degInScale];

  return Math.max(0, Math.min(127, midiNote(newPc, oct + octShift)));
}
