import { describe, it, expect } from "vitest";
import type { Cue, PerformanceCapture } from "@motif-studio/schema";
import {
  resolveCuePlan,
  sectionAtTick,
  sectionAtBar,
  cueSecondsToTick,
  cueTickToSeconds,
  createCaptureEvent,
  captureToCue,
  captureTotalBars,
  quantizeTick,
  ticksPerBar,
  ticksToSeconds,
  secondsToTicks,
  tickToBar,
  tickToBeat,
  TICKS_PER_BEAT,
} from "../src/index.js";

// ── Test fixtures ──

const testCue: Cue = {
  id: "cue-test",
  name: "Test Cue",
  bpm: 120,
  beatsPerBar: 4,
  sections: [
    { id: "s1", name: "Intro", role: "intro", durationBars: 4, sceneId: "scene-1", intensity: "low" },
    { id: "s2", name: "Body", role: "body", durationBars: 8, sceneId: "scene-2", intensity: "mid" },
    { id: "s3", name: "Climax", role: "climax", durationBars: 4, sceneId: "scene-3", intensity: "high" },
    { id: "s4", name: "Outro", role: "outro", durationBars: 4 },
  ],
};

// ── Tests ──

describe("Cue scheduling", () => {
  describe("resolveCuePlan", () => {
    it("resolves sections with correct tick positions", () => {
      const plan = resolveCuePlan(testCue);
      expect(plan.cueId).toBe("cue-test");
      expect(plan.bpm).toBe(120);
      expect(plan.beatsPerBar).toBe(4);
      expect(plan.totalBars).toBe(20);
      expect(plan.sections).toHaveLength(4);

      // Section 1: starts at bar 0, tick 0
      expect(plan.sections[0].startBar).toBe(0);
      expect(plan.sections[0].startTick).toBe(0);
      expect(plan.sections[0].durationBars).toBe(4);

      // Section 2: starts at bar 4
      const tpb = ticksPerBar(120, 4);
      expect(plan.sections[1].startBar).toBe(4);
      expect(plan.sections[1].startTick).toBe(4 * tpb);

      // Section 3: starts at bar 12
      expect(plan.sections[2].startBar).toBe(12);
      expect(plan.sections[2].startTick).toBe(12 * tpb);

      // Section 4: starts at bar 16
      expect(plan.sections[3].startBar).toBe(16);
      expect(plan.sections[3].endTick).toBe(20 * tpb);
    });

    it("computes total seconds correctly", () => {
      const plan = resolveCuePlan(testCue);
      // 20 bars × 4 beats/bar = 80 beats @ 120 BPM = 40 seconds
      expect(plan.totalSeconds).toBe(40);
    });

    it("uses defaults for missing bpm and beatsPerBar", () => {
      const cue: Cue = { id: "c", name: "C", sections: [{ id: "s", name: "S", role: "body", durationBars: 2 }] };
      const plan = resolveCuePlan(cue);
      expect(plan.bpm).toBe(120);
      expect(plan.beatsPerBar).toBe(4);
    });

    it("preserves scene and intensity from sections", () => {
      const plan = resolveCuePlan(testCue);
      expect(plan.sections[0].sceneId).toBe("scene-1");
      expect(plan.sections[0].intensity).toBe("low");
      expect(plan.sections[3].sceneId).toBeUndefined();
    });
  });

  describe("sectionAtTick", () => {
    it("finds the correct section at a given tick", () => {
      const plan = resolveCuePlan(testCue);
      const tpb = ticksPerBar(120, 4);

      // Tick 0 → section 0 (Intro)
      expect(sectionAtTick(plan, 0)?.sectionId).toBe("s1");

      // Middle of body section (bar 6)
      expect(sectionAtTick(plan, 6 * tpb)?.sectionId).toBe("s2");

      // Last tick before outro ends
      expect(sectionAtTick(plan, 19 * tpb)?.sectionId).toBe("s4");

      // Beyond last section
      expect(sectionAtTick(plan, 20 * tpb)).toBeNull();
    });
  });

  describe("sectionAtBar", () => {
    it("finds the correct section at a given bar", () => {
      const plan = resolveCuePlan(testCue);
      expect(sectionAtBar(plan, 0)?.sectionId).toBe("s1");
      expect(sectionAtBar(plan, 5)?.sectionId).toBe("s2");
      expect(sectionAtBar(plan, 14)?.sectionId).toBe("s3");
      expect(sectionAtBar(plan, 18)?.sectionId).toBe("s4");
      expect(sectionAtBar(plan, 20)).toBeNull();
    });
  });
});

