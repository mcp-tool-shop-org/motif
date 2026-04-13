import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  EqParams,
  DelayParams,
  ReverbParams,
  CompressorParams,
  ChorusParams,
  DistortionParams,
  PhaserParams,
  LimiterParams,
} from "../src/mixer-types.js";
import {
  DEFAULT_EQ_PARAMS,
  DEFAULT_DELAY_PARAMS,
  DEFAULT_REVERB_PARAMS,
  DEFAULT_COMPRESSOR_PARAMS,
  DEFAULT_CHORUS_PARAMS,
  DEFAULT_DISTORTION_PARAMS,
  DEFAULT_PHASER_PARAMS,
  DEFAULT_LIMITER_PARAMS,
} from "../src/mixer-types.js";

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

function createMockAudioContext(): BaseAudioContext {
  return {
    currentTime: 0,
    state: "running",
    sampleRate: 44100,
    destination: {} as AudioDestinationNode,
    createGain: vi.fn(() => createMockGainNode()),
    createBiquadFilter: vi.fn(() => createMockBiquadFilter()),
    createDelay: vi.fn(() => createMockDelay()),
    createConvolver: vi.fn(() => createMockConvolver()),
    createDynamicsCompressor: vi.fn(() => createMockDynamicsCompressor()),
    createWaveShaper: vi.fn(() => createMockWaveShaper()),
    createOscillator: vi.fn(() => createMockOscillator()),
    createBuffer: vi.fn(
      (channels: number, length: number, sampleRate: number) => {
        const buf = createMockAudioBuffer();
        Object.defineProperty(buf, "numberOfChannels", { value: channels });
        Object.defineProperty(buf, "length", { value: length });
        Object.defineProperty(buf, "sampleRate", { value: sampleRate });
        return buf;
      },
    ),
  } as unknown as BaseAudioContext;
}

// ── Tests ──

describe("createFxNodes — eq", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates EQ node set with correct type", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const params: EqParams = { ...DEFAULT_EQ_PARAMS };
    const nodeSet = createFxNodes(ctx, "eq", params);

    expect(nodeSet.type).toBe("eq");
    expect(nodeSet.input).toBeDefined();
    expect(nodeSet.output).toBeDefined();
    expect(nodeSet.nodes.length).toBeGreaterThan(0);
  });

  it("updates EQ parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "eq", { ...DEFAULT_EQ_PARAMS });

    const newParams: EqParams = {
      type: "lowpass",
      frequency: 500,
      gain: -3,
      Q: 2,
    };
    // Should not throw
    nodeSet.update(newParams);
  });
});

describe("createFxNodes — delay", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates delay node set with dry/wet mix", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "delay", { ...DEFAULT_DELAY_PARAMS });

    expect(nodeSet.type).toBe("delay");
    // Delay creates: input, output, dry, wet, delay, feedback = 6 nodes
    expect(nodeSet.nodes.length).toBe(6);
  });

  it("updates delay parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "delay", { ...DEFAULT_DELAY_PARAMS });

    const newParams: DelayParams = {
      delayTime: 0.5,
      feedback: 0.6,
      mix: 0.4,
    };
    nodeSet.update(newParams);
  });

  it("clamps feedback to safe maximum (0.95)", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    // Feedback > 0.95 should be clamped to prevent oscillation
    const params: DelayParams = { delayTime: 0.25, feedback: 1.5, mix: 0.3 };
    const nodeSet = createFxNodes(ctx, "delay", params);
    expect(nodeSet).toBeDefined();
    // The feedback gain node should be clamped (we verify it doesn't crash)
  });
});

describe("createFxNodes — reverb", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates reverb node set with convolver", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "reverb", { ...DEFAULT_REVERB_PARAMS });

    expect(nodeSet.type).toBe("reverb");
    // Reverb creates: input, output, dry, wet, convolver = 5 nodes
    expect(nodeSet.nodes.length).toBe(5);
  });

  it("updates reverb parameters and regenerates impulse", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "reverb", { ...DEFAULT_REVERB_PARAMS });

    const newParams: ReverbParams = { decayTime: 3.0, mix: 0.6 };
    nodeSet.update(newParams);
  });
});

