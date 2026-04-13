import { describe, it, expect } from "vitest";
import { filterByIntensity, sortByOrder } from "../src/scene-clip-player";
import type { SceneClipRef } from "@motif-studio/schema";

describe("filterByIntensity", () => {
  const layers: SceneClipRef[] = [
    { clipId: "low-clip", intensity: "low" },
    { clipId: "mid-clip", intensity: "mid" },
    { clipId: "high-clip", intensity: "high" },
    { clipId: "no-tag", },
  ];

  it("at 'low' includes only low and untagged", () => {
    const result = filterByIntensity(layers, "low");
    expect(result.map((r) => r.clipId)).toEqual(["low-clip", "no-tag"]);
  });

  it("at 'mid' includes low, mid, and untagged", () => {
    const result = filterByIntensity(layers, "mid");
    expect(result.map((r) => r.clipId)).toEqual(["low-clip", "mid-clip", "no-tag"]);
  });

  it("at 'high' includes everything", () => {
    const result = filterByIntensity(layers, "high");
    expect(result).toHaveLength(4);
  });

  it("handles empty array", () => {
    expect(filterByIntensity([], "high")).toEqual([]);
  });

  it("includes all untagged clips at any intensity", () => {
    const untagged: SceneClipRef[] = [
      { clipId: "a" },
      { clipId: "b" },
    ];
    expect(filterByIntensity(untagged, "low")).toHaveLength(2);
    expect(filterByIntensity(untagged, "mid")).toHaveLength(2);
    expect(filterByIntensity(untagged, "high")).toHaveLength(2);
  });
});

describe("sortByOrder", () => {
  it("sorts by order ascending", () => {
    const layers: SceneClipRef[] = [
      { clipId: "c", order: 3 },
      { clipId: "a", order: 1 },
      { clipId: "b", order: 2 },
    ];
    const result = sortByOrder(layers);
    expect(result.map((r) => r.clipId)).toEqual(["a", "b", "c"]);
  });

  it("treats missing order as 0", () => {
    const layers: SceneClipRef[] = [
      { clipId: "b", order: 1 },
      { clipId: "a" },
    ];
    const result = sortByOrder(layers);
    expect(result.map((r) => r.clipId)).toEqual(["a", "b"]);
  });

  it("does not mutate original array", () => {
    const layers: SceneClipRef[] = [
      { clipId: "b", order: 2 },
      { clipId: "a", order: 1 },
    ];
    const result = sortByOrder(layers);
    expect(result).not.toBe(layers);
    expect(layers[0].clipId).toBe("b"); // original unchanged
  });

  it("handles empty array", () => {
    expect(sortByOrder([])).toEqual([]);
  });

  it("handles equal orders (stable-ish)", () => {
    const layers: SceneClipRef[] = [
      { clipId: "a", order: 1 },
      { clipId: "b", order: 1 },
    ];
    const result = sortByOrder(layers);
    expect(result).toHaveLength(2);
  });
});
