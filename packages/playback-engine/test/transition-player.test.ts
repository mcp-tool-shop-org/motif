import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SoundtrackPack } from "@motif/schema";
import { loadFixture, FIXTURES } from "@motif/test-kit";
import type { PlaybackEvent } from "../src/types.js";

// ── Minimal Web Audio mocks ──

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

describe("TransitionPlayer — crossfade mode", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("performs crossfade transition between scenes via Transport", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    t.on((evt) => events.push(evt));

    // Play exploration first (source scene for crossfade)
    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");

    // switchScene with crossfade rule: exploration -> tension
    const switchPromise = t.switchScene(pack, "scene-tension");
    // Advance timers for crossfade sleeps
    await vi.advanceTimersByTimeAsync(5000);
    await switchPromise;

    expect(t.getSnapshot().transport).toBe("playing");

    // Verify transition-start event was emitted
    const transitionStart = events.find((e) => e.type === "transition-start");
    expect(transitionStart).toBeDefined();
    const detail = transitionStart!.detail as {
      fromSceneId: string;
      toSceneId: string;
      mode: string;
    };
    expect(detail.fromSceneId).toBe("scene-exploration");
    expect(detail.toSceneId).toBe("scene-tension");
    expect(detail.mode).toBe("crossfade");
  });
});

describe("TransitionPlayer — immediate mode", () => {
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

  it("immediate transition switches scene directly", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    // Play combat first, then use immediate transition (combat -> victory)
    await t.playScene(pack, "scene-combat");
    await t.switchScene(pack, "scene-victory");

    expect(t.getSnapshot().transport).toBe("playing");
  });

  it("explicit immediate option bypasses transition rules", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    await t.playScene(pack, "scene-exploration");
    // Force immediate even though crossfade rule exists
    await t.switchScene(pack, "scene-tension", { immediate: true });

    expect(t.getSnapshot().transport).toBe("playing");
  });
});

describe("TransitionPlayer — stinger-then-switch mode", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("plays stinger then switches scene (tension -> combat)", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    // Need to be on tension scene first
    await t.playScene(pack, "scene-tension");
    expect(t.getSnapshot().currentSceneId).toBe("scene-tension");

    // This should trigger stinger-then-switch
    const switchPromise = t.switchScene(pack, "scene-combat");
    await vi.advanceTimersByTimeAsync(5000);
    await switchPromise;

    expect(t.getSnapshot().transport).toBe("playing");
  });
});

describe("TransitionPlayer — cooldown-fade mode", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("cooldown-fade fades out before switching (sequential, not overlapping)", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    t.on((evt) => events.push(evt));

    // Victory -> Exploration uses cooldown-fade in the fixture (durationMs: 3000)
    await t.playScene(pack, "scene-victory");
    const switchPromise = t.switchScene(pack, "scene-exploration");

    // Advance past the fade-out duration + safety margin
    await vi.advanceTimersByTimeAsync(5000);
    await switchPromise;

    // Verify transition-start event was emitted with cooldown-fade mode
    const transitionStart = events.find((e) => e.type === "transition-start");
    expect(transitionStart).toBeDefined();
    const detail = transitionStart!.detail as {
      fromSceneId: string;
      toSceneId: string;
      mode: string;
      durationMs: number;
    };
    expect(detail.fromSceneId).toBe("scene-victory");
    expect(detail.toSceneId).toBe("scene-exploration");
    expect(detail.mode).toBe("cooldown-fade");
    expect(detail.durationMs).toBe(3000);

    expect(t.getSnapshot().transport).toBe("playing");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");
  });
});

describe("TransitionPlayer — bar-sync mode", () => {
  let pack: SoundtrackPack;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("bar-sync delays the switch (not immediate)", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: PlaybackEvent[] = [];
    t.on((evt) => events.push(evt));

    // Inject a bar-sync transition rule into the pack for testing
    const barSyncPack = {
      ...pack,
      transitions: [
        ...pack.transitions,
        {
          id: "trans-explore-to-combat-barsync",
          name: "Explore → Combat (bar-sync)",
          fromSceneId: "scene-exploration",
          toSceneId: "scene-combat",
          mode: "bar-sync" as const,
          durationMs: 1000,
        },
      ],
    };
    // Remove the crossfade rule for explore->tension so we can test explore->combat
    barSyncPack.transitions = barSyncPack.transitions.filter(
      (t) => !(t.fromSceneId === "scene-exploration" && t.toSceneId === "scene-combat" && t.mode !== "bar-sync"),
    );

    await t.playScene(barSyncPack, "scene-exploration");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");

    const switchPromise = t.switchScene(barSyncPack, "scene-combat");

    // The bar-sync should delay before switching — advance timers generously
    await vi.advanceTimersByTimeAsync(10000);
    await switchPromise;

    // Verify transition-start event was emitted with bar-sync mode
    const transitionStart = events.find((e) => e.type === "transition-start");
    expect(transitionStart).toBeDefined();
    const detail = transitionStart!.detail as {
      fromSceneId: string;
      toSceneId: string;
      mode: string;
    };
    expect(detail.mode).toBe("bar-sync");

    expect(t.getSnapshot().transport).toBe("playing");
  });

  it("bar-sync falls back to immediate when BPM is unavailable", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Create a pack where the scene's assets have no BPM
    const noBpmPack: SoundtrackPack = {
      ...pack,
      assets: pack.assets.map((a) => ({ ...a, bpm: undefined })),
      transitions: [
        {
          id: "trans-explore-to-tension-barsync",
          name: "Explore → Tension (bar-sync)",
          fromSceneId: "scene-exploration",
          toSceneId: "scene-tension",
          mode: "bar-sync" as const,
          durationMs: 1000,
        },
      ],
    };

    await t.playScene(noBpmPack, "scene-exploration");
    const switchPromise = t.switchScene(noBpmPack, "scene-tension");
    await vi.advanceTimersByTimeAsync(5000);
    await switchPromise;

    // Should warn about missing BPM and fall back to immediate
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("bar-sync"),
    );
    expect(t.getSnapshot().transport).toBe("playing");

    warnSpy.mockRestore();
  });
});

describe("TransitionPlayer — no rule fallback", () => {
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

  it("no transition rule falls back to immediate switch", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    // Play exploration, then go to safe-zone (no rule defined for this pair)
    await t.playScene(pack, "scene-exploration");
    await t.switchScene(pack, "scene-safe-zone");

    expect(t.getSnapshot().transport).toBe("playing");
  });

  it("switching to the same scene is treated as immediate", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();

    await t.playScene(pack, "scene-exploration");
    await t.switchScene(pack, "scene-exploration");

    expect(t.getSnapshot().transport).toBe("playing");
    expect(t.getSnapshot().currentSceneId).toBe("scene-exploration");
  });
});
