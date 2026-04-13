import { describe, it, expect } from "vitest";
import {
  // lanes
  createLane,
  makeTarget,
  addPoint,
  removePointAt,
  updatePoint,
  lanesForTarget,
  lanesForParam,
  clearLane,
  laneTimeSpan,
  // interpolate
  evaluateLane,
  interpolate,
  sampleLane,
  evaluateLanesAt,
  // macros
  defaultMacroState,
  createMacroMapping,
  evaluateMacros,
  applyMacroInfluence,
  mappingsForMacro,
  macrosAffectingParam,
  // envelopes
  createEnvelope,
  evaluateEnvelope,
  envelopesForTarget,
  entryEnvelopes,
  exitEnvelopes,
  // capture
  createCapture,
  recordPoint,
  finalizeCapture,
  applyCaptureToLane,
  mergeCaptureIntoLane,
  thinCapture,
  captureDuration,
} from "@motif-studio/automation";

// ── Lanes ──

describe("lanes", () => {
  const target = makeTarget("clip-layer", "clip-1", "layer-a");

  it("createLane returns a lane with empty points", () => {
    const lane = createLane("l1", "Volume", "volume", target);
    expect(lane.id).toBe("l1");
    expect(lane.name).toBe("Volume");
    expect(lane.param).toBe("volume");
    expect(lane.target).toEqual(target);
    expect(lane.points).toEqual([]);
  });

  it("makeTarget builds a target with optional layerRef", () => {
    const t1 = makeTarget("scene-layer", "s1");
    expect(t1).toEqual({ kind: "scene-layer", targetId: "s1" });

    const t2 = makeTarget("clip-layer", "c1", "lr");
    expect(t2).toEqual({ kind: "clip-layer", targetId: "c1", layerRef: "lr" });
  });

  it("addPoint inserts and sorts by time", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 500, value: 0.8 });
    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    lane = addPoint(lane, { timeMs: 300, value: 0.5 });

    expect(lane.points).toHaveLength(3);
    expect(lane.points[0].timeMs).toBe(100);
    expect(lane.points[1].timeMs).toBe(300);
    expect(lane.points[2].timeMs).toBe(500);
  });

  it("removePointAt removes within tolerance", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    lane = addPoint(lane, { timeMs: 200, value: 0.5 });
    lane = addPoint(lane, { timeMs: 300, value: 0.8 });

    lane = removePointAt(lane, 202, 5);
    expect(lane.points).toHaveLength(2);
    expect(lane.points.map((p) => p.timeMs)).toEqual([100, 300]);
  });

  it("removePointAt does nothing when no match in tolerance", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    lane = removePointAt(lane, 200, 5);
    expect(lane.points).toHaveLength(1);
  });

  it("updatePoint changes a specific index", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    lane = addPoint(lane, { timeMs: 200, value: 0.5 });

    lane = updatePoint(lane, 1, { value: 0.9 });
    expect(lane.points[1].value).toBe(0.9);
    expect(lane.points[1].timeMs).toBe(200);
  });

  it("updatePoint returns lane unchanged for out of bounds index", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    const same = updatePoint(lane, 5, { value: 0 });
    expect(same.points).toEqual(lane.points);
  });

  it("lanesForTarget filters by targetId", () => {
    const t1 = makeTarget("clip-layer", "clip-1");
    const t2 = makeTarget("scene-layer", "scene-1");
    const l1 = createLane("l1", "Vol", "volume", t1);
    const l2 = createLane("l2", "Pan", "pan", t2);
    const l3 = createLane("l3", "Filter", "filterCutoff", t1);

    expect(lanesForTarget([l1, l2, l3], "clip-1")).toHaveLength(2);
    expect(lanesForTarget([l1, l2, l3], "scene-1")).toHaveLength(1);
  });

  it("lanesForParam filters by parameter type", () => {
    const t = makeTarget("clip-layer", "clip-1");
    const l1 = createLane("l1", "Vol A", "volume", t);
    const l2 = createLane("l2", "Pan A", "pan", t);
    const l3 = createLane("l3", "Vol B", "volume", t);

    expect(lanesForParam([l1, l2, l3], "volume")).toHaveLength(2);
    expect(lanesForParam([l1, l2, l3], "pan")).toHaveLength(1);
  });

  it("clearLane removes all points", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    lane = addPoint(lane, { timeMs: 200, value: 0.5 });
    const cleared = clearLane(lane);
    expect(cleared.points).toEqual([]);
    expect(cleared.id).toBe("l1"); // preserves identity
  });

  it("laneTimeSpan returns span of points", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    expect(laneTimeSpan(lane)).toBe(0);

    lane = addPoint(lane, { timeMs: 100, value: 0.2 });
    lane = addPoint(lane, { timeMs: 500, value: 0.8 });
    expect(laneTimeSpan(lane)).toBe(400);
  });
});

