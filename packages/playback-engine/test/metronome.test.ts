import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Transport } from "../src/transport";

// Mock Web Audio API for Node.js
function mockAudioParam(defaultValue = 0) {
  return {
    value: defaultValue,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

function createMockAudioContext(): AudioContext {
  const destination = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    channelCount: 2,
    channelCountMode: "explicit",
    channelInterpretation: "speakers",
    maxChannelCount: 2,
    numberOfInputs: 1,
    numberOfOutputs: 0,
    context: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  const ctx = {
    currentTime: 0,
    sampleRate: 44100,
    state: "running",
    destination,
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => ({
      type: "sine",
      frequency: mockAudioParam(440),
      detune: mockAudioParam(),
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: mockAudioParam(1),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBiquadFilter: vi.fn(() => ({
      type: "lowpass",
      frequency: mockAudioParam(1000),
      Q: mockAudioParam(1),
      gain: mockAudioParam(0),
      detune: mockAudioParam(0),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createStereoPanner: vi.fn(() => ({
      pan: mockAudioParam(0),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createDynamicsCompressor: vi.fn(() => ({
      threshold: mockAudioParam(-24),
      knee: mockAudioParam(30),
      ratio: mockAudioParam(12),
      attack: mockAudioParam(0.003),
      release: mockAudioParam(0.25),
      reduction: 0,
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createDelay: vi.fn(() => ({
      delayTime: mockAudioParam(0),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createConvolver: vi.fn(() => ({
      buffer: null,
      normalize: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBuffer: vi.fn((channels: number, length: number, sampleRate: number) => {
      const data = new Float32Array(length);
      return {
        length,
        numberOfChannels: channels,
        sampleRate,
        duration: length / sampleRate,
        getChannelData: () => data,
        copyToChannel: vi.fn(),
        copyFromChannel: vi.fn(),
      };
    }),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      loop: false,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as AudioContext;

  return ctx;
}

describe("Transport — Metronome", () => {
  let transport: Transport;
  let originalAudioContext: typeof globalThis.AudioContext;

  beforeEach(() => {
    vi.useFakeTimers();
    // Inject mock AudioContext
    originalAudioContext = globalThis.AudioContext;
    (globalThis as any).AudioContext = vi.fn(() => createMockAudioContext());
    transport = new Transport();
  });

  afterEach(() => {
    transport.dispose();
    globalThis.AudioContext = originalAudioContext;
    vi.useRealTimers();
  });

  it("metronome is disabled by default", () => {
    expect(transport.metronomeEnabled).toBe(false);
  });

  it("default BPM is 120", () => {
    expect(transport.metronomeBpm).toBe(120);
  });

  it("toggleMetronome enables then disables", () => {
    transport.toggleMetronome();
    expect(transport.metronomeEnabled).toBe(true);

    transport.toggleMetronome();
    expect(transport.metronomeEnabled).toBe(false);
  });

  it("setMetronomeBpm updates BPM", () => {
    transport.setMetronomeBpm(140);
    expect(transport.metronomeBpm).toBe(140);
  });

  it("setMetronomeBpm clamps to 20-300 range", () => {
    transport.setMetronomeBpm(5);
    expect(transport.metronomeBpm).toBe(20);

    transport.setMetronomeBpm(500);
    expect(transport.metronomeBpm).toBe(300);
  });

  it("emits metronome-change event on toggle", () => {
    const listener = vi.fn();
    transport.on(listener);

    transport.toggleMetronome();

    const metronomeEvents = listener.mock.calls.filter(
      (c) => c[0].type === "metronome-change",
    );
    expect(metronomeEvents.length).toBeGreaterThanOrEqual(1);
    expect(metronomeEvents[0][0].detail).toEqual({
      enabled: true,
      bpm: 120,
    });
  });

  it("emits metronome-change event on BPM change", () => {
    const listener = vi.fn();
    transport.on(listener);

    transport.setMetronomeBpm(90);

    const metronomeEvents = listener.mock.calls.filter(
      (c) => c[0].type === "metronome-change",
    );
    expect(metronomeEvents.length).toBe(1);
    expect(metronomeEvents[0][0].detail).toEqual({
      enabled: false,
      bpm: 90,
    });
  });

  it("stop clears metronome", () => {
    transport.ensureContext();
    transport.toggleMetronome();
    transport.stop();
    // Should not throw and metronome should be cleaned up
    expect(transport.metronomeEnabled).toBe(true); // enabled flag persists
    // But internal scheduling is stopped (no way to directly observe,
    // but stop() should not throw)
  });

  it("dispose cleans up metronome", () => {
    transport.ensureContext();
    transport.toggleMetronome();
    // Should not throw
    transport.dispose();
  });
});
