// ────────────────────────────────────────────
// Chord generation and progression helpers
// ────────────────────────────────────────────

import type { Chord, ChordQuality, ChordMarker, Key, NoteEvent } from "./types.js";
import { scalePitchClasses, midiNote } from "./scales.js";

// ── Chord intervals by quality ──

const CHORD_INTERVALS: Record<ChordQuality, readonly number[]> = {
  major:      [0, 4, 7],
  minor:      [0, 3, 7],
  diminished: [0, 3, 6],
  augmented:  [0, 4, 8],
  dominant7:  [0, 4, 7, 10],
  major7:     [0, 4, 7, 11],
  minor7:     [0, 3, 7, 10],
  sus2:       [0, 2, 7],
  sus4:       [0, 5, 7],
};

/** Build MIDI pitches for a chord in a given octave.
 *  Falls back to major intervals if quality is not found — unreachable in
 *  typed code because ChordQuality is a closed union, but kept as a safe
 *  default for any future runtime-only callers. */
export function chordPitches(chord: Chord, octave: number): number[] {
  const intervals = CHORD_INTERVALS[chord.quality] ?? CHORD_INTERVALS.major;
  const base = midiNote(chord.root, octave);
  const pitches = intervals.map((i) => base + i);

  // Apply bass note (inversion)
  if (chord.bass !== undefined && chord.bass !== chord.root) {
    const bassNote = midiNote(chord.bass, octave);
    // Ensure bass is below chord root
    const adjustedBass = bassNote < base ? bassNote : bassNote - 12;
    pitches.unshift(Math.max(0, adjustedBass));
  }

  return pitches.filter((p) => p >= 0 && p <= 127);
}

/** Diatonic triad for each scale degree (0-indexed) */
export function diatonicChord(key: Key, degree: number): Chord {
  const pcs = scalePitchClasses(key);
  if (pcs.length === 0) return { root: key.root, quality: "major" };

  const idx = ((degree % pcs.length) + pcs.length) % pcs.length;
  const root = pcs[idx];
  const third = pcs[(idx + 2) % pcs.length];
  const fifth = pcs[(idx + 4) % pcs.length];

  const thirdInterval = ((third - root) + 12) % 12;
  const fifthInterval = ((fifth - root) + 12) % 12;

  let quality: ChordQuality = "major";
  if (thirdInterval === 3 && fifthInterval === 7) quality = "minor";
  else if (thirdInterval === 3 && fifthInterval === 6) quality = "diminished";
  else if (thirdInterval === 4 && fifthInterval === 8) quality = "augmented";

  return { root, quality };
}

/** Get all diatonic chords for a key */
export function diatonicChords(key: Key): Chord[] {
  const pcs = scalePitchClasses(key);
  return pcs.map((_, i) => diatonicChord(key, i));
}

/** Simple chord palette for the key.
 *  Numeral labels (I, ii, iii, IV, V, vi, vii°) assume a 7-note major-like
 *  scale. For scales with fewer or more than 7 degrees, extra chords receive
 *  plain numeric labels (e.g. "8", "9"). */
export function chordPalette(key: Key): { degree: number; numeral: string; chord: Chord }[] {
  const numerals7 = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  const chords = diatonicChords(key);
  return chords.map((chord, i) => ({
    degree: i,
    numeral: numerals7[i] ?? `${i + 1}`,
    chord,
  }));
}

// ── Note generation from chords ──

/** Generate pad voicing notes from chord markers */
export function generatePadVoicing(
  chordMarkers: readonly ChordMarker[],
  octave: number,
  ticksPerChord: number,
  velocity = 80,
): NoteEvent[] {
  const notes: NoteEvent[] = [];
  for (const marker of chordMarkers) {
    const pitches = chordPitches(marker.chord, octave);
    for (const pitch of pitches) {
      notes.push({
        pitch,
        startTick: marker.tick,
        durationTicks: ticksPerChord,
        velocity,
      });
    }
  }
  return notes;
}

/** Generate bass notes that follow chord roots */
export function generateBassLine(
  chordMarkers: readonly ChordMarker[],
  octave: number,
  ticksPerChord: number,
  velocity = 100,
): NoteEvent[] {
  return chordMarkers.map((marker) => ({
    pitch: midiNote(marker.chord.bass ?? marker.chord.root, octave),
    startTick: marker.tick,
    durationTicks: ticksPerChord,
    velocity,
  }));
}

/** Arpeggiate a chord across ticks */
export function arpeggiateChord(
  chord: Chord,
  octave: number,
  startTick: number,
  ticksPerNote: number,
  totalTicks: number,
  velocity = 90,
): NoteEvent[] {
  const pitches = chordPitches(chord, octave);
  if (pitches.length === 0) return [];

  const notes: NoteEvent[] = [];
  let tick = startTick;
  let idx = 0;
  while (tick < startTick + totalTicks) {
    notes.push({
      pitch: pitches[idx % pitches.length],
      startTick: tick,
      durationTicks: ticksPerNote,
      velocity,
    });
    tick += ticksPerNote;
    idx++;
  }
  return notes;
}

/** Build a chord progression from degree numbers (e.g. [0, 3, 4, 0] → I-IV-V-I) */
export function progressionFromDegrees(
  key: Key,
  degrees: readonly number[],
  startTick: number,
  ticksPerChord: number,
): ChordMarker[] {
  return degrees.map((deg, i) => ({
    tick: startTick + i * ticksPerChord,
    chord: diatonicChord(key, deg),
  }));
}