// ── Interpolation ──

describe("interpolation", () => {
  const target = makeTarget("clip-layer", "clip-1");

  it("evaluateLane returns default when no points", () => {
    const lane = createLane("l1", "Vol", "volume", target);
    expect(evaluateLane(lane, 100)).toBe(0.5); // default fallback

    const laneWithDefault = { ...lane, defaultValue: 0.7 };
    expect(evaluateLane(laneWithDefault, 100)).toBe(0.7);
  });

  it("evaluateLane returns first point value before all points", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.3 });
    lane = addPoint(lane, { timeMs: 200, value: 0.8 });
    expect(evaluateLane(lane, 50)).toBe(0.3);
  });

  it("evaluateLane returns last point value after all points", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 100, value: 0.3 });
    lane = addPoint(lane, { timeMs: 200, value: 0.8 });
    expect(evaluateLane(lane, 300)).toBe(0.8);
  });

  it("evaluateLane interpolates linearly between two points", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 0, value: 0.0 });
    lane = addPoint(lane, { timeMs: 100, value: 1.0 });
    expect(evaluateLane(lane, 50)).toBeCloseTo(0.5);
    expect(evaluateLane(lane, 25)).toBeCloseTo(0.25);
  });

  it("evaluateLane handles step curves", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 0, value: 0.0, curve: "step" });
    lane = addPoint(lane, { timeMs: 100, value: 1.0 });
    expect(evaluateLane(lane, 50)).toBe(0.0);
    expect(evaluateLane(lane, 100)).toBe(1.0);
  });

  it("interpolate — linear", () => {
    expect(interpolate(0, 1, 0.5, "linear")).toBeCloseTo(0.5);
    expect(interpolate(0.2, 0.8, 0.5, "linear")).toBeCloseTo(0.5);
  });

  it("interpolate — exponential", () => {
    const val = interpolate(0, 1, 0.5, "exponential");
    expect(val).toBeCloseTo(0.25); // 0.5^2
  });

  it("interpolate — step", () => {
    expect(interpolate(0, 1, 0.5, "step")).toBe(0);
    expect(interpolate(0, 1, 1, "step")).toBe(1);
  });

  it("interpolate — smooth", () => {
    const val = interpolate(0, 1, 0.5, "smooth");
    expect(val).toBeCloseTo(0.5); // smoothstep at t=0.5 is 0.5
  });

  it("interpolate clamps t to 0–1", () => {
    expect(interpolate(0, 1, -1, "linear")).toBe(0);
    expect(interpolate(0, 1, 2, "linear")).toBe(1);
  });

  it("sampleLane returns regularly-spaced values", () => {
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 0, value: 0.0 });
    lane = addPoint(lane, { timeMs: 100, value: 1.0 });

    const samples = sampleLane(lane, 0, 100, 25);
    expect(samples).toHaveLength(5); // 0, 25, 50, 75, 100
    expect(samples[0]).toBeCloseTo(0.0);
    expect(samples[2]).toBeCloseTo(0.5);
    expect(samples[4]).toBeCloseTo(1.0);
  });

  it("evaluateLanesAt returns param map for a target", () => {
    const t = makeTarget("clip-layer", "clip-1");
    let volLane = createLane("l1", "Vol", "volume", t);
    volLane = addPoint(volLane, { timeMs: 0, value: 0.0 });
    volLane = addPoint(volLane, { timeMs: 100, value: 1.0 });

    let panLane = createLane("l2", "Pan", "pan", t);
    panLane = addPoint(panLane, { timeMs: 0, value: 0.3 });
    panLane = addPoint(panLane, { timeMs: 100, value: 0.7 });

    const other = createLane("l3", "Filter", "filterCutoff", makeTarget("scene-layer", "s2"));

    const map = evaluateLanesAt([volLane, panLane, other], "clip-1", 50);
    expect(map.size).toBe(2);
    expect(map.get("volume")).toBeCloseTo(0.5);
    expect(map.get("pan")).toBeCloseTo(0.5);
  });
});

