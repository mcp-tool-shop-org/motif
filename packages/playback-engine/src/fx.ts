// ────────────────────────────────────────────
// FX — audio effect node factory and wiring
// ────────────────────────────────────────────

import type {
  FxType,
  FxParams,
  EqParams,
  DelayParams,
  ReverbParams,
  CompressorParams,
  ChorusParams,
  DistortionParams,
  PhaserParams,
  LimiterParams,
} from "./mixer-types.js";

/** Nodes created for a single FX slot */
export interface FxNodeSet {
  type: FxType;
  input: AudioNode;
  output: AudioNode;
  /** All nodes owned by this slot (for cleanup) */
  nodes: AudioNode[];
  /** Update parameters on existing nodes */
  update(params: FxParams): void;
}

/** Create an EQ (BiquadFilter) FX slot */
function createEq(ctx: BaseAudioContext, params: EqParams): FxNodeSet {
  const filter = ctx.createBiquadFilter();
  filter.type = params.type;
  filter.frequency.value = params.frequency;
  filter.gain.value = params.gain;
  filter.Q.value = params.Q;

  return {
    type: "eq",
    input: filter,
    output: filter,
    nodes: [filter],
    update(p: FxParams) {
      if (!("type" in p && "frequency" in p && "gain" in p && "Q" in p)) return;
      const ep = p as EqParams;
      filter.type = ep.type;
      filter.frequency.value = ep.frequency;
      filter.gain.value = ep.gain;
      filter.Q.value = ep.Q;
    },
  };
}

/**
 * Maximum safe feedback gain for delay effects.
 * Values >= 1.0 cause self-oscillation that can damage hearing.
 */
const MAX_DELAY_FEEDBACK = 0.95;

/** Clamp feedback to a safe range to prevent self-oscillation */
function safeDelayFeedback(value: number): number {
  return Math.min(Math.max(0, value), MAX_DELAY_FEEDBACK);
}

/** Create a delay FX slot with feedback loop */
function createDelay(ctx: BaseAudioContext, params: DelayParams): FxNodeSet {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const delay = ctx.createDelay(5);
  const feedback = ctx.createGain();

  dry.gain.value = 1 - params.mix;
  wet.gain.value = params.mix;
  delay.delayTime.value = params.delayTime;
  feedback.gain.value = safeDelayFeedback(params.feedback);

  // dry path: input → dry → output
  input.connect(dry);
  dry.connect(output);

  // wet path: input → delay → wet → output, with feedback loop
  input.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay); // feedback loop
  delay.connect(wet);
  wet.connect(output);

  return {
    type: "delay",
    input,
    output,
    nodes: [input, output, dry, wet, delay, feedback],
    update(p: FxParams) {
      if (!("delayTime" in p && "feedback" in p && "mix" in p)) return;
      const dp = p as DelayParams;
      dry.gain.value = 1 - dp.mix;
      wet.gain.value = dp.mix;
      delay.delayTime.value = dp.delayTime;
      feedback.gain.value = safeDelayFeedback(dp.feedback);
    },
  };
}

/** Create a reverb FX slot using ConvolverNode with generated impulse */
function createReverb(ctx: BaseAudioContext, params: ReverbParams): FxNodeSet {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const convolver = ctx.createConvolver();

  dry.gain.value = 1 - params.mix;
  wet.gain.value = params.mix;

  // Generate impulse response
  convolver.buffer = generateImpulse(ctx, params.decayTime);

  // dry path
  input.connect(dry);
  dry.connect(output);

  // wet path
  input.connect(convolver);
  convolver.connect(wet);
  wet.connect(output);

  return {
    type: "reverb",
    input,
    output,
    nodes: [input, output, dry, wet, convolver],
    update(p: FxParams) {
      if (!("decayTime" in p && "mix" in p)) return;
      const rp = p as ReverbParams;
      dry.gain.value = 1 - rp.mix;
      wet.gain.value = rp.mix;
      convolver.buffer = generateImpulse(ctx, rp.decayTime);
    },
  };
}

/** Create a compressor/limiter FX slot */
function createCompressor(
  ctx: BaseAudioContext,
  params: CompressorParams,
): FxNodeSet {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = params.threshold;
  comp.ratio.value = params.ratio;
  comp.attack.value = params.attack;
  comp.release.value = params.release;
  comp.knee.value = params.knee;

  return {
    type: "compressor",
    input: comp,
    output: comp,
    nodes: [comp],
    update(p: FxParams) {
      if (!("threshold" in p && "ratio" in p && "attack" in p && "release" in p && "knee" in p)) return;
      const cp = p as CompressorParams;
      comp.threshold.value = cp.threshold;
      comp.ratio.value = cp.ratio;
      comp.attack.value = cp.attack;
      comp.release.value = cp.release;
      comp.knee.value = cp.knee;
    },
  };
}

