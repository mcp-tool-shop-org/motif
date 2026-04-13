import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SoundtrackPack } from "@motif/schema";
import { loadFixture, FIXTURES } from "@motif/test-kit";
import { dbToGain } from "../src/scene-player.js";

// ── Minimal mock for Web Audio API ──

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

function createMockOscillatorForCtx(): OscillatorNode {
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
    createOscillator: vi.fn(() => createMockOscillatorForCtx()),
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

describe("dbToGain", () => {
  it("converts 0 dB to gain 1", () => {
    expect(dbToGain(0)).toBeCloseTo(1);
  });

  it("converts -6 dB to approximately 0.5", () => {
    expect(dbToGain(-6)).toBeCloseTo(0.5012, 3);
  });

  it("converts -20 dB to 0.1", () => {
    expect(dbToGain(-20)).toBeCloseTo(0.1, 4);
  });

  it("converts +6 dB to approximately 2", () => {
    expect(dbToGain(6)).toBeCloseTo(1.9953, 3);
  });
});

describe("AssetLoader", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
  });

  it("can be constructed", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    expect(loader).toBeDefined();
  });

  it("reports all cached for empty stem list", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    expect(loader.allCached([])).toBe(true);
  });

  it("reports not cached for unloaded assets", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    expect(loader.allCached(["asset-explore-base"])).toBe(false);
  });

  it("loads assets for stems using fetch + decodeAudioData", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    // Mock fetch
    const mockArrayBuffer = new ArrayBuffer(100);
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      } as Response),
    );

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.loaded).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(loader.getBuffer("asset-explore-base")).toBeDefined();
  });

  it("handles fetch errors gracefully", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      } as Response),
    );

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("404");
  });

  it("clears cache", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as Response),
    );

    await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(loader.getBuffer("asset-explore-base")).toBeDefined();

    loader.clear();
    expect(loader.getBuffer("asset-explore-base")).toBeUndefined();
  });
});

describe("ScenePlayer", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    // Mock fetch for loading
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as Response),
    );
  });

  it("plays a scene and returns stem IDs", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const { ScenePlayer } = await import("../src/scene-player.js");
    const loader = new AssetLoader(ctx);
    const player = new ScenePlayer(ctx, loader);

    const stemIds = await player.playScene(pack, "scene-exploration");
    expect(stemIds).toContain("stem-explore-base");
    expect(stemIds).toContain("stem-explore-accent");
    expect(player.sceneId).toBe("scene-exploration");
  });

  it("tracks stem handles after playing", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const { ScenePlayer } = await import("../src/scene-player.js");
    const loader = new AssetLoader(ctx);
    const player = new ScenePlayer(ctx, loader);

    await player.playScene(pack, "scene-combat");
    expect(player.stemHandles.size).toBe(2); // combat-base + combat-danger
  });

  it("stopAll clears handles and scene", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const { ScenePlayer } = await import("../src/scene-player.js");
    const loader = new AssetLoader(ctx);
    const player = new ScenePlayer(ctx, loader);

    await player.playScene(pack, "scene-exploration");
    expect(player.sceneId).toBe("scene-exploration");

    player.stopAll();
    expect(player.sceneId).toBeNull();
    expect(player.stemHandles.size).toBe(0);
  });

  it("setMuted toggles stem mute state", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const { ScenePlayer } = await import("../src/scene-player.js");
    const loader = new AssetLoader(ctx);
    const player = new ScenePlayer(ctx, loader);

    await player.playScene(pack, "scene-exploration");
    player.setMuted("stem-explore-base", true);
    expect(player.stemHandles.get("stem-explore-base")?.muted).toBe(true);
  });

  it("setSolo toggles stem solo state", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const { ScenePlayer } = await import("../src/scene-player.js");
    const loader = new AssetLoader(ctx);
    const player = new ScenePlayer(ctx, loader);

    await player.playScene(pack, "scene-exploration");
    player.setSolo("stem-explore-base", true);
    expect(player.stemHandles.get("stem-explore-base")?.solo).toBe(true);
  });

  it("setGain updates stem gain", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const { ScenePlayer } = await import("../src/scene-player.js");
    const loader = new AssetLoader(ctx);
    const player = new ScenePlayer(ctx, loader);

    await player.playScene(pack, "scene-exploration");
    player.setGain("stem-explore-base", -6);
    expect(player.stemHandles.get("stem-explore-base")?.userGainDb).toBe(-6);
  });
});

