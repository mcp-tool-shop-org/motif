import { describe, it, expect, vi } from "vitest";
import { SynthVoice } from "../src/synth-voice";

// Mock Web Audio API
function mockAudioParam() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

function mockAudioContext(): BaseAudioContext {
  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => ({
      type: "sine",
      frequency: mockAudioParam(),
      detune: mockAudioParam(),
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: mockAudioParam(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBiquadFilter: vi.fn(() => ({
      type: "lowpass",
      frequency: mockAudioParam(),
      Q: mockAudioParam(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  } as unknown as BaseAudioContext;
  return ctx;
}

describe("SynthVoice — multi-oscillator", () => {
  it("creates a single oscillator with default params", () => {
    const voice = new SynthVoice("lead");
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // Default: 1 unison voice, no osc2, no sub = 1 oscillator created
    // Plus the mix gain, filter, env = createOscillator called once
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it("creates 2 oscillators when osc2Mix > 0", () => {
    const voice = new SynthVoice("lead", {
      osc2Waveform: "sawtooth",
      osc2Detune: 7,
      osc2Mix: 0.6,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // 1 primary + 1 osc2 = 2 oscillators
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("creates 3 oscillators when osc2 + sub both enabled", () => {
    const voice = new SynthVoice("bass", {
      osc2Waveform: "square",
      osc2Mix: 0.5,
      subOscMix: 0.6,
      subOscWaveform: "sine",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 36, 100, 0, 0.5, output);

    // 1 primary + 1 osc2 + 1 sub = 3 oscillators
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it("creates N oscillators for unison voices", () => {
    const voice = new SynthVoice("lead", {
      unisonVoices: 7,
      unisonSpread: 40,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // 7 unison copies of osc1, no osc2, no sub
    expect(ctx.createOscillator).toHaveBeenCalledTimes(7);
  });

  it("creates unison + osc2 + sub = N+2 oscillators", () => {
    const voice = new SynthVoice("pad", {
      unisonVoices: 4,
      unisonSpread: 50,
      osc2Waveform: "sawtooth",
      osc2Detune: 12,
      osc2Mix: 0.8,
      subOscMix: 0.3,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 48, 100, 0, 1.0, output);

    // 4 unison + 1 osc2 + 1 sub = 6 oscillators
    expect(ctx.createOscillator).toHaveBeenCalledTimes(6);
  });

  it("sub oscillator frequency is one octave below", () => {
    const voice = new SynthVoice("bass", {
      subOscMix: 0.6,
      subOscWaveform: "sine",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // Second oscillator created is the sub
    const calls = (ctx.createOscillator as any).mock.results;
    const subOsc = calls[1].value;
    // Sub should set frequency to half of the primary
    const subFreqCall = subOsc.frequency.setValueAtTime.mock.calls[0];
    const primaryOsc = calls[0].value;
    const primaryFreqCall = primaryOsc.frequency.setValueAtTime.mock.calls[0];
    expect(subFreqCall[0]).toBeCloseTo(primaryFreqCall[0] / 2, 1);
  });

  it("unison spread distributes detune evenly", () => {
    const voice = new SynthVoice("lead", {
      unisonVoices: 3,
      unisonSpread: 60,
      detune: 0,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    const calls = (ctx.createOscillator as any).mock.results;
    // 3 voices: -30, 0, +30 cents
    const detunes = calls.map(
      (c: any) => c.value.detune.setValueAtTime.mock.calls[0][0],
    );
    expect(detunes[0]).toBeCloseTo(-30, 1);
    expect(detunes[1]).toBeCloseTo(0, 1);
    expect(detunes[2]).toBeCloseTo(30, 1);
  });

  it("voice stop cancels all oscillators", () => {
    const voice = new SynthVoice("pad", {
      unisonVoices: 3,
      unisonSpread: 30,
      osc2Mix: 0.5,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    const handle = voice.playNote(ctx, 60, 100, 0, 1.0, output);
    handle.stop();

    // 3 unison + 1 osc2 = 4 oscillators, all should have stop called
    const calls = (ctx.createOscillator as any).mock.results;
    for (const c of calls) {
      expect(c.value.stop).toHaveBeenCalled();
    }
  });

  it("getParams returns resolved params with defaults", () => {
    const voice = new SynthVoice("lead", { attack: 0.05 });
    const params = voice.getParams();
    expect(params.attack).toBe(0.05);
    expect(params.unisonVoices).toBe(1);
    expect(params.osc2Mix).toBe(0);
    expect(params.subOscMix).toBe(0);
  });

  it("getParams includes LFO defaults when not specified", () => {
    const voice = new SynthVoice("pad");
    const params = voice.getParams();
    expect(params.lfoRate).toBe(0);
    expect(params.lfoDepth).toBe(0);
    expect(params.lfoWaveform).toBe("sine");
    expect(params.lfoTarget).toBe("filter");
  });
});

describe("SynthVoice — LFO modulation", () => {
  it("creates an LFO oscillator when lfoRate and lfoDepth > 0 (filter target)", () => {
    const voice = new SynthVoice("pad", {
      lfoRate: 0.3,
      lfoDepth: 0.4,
      lfoWaveform: "sine",
      lfoTarget: "filter",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 1.0, output);

    // 1 primary osc + 1 LFO osc = 2 oscillators
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("does not create LFO when lfoRate is 0", () => {
    const voice = new SynthVoice("pad", {
      lfoRate: 0,
      lfoDepth: 0.5,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // Only 1 primary oscillator, no LFO
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it("does not create LFO when lfoDepth is 0", () => {
    const voice = new SynthVoice("pad", {
      lfoRate: 1.0,
      lfoDepth: 0,
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it("creates LFO for amplitude target (tremolo)", () => {
    const voice = new SynthVoice("lead", {
      lfoRate: 5,
      lfoDepth: 0.3,
      lfoTarget: "amplitude",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // 1 primary + 1 LFO = 2
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("creates LFO for pitch target (vibrato)", () => {
    const voice = new SynthVoice("lead", {
      lfoRate: 6,
      lfoDepth: 0.1,
      lfoTarget: "pitch",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 0.5, output);

    // 1 primary + 1 LFO = 2
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it("LFO oscillator is stopped when voice is stopped", () => {
    const voice = new SynthVoice("pad", {
      lfoRate: 0.5,
      lfoDepth: 0.4,
      lfoTarget: "filter",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    const handle = voice.playNote(ctx, 60, 100, 0, 1.0, output);
    handle.stop();

    // Both oscillators (primary + LFO) should have stop called
    const calls = (ctx.createOscillator as any).mock.results;
    for (const c of calls) {
      expect(c.value.stop).toHaveBeenCalled();
    }
  });

  it("LFO works with multi-oscillator + unison", () => {
    const voice = new SynthVoice("pad", {
      unisonVoices: 3,
      unisonSpread: 30,
      osc2Mix: 0.5,
      lfoRate: 0.3,
      lfoDepth: 0.4,
      lfoTarget: "filter",
    });
    const ctx = mockAudioContext();
    const output = (ctx as any).createGain();

    voice.playNote(ctx, 60, 100, 0, 1.0, output);

    // 3 unison + 1 osc2 + 1 LFO = 5 oscillators
    expect(ctx.createOscillator).toHaveBeenCalledTimes(5);
  });
});
