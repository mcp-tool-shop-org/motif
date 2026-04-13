// ────────────────────────────────────────────
// Synth voice — multi-oscillator melodic instrument engine
// Covers: bass, pad, lead/pluck, pulse/arp
// ────────────────────────────────────────────

import type { InstrumentCategory } from "@motif-studio/schema";
import type { InstrumentVoice, Voice, SynthParams } from "./types.js";
import { midiToFreq } from "./types.js";

const DEFAULTS: Required<SynthParams> = {
  oscillatorType: "sawtooth",
  attack: 0.01,
  decay: 0.2,
  sustain: 0.6,
  release: 0.3,
  filterFreq: 2000,
  filterQ: 1,
  filterType: "lowpass",
  detune: 0,
  gain: 0.7,
  // Multi-oscillator defaults (single osc behavior)
  osc2Waveform: "sawtooth",
  osc2Detune: 0,
  osc2Mix: 0, // 0 = osc2 off
  subOscMix: 0, // 0 = sub off
  subOscWaveform: "sine",
  unisonVoices: 1,
  unisonSpread: 0,
  // LFO defaults (off by default)
  lfoRate: 0,
  lfoDepth: 0,
  lfoWaveform: "sine",
  lfoTarget: "filter",
};

export class SynthVoice implements InstrumentVoice {
  readonly category: InstrumentCategory;
  private params: Required<SynthParams>;

  constructor(category: InstrumentCategory, params?: SynthParams) {
    this.category = category;
    this.params = { ...DEFAULTS, ...params } as Required<SynthParams>;
  }

  /** Expose resolved params for testing */
  getParams(): Readonly<Required<SynthParams>> {
    return this.params;
  }

  playNote(
    ctx: BaseAudioContext,
    pitch: number,
    velocity: number,
    startTime: number,
    duration: number,
    output: AudioNode,
  ): Voice {
    const p = this.params;
    const freq = midiToFreq(pitch);
    const velGain = (velocity / 127) * p.gain;
    const endTime = startTime + duration;

    // Collect all oscillators for cleanup
    const oscillators: OscillatorNode[] = [];

    // Master gain for mixing all oscillators
    const oscMix = ctx.createGain();
    oscMix.gain.setValueAtTime(1, startTime);

    // Calculate normalization factor so total gain stays consistent
    const unisonCount = Math.max(1, Math.min(8, Math.round(p.unisonVoices)));
    const hasOsc2 = p.osc2Mix > 0;
    const hasSub = p.subOscMix > 0;
    // Normalize: osc1 weight = 1, osc2 weight = osc2Mix, sub weight = subOscMix
    // Unison splits osc1's contribution across voices
    const osc1Weight = 1;
    const osc2Weight = hasOsc2 ? p.osc2Mix : 0;
    const subWeight = hasSub ? p.subOscMix : 0;
    const totalWeight = osc1Weight + osc2Weight + subWeight;

    // ── OSC1 (primary) + unison copies ──
    const osc1Gain = ctx.createGain();
    osc1Gain.gain.setValueAtTime(osc1Weight / totalWeight / unisonCount, startTime);
    osc1Gain.connect(oscMix);

    if (unisonCount <= 1) {
      // Single voice
      const osc = ctx.createOscillator();
      osc.type = p.oscillatorType;
      osc.frequency.setValueAtTime(freq, startTime);
      if (p.detune !== 0) osc.detune.setValueAtTime(p.detune, startTime);
      osc.connect(osc1Gain);
      osc.start(startTime);
      osc.stop(endTime + p.release + 0.01);
      oscillators.push(osc);
    } else {
      // Unison: spread voices evenly across -spread/2 to +spread/2
      for (let i = 0; i < unisonCount; i++) {
        const spreadOffset =
          unisonCount === 1
            ? 0
            : -p.unisonSpread / 2 +
              (p.unisonSpread * i) / (unisonCount - 1);
        const osc = ctx.createOscillator();
        osc.type = p.oscillatorType;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.detune.setValueAtTime(p.detune + spreadOffset, startTime);
        osc.connect(osc1Gain);
        osc.start(startTime);
        osc.stop(endTime + p.release + 0.01);
        oscillators.push(osc);
      }
    }

    // ── OSC2 (secondary, independent waveform + detune) ──
    if (hasOsc2) {
      const osc2GainNode = ctx.createGain();
      osc2GainNode.gain.setValueAtTime(osc2Weight / totalWeight, startTime);
      osc2GainNode.connect(oscMix);

      const osc2 = ctx.createOscillator();
      osc2.type = p.osc2Waveform;
      osc2.frequency.setValueAtTime(freq, startTime);
      osc2.detune.setValueAtTime(p.osc2Detune, startTime);
      osc2.connect(osc2GainNode);
      osc2.start(startTime);
      osc2.stop(endTime + p.release + 0.01);
      oscillators.push(osc2);
    }

    // ── SUB OSC (one octave below) ──
    if (hasSub) {
      const subGainNode = ctx.createGain();
      subGainNode.gain.setValueAtTime(subWeight / totalWeight, startTime);
      subGainNode.connect(oscMix);

      const sub = ctx.createOscillator();
      sub.type = p.subOscWaveform;
      sub.frequency.setValueAtTime(freq / 2, startTime); // one octave below
      sub.connect(subGainNode);
      sub.start(startTime);
      sub.stop(endTime + p.release + 0.01);
      oscillators.push(sub);
    }

    // ── Filter ──
    const filter = ctx.createBiquadFilter();
    filter.type = p.filterType;
    filter.frequency.setValueAtTime(p.filterFreq, startTime);
    filter.Q.setValueAtTime(p.filterQ, startTime);

    // ── Gain envelope (ADSR) ──
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);
    // Attack
    env.gain.linearRampToValueAtTime(velGain, startTime + p.attack);
    // Decay -> sustain
    env.gain.linearRampToValueAtTime(
      velGain * p.sustain,
      startTime + p.attack + p.decay,
    );
    // Sustain holds until note end
    env.gain.setValueAtTime(velGain * p.sustain, endTime);
    // Release
    env.gain.linearRampToValueAtTime(0, endTime + p.release);

