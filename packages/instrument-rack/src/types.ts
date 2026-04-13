// ────────────────────────────────────────────
// @motif/instrument-rack — types
// ────────────────────────────────────────────

import type { InstrumentCategory } from "@motif/schema";

/** Voice instance — a single playing note */
export interface Voice {
  stop: () => void;
}

/** An instrument voice that can play notes */
export interface InstrumentVoice {
  readonly category: InstrumentCategory;

  /**
   * Play a note.
   * @param pitch MIDI note number (0-127)
   * @param velocity 0-127
   * @param startTime AudioContext time to start
   * @param duration duration in seconds
   * @param output AudioNode to connect to
   * @returns Voice handle for early stop
   */
  playNote(
    ctx: BaseAudioContext,
    pitch: number,
    velocity: number,
    startTime: number,
    duration: number,
    output: AudioNode,
  ): Voice;

  /** Dispose any resources */
  dispose(): void;
}

/** Parameters for synth voice creation */
export interface SynthParams {
  oscillatorType?: OscillatorType;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  filterFreq?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  detune?: number;
  gain?: number;
  // Multi-oscillator parameters
  osc2Waveform?: OscillatorType;
  osc2Detune?: number; // cents
  osc2Mix?: number; // 0-1
  subOscMix?: number; // 0-1 (sub is one octave below, sine/square)
  subOscWaveform?: OscillatorType; // typically 'sine' or 'square'
  // Unison parameters
  unisonVoices?: number; // 1-8
  unisonSpread?: number; // 0-100 cents
  // LFO modulation parameters
  lfoRate?: number; // Hz, 0.01-20
  lfoDepth?: number; // 0-1
  lfoWaveform?: OscillatorType; // sine, triangle, square, sawtooth
  lfoTarget?: "filter" | "amplitude" | "pitch";
}

/** LFO target type */
export type LfoTarget = "filter" | "amplitude" | "pitch";

/** MIDI note number → frequency */
export function midiToFreq(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}
