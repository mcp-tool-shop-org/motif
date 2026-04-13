// ────────────────────────────────────────────
// Drum voice — synthesized percussion kit
// Uses Web Audio for kick, snare, hihat, clap, tom
// ────────────────────────────────────────────

import type { InstrumentVoice, Voice } from "./types.js";

/** Drum piece types mapped to MIDI note ranges */
export type DrumPiece = "kick" | "snare" | "closedHat" | "openHat" | "clap" | "tom" | "rimshot" | "cowbell";

/** Map MIDI note → drum piece (GM-inspired subset) */
export function pitchToDrum(pitch: number): DrumPiece {
  // Standard GM drum map subset
  switch (pitch) {
    case 36: return "kick";
    case 38: return "snare";
    case 42: return "closedHat";
    case 46: return "openHat";
    case 39: return "clap";
    case 45: case 47: case 48: return "tom";
    case 37: return "rimshot";
    case 56: return "cowbell";
    default:
      // Default mapping by range
      if (pitch <= 37) return "kick";
      if (pitch <= 40) return "snare";
      if (pitch <= 44) return "closedHat";
      if (pitch <= 49) return "tom";
      return "closedHat";
  }
}

export class DrumVoice implements InstrumentVoice {
  readonly category = "drums" as const;

  playNote(
    ctx: BaseAudioContext,
    pitch: number,
    velocity: number,
    startTime: number,
    _duration: number,
    output: AudioNode,
  ): Voice {
    const piece = pitchToDrum(pitch);
    const velGain = velocity / 127;

    switch (piece) {
      case "kick":
        return playKick(ctx, startTime, velGain, output);
      case "snare":
        return playSnare(ctx, startTime, velGain, output);
      case "closedHat":
        return playHat(ctx, startTime, velGain, 0.08, output);
      case "openHat":
        return playHat(ctx, startTime, velGain, 0.3, output);
      case "clap":
        return playClap(ctx, startTime, velGain, output);
      case "tom":
        return playTom(ctx, startTime, velGain, pitch, output);
      case "rimshot":
        return playRimshot(ctx, startTime, velGain, output);
      case "cowbell":
        return playCowbell(ctx, startTime, velGain, output);
    }
  }

  dispose(): void {}
}

// ── Individual drum synthesis ──

function playKick(ctx: BaseAudioContext, t: number, vel: number, out: AudioNode): Voice {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  gain.gain.setValueAtTime(vel * 0.9, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + 0.41);
  return makeVoice(ctx, gain, osc);
}

function playSnare(ctx: BaseAudioContext, t: number, vel: number, out: AudioNode): Voice {
  // Tone body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
  oscGain.gain.setValueAtTime(vel * 0.5, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(oscGain);
  oscGain.connect(out);
  osc.start(t);
  osc.stop(t + 0.16);

  // Noise burst
  const noise = createNoiseSource(ctx, t, 0.15);
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.setValueAtTime(3000, t);
  noiseGain.gain.setValueAtTime(vel * 0.6, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(out);
  noise.start(t);
  noise.stop(t + 0.16);

  return makeVoice(ctx, oscGain, osc);
}

function playHat(ctx: BaseAudioContext, t: number, vel: number, decay: number, out: AudioNode): Voice {
  const noise = createNoiseSource(ctx, t, decay + 0.01);
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(6000, t);
  gain.gain.setValueAtTime(vel * 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  noise.start(t);
  noise.stop(t + decay + 0.01);
  return makeVoice(ctx, gain);
}

function playClap(ctx: BaseAudioContext, t: number, vel: number, out: AudioNode): Voice {
  const noise = createNoiseSource(ctx, t, 0.2);
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2000, t);
  filter.Q.setValueAtTime(2, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.setValueAtTime(vel * 0.5, t + 0.005);
  gain.gain.setValueAtTime(vel * 0.2, t + 0.01);
  gain.gain.setValueAtTime(vel * 0.5, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(out);
  noise.start(t);
  noise.stop(t + 0.21);
  return makeVoice(ctx, gain);
}

function playTom(ctx: BaseAudioContext, t: number, vel: number, pitch: number, out: AudioNode): Voice {
  const baseFreq = 80 + (pitch - 45) * 20;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(baseFreq * 1.5, t);
  osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.05);
  gain.gain.setValueAtTime(vel * 0.7, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + 0.31);
  return makeVoice(ctx, gain, osc);
}

function playRimshot(ctx: BaseAudioContext, t: number, vel: number, out: AudioNode): Voice {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, t);
  gain.gain.setValueAtTime(vel * 0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + 0.05);
  return makeVoice(ctx, gain, osc);
}

function playCowbell(ctx: BaseAudioContext, t: number, vel: number, out: AudioNode): Voice {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.type = "square";
  osc2.type = "square";
  osc1.frequency.setValueAtTime(587, t);
  osc2.frequency.setValueAtTime(845, t);
  gain.gain.setValueAtTime(vel * 0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(out);
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 0.31);
  osc2.stop(t + 0.31);
  return makeVoice(ctx, gain, osc1);
}

// ── Helpers ──

function createNoiseSource(ctx: BaseAudioContext, _t: number, duration: number): AudioBufferSourceNode {
  const sampleRate = ctx.sampleRate;
  const samples = Math.ceil(sampleRate * (duration + 0.05));
  const buffer = ctx.createBuffer(1, samples, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function makeVoice(ctx: BaseAudioContext, gain: GainNode, osc?: OscillatorNode): Voice {
  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.02);
        osc?.stop(now + 0.03);
      } catch {
        // Already stopped
      }
    },
  };
}