describe("Transport", () => {
  beforeEach(() => {
    // Mock AudioContext constructor
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

  it("creates and returns snapshot in stopped state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const snap = t.getSnapshot();
    expect(snap.transport).toBe("stopped");
    expect(snap.currentSceneId).toBeNull();
  });

  it("ensureContext creates AudioContext", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const ctx = t.ensureContext();
    expect(ctx).toBeDefined();
  });

  it("playScene transitions to playing state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    const snap = t.getSnapshot();
    expect(snap.transport).toBe("playing");
    expect(snap.currentSceneId).toBe("scene-exploration");
  });

  it("stop transitions back to stopped", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    t.stop();
    const snap = t.getSnapshot();
    expect(snap.transport).toBe("stopped");
  });

  it("on/off subscribes and unsubscribes", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const events: string[] = [];
    const unsub = t.on((evt) => events.push(evt.type));
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    expect(events.length).toBeGreaterThan(0);

    unsub();
  });

  it("dispose cleans up", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    t.ensureContext();
    t.dispose();
    const snap = t.getSnapshot();
    expect(snap.transport).toBe("stopped");
  });

  it("mute/solo/gain delegate to scene player", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    // These should not throw
    t.setMuted("stem-explore-base", true);
    t.setSolo("stem-explore-base", true);
    t.setGain("stem-explore-base", -3);
  });

  it("pan/bus delegates to scene player through mixer", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    // These should not throw
    t.setPan("stem-explore-base", -0.5);
    t.setStemBus("stem-explore-base", "drums");
    t.setMasterGain(-3);
  });

  it("getMixerSnapshot returns mixer state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");
    const snap = t.getMixerSnapshot();
    expect(snap).toBeDefined();
    expect(snap!.buses).toHaveLength(3);
    expect(snap!.buses.map((b) => b.id)).toEqual(["drums", "music", "master"]);
    expect(snap!.stems.length).toBeGreaterThan(0);
  });

  it("addFxSlot and removeFxSlot modify bus FX", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    t.ensureContext();

    // Master bus starts with default compressor
    let snap = t.getMixerSnapshot()!;
    const masterSlots = snap.buses.find((b) => b.id === "master")!.fxSlots;
    expect(masterSlots.length).toBeGreaterThanOrEqual(1);

    // Add EQ to drums bus
    t.addFxSlot("drums", "eq");
    snap = t.getMixerSnapshot()!;
    const drumsFx = snap.buses.find((b) => b.id === "drums")!.fxSlots;
    expect(drumsFx).toHaveLength(1);
    expect(drumsFx[0].type).toBe("eq");

    // Remove it
    t.removeFxSlot("drums", 0);
    snap = t.getMixerSnapshot()!;
    expect(snap.buses.find((b) => b.id === "drums")!.fxSlots).toHaveLength(0);
  });

  it("setBusGain and setBusMuted update bus state", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    t.ensureContext();

    t.setBusGain("music", -6);
    t.setBusMuted("drums", true);

    const snap = t.getMixerSnapshot()!;
    expect(snap.buses.find((b) => b.id === "music")!.gainDb).toBe(-6);
    expect(snap.buses.find((b) => b.id === "drums")!.muted).toBe(true);
  });

  it("setFxBypassed toggles FX bypass", async () => {
    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    t.ensureContext();

    t.addFxSlot("music", "delay");
    t.setFxBypassed("music", 0, true);

    const snap = t.getMixerSnapshot()!;
    expect(snap.buses.find((b) => b.id === "music")!.fxSlots[0].bypassed).toBe(
      true,
    );
  });
});

