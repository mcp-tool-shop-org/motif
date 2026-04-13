import { describe, it, expect, vi, beforeEach } from "vitest";
import { InstrumentRack } from "../src/rack";
import { FACTORY_PRESETS } from "../src/presets";

// Mock Web Audio API for Node environment
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

function mockAudioContext(): AudioContext {
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
    createBufferSource: vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createBuffer: vi.fn(() => ({
      getChannelData: vi.fn(() => new Float32Array(44100)),
      length: 44100,
      sampleRate: 44100,
      numberOfChannels: 1,
    })),
    destination: { connect: vi.fn() },
  } as unknown as AudioContext;
  return ctx;
}

describe("InstrumentRack", () => {
  let rack: InstrumentRack;

  beforeEach(() => {
    rack = new InstrumentRack();
  });

  it("lists all factory presets", () => {
    const presets = rack.listPresets();
    expect(presets.length).toBe(FACTORY_PRESETS.length);
  });

  it("resolves a factory preset to a voice", () => {
    const voice = rack.getVoice("bass-sub");
    expect(voice).not.toBeNull();
    expect(voice!.category).toBe("bass");
  });

  it("resolves drums preset to a DrumVoice", () => {
    const voice = rack.getVoice("drums-standard");
    expect(voice).not.toBeNull();
    expect(voice!.category).toBe("drums");
  });

  it("returns null for unknown preset", () => {
    const voice = rack.getVoice("unknown-preset");
    expect(voice).toBeNull();
  });

  it("caches voice instances", () => {
    const voice1 = rack.getVoice("lead-pluck");
    const voice2 = rack.getVoice("lead-pluck");
    expect(voice1).toBe(voice2);
  });

  it("registers custom presets", () => {
    rack.registerPresets([
      {
        id: "custom-bass",
        name: "Custom Bass",
        category: "bass",
        params: { oscillatorType: "sine" },
      },
    ]);
    const voice = rack.getVoice("custom-bass");
    expect(voice).not.toBeNull();
  });

  it("custom presets override factory presets with same ID", () => {
    rack.registerPresets([
      {
        id: "bass-sub",
        name: "Override Sub",
        category: "bass",
        params: { oscillatorType: "square" },
      },
    ]);
    // Should resolve (custom takes priority)
    const voice = rack.getVoice("bass-sub");
    expect(voice).not.toBeNull();
  });

  it("voice can play a note with mocked AudioContext", () => {
    const ctx = mockAudioContext();
    const output = ctx.createGain();
    const voice = rack.getVoice("lead-pluck");
    expect(voice).not.toBeNull();

    const handle = voice!.playNote(ctx, 60, 100, 0, 0.5, output);
    expect(handle).toBeDefined();
    expect(handle.stop).toBeInstanceOf(Function);
  });

  it("drum voice can play a note", () => {
    const ctx = mockAudioContext();
    const output = ctx.createGain();
    const voice = rack.getVoice("drums-standard");
    expect(voice).not.toBeNull();

    const handle = voice!.playNote(ctx, 36, 100, 0, 0.25, output);
    expect(handle).toBeDefined();
  });

  it("dispose clears all voices", () => {
    rack.getVoice("bass-sub");
    rack.getVoice("lead-pluck");
    rack.dispose();
    // After dispose, getVoice should create fresh instances
    const voice = rack.getVoice("bass-sub");
    expect(voice).not.toBeNull();
  });
});
