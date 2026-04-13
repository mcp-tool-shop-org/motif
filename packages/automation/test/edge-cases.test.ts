import { describe, it, expect } from "vitest";
import { createEnvelope, evaluateEnvelope } from "../src/envelopes.js";
import { sampleLane, evaluateLane, interpolate } from "../src/interpolate.js";
import type { AutomationLane } from "@motif/schema";

describe("evaluateEnvelope — durationMs: 0 (division by zero guard)", () => {
  it("fade-in with durationMs 0 returns depth (completed state)", () => {
    const env = createEnvelope("e1", "t1", "fade-in", 0, "entry");
    expect(evaluateEnvelope(env, 0)).toBe(1);
  });

  it("fade-in with durationMs 0 and custom depth returns depth", () => {
    const env = createEnvelope("e1", "t1", "fade-in", 0, "entry", 0.8);
    expect(evaluateEnvelope(env, 0)).toBe(0.8);
  });

  it("fade-out with durationMs 0 returns 0 (fully faded)", () => {
    const env = createEnvelope("e1", "t1", "fade-out", 0, "exit");
    expect(evaluateEnvelope(env, 0)).toBe(0);
  });

  it("swell with durationMs 0 returns depth", () => {
    const env = createEnvelope("e1", "t1", "swell", 0, "entry");
    expect(evaluateEnvelope(env, 0)).toBe(1);
  });

  it("duck with durationMs 0 returns 1 (no dip)", () => {
    const env = createEnvelope("e1", "t1", "duck", 0, "entry");
    expect(evaluateEnvelope(env, 0)).toBe(1);
  });

  it("filter-rise with durationMs 0 returns depth", () => {
    const env = createEnvelope("e1", "t1", "filter-rise", 0, "entry");
    expect(evaluateEnvelope(env, 0)).toBe(1);
  });

  it("filter-fall with durationMs 0 returns 0", () => {
    const env = createEnvelope("e1", "t1", "filter-fall", 0, "exit");
    expect(evaluateEnvelope(env, 0)).toBe(0);
  });

  it("negative durationMs also triggers the guard", () => {
    const env = createEnvelope("e1", "t1", "fade-in", -100, "entry");
    expect(evaluateEnvelope(env, 0)).toBe(1);
  });
});

describe("sampleLane — stepMs: 0 (infinite loop guard)", () => {
  const lane: AutomationLane = {
    id: "l1",
    target: { targetId: "t1", targetType: "track" },
    param: "volume",
    points: [
      { timeMs: 0, value: 0 },
      { timeMs: 1000, value: 1 },
    ],
  };

  it("throws RangeError when stepMs is 0", () => {
    expect(() => sampleLane(lane, 0, 1000, 0)).toThrow(RangeError);
    expect(() => sampleLane(lane, 0, 1000, 0)).toThrow("stepMs must be positive");
  });

  it("throws RangeError when stepMs is negative", () => {
    expect(() => sampleLane(lane, 0, 1000, -10)).toThrow(RangeError);
  });

  it("works normally with positive stepMs", () => {
    const values = sampleLane(lane, 0, 1000, 500);
    expect(values).toHaveLength(3); // 0, 500, 1000
    expect(values[0]).toBe(0);
    expect(values[2]).toBe(1);
  });
});

describe("B13 — interpolate: division by zero guard", () => {
  it("evaluateLane returns finite values even with duplicate-time points", () => {
    // When consecutive points share the same timeMs, the loop picks
    // the first matching segment. The division-by-zero guard ensures
    // that if such a segment were selected, we get a valid number.
    const lane: AutomationLane = {
      id: "l1",
      target: { targetId: "t1", targetType: "track" },
      param: "volume",
      points: [
        { timeMs: 0, value: 0 },
        { timeMs: 100, value: 0.5 },
        { timeMs: 100, value: 1.0 },
        { timeMs: 200, value: 0 },
      ],
    };

    // Query at the duplicate time — should not produce NaN or Infinity
    const result = evaluateLane(lane, 100);
    expect(Number.isFinite(result)).toBe(true);
  });

  it("interpolate helper returns b-value when span is zero (t defaults to 1)", () => {
    // Simulating what happens when span === 0 → t = 1
    const result = interpolate(0.2, 0.8, 1, "linear");
    expect(result).toBe(0.8);
  });
});