// ── Macros ──

describe("macros", () => {
  it("defaultMacroState returns midpoints", () => {
    const state = defaultMacroState();
    expect(state).toEqual({ intensity: 0.5, tension: 0.5, brightness: 0.5, space: 0.5 });
  });

  it("createMacroMapping builds a mapping", () => {
    const m = createMacroMapping("m1", "intensity", "volume", 0.8);
    expect(m.id).toBe("m1");
    expect(m.macro).toBe("intensity");
    expect(m.param).toBe("volume");
    expect(m.weight).toBe(0.8);
    expect(m.targetId).toBeUndefined();
    expect(m.invert).toBeUndefined();
  });

  it("createMacroMapping with options", () => {
    const m = createMacroMapping("m1", "tension", "filterCutoff", 0.5, {
      targetId: "t1",
      invert: true,
    });
    expect(m.targetId).toBe("t1");
    expect(m.invert).toBe(true);
  });

  it("evaluateMacros produces additive offsets", () => {
    const state = { intensity: 1.0, tension: 0.5, brightness: 0.5, space: 0.5 };
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 1.0),
    ];
    const result = evaluateMacros(state, mappings);
    // intensity at 1.0 → offset = (1.0 - 0.5) * 1.0 = 0.5
    expect(result.get("volume")).toBeCloseTo(0.5);
  });

  it("evaluateMacros stacks offsets from multiple mappings", () => {
    const state = { intensity: 1.0, tension: 1.0, brightness: 0.5, space: 0.5 };
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 0.5),
      createMacroMapping("m2", "tension", "volume", 0.5),
    ];
    const result = evaluateMacros(state, mappings);
    // intensity: (1.0-0.5)*0.5 = 0.25; tension: (1.0-0.5)*0.5 = 0.25; total = 0.5
    expect(result.get("volume")).toBeCloseTo(0.5);
  });

  it("evaluateMacros respects invert flag", () => {
    const state = { intensity: 1.0, tension: 0.5, brightness: 0.5, space: 0.5 };
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 1.0, { invert: true }),
    ];
    const result = evaluateMacros(state, mappings);
    // inverted: -(1.0-0.5)*1.0 = -0.5
    expect(result.get("volume")).toBeCloseTo(-0.5);
  });

  it("evaluateMacros filters by targetId when provided", () => {
    const state = { intensity: 1.0, tension: 0.5, brightness: 0.5, space: 0.5 };
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 1.0, { targetId: "t1" }),
      createMacroMapping("m2", "intensity", "pan", 0.5, { targetId: "t2" }),
    ];
    const result = evaluateMacros(state, mappings, "t1");
    expect(result.has("volume")).toBe(true);
    expect(result.has("pan")).toBe(false);
  });

  it("evaluateMacros returns zero offset at midpoint state", () => {
    const state = defaultMacroState();
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 1.0),
    ];
    const result = evaluateMacros(state, mappings);
    expect(result.get("volume")).toBeCloseTo(0);
  });

  it("applyMacroInfluence clamps to 0–1", () => {
    expect(applyMacroInfluence(0.8, 0.5)).toBe(1);
    expect(applyMacroInfluence(0.2, -0.5)).toBe(0);
    expect(applyMacroInfluence(0.5, 0.1)).toBeCloseTo(0.6);
  });

  it("mappingsForMacro filters correctly", () => {
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 1.0),
      createMacroMapping("m2", "tension", "pan", 0.5),
      createMacroMapping("m3", "intensity", "filterCutoff", 0.8),
    ];
    expect(mappingsForMacro(mappings, "intensity")).toHaveLength(2);
    expect(mappingsForMacro(mappings, "tension")).toHaveLength(1);
    expect(mappingsForMacro(mappings, "brightness")).toHaveLength(0);
  });

  it("macrosAffectingParam returns unique macro list", () => {
    const mappings = [
      createMacroMapping("m1", "intensity", "volume", 1.0),
      createMacroMapping("m2", "tension", "volume", 0.5),
      createMacroMapping("m3", "intensity", "volume", 0.3),
    ];
    const macros = macrosAffectingParam(mappings, "volume");
    expect(macros).toHaveLength(2);
    expect(macros).toContain("intensity");
    expect(macros).toContain("tension");
  });
});

