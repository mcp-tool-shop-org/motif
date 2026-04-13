import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SoundtrackPack } from "@motif/schema";
import { loadFixture, FIXTURES } from "@motif/test-kit";
import type { PlaybackEvent } from "../src/types.js";

// ── Minimal mock for Web Audio API ──

function createMockAudioParam(defaultValue = 1) {
  return {
    value: defaultValue,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    defaultValue,
    minValue: -3.4028235e38,
    maxValue: 3.4028235e38,
    automationRate: "a-rate" as AudioParam["automationRate"],
  };
}

function createMockGainNode(): GainNode {
  return {
    gain: createMockAudioParam(1),
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as GainNode;
}

function createMockStereoPanner(): StereoPannerNode {
  return {
    pan: createMockAudioParam(0),
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as StereoPannerNode;
}

function createMockBiquadFilter(): BiquadFilterNode {
  return {
    type: "peaking",
    frequency: createMockAudioParam(1000),
    Q: createMockAudioParam(1),
    gain: createMockAudioParam(0),
    detune: createMockAudioParam(0),
    connect: vi.fn(),
    disconnect: vi.fn(),
    getFrequencyResponse: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as BiquadFilterNode;
}

function createMockDelay(): DelayNode {
  return {
    delayTime: createMockAudioParam(0),
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as DelayNode;
}

function createMockConvolver(): ConvolverNode {
  return {
    buffer: null,
    normalize: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as ConvolverNode;
}

function createMockDynamicsCompressor(): DynamicsCompressorNode {
  return {
    threshold: createMockAudioParam(-24),
    ratio: createMockAudioParam(12),
    attack: createMockAudioParam(0.003),
    release: createMockAudioParam(0.25),
    knee: createMockAudioParam(30),
    reduction: 0,
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as DynamicsCompressorNode;
}

function createMockWaveShaper(): WaveShaperNode {
  return {
    curve: null,
    oversample: "none",
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as WaveShaperNode;
}

function createMockOscillator(): OscillatorNode {
  return {
    type: "sine" as OscillatorType,
    frequency: createMockAudioParam(440),
    detune: createMockAudioParam(0),
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 0,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onended: null,
  } as unknown as OscillatorNode;
}

function createMockBufferSource(): AudioBufferSourceNode {
  return {
    buffer: null,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
    playbackRate: { value: 1 },
    detune: { value: 0 },
    loopStart: 0,
    loopEnd: 0,
    context: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    numberOfInputs: 0,
    numberOfOutputs: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as AudioBufferSourceNode;
}

function createMockAudioBuffer(): AudioBuffer {
  return {
    duration: 2,
    length: 44100 * 2,
    numberOfChannels: 2,
    sampleRate: 44100,
    getChannelData: vi.fn(() => new Float32Array(44100 * 2)),
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  } as unknown as AudioBuffer;
}

function createMockAudioContext(): AudioContext {
  return {
    currentTime: 0,
    state: "running",
    sampleRate: 44100,
    destination: {} as AudioDestinationNode,
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    createGain: vi.fn(() => createMockGainNode()),
    createBufferSource: vi.fn(() => createMockBufferSource()),
    createStereoPanner: vi.fn(() => createMockStereoPanner()),
    createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
    createDelay: vi.fn(() => createMockDelay()),
    createConvolver: vi.fn(() => createMockConvolver()),
    createDynamicsCompressor: vi.fn(() => createMockDynamicsCompressor()),
    createOscillator: vi.fn(() => createMockOscillator()),
    createWaveShaper: vi.fn(() => createMockWaveShaper()),
    createBuffer: vi.fn(
      (channels: number, length: number, sampleRate: number) => {
        const buf = createMockAudioBuffer();
        Object.defineProperty(buf, "numberOfChannels", { value: channels });
        Object.defineProperty(buf, "length", { value: length });
        Object.defineProperty(buf, "sampleRate", { value: sampleRate });
        return buf;
      },
    ),
    decodeAudioData: vi.fn(() => Promise.resolve(createMockAudioBuffer())),
  } as unknown as AudioContext;
}

// ── Tests ──

describe("Transport — state transitions", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => createMockAudioContext()),
    );
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as Response),
    );
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in stopped state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    expect(t.getSnapshot().transport).toBe("stopped");
  });

  it("transitions stopped -> playing on playScene", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().transport).toBe("playing");
  });

  it("transitions playing -> stopped on stop()", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().transport).toBe("playing");
    t.stop();
    expect(t.getSnapshot().transport).toBe("stopped");
  });

  it("re-entrant play: calling playScene while already playing switches scene", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().transport).toBe("playing");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");

    // Play a different scene while already playing
    await t.playScene(pack, "scene-combat");
    expect(t.getSnapshot().transport).toBe("playing");
    expect(t.getSnapshot().currentSceneId).toBe("scene-combat");
  });

  it("re-entrant play: same scene does not break state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    await t.playScene(pack, "scene-exploration");
    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().transport).toBe("playing");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");
  });

  it("stop while stopped is a no-op", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    // Should not throw
    t.stop();
    expect(t.getSnapshot().transport).toBe("stopped");
  });
});

