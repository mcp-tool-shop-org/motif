// @motif/instrument-rack — public API
export { InstrumentRack } from "./rack.js";
export { SynthVoice } from "./synth-voice.js";
export { DrumVoice, pitchToDrum } from "./drum-voice.js";
export type { DrumPiece } from "./drum-voice.js";
export { SampleVoice, SAMPLE_INSTRUMENT_TEMPLATES } from "./sample-voice.js";
export type { RegisteredSampleInstrument } from "./sample-voice.js";
export { FACTORY_PRESETS, getPreset, getPresetsByCategory } from "./presets.js";
export { midiToFreq } from "./types.js";
export type { InstrumentVoice, Voice, SynthParams, LfoTarget } from "./types.js";
