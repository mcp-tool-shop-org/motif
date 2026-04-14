import { describe, it, expect } from "vitest";
import type { LoopRegion } from "@motif-studio/schema";
import {
  validateLoopRegion,
  loopDurationMs,
  totalLoopDurationMs,
  resolveLoopPosition,
  crossfadeGain,
} from "../src/loop-region.js";

// ── Helpers ──

function region(overrides?: Partial<LoopRegion>): LoopRegion {
  return {
    loopStartMs: 1000,
    loopEndMs: 5000,
    crossfadeDurationMs: 500,
    count: 0,
    ...overrides,
  };
}

// ── validateLoopRegion ──

describe("validateLoopRegion", () => {
  it("returns empty array for valid region", () => {
    expect(validateLoopRegion(region())).toEqual([]);
  });

  it("rejects negative loopStartMs", () => {
    const errors = validateLoopRegion(region({ loopStartMs: -1 }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("loopStartMs");
  });

  it("rejects loopEndMs <= loopStartMs", () => {
    const errors = validateLoopRegion(region({ loopStartMs: 5000, loopEndMs: 5000 }));
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => e.includes("loopEndMs must be greater"))).toBe(true);
  });

  it("rejects crossfade exceeding region duration", () => {
    const errors = validateLoopRegion(
      region({ loopStartMs: 0, loopEndMs: 1000, crossfadeDurationMs: 1500 }),
    );
    expect(errors.some((e) => e.includes("exceeds loop region duration"))).toBe(true);
  });

  it("rejects negative crossfade", () => {
    const errors = validateLoopRegion(region({ crossfadeDurationMs: -100 }));
    expect(errors.some((e) => e.includes("crossfadeDurationMs must be >= 0"))).toBe(true);
  });

  it("rejects negative count", () => {
    const errors = validateLoopRegion(region({ count: -1 }));
    expect(errors.some((e) => e.includes("count must be >= 0"))).toBe(true);
  });

  it("accepts zero crossfade", () => {
    expect(validateLoopRegion(region({ crossfadeDurationMs: 0 }))).toEqual([]);
  });

  it("accepts undefined crossfade", () => {
    expect(
      validateLoopRegion({ loopStartMs: 0, loopEndMs: 4000 }),
    ).toEqual([]);
  });
});

// ── loopDurationMs ──

describe("loopDurationMs", () => {
  it("calculates loop region duration", () => {
    expect(loopDurationMs(region())).toBe(4000); // 5000 - 1000
  });

  it("handles zero-start region", () => {
    expect(loopDurationMs(region({ loopStartMs: 0, loopEndMs: 3000 }))).toBe(3000);
  });
});

// ── totalLoopDurationMs ──

describe("totalLoopDurationMs", () => {
  it("returns Infinity when count is 0 (loop forever)", () => {
    expect(totalLoopDurationMs(region({ count: 0 }))).toBe(Infinity);
  });

  it("returns Infinity when count is undefined", () => {
    expect(totalLoopDurationMs(region({ count: undefined }))).toBe(Infinity);
  });

  it("calculates total duration for finite count", () => {
    // start=1000, duration=4000, count=3 → 1000 + 4000*3 = 13000
    expect(totalLoopDurationMs(region({ count: 3 }))).toBe(13000);
  });

  it("single iteration", () => {
    // start=1000, duration=4000, count=1 → 1000 + 4000 = 5000
    expect(totalLoopDurationMs(region({ count: 1 }))).toBe(5000);
  });
});

// ── resolveLoopPosition ──

describe("resolveLoopPosition", () => {
  it("returns position as-is before loop start (intro)", () => {
    expect(resolveLoopPosition(region(), 500)).toBe(500);
  });

  it("returns position within first iteration", () => {
    // 2000 is within [1000, 5000)
    expect(resolveLoopPosition(region(), 2000)).toBe(2000);
  });

  it("wraps at loop boundary", () => {
    // 5000 = loopEnd → wraps to loopStart (1000)
    expect(resolveLoopPosition(region(), 5000)).toBe(1000);
  });

  it("wraps mid-second iteration", () => {
    // 6000 = 1000ms into second iteration → 1000 + 1000 = 2000
    expect(resolveLoopPosition(region(), 6000)).toBe(2000);
  });

  it("handles exact multiple of loop duration", () => {
    // 9000 = 2 full iterations past start → wraps to 1000
    expect(resolveLoopPosition(region(), 9000)).toBe(1000);
  });

  it("clamps past finite count", () => {
    const r = region({ count: 2 });
    // Total: 1000 + 4000*2 = 9000. At 10000, past end.
    expect(resolveLoopPosition(r, 10000)).toBe(5000); // loopEndMs
  });

  it("works with infinite loop (count=0)", () => {
    const r = region({ count: 0 });
    // Should always wrap, never clamp
    expect(resolveLoopPosition(r, 100000)).toBe(
      1000 + ((100000 - 1000) % 4000),
    );
  });
});

// ── crossfadeGain ──

describe("crossfadeGain", () => {
  const r = region({ loopStartMs: 0, loopEndMs: 4000, crossfadeDurationMs: 500 });

  it("returns 1 in the middle of the loop", () => {
    expect(crossfadeGain(r, 2000, false)).toBe(1);
  });

  it("fades in at loop start (non-first iteration)", () => {
    // 250ms into a 500ms fade = 0.5
    expect(crossfadeGain(r, 250, false)).toBe(0.5);
  });

  it("no fade-in on first iteration", () => {
    expect(crossfadeGain(r, 0, true)).toBe(1);
    expect(crossfadeGain(r, 250, true)).toBe(1);
  });

  it("fades out at loop end", () => {
    // 250ms from end = 250/500 = 0.5
    expect(crossfadeGain(r, 3750, false)).toBe(0.5);
  });

  it("returns 0 at exact loop end", () => {
    expect(crossfadeGain(r, 4000, false)).toBe(0);
  });

  it("returns 1 when crossfade is 0", () => {
    const noxfade = region({ crossfadeDurationMs: 0 });
    expect(crossfadeGain(noxfade, 1000, false)).toBe(1);
  });

  it("returns 1 when crossfade is undefined", () => {
    const noxfade: LoopRegion = { loopStartMs: 0, loopEndMs: 4000 };
    expect(crossfadeGain(noxfade, 0, false)).toBe(1);
  });
});