// ── Envelopes ──

describe("envelopes", () => {
  it("createEnvelope builds an entry envelope", () => {
    const env = createEnvelope("e1", "scene-1", "fade-in", 1000, "entry");
    expect(env.id).toBe("e1");
    expect(env.targetId).toBe("scene-1");
    expect(env.shape).toBe("fade-in");
    expect(env.durationMs).toBe(1000);
    expect(env.position).toBe("entry");
    expect(env.depth).toBeUndefined();
  });

  it("createEnvelope with depth", () => {
    const env = createEnvelope("e2", "s2", "swell", 500, "entry", 0.7);
    expect(env.depth).toBe(0.7);
  });

  it("evaluateEnvelope — fade-in", () => {
    const env = createEnvelope("e", "t", "fade-in", 1000, "entry");
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(0);
    expect(evaluateEnvelope(env, 500)).toBeCloseTo(0.5);
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(1.0);
  });

  it("evaluateEnvelope — fade-out", () => {
    const env = createEnvelope("e", "t", "fade-out", 1000, "exit");
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(1.0);
    expect(evaluateEnvelope(env, 500)).toBeCloseTo(0.5);
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(0);
  });

  it("evaluateEnvelope — swell (quadratic)", () => {
    const env = createEnvelope("e", "t", "swell", 1000, "entry");
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(0);
    expect(evaluateEnvelope(env, 500)).toBeCloseTo(0.25); // 0.5^2
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(1.0);
  });

  it("evaluateEnvelope — duck dips then recovers", () => {
    const env = createEnvelope("e", "t", "duck", 1000, "entry");
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(1.0);
    expect(evaluateEnvelope(env, 500)).toBeCloseTo(0); // deepest dip at midpoint
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(1.0);
  });

  it("evaluateEnvelope — filter-rise (smoothstep)", () => {
    const env = createEnvelope("e", "t", "filter-rise", 1000, "entry");
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(0);
    expect(evaluateEnvelope(env, 500)).toBeCloseTo(0.5); // smoothstep at 0.5
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(1.0);
  });

  it("evaluateEnvelope — filter-fall", () => {
    const env = createEnvelope("e", "t", "filter-fall", 1000, "exit");
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(1.0);
    expect(evaluateEnvelope(env, 500)).toBeCloseTo(0.5);
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(0);
  });

  it("evaluateEnvelope respects depth < 1", () => {
    const env = createEnvelope("e", "t", "fade-in", 1000, "entry", 0.5);
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(0);
    expect(evaluateEnvelope(env, 1000)).toBeCloseTo(0.5);
  });

  it("evaluateEnvelope clamps offset to 0–duration", () => {
    const env = createEnvelope("e", "t", "fade-in", 1000, "entry");
    expect(evaluateEnvelope(env, -100)).toBeCloseTo(0);
    expect(evaluateEnvelope(env, 2000)).toBeCloseTo(1.0);
  });

  it("envelopesForTarget filters by targetId", () => {
    const e1 = createEnvelope("e1", "t1", "fade-in", 1000, "entry");
    const e2 = createEnvelope("e2", "t2", "fade-out", 500, "exit");
    const e3 = createEnvelope("e3", "t1", "swell", 800, "entry");
    expect(envelopesForTarget([e1, e2, e3], "t1")).toHaveLength(2);
    expect(envelopesForTarget([e1, e2, e3], "t2")).toHaveLength(1);
  });

  it("entryEnvelopes / exitEnvelopes filter by position", () => {
    const e1 = createEnvelope("e1", "t1", "fade-in", 1000, "entry");
    const e2 = createEnvelope("e2", "t1", "fade-out", 500, "exit");
    const e3 = createEnvelope("e3", "t2", "swell", 800, "entry");
    expect(entryEnvelopes([e1, e2, e3])).toHaveLength(2);
    expect(exitEnvelopes([e1, e2, e3])).toHaveLength(1);
  });
});