describe("Tick/time utilities", () => {
  it("converts ticks to seconds", () => {
    // 480 ticks = 1 beat, at 120 BPM = 0.5 seconds
    expect(ticksToSeconds(480, 120)).toBe(0.5);
    expect(ticksToSeconds(1920, 120)).toBe(2); // 4 beats = 2s
  });

  it("converts seconds to ticks", () => {
    expect(secondsToTicks(0.5, 120)).toBe(480);
    expect(secondsToTicks(2, 120)).toBe(1920);
  });

  it("cueSecondsToTick and cueTickToSeconds are inverse", () => {
    const tick = cueSecondsToTick(5, 120);
    expect(cueTickToSeconds(tick, 120)).toBeCloseTo(5, 5);
  });

  it("computes ticksPerBar", () => {
    expect(ticksPerBar(120, 4)).toBe(4 * TICKS_PER_BEAT);
    expect(ticksPerBar(120, 3)).toBe(3 * TICKS_PER_BEAT);
  });

  it("computes tickToBar and tickToBeat", () => {
    const tpb = ticksPerBar(120, 4);
    // Bar 3, beat 2
    const tick = 3 * tpb + 2 * TICKS_PER_BEAT;
    expect(tickToBar(tick, 120, 4)).toBe(3);
    expect(tickToBeat(tick, 120, 4)).toBe(2);
  });
});

describe("Quantize tick", () => {
  it("quantize 'none' returns unchanged", () => {
    expect(quantizeTick(123, 120, 4, "none")).toBe(123);
  });

  it("quantize 'beat' snaps to nearest beat", () => {
    const result = quantizeTick(500, 120, 4, "beat");
    expect(result).toBe(TICKS_PER_BEAT); // 480 is nearest beat
  });

  it("quantize 'bar' snaps to nearest bar", () => {
    const tpb = ticksPerBar(120, 4);
    const result = quantizeTick(tpb + 100, 120, 4, "bar");
    expect(result).toBe(tpb); // snap to bar 1
  });
});

describe("Capture events", () => {
  it("creates capture event with correct bar/beat", () => {
    const tpb = ticksPerBar(120, 4);
    const tick = 3 * tpb + 2 * TICKS_PER_BEAT; // bar 3, beat 2
    const event = createCaptureEvent(tick, 120, 4, "scene-launch", { sceneId: "s1" });
    expect(event.tick).toBe(tick);
    expect(event.bar).toBe(3);
    expect(event.beat).toBe(2);
    expect(event.action).toBe("scene-launch");
    expect(event.sceneId).toBe("s1");
  });

  it("creates intensity change event", () => {
    const event = createCaptureEvent(0, 120, 4, "intensity-change", { intensity: "high" });
    expect(event.action).toBe("intensity-change");
    expect(event.intensity).toBe("high");
  });
});

describe("captureTotalBars", () => {
  it("returns 0 for empty events", () => {
    expect(captureTotalBars([])).toBe(0);
  });

  it("returns max bar + 1", () => {
    const events = [
      createCaptureEvent(0, 120, 4, "scene-launch", { sceneId: "s1" }),
      createCaptureEvent(ticksPerBar(120, 4) * 7, 120, 4, "scene-launch", { sceneId: "s2" }),
    ];
    expect(captureTotalBars(events)).toBe(8); // bar 7 + 1
  });
});

describe("captureToCue (capture → cue conversion)", () => {
  it("converts scene-launch events into sections", () => {
    const tpb = ticksPerBar(120, 4);
    const capture: PerformanceCapture = {
      id: "cap-1",
      name: "My Performance",
      bpm: 120,
      beatsPerBar: 4,
      totalBars: 12,
      events: [
        createCaptureEvent(0, 120, 4, "scene-launch", { sceneId: "scene-a" }),
        createCaptureEvent(4 * tpb, 120, 4, "scene-launch", { sceneId: "scene-b" }),
        createCaptureEvent(8 * tpb, 120, 4, "scene-launch", { sceneId: "scene-c" }),
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const cue = captureToCue(capture);
    expect(cue.name).toBe("My Performance (captured)");
    expect(cue.bpm).toBe(120);
    expect(cue.sections.length).toBeGreaterThanOrEqual(3);
    expect(cue.tags).toContain("captured");

    // First section should reference scene-a
    expect(cue.sections[0].sceneId).toBe("scene-a");
  });

  it("handles intensity changes in capture", () => {
    const tpb = ticksPerBar(120, 4);
    const capture: PerformanceCapture = {
      id: "cap-2",
      name: "Intensity Test",
      bpm: 120,
      beatsPerBar: 4,
      totalBars: 8,
      events: [
        createCaptureEvent(0, 120, 4, "scene-launch", { sceneId: "s1" }),
        createCaptureEvent(2 * tpb, 120, 4, "intensity-change", { intensity: "high" }),
        createCaptureEvent(4 * tpb, 120, 4, "scene-launch", { sceneId: "s2" }),
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const cue = captureToCue(capture);
    // Should have at least 2 sections
    expect(cue.sections.length).toBeGreaterThanOrEqual(2);
  });
});
