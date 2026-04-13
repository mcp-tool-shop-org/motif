import type { SampleInstrument } from "@motif/schema";

/** Create a sample instrument with sensible ADSR defaults. */
export function createSampleInstrument(
  id: string,
  name: string,
  assetId: string,
  rootNote: number,
  pitchMin = 0,
  pitchMax = 127,
): SampleInstrument {
  return {
    id,
    name,
    assetId,
    rootNote,
    pitchMin,
    pitchMax,
    attackMs: 5,
    decayMs: 100,
    sustainLevel: 0.8,
    releaseMs: 200,
  };
}

/** Calculate playback rate to shift from rootNote to targetNote. */
export function pitchToPlaybackRate(rootNote: number, targetNote: number): number {
  return Math.pow(2, (targetNote - rootNote) / 12);
}

/** Check whether a MIDI note falls within the instrument's pitch range. */
export function isInRange(instrument: SampleInstrument, note: number): boolean {
  return note >= instrument.pitchMin && note <= instrument.pitchMax;
}

/** Return the number of semitones covered by the instrument's pitch range. */
export function rangeSpan(instrument: SampleInstrument): number {
  return instrument.pitchMax - instrument.pitchMin;
}