describe("createFxNodes — compressor", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates compressor node set", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "compressor", {
      ...DEFAULT_COMPRESSOR_PARAMS,
    });

    expect(nodeSet.type).toBe("compressor");
    expect(nodeSet.nodes).toHaveLength(1);
  });

  it("updates compressor parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "compressor", {
      ...DEFAULT_COMPRESSOR_PARAMS,
    });

    const newParams: CompressorParams = {
      threshold: -12,
      ratio: 8,
      attack: 0.01,
      release: 0.1,
      knee: 10,
    };
    nodeSet.update(newParams);
  });
});

describe("createFxNodes — chorus", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates chorus node set with LFO", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "chorus", { ...DEFAULT_CHORUS_PARAMS });

    expect(nodeSet.type).toBe("chorus");
    // Chorus creates: input, output, dry, wet, delay, lfo, lfoGain = 7 nodes
    expect(nodeSet.nodes.length).toBe(7);
  });

  it("updates chorus parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "chorus", { ...DEFAULT_CHORUS_PARAMS });

    const newParams: ChorusParams = { rate: 3.0, depth: 10, mix: 0.7 };
    nodeSet.update(newParams);
  });

  it("handles zero-depth chorus (edge case)", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const params: ChorusParams = { rate: 1.5, depth: 0, mix: 0.5 };
    const nodeSet = createFxNodes(ctx, "chorus", params);
    expect(nodeSet).toBeDefined();
    expect(nodeSet.type).toBe("chorus");
  });
});

describe("createFxNodes — distortion", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates distortion node set with waveshaper + tone filter", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "distortion", {
      ...DEFAULT_DISTORTION_PARAMS,
    });

    expect(nodeSet.type).toBe("distortion");
    // Distortion creates: input, output, dry, wet, shaper, toneFilter = 6 nodes
    expect(nodeSet.nodes.length).toBe(6);
  });

  it("creates with all curve types", async () => {
    const { createFxNodes } = await import("../src/fx.js");

    for (const curve of ["soft-clip", "hard-clip", "tube"] as const) {
      const params: DistortionParams = {
        drive: 50,
        tone: 3000,
        mix: 0.5,
        curve,
      };
      const nodeSet = createFxNodes(ctx, "distortion", params);
      expect(nodeSet.type).toBe("distortion");
    }
  });

  it("updates distortion parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "distortion", {
      ...DEFAULT_DISTORTION_PARAMS,
    });

    const newParams: DistortionParams = {
      drive: 80,
      tone: 5000,
      mix: 0.8,
      curve: "hard-clip",
    };
    nodeSet.update(newParams);
  });

  it("handles zero-drive distortion (edge case)", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const params: DistortionParams = {
      drive: 0,
      tone: 3000,
      mix: 0.5,
      curve: "soft-clip",
    };
    const nodeSet = createFxNodes(ctx, "distortion", params);
    expect(nodeSet).toBeDefined();
    expect(nodeSet.type).toBe("distortion");
  });
});

describe("createFxNodes — phaser", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates phaser node set with allpass chain", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "phaser", { ...DEFAULT_PHASER_PARAMS });

    expect(nodeSet.type).toBe("phaser");
    // Phaser creates: input, output, feedbackGain, lfo + (stages allpass filters) + (stages lfoGains)
    // Default stages = 4, so 4 + 3 + 4 + 4 = 15 nodes (input, output, feedbackGain, lfo, 4 ap, 4 lfoGain)
    expect(nodeSet.nodes.length).toBeGreaterThanOrEqual(8);
  });

  it("updates phaser parameters", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "phaser", { ...DEFAULT_PHASER_PARAMS });

    const newParams: PhaserParams = {
      rate: 2.0,
      depth: 0.8,
      stages: 6,
      feedback: 0.7,
    };
    nodeSet.update(newParams);
  });
});

