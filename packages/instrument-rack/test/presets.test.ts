import { describe, it, expect } from "vitest";
import {
  FACTORY_PRESETS,
  getPreset,
  getPresetsByCategory,
} from "../src/presets";

describe("Factory Presets", () => {
  it("has 16 curated presets", () => {
    expect(FACTORY_PRESETS).toHaveLength(16);
  });

  it("covers all categories", () => {
    const categories = new Set(FACTORY_PRESETS.map((p) => p.category));
    expect(categories).toContain("drums");
    expect(categories).toContain("bass");
    expect(categories).toContain("pad");
    expect(categories).toContain("lead");
    expect(categories).toContain("pulse");
  });

  it("every preset has a unique ID", () => {
    const ids = FACTORY_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getPreset returns a preset by ID", () => {
    const p = getPreset("drums-standard");
    expect(p).toBeDefined();
    expect(p!.name).toBe("Standard Kit");
  });

  it("getPreset returns undefined for unknown ID", () => {
    expect(getPreset("nonexistent")).toBeUndefined();
  });

  it("getPresetsByCategory filters correctly", () => {
    const bass = getPresetsByCategory("bass");
    expect(bass.length).toBeGreaterThanOrEqual(3);
    expect(bass.every((p) => p.category === "bass")).toBe(true);
  });
});