describe("Transport — event emission", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => createMockAudioContext()),
    );
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as Response),
    );
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits transport-change events during lifecycle", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    t.on((evt) => events.push(evt));

    await t.playScene(pack, "scene-exploration");

    const transportChanges = events.filter((e) => e.type === "transport-change");
    expect(transportChanges.length).toBeGreaterThanOrEqual(1);

    // Should see "playing" in the transport-change events
    const playingEvent = transportChanges.find(
      (e) => (e.detail as { state: string }).state === "playing",
    );
    expect(playingEvent).toBeDefined();
  });

  it("on() returns an unsubscribe function", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    const unsub = t.on((evt) => events.push(evt));

    await t.playScene(pack, "scene-exploration");
    const countBefore = events.length;

    // Unsubscribe
    unsub();

    // Further actions should not add events
    t.stop();
    expect(events.length).toBe(countBefore);
  });

  it("listener exceptions do not crash the transport", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const goodEvents: PlaybackEvent[] = [];

    // Bad listener that throws
    t.on(() => {
      throw new Error("listener crash");
    });
    // Good listener after the bad one
    t.on((evt) => goodEvents.push(evt));

    // Should not throw
    await t.playScene(pack, "scene-exploration");
    expect(goodEvents.length).toBeGreaterThan(0);
  });
});

describe("Transport — stop while playing", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => createMockAudioContext()),
    );
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as Response),
    );
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stop clears current scene and stem handles", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");
    expect(t.getSnapshot().stemHandles.size).toBeGreaterThan(0);

    t.stop();
    expect(t.getSnapshot().currentSceneId).toBeNull();
    expect(t.getSnapshot().stemHandles.size).toBe(0);
  });

  it("stop emits transport-change with stopped state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    t.on((evt) => events.push(evt));

    await t.playScene(pack, "scene-exploration");
    events.length = 0; // clear events from play

    t.stop();
    const stopEvent = events.find(
      (e) =>
        e.type === "transport-change" &&
        (e.detail as { state: string }).state === "stopped",
    );
    expect(stopEvent).toBeDefined();
  });
});

describe("Transport — dispose", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => createMockAudioContext()),
    );
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispose while playing stops playback and closes context", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().transport).toBe("playing");

    t.dispose();
    expect(t.getSnapshot().transport).toBe("stopped");
  });

  it("dispose clears all listeners", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    t.on((evt) => events.push(evt));

    t.ensureContext();
    t.dispose();

    // After dispose, no events should be emitted
    const countAfterDispose = events.length;
    // Calling stop after dispose should not crash or emit
    t.stop();
    expect(events.length).toBe(countAfterDispose);
  });

  it("dispose without ensureContext is safe", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    // Should not throw
    t.dispose();
    expect(t.getSnapshot().transport).toBe("stopped");
  });

  it("double dispose is safe", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    t.ensureContext();
    t.dispose();
    t.dispose();
    expect(t.getSnapshot().transport).toBe("stopped");
  });
});