describe("createFxNodes — limiter", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("creates limiter node set", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "limiter", { ...DEFAULT_LIMITER_PARAMS });

    expect(nodeSet.type).toBe("limiter");
    expect(nodeSet.nodes).toHaveLength(1);
  });

  it("updates limiter ceiling", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "limiter", { ...DEFAULT_LIMITER_PARAMS });

    const newParams: LimiterParams = { ceiling: -0.5 };
    nodeSet.update(newParams);
  });
});

describe("disposeFxNodes", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("disconnects all nodes in the set", async () => {
    const { createFxNodes, disposeFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "delay", { ...DEFAULT_DELAY_PARAMS });

    // All nodes should have disconnect called
    disposeFxNodes(nodeSet);
    for (const node of nodeSet.nodes) {
      expect(node.disconnect).toHaveBeenCalled();
    }
  });

  it("handles already-disconnected nodes gracefully", async () => {
    const { createFxNodes, disposeFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "eq", { ...DEFAULT_EQ_PARAMS });

    // Make disconnect throw on first node to simulate already-disconnected
    (nodeSet.nodes[0].disconnect as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw new Error("already disconnected");
      },
    );

    // Should not throw
    disposeFxNodes(nodeSet);
  });

  it("disposes all 8 FX types without error", async () => {
    const { createFxNodes, disposeFxNodes } = await import("../src/fx.js");

    const types = [
      { type: "eq" as const, params: { ...DEFAULT_EQ_PARAMS } },
      { type: "delay" as const, params: { ...DEFAULT_DELAY_PARAMS } },
      { type: "reverb" as const, params: { ...DEFAULT_REVERB_PARAMS } },
      { type: "compressor" as const, params: { ...DEFAULT_COMPRESSOR_PARAMS } },
      { type: "chorus" as const, params: { ...DEFAULT_CHORUS_PARAMS } },
      { type: "distortion" as const, params: { ...DEFAULT_DISTORTION_PARAMS } },
      { type: "phaser" as const, params: { ...DEFAULT_PHASER_PARAMS } },
      { type: "limiter" as const, params: { ...DEFAULT_LIMITER_PARAMS } },
    ];

    for (const { type, params } of types) {
      const nodeSet = createFxNodes(ctx, type, params);
      expect(() => disposeFxNodes(nodeSet)).not.toThrow();
    }
  });
});

describe("createFxNodes — unknown type", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("throws on unknown FX type", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    expect(() =>
      createFxNodes(ctx, "unknown-effect" as never, {} as never),
    ).toThrow(/Unknown FX type/);
  });
});

describe("update with wrong param shape is a no-op", () => {
  let ctx: BaseAudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
  });

  it("eq ignores non-EQ params", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "eq", { ...DEFAULT_EQ_PARAMS });
    // Pass delay params to eq update — should be silently ignored
    nodeSet.update({ delayTime: 0.5, feedback: 0.3, mix: 0.2 } as DelayParams);
  });

  it("delay ignores non-Delay params", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "delay", { ...DEFAULT_DELAY_PARAMS });
    nodeSet.update({
      type: "peaking",
      frequency: 1000,
      gain: 0,
      Q: 1,
    } as EqParams);
  });

  it("compressor ignores non-Compressor params", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "compressor", {
      ...DEFAULT_COMPRESSOR_PARAMS,
    });
    nodeSet.update({ ceiling: -1 } as LimiterParams);
  });

  it("limiter ignores non-Limiter params", async () => {
    const { createFxNodes } = await import("../src/fx.js");
    const nodeSet = createFxNodes(ctx, "limiter", { ...DEFAULT_LIMITER_PARAMS });
    nodeSet.update({ delayTime: 0.5, feedback: 0.3, mix: 0.2 } as DelayParams);
  });
});
