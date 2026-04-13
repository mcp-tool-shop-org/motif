// ────────────────────────────────────────────
// @motif/clip-engine — barrel exports
// ────────────────────────────────────────────

export { ClipPlayer, resolveClipNotes } from "./clip-player.js";
export { SceneClipPlayer, filterByIntensity, sortByOrder } from "./scene-clip-player.js";
export { scheduleNotes, clipLengthSeconds, quantizedLaunchTime } from "./scheduler.js";
export type { ScheduledNote } from "./scheduler.js";
export type { ClipPlaybackHandle, ClipPlaybackState } from "./types.js";
export { TICKS_PER_BEAT, TICKS_PER_16TH, TICKS_PER_8TH } from "./types.js";

// Composition tools (wraps @motif/music-theory for Clip objects)
export {
  clipKey,
  clipTranspose,
  clipTransposeInKey,
  clipInvert,
  clipReverse,
  clipOctaveShift,
  clipRhythmScale,
  clipDuplicateWithVariation,
  clipTransposeAndSnap,
  clipSnapToScale,
  clipFindOutOfScale,
  clipRhythmicVariation,
  clipMelodicVariation,
  clipThinNotes,
  clipDensifyNotes,
  clipAccentEveryN,
  clipAddGhostHits,
  clipRemoveGhostHits,
  clipDeriveIntensity,
  clipAddTension,
  clipBrighten,
  clipPadVoicing,
  clipBassLine,
  clipArpeggiate,
  createTransformedVariant,
  chordPalette,
  diatonicChords,
  progressionFromDegrees,
} from "./clip-transforms.js";

// Cue scheduling & performance capture
export {
  resolveCuePlan,
  sectionAtTick,
  sectionAtBar,
  cueSecondsToTick,
  cueTickToSeconds,
  createCaptureEvent,
  captureToCue,
  captureTotalBars,
  quantizeTick,
  ticksPerBar,
  ticksToSeconds,
  secondsToTicks,
  tickToBar,
  tickToBeat,
} from "./cue-scheduler.js";
export type { ResolvedSection, CuePlaybackPlan } from "./cue-scheduler.js";

// Drum pattern presets
export { getDrumPatterns, GM_DRUMS } from "./drum-patterns.js";
export type { DrumPattern } from "./drum-patterns.js";

// MIDI import/export
export { parseMidi, midiToClipNotes, clipNotesToMidi, readVLQ, writeVLQ } from "./midi.js";
export type { MidiFile, MidiTrack, MidiEvent, MidiEventType } from "./midi-types.js";