describe("Mixer", () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates with 3 buses and a default compressor on master", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const snap = mixer.getSnapshot();

    expect(snap.buses).toHaveLength(3);
    expect(snap.buses.map((b) => b.id)).toEqual(["drums", "music", "master"]);
    // Master has default compressor
    expect(snap.buses[2].fxSlots).toHaveLength(1);
    expect(snap.buses[2].fxSlots[0].type).toBe("compressor");
  });

  it("connects and disconnects stems with pan", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();

    const panNode = mixer.connectStem("stem-1", gainNode, "music", 0.5);
    expect(panNode).toBeDefined();
    expect(mixer.getPan("stem-1")).toBe(0.5);
    expect(mixer.getStemBus("stem-1")).toBe("music");

    const snap = mixer.getSnapshot();
    expect(snap.stems).toHaveLength(1);
    expect(snap.stems[0].stemId).toBe("stem-1");

    mixer.disconnectStem("stem-1");
    expect(mixer.getSnapshot().stems).toHaveLength(0);
  });

  it("setPan clamps value to [-1, 1]", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);

    mixer.setPan("stem-1", 2.5);
    expect(mixer.getPan("stem-1")).toBe(1);

    mixer.setPan("stem-1", -3);
    expect(mixer.getPan("stem-1")).toBe(-1);
  });

  it("setStemBus changes bus assignment", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode, "music");
    expect(mixer.getStemBus("stem-1")).toBe("music");

    mixer.setStemBus("stem-1", "drums");
    expect(mixer.getStemBus("stem-1")).toBe("drums");
  });

  it("setMasterGain updates master gain", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);

    mixer.setMasterGain(-6);
    expect(mixer.getMasterGainDb()).toBe(-6);
  });

  it("adds and removes FX slots", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);

    mixer.addFxSlot("drums", "eq");
    mixer.addFxSlot("drums", "delay");
    expect(mixer.getSnapshot().buses[0].fxSlots).toHaveLength(2);

    mixer.removeFxSlot("drums", 0);
    expect(mixer.getSnapshot().buses[0].fxSlots).toHaveLength(1);
    expect(mixer.getSnapshot().buses[0].fxSlots[0].type).toBe("delay");
  });

  it("setBusMuted and setBusGain work", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);

    mixer.setBusGain("music", -12);
    mixer.setBusMuted("music", true);

    const bus = mixer.getSnapshot().buses.find((b) => b.id === "music")!;
    expect(bus.gainDb).toBe(-12);
    expect(bus.muted).toBe(true);
  });

  it("dispose cleans up", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);
    mixer.addFxSlot("drums", "reverb");

    mixer.dispose();
    expect(mixer.getSnapshot().stems).toHaveLength(0);
  });

  // ── Per-stem FX insert tests ──

  it("addStemFx adds FX to a stem and getStemFxSlots returns them", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);

    mixer.addStemFx("stem-1", "eq");
    mixer.addStemFx("stem-1", "delay");

    const slots = mixer.getStemFxSlots("stem-1");
    expect(slots).toHaveLength(2);
    expect(slots[0].type).toBe("eq");
    expect(slots[1].type).toBe("delay");
  });

  it("addStemFx enforces max 4 slots per stem", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);

    mixer.addStemFx("stem-1", "eq");
    mixer.addStemFx("stem-1", "delay");
    mixer.addStemFx("stem-1", "reverb");
    mixer.addStemFx("stem-1", "compressor");
    mixer.addStemFx("stem-1", "chorus"); // should be rejected

    expect(mixer.getStemFxSlots("stem-1")).toHaveLength(4);
  });

  it("removeStemFx removes an FX slot by index", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);

    mixer.addStemFx("stem-1", "eq");
    mixer.addStemFx("stem-1", "delay");
    mixer.removeStemFx("stem-1", 0);

    const slots = mixer.getStemFxSlots("stem-1");
    expect(slots).toHaveLength(1);
    expect(slots[0].type).toBe("delay");
  });

  it("updateStemFx updates FX parameters", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);

    mixer.addStemFx("stem-1", "eq");
    mixer.updateStemFx("stem-1", 0, { type: "peaking", frequency: 3000, gain: 6, Q: 2 });

    const slots = mixer.getStemFxSlots("stem-1");
    expect((slots[0].params as any).frequency).toBe(3000);
  });

  it("stem FX survive disconnect/reconnect (scene transition)", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode1 = createMockGainNode();
    mixer.connectStem("stem-1", gainNode1);
    mixer.addStemFx("stem-1", "chorus");

    // Disconnect (simulates scene transition)
    mixer.disconnectStem("stem-1");

    // Reconnect with a new gain node
    const gainNode2 = createMockGainNode();
    mixer.connectStem("stem-1", gainNode2);

    // FX should still be there
    const slots = mixer.getStemFxSlots("stem-1");
    expect(slots).toHaveLength(1);
    expect(slots[0].type).toBe("chorus");
  });

  it("addStemFx works before stem is connected", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);

    // Add FX before connecting stem
    mixer.addStemFx("future-stem", "reverb");
    expect(mixer.getStemFxSlots("future-stem")).toHaveLength(1);

    // Now connect — FX should be wired in
    const gainNode = createMockGainNode();
    mixer.connectStem("future-stem", gainNode);
    expect(mixer.getStemFxSlots("future-stem")).toHaveLength(1);
  });

  it("snapshot includes stem FX slots", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);
    const gainNode = createMockGainNode();
    mixer.connectStem("stem-1", gainNode);
    mixer.addStemFx("stem-1", "distortion");

    const snap = mixer.getSnapshot();
    expect(snap.stems[0].fxSlots).toHaveLength(1);
    expect(snap.stems[0].fxSlots![0].type).toBe("distortion");
  });

  it("pruneOrphanedStemFx removes FX for dead stems", async () => {
    const { Mixer } = await import("../src/mixer.js");
    const mixer = new Mixer(ctx, ctx.destination);

    mixer.addStemFx("alive", "eq");
    mixer.addStemFx("dead", "delay");

    mixer.pruneOrphanedStemFx(new Set(["alive"]));

    expect(mixer.getStemFxSlots("alive")).toHaveLength(1);
    expect(mixer.getStemFxSlots("dead")).toHaveLength(0);
  });
});