/**
 * Create a chorus FX slot.
 * Chorus = modulated delay line. An LFO oscillator drives the delay time
 * of a short DelayNode, creating pitch fluctuation that thickens the sound.
 * Sweet spot: rate 1.5 Hz, depth 5 ms.
 */
function createChorus(ctx: BaseAudioContext, params: ChorusParams): FxNodeSet {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const delay = ctx.createDelay(0.05); // max 50ms
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  dry.gain.value = 1 - params.mix;
  wet.gain.value = params.mix;

  // Center the delay at depth/2 ms so LFO swings around it
  const depthSec = params.depth / 1000;
  delay.delayTime.value = depthSec / 2;

  // LFO modulates delay time: depth/2 range in seconds
  lfo.type = "sine";
  lfo.frequency.value = params.rate;
  lfoGain.gain.value = depthSec / 2;

  lfo.connect(lfoGain);
  lfoGain.connect(delay.delayTime);
  lfo.start();

  // dry path
  input.connect(dry);
  dry.connect(output);

  // wet path
  input.connect(delay);
  delay.connect(wet);
  wet.connect(output);

  return {
    type: "chorus",
    input,
    output,
    nodes: [input, output, dry, wet, delay, lfo, lfoGain],
    update(p: FxParams) {
      if (!("rate" in p && "depth" in p && "mix" in p) || "curve" in p) return;
      const cp = p as ChorusParams;
      dry.gain.value = 1 - cp.mix;
      wet.gain.value = cp.mix;
      const d = cp.depth / 1000;
      delay.delayTime.value = d / 2;
      lfo.frequency.value = cp.rate;
      lfoGain.gain.value = d / 2;
    },
  };
}

/** Generate a waveshaper distortion curve */
function makeDistortionCurve(
  drive: number,
  curveType: "soft-clip" | "hard-clip" | "tube",
): Float32Array<ArrayBuffer> {
  const samples = 44100;
  const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
  const k = Math.max(1, drive);

  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1; // -1 to +1
    switch (curveType) {
      case "soft-clip":
        // Polynomial soft clip
        curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
        break;
      case "hard-clip":
        // Hard clip at threshold derived from drive
        {
          const threshold = 1 - k / 200;
          curve[i] = Math.max(-threshold, Math.min(threshold, x));
        }
        break;
      case "tube":
        // Tube-like asymmetric saturation — warm even harmonics
        if (x >= 0) {
          curve[i] = 1 - Math.exp(-k * x / 25);
        } else {
          curve[i] = -(1 - Math.exp(k * x / 25)) * 0.8;
        }
        break;
    }
  }
  return curve;
}

/** Create a distortion FX slot with waveshaper + tone filter */
function createDistortion(ctx: BaseAudioContext, params: DistortionParams): FxNodeSet {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const shaper = ctx.createWaveShaper();
  const toneFilter = ctx.createBiquadFilter();

  dry.gain.value = 1 - params.mix;
  wet.gain.value = params.mix;

  shaper.curve = makeDistortionCurve(params.drive, params.curve);
  shaper.oversample = "4x"; // reduce aliasing

  toneFilter.type = "lowpass";
  toneFilter.frequency.value = params.tone;
  toneFilter.Q.value = 0.7;

  // dry path
  input.connect(dry);
  dry.connect(output);

  // wet path: input → shaper → tone filter → wet → output
  input.connect(shaper);
  shaper.connect(toneFilter);
  toneFilter.connect(wet);
  wet.connect(output);

  return {
    type: "distortion",
    input,
    output,
    nodes: [input, output, dry, wet, shaper, toneFilter],
    update(p: FxParams) {
      if (!("drive" in p && "tone" in p && "mix" in p && "curve" in p)) return;
      const dp = p as DistortionParams;
      dry.gain.value = 1 - dp.mix;
      wet.gain.value = dp.mix;
      shaper.curve = makeDistortionCurve(dp.drive, dp.curve);
      toneFilter.frequency.value = dp.tone;
    },
  };
}

/**
 * Create a phaser FX slot.
 * Chain of allpass filters whose frequencies are swept by an LFO.
 * The swept allpass creates phase cancellation notches that sweep through
 * the spectrum — the classic jet-like phaser effect.
 */
