import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SoundtrackPack } from "@motif/schema";
import { loadFixture, FIXTURES } from "@motif/test-kit";

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
    decodeAudioData: vi.fn(() => Promise.resolve(createMockAudioBuffer())),
  } as unknown as AudioContext;
}

// ── Tests ──

describe("AssetLoader — basic load + cache", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads assets and caches them", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.loaded).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(loader.getBuffer("asset-explore-base")).toBeDefined();
  });

  it("returns cache hit on second load (no extra fetch)", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    await loader.loadForStems(pack, ["stem-explore-base"]);
    const fetchCount = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
      .length;

    // Second load should hit cache
    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.loaded).toBe(0); // nothing new loaded
    expect(result.errors).toHaveLength(0);
    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(fetchCount);
  });

  it("allCached returns true after loading", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    expect(loader.allCached(["asset-explore-base"])).toBe(false);
    await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(loader.allCached(["asset-explore-base"])).toBe(true);
  });

  it("allCached returns true for empty list", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);
    expect(loader.allCached([])).toBe(true);
  });
});

describe("AssetLoader — decode failure handling", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles HTTP 404 errors gracefully", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        headers: { get: () => "text/html" },
      } as unknown as Response),
    );

    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("404");
  });

  it("handles decodeAudioData failure", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );
    (ctx.decodeAudioData as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Decoding failed"),
    );

    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Decoding failed");
  });

  it("handles fetch network error", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error")),
    );

    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Network error");
  });

  it("rejects HTML content-type responses", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "text/html; charset=utf-8" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );

    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("expected audio content");
  });

  it("rejects empty response body", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      } as unknown as Response),
    );

    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("empty response");
  });
});

describe("AssetLoader — timeout behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("fetch timeout aborts via AbortController", async () => {
    const ctx = createMockAudioContext();
    const pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    // Simulate a fetch that never resolves until aborted
    globalThis.fetch = vi.fn(
      (_url: string, opts?: { signal?: AbortSignal }) => {
        return new Promise<Response>((_resolve, reject) => {
          if (opts?.signal) {
            opts.signal.addEventListener("abort", () => {
              const err = new DOMException("Aborted", "AbortError");
              reject(err);
            });
          }
        });
      },
    );

    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const loadPromise = loader.loadForStems(pack, ["stem-explore-base"]);

    // Advance past the timeout (30s)
    await vi.advanceTimersByTimeAsync(31_000);

    const result = await loadPromise;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("timed out");
  });
});

describe("AssetLoader — clearCache", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clear removes all cached buffers", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(loader.getBuffer("asset-explore-base")).toBeDefined();

    loader.clear();
    expect(loader.getBuffer("asset-explore-base")).toBeUndefined();
    expect(loader.allCached(["asset-explore-base"])).toBe(false);
  });

  it("loading after clear re-fetches assets", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    await loader.loadForStems(pack, ["stem-explore-base"]);
    loader.clear();

    const result = await loader.loadForStems(pack, ["stem-explore-base"]);
    expect(result.loaded).toBe(1);
    expect(loader.getBuffer("asset-explore-base")).toBeDefined();
  });
});

describe("AssetLoader — stinger loading", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads a stinger asset by ID", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const buffer = await loader.loadStingerAsset(pack, "asset-stinger-combat");
    expect(buffer).toBeDefined();
  });

  it("returns null for nonexistent stinger asset ID", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const buffer = await loader.loadStingerAsset(pack, "nonexistent-asset");
    expect(buffer).toBeNull();
  });

  it("returns cached stinger on second call", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const first = await loader.loadStingerAsset(pack, "asset-stinger-combat");
    const fetchCount = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
      .length;

    const second = await loader.loadStingerAsset(pack, "asset-stinger-combat");
    expect(second).toBe(first);
    // No additional fetch
    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(fetchCount);
  });
});

describe("AssetLoader — event emission", () => {
  let ctx: AudioContext;
  let pack: SoundtrackPack;

  beforeEach(() => {
    ctx = createMockAudioContext();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as unknown as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits load-progress events during loading", async () => {
    const { AssetLoader } = await import("../src/loader.js");
    const loader = new AssetLoader(ctx);

    const events: Array<{ type: string; detail: unknown }> = [];
    loader.setListener((evt) => events.push(evt));

    await loader.loadForStems(pack, ["stem-explore-base"]);

    const progressEvents = events.filter((e) => e.type === "load-progress");
    expect(progressEvents.length).toBeGreaterThanOrEqual(2); // at least start + end
  });
});
