// ────────────────────────────────────────────
// @motif-studio/music-theory — barrel exports
// ────────────────────────────────────────────

// Types
export type {
  PitchClass,
  NoteName,
  ScaleDefinition,
  Key,
  NoteEvent,
  ChordQuality,
  Chord,
  ChordMarker,
  IntensityTier,
} from "./types.js";
export { NOTE_NAMES } from "./types.js";

// Scales
export {
  SCALES,
  SCALE_NAMES,
  pitchClass,
  octave,
  midiNote,
  noteName,
  parseMidi,
  scalePitchClasses,
  isInScale,
  snapToScale,
  snapNotesToScale,
  findOutOfScale,
  transposeDiatonic,
} from "./scales.js";

// Chords
export {
  chordPitches,
  diatonicChord,
  diatonicChords,
  chordPalette,
  generatePadVoicing,
  generateBassLine,
  arpeggiateChord,
  progressionFromDegrees,
} from "./chords.js";

// Motif transforms
export {
  transpose,
  transposeInKey,
  invert,
  reverse,
  octaveShift,
  rhythmScale,
  duplicateWithVariation,
  transposeAndSnap,
} from "./motif.js";

// Variation tools
export {
  rhythmicVariation,
  melodicVariation,
  thinNotes,
  densifyNotes,
  accentEveryN,
  addGhostHits,
  removeGhostHits,
} from "./variation.js";

// Intensity transforms
export {
  lowIntensity,
  midIntensity,
  highIntensity,
  deriveIntensity,
  addTension,
  brighten,
} from "./intensity.js";
export type { IntensityOptions } from "./intensity.js";