    // Connect chain: oscMix -> filter -> envelope -> output
    oscMix.connect(filter);
    filter.connect(env);
    env.connect(output);

    // ── LFO modulation ──
    let lfoOsc: OscillatorNode | null = null;
    if (p.lfoRate > 0 && p.lfoDepth > 0) {
      lfoOsc = ctx.createOscillator();
      lfoOsc.type = p.lfoWaveform;
      lfoOsc.frequency.setValueAtTime(p.lfoRate, startTime);

      const lfoGain = ctx.createGain();

      switch (p.lfoTarget) {
        case "filter": {
          // Modulate filter cutoff: depth scales to +/- filterFreq * depth
          lfoGain.gain.setValueAtTime(p.filterFreq * p.lfoDepth, startTime);
          lfoOsc.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          break;
        }
        case "amplitude": {
          // Tremolo: modulate the envelope gain
          // Depth of 1.0 means full amplitude swing (0 to velGain*sustain)
          lfoGain.gain.setValueAtTime(velGain * p.sustain * p.lfoDepth * 0.5, startTime);
          lfoOsc.connect(lfoGain);
          lfoGain.connect(env.gain);
          break;
        }
        case "pitch": {
          // Vibrato: modulate oscillator detune in cents
          // Depth of 1.0 = +/- 100 cents (1 semitone)
          const vibratoRange = 100 * p.lfoDepth;
          lfoGain.gain.setValueAtTime(vibratoRange, startTime);
          lfoOsc.connect(lfoGain);
          // Connect to all oscillator detune params
          for (const osc of oscillators) {
            lfoGain.connect(osc.detune);
          }
          break;
        }
      }

      lfoOsc.start(startTime);
      lfoOsc.stop(endTime + p.release + 0.01);
      oscillators.push(lfoOsc); // track for cleanup
    }

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
          for (const osc of oscillators) {
            osc.stop(now + 0.06);
          }
        } catch {
          // Already stopped
        }
      },
    };
  }

  dispose(): void {
    // No persistent resources
  }
}