// ── Capture ──

describe("capture", () => {
  it("createCapture initialises with empty points", () => {
    const cap = createCapture("c1", "Take 1", "intensity");
    expect(cap.id).toBe("c1");
    expect(cap.name).toBe("Take 1");
    expect(cap.source).toBe("intensity");
    expect(cap.points).toEqual([]);
    expect(cap.recordedAt).toBeTruthy();
  });

  it("recordPoint appends a point", () => {
    let cap = createCapture("c1", "Take 1", "volume");
    cap = recordPoint(cap, 0, 0.5);
    cap = recordPoint(cap, 50, 0.7);
    cap = recordPoint(cap, 100, 0.3);
    expect(cap.points).toHaveLength(3);
  });

  it("finalizeCapture sorts points by time", () => {
    let cap = createCapture("c1", "Take 1", "volume");
    cap = recordPoint(cap, 200, 0.5);
    cap = recordPoint(cap, 50, 0.7);
    cap = recordPoint(cap, 100, 0.3);

    const finalized = finalizeCapture(cap, "lane-1");
    expect(finalized.points.map((p) => p.timeMs)).toEqual([50, 100, 200]);
    expect(finalized.laneId).toBe("lane-1");
  });

  it("finalizeCapture without laneId", () => {
    let cap = createCapture("c1", "Take 1", "volume");
    cap = recordPoint(cap, 100, 0.5);
    const finalized = finalizeCapture(cap);
    expect(finalized.laneId).toBeUndefined();
  });

  it("applyCaptureToLane replaces lane points", () => {
    const target = makeTarget("clip-layer", "c1");
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 0, value: 0.1 });
    lane = addPoint(lane, { timeMs: 100, value: 0.9 });

    let cap = createCapture("c1", "Take 1", "volume");
    cap = recordPoint(cap, 50, 0.5);
    cap = recordPoint(cap, 150, 0.6);

    const result = applyCaptureToLane(cap, lane);
    expect(result.points).toHaveLength(2);
    expect(result.points[0].timeMs).toBe(50);
  });

  it("mergeCaptureIntoLane combines and sorts", () => {
    const target = makeTarget("clip-layer", "c1");
    let lane = createLane("l1", "Vol", "volume", target);
    lane = addPoint(lane, { timeMs: 0, value: 0.1 });
    lane = addPoint(lane, { timeMs: 200, value: 0.9 });

    let cap = createCapture("c1", "Take 1", "volume");
    cap = recordPoint(cap, 50, 0.5);
    cap = recordPoint(cap, 100, 0.6);

    const merged = mergeCaptureIntoLane(cap, lane);
    expect(merged.points).toHaveLength(4);
    expect(merged.points.map((p) => p.timeMs)).toEqual([0, 50, 100, 200]);
  });

  it("thinCapture removes points closer than tolerance", () => {
    let cap = createCapture("c1", "Take 1", "volume");
    cap = recordPoint(cap, 0, 0.5);
    cap = recordPoint(cap, 5, 0.51);
    cap = recordPoint(cap, 10, 0.52);
    cap = recordPoint(cap, 50, 0.7);
    cap = recordPoint(cap, 55, 0.71);
    cap = recordPoint(cap, 100, 0.3);

    const thinned = thinCapture(cap, 20);
    expect(thinned.points.length).toBeLessThan(cap.points.length);
    // Should keep: 0, 50, 100 (each ≥20ms apart)
    expect(thinned.points.map((p) => p.timeMs)).toEqual([0, 50, 100]);
  });

  it("thinCapture returns capture unchanged when ≤1 point", () => {
    let cap = createCapture("c1", "Take 1", "volume");
    expect(thinCapture(cap, 20).points).toEqual([]);

    cap = recordPoint(cap, 100, 0.5);
    expect(thinCapture(cap, 20).points).toHaveLength(1);
  });

  it("captureDuration returns time span", () => {
    let cap = createCapture("c1", "Take 1", "volume");
    expect(captureDuration(cap)).toBe(0);

    cap = recordPoint(cap, 50, 0.5);
    expect(captureDuration(cap)).toBe(0);

    cap = recordPoint(cap, 150, 0.7);
    expect(captureDuration(cap)).toBe(100);
  });
});