describe("FX factory", () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates EQ nodes", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_EQ_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "eq", { ...DEFAULT_EQ_PARAMS });
    expect(fx.type).toBe("eq");
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  it("creates delay nodes", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_DELAY_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "delay", { ...DEFAULT_DELAY_PARAMS });
    expect(fx.type).toBe("delay");
    expect(fx.nodes.length).toBeGreaterThan(1);
  });

  it("creates reverb nodes", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_REVERB_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "reverb", { ...DEFAULT_REVERB_PARAMS });
    expect(fx.type).toBe("reverb");
  });

  it("creates compressor nodes", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_COMPRESSOR_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "compressor", {
      ...DEFAULT_COMPRESSOR_PARAMS,
    });
    expect(fx.type).toBe("compressor");
  });

  it("update modifies FX parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_EQ_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "eq", { ...DEFAULT_EQ_PARAMS });
    // Should not throw
    fx.update({ ...DEFAULT_EQ_PARAMS, frequency: 2000, gain: 3 });
  });

  it("disposeFxNodes disconnects all nodes", async () => {
    const { createFxNodes, disposeFxNodes } = await import("../src/fx.js");
    const { DEFAULT_DELAY_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "delay", { ...DEFAULT_DELAY_PARAMS });
    // Should not throw
    disposeFxNodes(fx);
  });

  it("creates chorus nodes with LFO", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_CHORUS_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "chorus", { ...DEFAULT_CHORUS_PARAMS });
    expect(fx.type).toBe("chorus");
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
    // Chorus uses: input, output, dry, wet, delay, lfo, lfoGain = 7 nodes
    expect(fx.nodes.length).toBe(7);
  });

  it("chorus update modifies params without throwing", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_CHORUS_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "chorus", { ...DEFAULT_CHORUS_PARAMS });
    fx.update({ rate: 2.0, depth: 8, mix: 0.7 });
  });

  it("creates distortion nodes with waveshaper", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_DISTORTION_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "distortion", { ...DEFAULT_DISTORTION_PARAMS });
    expect(fx.type).toBe("distortion");
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
    // distortion uses: input, output, dry, wet, shaper, toneFilter = 6 nodes
    expect(fx.nodes.length).toBe(6);
  });

  it("distortion update changes curve and tone", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_DISTORTION_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "distortion", { ...DEFAULT_DISTORTION_PARAMS });
    fx.update({ drive: 60, tone: 5000, mix: 0.8, curve: "hard-clip" });
  });

  it("creates phaser nodes with allpass stages", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_PHASER_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "phaser", { ...DEFAULT_PHASER_PARAMS });
    expect(fx.type).toBe("phaser");
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
    // phaser uses: input, output, feedbackGain, lfo + 4 allpass + 4 lfoGains = 12 nodes
    expect(fx.nodes.length).toBe(12);
  });

  it("phaser update modifies rate and feedback", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_PHASER_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "phaser", { ...DEFAULT_PHASER_PARAMS });
    fx.update({ rate: 1.5, depth: 0.8, stages: 4, feedback: 0.7 });
  });

  it("creates limiter nodes", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_LIMITER_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "limiter", { ...DEFAULT_LIMITER_PARAMS });
    expect(fx.type).toBe("limiter");
    expect(fx.nodes.length).toBe(1); // single compressor node
  });

  it("limiter update adjusts ceiling", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const { DEFAULT_LIMITER_PARAMS } = await import("../src/mixer-types.js");
    const fx = createFxNodes(ctx, "limiter", { ...DEFAULT_LIMITER_PARAMS });
    fx.update({ ceiling: -2 });
  });
});

