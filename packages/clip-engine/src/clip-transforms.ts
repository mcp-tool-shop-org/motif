// ────────────────────────────────────────────
// Clip-level composition tools
// Wraps @motif-studio/music-theory for Clip objects
// ────────────────────────────────────────────

import type { Clip, ClipNote, ClipVariant } from "@motif-studio/schema";
import type { Key, PitchClass, NoteEvent, Chord, ChordMarker, IntensityTier } from "@motif-studio/music-theory";
import {
  transpose,
  transposeInKey,
  invert,
  reverse,
  octaveShift,
  rhythmScale,
  duplicateWithVariation,
  transposeAndSnap,
  snapNotesToScale,
  findOutOfScale,
  rhythmicVariation,
  melodicVariation,
  thinNotes,
  densifyNotes,
  accentEveryN,
  addGhostHits,
  removeGhostHits,
  deriveIntensity,
  addTension,
  brighten,
  generatePadVoicing,
  generateBassLine,
  arpeggiateChord,
  progressionFromDegrees,
  chordPalette,
  diatonicChords,
} from "@motif-studio/music-theory";

// ── Clip ↔ NoteEvent bridge ──

function toEvents(notes: readonly ClipNote[]): NoteEvent[] {
  return notes.map((n) => ({ ...n }));
}

function toClipNotes(events: readonly NoteEvent[]): ClipNote[] {
  return events.map((e) => ({
    pitch: e.pitch,
    startTick: e.startTick,
    durationTicks: e.durationTicks,
    velocity: e.velocity,
  }));
}

/** Extract the Key from a clip's keyRoot + keyScale fields */
export function clipKey(clip: Clip): Key | null {
  if (clip.keyRoot === undefined || !clip.keyScale) return null;
  return { root: clip.keyRoot as PitchClass, scale: clip.keyScale };
}

// ── Motif transforms (return new notes array) ──

export function clipTranspose(notes: readonly ClipNote[], semitones: number): ClipNote[] {
  return toClipNotes(transpose(toEvents(notes), semitones));
}

export function clipTransposeInKey(notes: readonly ClipNote[], degrees: number, key: Key): ClipNote[] {
  return toClipNotes(transposeInKey(toEvents(notes), degrees, key));
}

export function clipInvert(notes: readonly ClipNote[], pivot?: number): ClipNote[] {
  return toClipNotes(invert(toEvents(notes), pivot));
}

export function clipReverse(notes: readonly ClipNote[]): ClipNote[] {
  return toClipNotes(reverse(toEvents(notes)));
}

export function clipOctaveShift(notes: readonly ClipNote[], octaves: number): ClipNote[] {
  return toClipNotes(octaveShift(toEvents(notes), octaves));
}

export function clipRhythmScale(notes: readonly ClipNote[], factor: number): ClipNote[] {
  return toClipNotes(rhythmScale(toEvents(notes), factor));
}

export function clipDuplicateWithVariation(
  notes: readonly ClipNote[],
  options?: { pitchJitter?: number; velocityJitter?: number; timingJitter?: number },
): ClipNote[] {
  return toClipNotes(duplicateWithVariation(toEvents(notes), options));
}

export function clipTransposeAndSnap(notes: readonly ClipNote[], semitones: number, key: Key): ClipNote[] {
  return toClipNotes(transposeAndSnap(toEvents(notes), semitones, key));
}

// ── Scale tools ──

export function clipSnapToScale(notes: readonly ClipNote[], key: Key): ClipNote[] {
  return toClipNotes(snapNotesToScale(toEvents(notes), key));
}

export function clipFindOutOfScale(notes: readonly ClipNote[], key: Key): number[] {
  return findOutOfScale(toEvents(notes), key);
}

// ── Variation tools ──

export function clipRhythmicVariation(notes: readonly ClipNote[], amount: number): ClipNote[] {
  return toClipNotes(rhythmicVariation(toEvents(notes), amount));
}

export function clipMelodicVariation(notes: readonly ClipNote[], range: number, key?: Key): ClipNote[] {
  return toClipNotes(melodicVariation(toEvents(notes), range, key));
}

export function clipThinNotes(notes: readonly ClipNote[], keepEveryN: number): ClipNote[] {
  return toClipNotes(thinNotes(toEvents(notes), keepEveryN));
}

export function clipDensifyNotes(notes: readonly ClipNote[], subdivisions: number, tickSpacing: number): ClipNote[] {
  return toClipNotes(densifyNotes(toEvents(notes), subdivisions, tickSpacing));
}

export function clipAccentEveryN(notes: readonly ClipNote[], n: number, boost: number): ClipNote[] {
  return toClipNotes(accentEveryN(toEvents(notes), n, boost));
}

export function clipAddGhostHits(notes: readonly ClipNote[], ghostVelocity: number, tickOffset: number): ClipNote[] {
  return toClipNotes(addGhostHits(toEvents(notes), ghostVelocity, tickOffset));
}

export function clipRemoveGhostHits(notes: readonly ClipNote[], threshold: number): ClipNote[] {
  return toClipNotes(removeGhostHits(toEvents(notes), threshold));
}

// ── Intensity tools ──

export function clipDeriveIntensity(
  notes: readonly ClipNote[],
  tier: IntensityTier,
  key?: Key,
): ClipNote[] {
  return toClipNotes(deriveIntensity(toEvents(notes), tier, { key }));
}

export function clipAddTension(notes: readonly ClipNote[], factor: number): ClipNote[] {
  return toClipNotes(addTension(toEvents(notes), factor));
}

export function clipBrighten(notes: readonly ClipNote[], amount: number): ClipNote[] {
  return toClipNotes(brighten(toEvents(notes), amount));
}

// ── Chord/bass generation ──

export { chordPalette, diatonicChords, generatePadVoicing, generateBassLine, arpeggiateChord, progressionFromDegrees };

/** Generate pad voicing as ClipNotes */
export function clipPadVoicing(
  chordMarkers: readonly ChordMarker[],
  octave: number,
  ticksPerChord: number,
  velocity?: number,
): ClipNote[] {
  return toClipNotes(generatePadVoicing(chordMarkers, octave, ticksPerChord, velocity));
}

/** Generate bass line as ClipNotes */
export function clipBassLine(
  chordMarkers: readonly ChordMarker[],
  octave: number,
  ticksPerChord: number,
  velocity?: number,
): ClipNote[] {
  return toClipNotes(generateBassLine(chordMarkers, octave, ticksPerChord, velocity));
}

/** Arpeggiate a chord as ClipNotes */
export function clipArpeggiate(
  chord: Chord,
  octave: number,
  startTick: number,
  ticksPerNote: number,
  totalTicks: number,
  velocity?: number,
): ClipNote[] {
  return toClipNotes(arpeggiateChord(chord, octave, startTick, ticksPerNote, totalTicks, velocity));
}

// ── Variant helpers ──

/** Create a variant from a transform applied to a clip's notes */
export function createTransformedVariant(
  clip: Clip,
  name: string,
  transformedNotes: ClipNote[],
): ClipVariant {
  return {
    id: `var-${name.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomUUID()}`,
    name,
    notes: transformedNotes,
    tags: [`derived:${name.toLowerCase()}`],
  };
}
