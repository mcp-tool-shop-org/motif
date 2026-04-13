// ────────────────────────────────────────────
// @motif-studio/music-theory — types
// ────────────────────────────────────────────

/** Pitch class (0 = C, 1 = C#, … 11 = B) */
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

/** Scale definition: an ordered array of semitone intervals from root */
export interface ScaleDefinition {
  name: string;
  intervals: readonly number[];
}

/** Key = root pitch class + scale */
export interface Key {
  root: PitchClass;
  scale: string; // name referencing SCALES
}

/** A simple note event used for transforms (pitch + timing + velocity) */
export interface NoteEvent {
  pitch: number;
  startTick: number;
  durationTicks: number;
  velocity: number;
}

/** Chord quality */
export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant7"
  | "major7"
  | "minor7"
  | "sus2"
  | "sus4";

/** A chord: root pitch class + quality + optional bass note */
export interface Chord {
  root: PitchClass;
  quality: ChordQuality;
  bass?: PitchClass;
}

/** Chord marker placed at a tick position */
export interface ChordMarker {
  tick: number;
  chord: Chord;
}

/** Intensity tier for variation transforms */
export type IntensityTier = "low" | "mid" | "high";