describe("mixer-types", () => {
  it("defaultParamsForFx returns correct defaults for all types", async () => {
    const { defaultParamsForFx } = await import("../src/mixer-types.js");
    const eq = defaultParamsForFx("eq");
    expect(eq).toHaveProperty("frequency");

    const delay = defaultParamsForFx("delay");
    expect(delay).toHaveProperty("delayTime");

    const reverb = defaultParamsForFx("reverb");
    expect(reverb).toHaveProperty("decayTime");

    const comp = defaultParamsForFx("compressor");
    expect(comp).toHaveProperty("threshold");

    const chorus = defaultParamsForFx("chorus");
    expect(chorus).toHaveProperty("rate");
    expect(chorus).toHaveProperty("depth");

    const distortion = defaultParamsForFx("distortion");
    expect(distortion).toHaveProperty("drive");
    expect(distortion).toHaveProperty("curve");

    const phaser = defaultParamsForFx("phaser");
    expect(phaser).toHaveProperty("stages");
    expect(phaser).toHaveProperty("feedback");

    const limiter = defaultParamsForFx("limiter");
    expect(limiter).toHaveProperty("ceiling");
  });
});

describe("encodeWav", () => {
  it("encodes an AudioBuffer to a WAV blob", async () => {
    const { encodeWav } = await import("../src/renderer.js");
    const buffer = createMockAudioBuffer();
    // Provide real channel data for encoding
    const realData = new Float32Array(100);
    for (let i = 0; i < 100; i++) realData[i] = Math.sin(i * 0.1) * 0.5;
    vi.mocked(buffer.getChannelData).mockReturnValue(realData);
    Object.defineProperty(buffer, "length", { value: 100 });
    Object.defineProperty(buffer, "numberOfChannels", { value: 2 });
    Object.defineProperty(buffer, "sampleRate", { value: 44100 });

    const blob = encodeWav(buffer, 16);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
    // WAV header (44 bytes) + data (100 samples × 2 channels × 2 bytes)
    expect(blob.size).toBe(44 + 100 * 2 * 2);
  });
});

