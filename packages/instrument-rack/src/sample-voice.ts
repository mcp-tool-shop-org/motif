// ────────────────────────────────────────────
// Sample voice — plays pitched audio samples with ADSR envelope
// ────────────────────────────────────────────

import type { SampleInstrument } from "@motif/schema";
import type { InstrumentVoice, Voice } from "./types.js";

/**
 * A registered sample instrument with its resolved audio buffers.
 * Each instrument has one buffer per zone (most have a single zone).
 */
export interface RegisteredSampleInstrument {
  instrument: SampleInstrument;
  buffer: AudioBuffer;
}

/**
 * SampleVoice implements InstrumentVoice for sample-based instruments.
 * It plays AudioBuffer sources with pitch-shifting, velocity-scaled gain,
 * ADSR envelope, and optional filter.
 */
export class SampleVoice implements InstrumentVoice {
  readonly category = "lead" as const; // sample instruments default to "lead" category
  private instrument: SampleInstrument;
  private buffer: AudioBuffer;

  constructor(instrument: SampleInstrument, buffer: AudioBuffer) {
    this.instrument = instrument;
    this.buffer = buffer;
  }

  /** Expose instrument definition for testing */
  getInstrument(): Readonly<SampleInstrument> {
    return this.instrument;
  }

  playNote(
    ctx: BaseAudioContext,
    pitch: number,
    velocity: number,
    startTime: number,
    duration: number,
    output: AudioNode,
  ): Voice {
    const inst = this.instrument;

    // Clamp pitch to instrument range
    const clampedPitch = Math.max(inst.pitchMin, Math.min(inst.pitchMax, pitch));

    // Calculate playback rate for pitch shifting from root note
    const playbackRate = Math.pow(2, (clampedPitch - inst.rootNote) / 12);

    // ADSR parameters (convert ms to seconds, with defaults)
    const attack = (inst.attackMs ?? 5) / 1000;
    const decay = (inst.decayMs ?? 100) / 1000;
    const sustain = inst.sustainLevel ?? 0.8;
    const release = (inst.releaseMs ?? 200) / 1000;

    // Velocity-scaled gain
    const velGain = velocity / 127;
    const endTime = startTime + duration;

    // Create buffer source
    const source = ctx.createBufferSource();
    source.buffer = this.buffer;
    source.playbackRate.setValueAtTime(playbackRate, startTime);

    // Gain envelope (ADSR)
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    // Attack
    env.gain.linearRampToValueAtTime(velGain, startTime + attack);
    // Decay -> sustain
    env.gain.linearRampToValueAtTime(
      velGain * sustain,
      startTime + attack + decay,
    );
    // Hold sustain until note end
    env.gain.setValueAtTime(velGain * sustain, endTime);
    // Release
    env.gain.linearRampToValueAtTime(0, endTime + release);

    // Optional filter
    if (inst.filterCutoffHz != null && inst.filterCutoffHz > 0) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(inst.filterCutoffHz, startTime);
      if (inst.filterQ != null) {
        filter.Q.setValueAtTime(inst.filterQ, startTime);
      }
      source.connect(filter);
      filter.connect(env);
    } else {
      source.connect(env);
    }

    env.connect(output);

    source.start(startTime);
    source.stop(endTime + release + 0.01);

    let stopped = false;
    return {
      stop: () => {
        if (stopped) return;
        stopped = true;
        try {
          const now = ctx.currentTime;
          env.gain.cancelScheduledValues(now);
          env.gain.setValueAtTime(env.gain.value, now);
          env.gain.linearRampToValueAtTime(0, now + 0.05);
          source.stop(now + 0.06);
        } catch {
          // Already stopped
        }
      },
    };
  }

  dispose(): void {
    // No persistent resources — buffers are owned by the caller
  }
}

/**
 * Built-in sample instrument template definitions.
 * These define the pitch mapping and ADSR shape for common instruments.
 * Actual audio buffers must be loaded at runtime.
 */
export const SAMPLE_INSTRUMENT_TEMPLATES: Record<string, SampleInstrument> = {
  piano: {
    id: "sample-piano",
    name: "Piano",
    assetId: "piano-sample",
    rootNote: 60,
    pitchMin: 21,
    pitchMax: 108,
    attackMs: 10,
    decayMs: 100,
    sustainLevel: 0.8,
    releaseMs: 500,
  },
  strings: {
    id: "sample-strings",
    name: "Strings",
    assetId: "strings-sample",
    rootNote: 60,
    pitchMin: 36,
    pitchMax: 96,
    attackMs: 300,
    decayMs: 200,
    sustainLevel: 0.9,
    releaseMs: 1000,
  },
  guitar: {
    id: "sample-guitar",
    name: "Guitar",
    assetId: "guitar-sample",
    rootNote: 60,
    pitchMin: 40,
    pitchMax: 88,
    attackMs: 5,
    decayMs: 300,
    sustainLevel: 0.5,
    releaseMs: 300,
  },
};
