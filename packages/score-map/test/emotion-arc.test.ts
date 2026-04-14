import { describe, it, expect } from "vitest";
import type { Scene, Cue, CueFamily, EmotionTag } from "@motif-studio/schema";
import {
  scenesToArcPoints,
  cuesToArcPoints,
  cueFamiliesToArcPoints,
  emotionDistance,
  buildEmotionArc,
  type ArcPoint,
} from "../src/emotion-arc.js";

// ── Helpers ──

function scene(id: string, name: string, emotion?: EmotionTag): Scene {
  return {
    id,
    name,
    category: "exploration",
    layers: [{ stemId: "s1" }],
    emotion,
  } as Scene;
}

function cue(id: string, name: string, emotion?: EmotionTag): Cue {
  return {
    id,
    name,
    sections: [{ role: "body", durationBars: 4 }],
    emotion,
  } as Cue;
}

// ── scenesToArcPoints ──

describe("scenesToArcPoints", () => {
  it("filters out scenes without emotion", () => {
    const scenes = [
      scene("s1", "A", { valence: -0.5, arousal: 0.8, label: "dread" }),
      scene("s2", "B"), // no emotion
      scene("s3", "C", { valence: 0.5, arousal: -0.3, label: "peace" }),
    ];
    const points = scenesToArcPoints(scenes);
    expect(points).toHaveLength(2);
    expect(points[0].id).toBe("s1");
    expect(points[1].id).toBe("s3");
  });

  it("preserves order", () => {
    const scenes = [
      scene("a", "First", { valence: 0, arousal: 0, label: "neutral" }),
      scene("b", "Second", { valence: 1, arousal: 1, label: "triumph" }),
    ];
    const points = scenesToArcPoints(scenes);
    expect(points[0].order).toBe(0);
    expect(points[1].order).toBe(1);
  });

  it("sets source to scene", () => {
    const points = scenesToArcPoints([
      scene("s1", "A", { valence: 0, arousal: 0, label: "neutral" }),
    ]);
    expect(points[0].source).toBe("scene");
  });
});

// ── cuesToArcPoints ──

describe("cuesToArcPoints", () => {
  it("extracts emotion-tagged cues", () => {
    const cues = [
      cue("c1", "Intro", { valence: -0.3, arousal: 0.2, label: "mystery" }),
      cue("c2", "Middle"),
    ];
    const points = cuesToArcPoints(cues);
    expect(points).toHaveLength(1);
    expect(points[0].source).toBe("cue");
  });
});

// ── cueFamiliesToArcPoints ──

describe("cueFamiliesToArcPoints", () => {
  it("extracts emotion-tagged families", () => {
    const families: CueFamily[] = [
      {
        id: "cf1",
        name: "Combat",
        role: "combat",
        sceneIds: [],
        emotion: { valence: -0.7, arousal: 0.9, label: "danger" },
      },
      { id: "cf2", name: "Explore", role: "exploration", sceneIds: [] },
    ];
    const points = cueFamiliesToArcPoints(families);
    expect(points).toHaveLength(1);
    expect(points[0].source).toBe("cue-family");
  });
});

// ── emotionDistance ──

describe("emotionDistance", () => {
  it("returns 0 for identical points", () => {
    const a: EmotionTag = { valence: 0.5, arousal: 0.5, label: "a" };
    expect(emotionDistance(a, a)).toBe(0);
  });

  it("calculates euclidean distance", () => {
    const a: EmotionTag = { valence: 0, arousal: 0, label: "a" };
    const b: EmotionTag = { valence: 1, arousal: 0, label: "b" };
    expect(emotionDistance(a, b)).toBe(1);
  });

  it("handles diagonal distance", () => {
    const a: EmotionTag = { valence: -1, arousal: -1, label: "a" };
    const b: EmotionTag = { valence: 1, arousal: 1, label: "b" };
    expect(emotionDistance(a, b)).toBeCloseTo(Math.sqrt(8), 5);
  });
});

// ── buildEmotionArc ──

describe("buildEmotionArc", () => {
  it("handles empty points", () => {
    const arc = buildEmotionArc([]);
    expect(arc.avgValence).toBe(0);
    expect(arc.avgArousal).toBe(0);
    expect(arc.maxDelta).toBe(0);
    expect(arc.trendsPositive).toBe(false);
  });

  it("computes averages", () => {
    const points: ArcPoint[] = [
      {
        id: "a",
        name: "A",
        emotion: { valence: -1, arousal: 0, label: "dark" },
        source: "scene",
        order: 0,
      },
      {
        id: "b",
        name: "B",
        emotion: { valence: 1, arousal: 1, label: "bright" },
        source: "scene",
        order: 1,
      },
    ];
    const arc = buildEmotionArc(points);
    expect(arc.avgValence).toBe(0);
    expect(arc.avgArousal).toBe(0.5);
  });

  it("computes max delta", () => {
    const points: ArcPoint[] = [
      {
        id: "a",
        name: "A",
        emotion: { valence: -1, arousal: -1, label: "despair" },
        source: "scene",
        order: 0,
      },
      {
        id: "b",
        name: "B",
        emotion: { valence: 0, arousal: 0, label: "neutral" },
        source: "scene",
        order: 1,
      },
      {
        id: "c",
        name: "C",
        emotion: { valence: 1, arousal: 1, label: "triumph" },
        source: "scene",
        order: 2,
      },
    ];
    const arc = buildEmotionArc(points);
    // Distance a→b = sqrt(2) ≈ 1.414, b→c = sqrt(2) ≈ 1.414
    expect(arc.maxDelta).toBeCloseTo(Math.sqrt(2), 5);
  });

  it("detects positive trend (Grounded arc)", () => {
    // Grounded: disgrace → rock bottom → first hope → alien wonder → investigation
    const groundedArc: ArcPoint[] = [
      {
        id: "ardent",
        name: "Ardent Flashback",
        emotion: { valence: -0.8, arousal: 0.7, label: "dread" },
        source: "scene",
        order: 0,
      },
      {
        id: "freeport",
        name: "Freeport Rock Bottom",
        emotion: { valence: -0.6, arousal: -0.3, label: "sorrow" },
        source: "scene",
        order: 1,
      },
      {
        id: "first-contract",
        name: "First Contract",
        emotion: { valence: 0.1, arousal: 0.2, label: "hope" },
        source: "scene",
        order: 2,
      },
      {
        id: "communion",
        name: "Communion Relay",
        emotion: { valence: 0.6, arousal: 0.5, label: "wonder" },
        source: "scene",
        order: 3,
      },
      {
        id: "investigation",
        name: "Investigation Hook",
        emotion: { valence: -0.2, arousal: 0.6, label: "mystery" },
        source: "scene",
        order: 4,
      },
    ];

    const arc = buildEmotionArc(groundedArc);
    expect(arc.points).toHaveLength(5);
    expect(arc.trendsPositive).toBe(true); // overall arc trends positive
    expect(arc.maxDelta).toBeGreaterThan(0);
    // Average valence should be slightly negative (more dark scenes than bright)
    expect(arc.avgValence).toBeLessThan(0.2);
  });

  it("detects negative trend", () => {
    const darkArc: ArcPoint[] = [
      {
        id: "a",
        name: "Hope",
        emotion: { valence: 0.8, arousal: 0.3, label: "hope" },
        source: "scene",
        order: 0,
      },
      {
        id: "b",
        name: "Despair",
        emotion: { valence: -0.9, arousal: 0.8, label: "dread" },
        source: "scene",
        order: 1,
      },
    ];
    const arc = buildEmotionArc(darkArc);
    expect(arc.trendsPositive).toBe(false);
  });
});