// ── Clip rendering tests ──

function createMockOscillator(): OscillatorNode {
  return {
    type: "sawtooth" as OscillatorType,
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

function createMockOfflineContext(): OfflineAudioContext {
  const mockBuffer = createMockAudioBuffer();
  return {
    currentTime: 0,
    state: "running",
    sampleRate: 44100,
    destination: {} as AudioDestinationNode,
    length: 44100 * 32,
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
    startRendering: vi.fn(() => Promise.resolve(mockBuffer)),
    resume: vi.fn(() => Promise.resolve()),
    decodeAudioData: vi.fn(() => Promise.resolve(mockBuffer)),
  } as unknown as OfflineAudioContext;
}

describe("CueRenderer — clip rendering", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => createMockAudioContext()),
    );
    vi.stubGlobal(
      "OfflineAudioContext",
      vi.fn(() => createMockOfflineContext()),
    );
  });

  it("renders a scene with clip layers (no stems)", async () => {
    const { CueRenderer } = await import("../src/renderer.js");
    const { AssetLoader } = await import("../src/loader.js");

    const ctx = new AudioContext();
    const loader = new AssetLoader(ctx);
    const renderer = new CueRenderer(ctx, loader);

    const pack: SoundtrackPack = {
      meta: { id: "test", name: "Test", version: "1.0.0", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [
        {
          id: "scene-clip",
          name: "Clip Scene",
          category: "exploration",
          layers: [],
          clipLayers: [
            { clipId: "clip-bass" },
          ],
        },
      ],
      clips: [
        {
          id: "clip-bass",
          name: "Bass",
          lane: "bass",
          instrumentId: "bass-sub",
          bpm: 120,
          lengthBeats: 4,
          loop: true,
          notes: [
            { pitch: 40, startTick: 0, durationTicks: 480, velocity: 100 },
            { pitch: 43, startTick: 480, durationTicks: 480, velocity: 90 },
          ],
        },
      ],
      bindings: [],
      transitions: [],
    };

    const result = await renderer.render(pack, {
      sceneId: "scene-clip",
      durationSeconds: 4,
      preset: "full-cue",
    });

    expect(result).toBeDefined();
    expect(result.buffer).toBeDefined();
    expect(result.sampleRate).toBe(48000);
    expect(result.channels).toBe(2);
  });

  it("renders a scene with drums clip layer", async () => {
    const { CueRenderer } = await import("../src/renderer.js");
    const { AssetLoader } = await import("../src/loader.js");

    const ctx = new AudioContext();
    const loader = new AssetLoader(ctx);
    const renderer = new CueRenderer(ctx, loader);

    const pack: SoundtrackPack = {
      meta: { id: "test", name: "Test", version: "1.0.0", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [
        {
          id: "scene-drums",
          name: "Drums",
          category: "combat",
          layers: [],
          clipLayers: [
            { clipId: "clip-drums" },
          ],
        },
      ],
      clips: [
        {
          id: "clip-drums",
          name: "Drums",
          lane: "drums",
          instrumentId: "drums-standard",
          bpm: 140,
          lengthBeats: 4,
          loop: true,
          notes: [
            { pitch: 36, startTick: 0, durationTicks: 120, velocity: 110 },
            { pitch: 38, startTick: 480, durationTicks: 120, velocity: 105 },
            { pitch: 42, startTick: 0, durationTicks: 60, velocity: 80 },
            { pitch: 42, startTick: 240, durationTicks: 60, velocity: 70 },
          ],
        },
      ],
      bindings: [],
      transitions: [],
    };

    const result = await renderer.render(pack, {
      sceneId: "scene-drums",
      durationSeconds: 4,
      preset: "full-cue",
    });

    expect(result).toBeDefined();
    expect(result.buffer).toBeDefined();
  });

  it("skips muted clip layers", async () => {
    const { CueRenderer } = await import("../src/renderer.js");
    const { AssetLoader } = await import("../src/loader.js");

    const ctx = new AudioContext();
    const loader = new AssetLoader(ctx);
    const renderer = new CueRenderer(ctx, loader);

    const pack: SoundtrackPack = {
      meta: { id: "test", name: "Test", version: "1.0.0", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [
        {
          id: "scene-muted",
          name: "Muted",
          category: "exploration",
          layers: [],
          clipLayers: [
            { clipId: "clip-muted", mutedByDefault: true },
          ],
        },
      ],
      clips: [
        {
          id: "clip-muted",
          name: "Muted Clip",
          lane: "motif",
          instrumentId: "lead-pluck",
          bpm: 120,
          lengthBeats: 4,
          loop: true,
          notes: [
            { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
          ],
        },
      ],
      bindings: [],
      transitions: [],
    };

    // Should render without errors (muted clips are skipped)
    const result = await renderer.render(pack, {
      sceneId: "scene-muted",
      durationSeconds: 4,
      preset: "full-cue",
    });
    expect(result).toBeDefined();
  });

  it("handles oneshot (non-looping) clips", async () => {
    const { CueRenderer } = await import("../src/renderer.js");
    const { AssetLoader } = await import("../src/loader.js");

    const ctx = new AudioContext();
    const loader = new AssetLoader(ctx);
    const renderer = new CueRenderer(ctx, loader);

    const pack: SoundtrackPack = {
      meta: { id: "test", name: "Test", version: "1.0.0", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [
        {
          id: "scene-oneshot",
          name: "Victory",
          category: "victory",
          layers: [],
          clipLayers: [
            { clipId: "clip-fanfare" },
          ],
        },
      ],
      clips: [
        {
          id: "clip-fanfare",
          name: "Fanfare",
          lane: "motif",
          instrumentId: "lead-square",
          bpm: 120,
          lengthBeats: 4,
          loop: false,
          notes: [
            { pitch: 72, startTick: 0, durationTicks: 480, velocity: 110 },
            { pitch: 76, startTick: 480, durationTicks: 960, velocity: 115 },
          ],
        },
      ],
      bindings: [],
      transitions: [],
    };

    const result = await renderer.render(pack, {
      sceneId: "scene-oneshot",
      durationSeconds: 8,
      preset: "full-cue",
    });
    expect(result).toBeDefined();
    expect(result.buffer).toBeDefined();
  });

  it("defaults to 30s duration when no stems or clips provide length", async () => {
    const { CueRenderer } = await import("../src/renderer.js");
    const { AssetLoader } = await import("../src/loader.js");

    const ctx = new AudioContext();
    const loader = new AssetLoader(ctx);
    const renderer = new CueRenderer(ctx, loader);

    const pack: SoundtrackPack = {
      meta: { id: "test", name: "Test", version: "1.0.0", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [
        {
          id: "scene-empty",
          name: "Empty",
          category: "exploration",
          layers: [],
          clipLayers: [],
        },
      ],
      clips: [],
      bindings: [],
      transitions: [],
    };

    const result = await renderer.render(pack, {
      sceneId: "scene-empty",
      preset: "full-cue",
    });
    expect(result).toBeDefined();
  });
});

// ── Stage C: Humanization tests ──

describe("B1 — AudioContext creation failure", () => {
  it("sets error state with a helpful message when AudioContext is unavailable", async () => {
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => {
        throw new Error("AudioContext not allowed");
      }),
    );

    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    expect(() => t.ensureContext()).toThrow(
      "Audio engine unavailable",
    );

    const snap = t.getSnapshot();
    expect(snap.transport).toBe("error");
    expect(snap.errorMessage).toContain("Audio engine unavailable");
  });
});

describe("B2 — AudioContext resume failure", () => {
  it("throws a clear message when context stays suspended after resume", async () => {
    const suspendedCtx = createMockAudioContext();
    Object.defineProperty(suspendedCtx, "state", {
      get: () => "suspended",
      configurable: true,
    });
    (suspendedCtx.resume as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => suspendedCtx),
    );

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: new Map([["content-type", "audio/wav"]]),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
      } as unknown as Response),
    );

    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    await t.playScene(pack, "scene-exploration");

    const snap = t.getSnapshot();
    expect(snap.transport).toBe("error");
    expect(snap.errorMessage).toContain("Audio blocked by browser");
  });
});

