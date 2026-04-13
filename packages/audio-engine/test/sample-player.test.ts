import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AudioAsset, SampleSlice, SampleKitSlot, SampleInstrument } from "@motif-studio/schema";
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "../src/sample-player.js";

// ── Web Audio API mocks ──

function mockAudioParam(initial = 0) {
  return {
    value: initial,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

function mockBufferSource() {
  const node: Record<string, unknown> = {
    buffer: null,
    playbackRate: mockAudioParam(1),
    connect: vi.fn(() => node),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return node;
}

function mockGainNode() {
  const node: Record<string, unknown> = {
    gain: mockAudioParam(1),
    connect: vi.fn(() => node),
    disconnect: vi.fn(),
  };
  return node;
}

function mockBiquadFilter() {
  const node: Record<string, unknown> = {
    type: "lowpass",
    frequency: mockAudioParam(350),
    Q: mockAudioParam(1),
    gain: mockAudioParam(0),
    connect: vi.fn(() => node),
    disconnect: vi.fn(),
  };
  return node;
}

function createMockAudioContext() {
  const destination = { connect: vi.fn() };
  const sources: ReturnType<typeof mockBufferSource>[] = [];
  const gains: ReturnType<typeof mockGainNode>[] = [];
  const filters: ReturnType<typeof mockBiquadFilter>[] = [];

  return {
    currentTime: 0,
    destination,
    createBufferSource: vi.fn(() => {
      const s = mockBufferSource();
      sources.push(s);
      return s;
    }),
    createGain: vi.fn(() => {
      const g = mockGainNode();
      gains.push(g);
      return g;
    }),
    createBiquadFilter: vi.fn(() => {
      const f = mockBiquadFilter();
      filters.push(f);
      return f;
    }),
    _sources: sources,
    _gains: gains,
    _filters: filters,
  } as unknown as AudioContext & {
    _sources: ReturnType<typeof mockBufferSource>[];
    _gains: ReturnType<typeof mockGainNode>[];
    _filters: ReturnType<typeof mockBiquadFilter>[];
  };
}

const mockBuffer = {} as AudioBuffer;

// ── Tests ──

describe("playTrimmedRegion", () => {
  let ctx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("plays from trimStartMs to trimEndMs", () => {
    const asset: AudioAsset = {
      id: "a1", name: "test", src: "test.wav", kind: "sfx",
      durationMs: 5000, trimStartMs: 1000, trimEndMs: 3000,
    };

    const voice = playTrimmedRegion(ctx, mockBuffer, asset);
    const src = ctx._sources[0];

    expect(src.start).toHaveBeenCalledWith(0, 1, 2); // offset=1s, duration=2s
    expect(src.connect).toHaveBeenCalledWith(ctx.destination);
    expect(typeof voice.stop).toBe("function");
  });

  it("defaults to 0..durationMs when no trim points set", () => {
    const asset: AudioAsset = {
      id: "a2", name: "test", src: "test.wav", kind: "sfx",
      durationMs: 4000,
    };

    playTrimmedRegion(ctx, mockBuffer, asset);
    const src = ctx._sources[0];

    expect(src.start).toHaveBeenCalledWith(0, 0, 4); // full 4 seconds
  });

  it("connects to custom destination when provided", () => {
    const dest = mockGainNode() as unknown as AudioNode;
    const asset: AudioAsset = {
      id: "a3", name: "test", src: "test.wav", kind: "sfx",
      durationMs: 2000,
    };

    playTrimmedRegion(ctx, mockBuffer, asset, dest);
    const src = ctx._sources[0];

    expect(src.connect).toHaveBeenCalledWith(dest);
  });
});

describe("playSlice", () => {
  let ctx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("plays the correct slice region", () => {
    const slice: SampleSlice = {
      id: "s1", assetId: "a1", name: "kick",
      startMs: 500, endMs: 1500,
    };

    const voice = playSlice(ctx, mockBuffer, slice);
    const src = ctx._sources[0];

    expect(src.start).toHaveBeenCalledWith(0, 0.5, 1); // 500ms..1500ms
    expect(typeof voice.stop).toBe("function");
  });
});

describe("playKitSlot", () => {
  let ctx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("applies gain from slot.gainDb", () => {
    const slot: SampleKitSlot = {
      pitch: 60, assetId: "a1", gainDb: -6,
    };

    playKitSlot(ctx, mockBuffer, slot, undefined);
    const gain = ctx._gains[0];

    // -6 dB ~= 0.501
    expect((gain.gain as { value: number }).value).toBeCloseTo(
      Math.pow(10, -6 / 20), 2,
    );
  });

  it("uses slice region when provided", () => {
    const slot: SampleKitSlot = { pitch: 60, assetId: "a1" };
    const slice: SampleSlice = {
      id: "s1", assetId: "a1", name: "snare",
      startMs: 200, endMs: 700,
    };

    playKitSlot(ctx, mockBuffer, slot, slice);
    const src = ctx._sources[0];

    expect(src.start).toHaveBeenCalledWith(0, 0.2, 0.5);
  });

  it("plays full buffer when no slice provided", () => {
    const slot: SampleKitSlot = { pitch: 60, assetId: "a1" };

    playKitSlot(ctx, mockBuffer, slot, undefined);
    const src = ctx._sources[0];

    expect(src.start).toHaveBeenCalledWith(0, 0, undefined);
  });
});

describe("playSampleInstrumentNote", () => {
  let ctx: ReturnType<typeof createMockAudioContext>;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("sets playback rate based on note distance from rootNote", () => {
    const instrument: SampleInstrument = {
      id: "i1", name: "piano", assetId: "a1",
      rootNote: 60, pitchMin: 36, pitchMax: 84,
    };

    playSampleInstrumentNote(ctx, mockBuffer, instrument, 72);
    const src = ctx._sources[0];

    // 12 semitones up = 2x rate
    expect((src.playbackRate as { value: number }).value).toBeCloseTo(2, 5);
  });

  it("sets up ADSR envelope", () => {
    const instrument: SampleInstrument = {
      id: "i1", name: "piano", assetId: "a1",
      rootNote: 60, pitchMin: 36, pitchMax: 84,
      attackMs: 10, decayMs: 50, sustainLevel: 0.7,
    };

    playSampleInstrumentNote(ctx, mockBuffer, instrument, 60);
    const gain = ctx._gains[0];
    const param = gain.gain as ReturnType<typeof mockAudioParam>;

    expect(param.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(1, 0.01); // attack
    // attack + decay = 0.01 + 0.05 = 0.06 (floating point)
    const calls = param.linearRampToValueAtTime.mock.calls;
    expect(calls[1][0]).toBe(0.7);
    expect(calls[1][1]).toBeCloseTo(0.06, 5);
  });

  it("creates lowpass filter when filterCutoffHz is set", () => {
    const instrument: SampleInstrument = {
      id: "i1", name: "piano", assetId: "a1",
      rootNote: 60, pitchMin: 36, pitchMax: 84,
      filterCutoffHz: 2000, filterQ: 2,
    };

    playSampleInstrumentNote(ctx, mockBuffer, instrument, 60);

    expect(ctx.createBiquadFilter).toHaveBeenCalled();
    const filter = ctx._filters[0];
    expect((filter.frequency as { value: number }).value).toBe(2000);
    expect((filter.Q as { value: number }).value).toBe(2);
  });

  it("stop() applies release envelope", () => {
    const instrument: SampleInstrument = {
      id: "i1", name: "piano", assetId: "a1",
      rootNote: 60, pitchMin: 36, pitchMax: 84,
      releaseMs: 100,
    };

    const voice = playSampleInstrumentNote(ctx, mockBuffer, instrument, 60);
    voice.stop();

    const gain = ctx._gains[0];
    const param = gain.gain as ReturnType<typeof mockAudioParam>;

    expect(param.cancelScheduledValues).toHaveBeenCalled();
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.1); // release
  });
});
