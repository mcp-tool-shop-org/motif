import { describe, it, expect } from "vitest";
import {
  SCIFI_PRESETS,
  SCIFI_TAGS,
  ALL_PRESETS,
  FACTORY_PRESETS,
  getPreset,
  getPresetsByCategory,
  getPresetsByTag,
  getAllPresetTags,
} from "../src/index.js";

describe("SCIFI_PRESETS", () => {
  it("has 16 sci-fi presets", () => {
    expect(SCIFI_PRESETS).toHaveLength(16);
  });

  it("all presets have required fields", () => {
    for (const p of SCIFI_PRESETS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.params).toBeDefined();
      expect(p.tags).toBeDefined();
      expect(p.tags!.length).toBeGreaterThan(0);
    }
  });

  it("all preset IDs are unique", () => {
    const ids = SCIFI_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no ID conflicts with factory presets", () => {
    const factoryIds = new Set(FACTORY_PRESETS.map((p) => p.id));
    for (const p of SCIFI_PRESETS) {
      expect(factoryIds.has(p.id)).toBe(false);
    }
  });

  it("all IDs start with scifi-", () => {
    for (const p of SCIFI_PRESETS) {
      expect(p.id).toMatch(/^scifi-/);
    }
  });
});

describe("SCIFI_TAGS", () => {
  it("has 4 aesthetic categories", () => {
    expect(Object.keys(SCIFI_TAGS)).toHaveLength(4);
    expect(SCIFI_TAGS.INDUSTRIAL).toBe("scifi-industrial");
    expect(SCIFI_TAGS.MILITARY).toBe("scifi-military");
    expect(SCIFI_TAGS.ALIEN).toBe("scifi-alien");
    expect(SCIFI_TAGS.INVESTIGATION).toBe("scifi-investigation");
  });
});

describe("preset counts by tag", () => {
  it("has 4 industrial presets", () => {
    expect(getPresetsByTag(SCIFI_TAGS.INDUSTRIAL)).toHaveLength(4);
  });

  it("has 4 military presets", () => {
    expect(getPresetsByTag(SCIFI_TAGS.MILITARY)).toHaveLength(4);
  });

  it("has 4 alien (Keth) presets", () => {
    expect(getPresetsByTag(SCIFI_TAGS.ALIEN)).toHaveLength(4);
  });

  it("has 4 investigation presets", () => {
    expect(getPresetsByTag(SCIFI_TAGS.INVESTIGATION)).toHaveLength(4);
  });
});

describe("each tag has balanced instrument coverage", () => {
  for (const [label, tag] of Object.entries(SCIFI_TAGS)) {
    describe(label, () => {
      const presets = SCIFI_PRESETS.filter((p) => p.tags?.includes(tag));
      const categories = presets.map((p) => p.category);

      it("has at least one pad or drone", () => {
        expect(categories.some((c) => c === "pad")).toBe(true);
      });

      it("has at least one bass or drums", () => {
        expect(categories.some((c) => c === "bass" || c === "drums")).toBe(true);
      });
    });
  }
});

describe("ALL_PRESETS", () => {
  it("combines factory + scifi presets", () => {
    expect(ALL_PRESETS).toHaveLength(FACTORY_PRESETS.length + SCIFI_PRESETS.length);
  });

  it("all IDs are globally unique", () => {
    const ids = ALL_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getPreset finds sci-fi presets", () => {
  it("finds industrial drone", () => {
    const p = getPreset("scifi-drone-station");
    expect(p).toBeDefined();
    expect(p!.name).toBe("Station Drone");
  });

  it("finds Keth chorus", () => {
    const p = getPreset("scifi-keth-voice");
    expect(p).toBeDefined();
    expect(p!.tags).toContain(SCIFI_TAGS.ALIEN);
  });

  it("still finds factory presets", () => {
    expect(getPreset("bass-sub")).toBeDefined();
  });
});

describe("getPresetsByCategory includes sci-fi", () => {
  it("pad category includes sci-fi pads", () => {
    const pads = getPresetsByCategory("pad");
    expect(pads.some((p) => p.id === "scifi-drone-station")).toBe(true);
    expect(pads.some((p) => p.id === "pad-warm")).toBe(true);
  });
});

describe("getAllPresetTags", () => {
  it("returns all sci-fi tags", () => {
    const tags = getAllPresetTags();
    expect(tags).toContain(SCIFI_TAGS.INDUSTRIAL);
    expect(tags).toContain(SCIFI_TAGS.MILITARY);
    expect(tags).toContain(SCIFI_TAGS.ALIEN);
    expect(tags).toContain(SCIFI_TAGS.INVESTIGATION);
  });
});

describe("suggested scales", () => {
  it("Keth presets suggest phrygian", () => {
    const keth = SCIFI_PRESETS.filter((p) => p.tags?.includes(SCIFI_TAGS.ALIEN));
    const withScale = keth.filter((p) => p.suggestedScale);
    expect(withScale.length).toBeGreaterThan(0);
    expect(withScale.every((p) => p.suggestedScale === "phrygian")).toBe(true);
  });

  it("investigation presets use chromatic or harmonic-minor", () => {
    const inv = SCIFI_PRESETS.filter((p) =>
      p.tags?.includes(SCIFI_TAGS.INVESTIGATION),
    );
    const withScale = inv.filter((p) => p.suggestedScale);
    for (const p of withScale) {
      expect(["chromatic", "harmonic-minor"]).toContain(p.suggestedScale);
    }
  });
});