describe("B3 — handleError stops playback", () => {
  it("clears stem handles after error (handleError calls stop)", async () => {
    const mockCtx = createMockAudioContext();
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => mockCtx),
    );

    // First call succeeds (playScene loads), second call triggers error
    let callCount = 0;
    globalThis.fetch = vi.fn(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
        } as Response);
      }
      return Promise.reject(new Error("network failure"));
    });

    const { Transport } = await import("../src/transport.js");
    const t = new Transport();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    // Play successfully first
    await t.playScene(pack, "scene-exploration");
    expect(t.getSnapshot().transport).toBe("playing");

    // Force an error via switchScene to nonexistent scene (will throw internally)
    await t.playScene(pack, "nonexistent-scene-id");

    const snap = t.getSnapshot();
    // After error, handles should be cleared because handleError now calls stop
    expect(snap.stemHandles.size).toBe(0);
  });
});

describe("B7 — Content-type validation in loader", () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("rejects HTML responses with a clear error message", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: (key: string) => key === "content-type" ? "text/html; charset=utf-8" : null },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(500)),
      } as unknown as Response),
    );

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("expected audio content");
    expect(result.errors[0]).toContain("text/html");
  });

  it("rejects empty responses with a clear error message", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: (key: string) => key === "content-type" ? "audio/wav" : null },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      } as unknown as Response),
    );

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("empty response");
  });

  it("accepts valid audio content types", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: (key: string) => key === "content-type" ? "audio/mpeg" : null },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(0);
    expect(result.loaded).toBe(1);
  });
});

