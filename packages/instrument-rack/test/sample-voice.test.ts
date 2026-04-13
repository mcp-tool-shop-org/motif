import { describe, it, expect, vi, beforeEach } from "vitest";
import { SampleVoice, SAMPLE_INSTRUMENT_TEMPLATES } from "../src/sample-voice";
import { InstrumentRack } from "../src/rack";
import type { SampleInstrument } from "@motif/schema";

// ── Mock Web Audio API ──

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

function mockAudioBuffer(): AudioBuffer {
  return {
    length: 44100,
    sampleRate: 44100,
    numberOfChannels: 1,
    duration: 1,
    getChannelData: vi.fn(() => new Float32Array(44100)),
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  } as unknown as AudioBuffer;
}

function mockAudioContext(): AudioContext {
  return {
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
    createBufferSource: vi.fn(() => ({
      buffer: null,
      playbackRate: mockAudioParam(),
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBuffer: vi.fn(() => mockAudioBuffer()),
    destination: { connect: vi.fn() },
  } as unknown as AudioContext;
}

// ── Tests ──

describe("SampleVoice", () => {
  const instrument: SampleInstrument = {
    id: "test-piano",
    name: "Test Piano",
    assetId: "piano-asset",
    rootNote: 60,
    pitchMin: 21,
    pitchMax: 108,
    attackMs: 10,
    decayMs: 100,
    sustainLevel: 0.8,
    releaseMs: 500,
  };

  let ctx: AudioContext;
  let buffer: AudioBuffer;
  let output: ReturnType<AudioContext["createGain"]>;

  beforeEach(() => {
    ctx = mockAudioContext();
    buffer = mockAudioBuffer();
    output = ctx.createGain();
  });

  it("creates a SampleVoice with correct category", () => {
    const voice = new SampleVoice(instrument, buffer);
    expect(voice.category).toBe("lead");
  });

  it("exposes instrument definition via getInstrument", () => {
    const voice = new SampleVoice(instrument, buffer);
    expect(voice.getInstrument().id).toBe("test-piano");
    expect(voice.getInstrument().rootNote).toBe(60);
  });

  it("plays a note and returns a stop handle", () => {
    const voice = new SampleVoice(instrument, buffer);
    const handle = voice.playNote(ctx, 60, 100, 0, 1.0, output);

    expect(handle).toBeDefined();
    expect(handle.stop).toBeInstanceOf(Function);
  });

  it("creates a buffer source with correct playback rate for root note", () => {
    const voice = new SampleVoice(instrument, buffer);
    voice.playNote(ctx, 60, 100, 0, 1.0, output);

    const source = (ctx.createBufferSource as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(source.playbackRate.setValueAtTime).toHaveBeenCalledWith(1, 0);
  });

  it("calculates playback rate for pitch-shifted note (octave up)", () => {
    const voice = new SampleVoice(instrument, buffer);
    voice.playNote(ctx, 72, 100, 0, 1.0, output);

    const source = (ctx.createBufferSource as ReturnType<typeof vi.fn>).mock.results[0].value;
    // 2^((72-60)/12) = 2^1 = 2
    expect(source.playbackRate.setValueAtTime).toHaveBeenCalledWith(2, 0);
  });

  it("calculates playback rate for pitch-shifted note (octave down)", () => {
    const voice = new SampleVoice(instrument, buffer);
    voice.playNote(ctx, 48, 100, 0, 1.0, output);

    const source = (ctx.createBufferSource as ReturnType<typeof vi.fn>).mock.results[0].value;
    // 2^((48-60)/12) = 2^-1 = 0.5
    expect(source.playbackRate.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
  });

  it("applies velocity-scaled gain", () => {
    const voice = new SampleVoice(instrument, buffer);
    voice.playNote(ctx, 60, 64, 0, 1.0, output);

    // Velocity/127 = 64/127 ≈ 0.5039
    const gainCalls = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results;
    // The second createGain call (after output) is the envelope
    const envGain = gainCalls[gainCalls.length - 1].value;
    // Attack ramps to velGain = 64/127
    const attackCall = envGain.gain.linearRampToValueAtTime.mock.calls[0];
    expect(attackCall[0]).toBeCloseTo(64 / 127, 4);
  });

  it("applies ADSR envelope timing", () => {
    const voice = new SampleVoice(instrument, buffer);
    voice.playNote(ctx, 60, 127, 0, 1.0, output);

    const gainCalls = (ctx.createGain as ReturnType<typeof vi.fn>).mock.results;
    const envGain = gainCalls[gainCalls.length - 1].value;

    // Attack: ramp to 1.0 at time 0 + 0.01 (10ms)
    const attackCall = envGain.gain.linearRampToValueAtTime.mock.calls[0];
    expect(attackCall[0]).toBeCloseTo(1.0, 4);
    expect(attackCall[1]).toBeCloseTo(0.01, 4);

    // Decay: ramp to sustain * velGain at time 0.01 + 0.1 (100ms)
    const decayCall = envGain.gain.linearRampToValueAtTime.mock.calls[1];
    expect(decayCall[0]).toBeCloseTo(0.8, 4); // sustainLevel = 0.8
    expect(decayCall[1]).toBeCloseTo(0.11, 4);
  });

  it("stop handle can be called safely twice", () => {
    const voice = new SampleVoice(instrument, buffer);
    const handle = voice.playNote(ctx, 60, 100, 0, 1.0, output);

    expect(() => {
      handle.stop();
      handle.stop(); // second call should be no-op
    }).not.toThrow();
  });

  it("creates a filter when filterCutoffHz is specified", () => {
    const filteredInstrument: SampleInstrument = {
      ...instrument,
      filterCutoffHz: 4000,
      filterQ: 2,
    };
    const voice = new SampleVoice(filteredInstrument, buffer);
    voice.playNote(ctx, 60, 100, 0, 1.0, output);

    expect(ctx.createBiquadFilter).toHaveBeenCalled();
    const filter = (ctx.createBiquadFilter as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(filter.frequency.setValueAtTime).toHaveBeenCalledWith(4000, 0);
    expect(filter.Q.setValueAtTime).toHaveBeenCalledWith(2, 0);
  });

  it("skips filter when filterCutoffHz is not set", () => {
    const noFilterInst: SampleInstrument = {
      ...instrument,
      filterCutoffHz: undefined,
      filterQ: undefined,
    };
    const voice = new SampleVoice(noFilterInst, buffer);
    voice.playNote(ctx, 60, 100, 0, 1.0, output);

    expect(ctx.createBiquadFilter).not.toHaveBeenCalled();
  });

  it("clamps pitch to instrument range", () => {
    const narrowInst: SampleInstrument = {
      ...instrument,
      pitchMin: 48,
      pitchMax: 72,
    };
    const voice = new SampleVoice(narrowInst, buffer);

    // Pitch below range — should clamp to 48
    voice.playNote(ctx, 20, 100, 0, 1.0, output);
    const source = (ctx.createBufferSource as ReturnType<typeof vi.fn>).mock.results[0].value;
    const expectedRate = Math.pow(2, (48 - 60) / 12);
    expect(source.playbackRate.setValueAtTime).toHaveBeenCalledWith(expectedRate, 0);
  });

  it("dispose is safe to call", () => {
    const voice = new SampleVoice(instrument, buffer);
    expect(() => voice.dispose()).not.toThrow();
  });
});

describe("SAMPLE_INSTRUMENT_TEMPLATES", () => {
  it("contains piano, strings, guitar", () => {
    expect(SAMPLE_INSTRUMENT_TEMPLATES.piano).toBeDefined();
    expect(SAMPLE_INSTRUMENT_TEMPLATES.strings).toBeDefined();
    expect(SAMPLE_INSTRUMENT_TEMPLATES.guitar).toBeDefined();
  });

  it("piano has full keyboard range", () => {
    const piano = SAMPLE_INSTRUMENT_TEMPLATES.piano;
    expect(piano.pitchMin).toBe(21);
    expect(piano.pitchMax).toBe(108);
    expect(piano.rootNote).toBe(60);
  });

  it("strings has slow attack for bowed sound", () => {
    const strings = SAMPLE_INSTRUMENT_TEMPLATES.strings;
    expect(strings.attackMs).toBe(300);
    expect(strings.sustainLevel).toBe(0.9);
  });

  it("guitar has fast attack", () => {
    const guitar = SAMPLE_INSTRUMENT_TEMPLATES.guitar;
    expect(guitar.attackMs).toBe(5);
  });
});

describe("InstrumentRack — sample instruments", () => {
  let rack: InstrumentRack;
  let ctx: AudioContext;

  beforeEach(() => {
    rack = new InstrumentRack();
    ctx = mockAudioContext();
  });

  it("returns null for unregistered sample instrument", () => {
    expect(rack.getVoice("sample-piano")).toBeNull();
  });

  it("registers and resolves a sample instrument", () => {
    const buffer = mockAudioBuffer();
    rack.registerSampleInstrument("sample-piano", SAMPLE_INSTRUMENT_TEMPLATES.piano, buffer);

    const voice = rack.getVoice("sample-piano");
    expect(voice).not.toBeNull();
    expect(voice).toBeInstanceOf(SampleVoice);
  });

  it("sample instrument takes priority over synth preset with same ID", () => {
    const buffer = mockAudioBuffer();
    // "bass-sub" is a factory synth preset
    rack.registerSampleInstrument("bass-sub", SAMPLE_INSTRUMENT_TEMPLATES.piano, buffer);

    const voice = rack.getVoice("bass-sub");
    expect(voice).toBeInstanceOf(SampleVoice);
  });

  it("lists registered sample instrument IDs", () => {
    const buffer = mockAudioBuffer();
    rack.registerSampleInstrument("sample-piano", SAMPLE_INSTRUMENT_TEMPLATES.piano, buffer);
    rack.registerSampleInstrument("sample-strings", SAMPLE_INSTRUMENT_TEMPLATES.strings, buffer);

    const ids = rack.listSampleInstruments();
    expect(ids).toContain("sample-piano");
    expect(ids).toContain("sample-strings");
    expect(ids).toHaveLength(2);
  });

  it("sample voice can play a note", () => {
    const buffer = mockAudioBuffer();
    rack.registerSampleInstrument("sample-piano", SAMPLE_INSTRUMENT_TEMPLATES.piano, buffer);

    const voice = rack.getVoice("sample-piano");
    const output = ctx.createGain();
    const handle = voice!.playNote(ctx, 60, 100, 0, 0.5, output);
    expect(handle).toBeDefined();
    expect(handle.stop).toBeInstanceOf(Function);
  });

  it("caches sample voice instances", () => {
    const buffer = mockAudioBuffer();
    rack.registerSampleInstrument("sample-piano", SAMPLE_INSTRUMENT_TEMPLATES.piano, buffer);

    const v1 = rack.getVoice("sample-piano");
    const v2 = rack.getVoice("sample-piano");
    expect(v1).toBe(v2);
  });

  it("re-registering clears cached voice", () => {
    const buffer1 = mockAudioBuffer();
    const buffer2 = mockAudioBuffer();
    rack.registerSampleInstrument("sample-piano", SAMPLE_INSTRUMENT_TEMPLATES.piano, buffer1);
    const v1 = rack.getVoice("sample-piano");

    rack.registerSampleInstrument("sample-piano", SAMPLE_INSTRUMENT_TEMPLATES.strings, buffer2);
    const v2 = rack.getVoice("sample-piano");
    expect(v1).not.toBe(v2);
  });
});
