// @motif/audio-engine — scene-layer resolution, transition lookup, simulation, sample playback
export const PACKAGE = "@motif/audio-engine" as const;

export * from "./types.js";
export { resolveActiveLayers } from "./layers.js";
export { findTransitionRule } from "./transitions.js";
export { simulateStateSequence } from "./simulate.js";

export { playTrimmedRegion, playSlice, playKitSlot, playSampleInstrumentNote } from "./sample-player.js";
export type { SampleVoice } from "./sample-types.js";