describe("B11 — Delay feedback safety limiter", () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("clamps feedback >= 1.0 to safe maximum (0.95)", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const fx = createFxNodes(ctx, "delay", {
      delayTime: 0.5,
      feedback: 1.5,
      mix: 0.5,
    });

    // The feedback gain node is the 6th node in the array (index 5)
    const feedbackNode = fx.nodes[5] as GainNode;
    expect(feedbackNode.gain.value).toBeLessThanOrEqual(0.95);
  });

  it("clamps feedback to 0.95 on update", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const fx = createFxNodes(ctx, "delay", {
      delayTime: 0.5,
      feedback: 0.5,
      mix: 0.5,
    });

    fx.update({ delayTime: 0.5, feedback: 1.0, mix: 0.5 });

    const feedbackNode = fx.nodes[5] as GainNode;
    expect(feedbackNode.gain.value).toBeLessThanOrEqual(0.95);
  });

  it("allows normal feedback values below 0.95", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const fx = createFxNodes(ctx, "delay", {
      delayTime: 0.5,
      feedback: 0.7,
      mix: 0.5,
    });

    const feedbackNode = fx.nodes[5] as GainNode;
    expect(feedbackNode.gain.value).toBeCloseTo(0.7);
  });
});

describe("B12 — createFxNodes exhaustive check", () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("throws for unknown FX type with a helpful message", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    expect(() =>
      createFxNodes(ctx, "flanger" as never, {} as never),
    ).toThrow("Unknown FX type");
    expect(() =>
      createFxNodes(ctx, "flanger" as never, {} as never),
    ).toThrow("Supported types");
  });
});