function createPhaser(ctx: BaseAudioContext, params: PhaserParams): FxNodeSet {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const feedbackGain = ctx.createGain();
  const lfo = ctx.createOscillator();

  feedbackGain.gain.value = Math.min(params.feedback, 0.95);

  // Create allpass filter stages
  const allpassFilters: BiquadFilterNode[] = [];
  const lfoGains: GainNode[] = []; // depth scalers per stage

  const minFreq = 200;
  const maxFreq = 5000;

  for (let i = 0; i < params.stages; i++) {
    const ap = ctx.createBiquadFilter();
    ap.type = "allpass";
    // Spread base frequencies across range
    const t = i / Math.max(1, params.stages - 1);
    ap.frequency.value = minFreq + (maxFreq - minFreq) * t;
    ap.Q.value = 0.5;
    allpassFilters.push(ap);

    // LFO depth scaling for this stage
    const depthGain = ctx.createGain();
    depthGain.gain.value = params.depth * (maxFreq - minFreq) * 0.5;
    lfoGains.push(depthGain);
  }

  // Wire LFO
  lfo.type = "sine";
  lfo.frequency.value = params.rate;
  lfo.start();

  // Connect LFO to each allpass frequency via depth scaler
  for (let i = 0; i < allpassFilters.length; i++) {
    const depthGain = lfoGains[i];
    lfo.connect(depthGain);
    depthGain.connect(allpassFilters[i].frequency);
  }

  // Chain allpass filters: input → ap[0] → ap[1] → ... → ap[n]
  let current: AudioNode = input;
  for (const ap of allpassFilters) {
    current.connect(ap);
    current = ap;
  }

  // Feedback: last allpass → feedbackGain → first allpass
  const lastAp = allpassFilters[allpassFilters.length - 1];
  lastAp.connect(feedbackGain);
  feedbackGain.connect(allpassFilters[0]);

  // Mix: input (dry) + last allpass (wet) → output
  input.connect(output); // dry signal
  lastAp.connect(output); // wet signal

  const allNodes: AudioNode[] = [input, output, feedbackGain, lfo, ...allpassFilters, ...lfoGains];

  return {
    type: "phaser",
    input,
    output,
    nodes: allNodes,
    update(p: FxParams) {
      if (!("rate" in p && "depth" in p && "stages" in p && "feedback" in p)) return;
      const pp = p as PhaserParams;
      lfo.frequency.value = pp.rate;
      feedbackGain.gain.value = Math.min(pp.feedback, 0.95);
      for (const dg of lfoGains) {
        dg.gain.value = pp.depth * (maxFreq - minFreq) * 0.5;
      }
    },
  };
}

/**
 * Create a limiter FX slot.
 * A brick-wall limiter using DynamicsCompressorNode with
 * very high ratio, fast attack, and configurable ceiling.
 */
function createLimiter(ctx: BaseAudioContext, params: LimiterParams): FxNodeSet {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = Math.max(-3, Math.min(0, params.ceiling));
  comp.ratio.value = 20;
  comp.attack.value = 0.001;
  comp.release.value = 0.05;
  comp.knee.value = 0;

  return {
    type: "limiter",
    input: comp,
    output: comp,
    nodes: [comp],
    update(p: FxParams) {
      if (!("ceiling" in p)) return;
      const lp = p as LimiterParams;
      comp.threshold.value = Math.max(-3, Math.min(0, lp.ceiling));
    },
  };
}

/** Factory: create an FX node set for any FX type */
export function createFxNodes(
  ctx: BaseAudioContext,
  type: FxType,
  params: FxParams,
): FxNodeSet {
  switch (type) {
    case "eq":
      return createEq(ctx, params as EqParams);
    case "delay":
      return createDelay(ctx, params as DelayParams);
    case "reverb":
      return createReverb(ctx, params as ReverbParams);
    case "compressor":
      return createCompressor(ctx, params as CompressorParams);
    case "chorus":
      return createChorus(ctx, params as ChorusParams);
    case "distortion":
      return createDistortion(ctx, params as DistortionParams);
    case "phaser":
      return createPhaser(ctx, params as PhaserParams);
    case "limiter":
      return createLimiter(ctx, params as LimiterParams);
    default: {
      const unhandled: never = type;
      throw new Error(`Unknown FX type: '${unhandled}'. Supported types: eq, delay, reverb, compressor, chorus, distortion, phaser, limiter.`);
    }
  }
}

/** Disconnect and clean up an FX node set */
export function disposeFxNodes(fxNodeSet: FxNodeSet): void {
  for (const node of fxNodeSet.nodes) {
    try {
      node.disconnect();
    } catch {
      // May already be disconnected
    }
  }
}

/** Generate a simple exponential-decay impulse response */
function generateImpulse(
  ctx: BaseAudioContext,
  decayTime: number,
): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * decayTime));
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      // Exponential decay with random noise
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  return buffer;
}
