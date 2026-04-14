import { describe, it, expect } from "vitest";
import {
  GROUNDED_CUE_FAMILIES,
  GROUNDED_MOTIF_FAMILIES,
  GROUNDED_PROFILES,
  sharedMotifs,
  sharedScenes,
  collectMotifFamilyIds,
  resolveProfile,
} from "@motif-studio/score-map";

// ── Cue Family inventory ──

describe("GROUNDED_CUE_FAMILIES", () => {
  it("contains exactly 6 families", () => {
    expect(GROUNDED_CUE_FAMILIES).toHaveLength(6);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_CUE_FAMILIES.map((f) => f.id);
    expect(new Set(ids).size).toBe(6);
  });

  it("all IDs use cf- prefix", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      expect(f.id).toMatch(/^cf-/);
    }
  });

  it("all families have at least one scene", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      expect(f.sceneIds.length).toBeGreaterThan(0);
    }
  });

  it("all families have at least one motif family link", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      expect(f.motifFamilyIds!.length).toBeGreaterThan(0);
    }
  });

  it("all families have emotion tags", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      expect(f.emotion).toBeDefined();
      expect(f.emotion!.label).toBeTruthy();
    }
  });

  it("all families have score profile links", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      expect(f.scoreProfileId).toBeTruthy();
    }
  });
});

// ── Role distribution ──

describe("cue family roles", () => {
  const byId = (id: string) => GROUNDED_CUE_FAMILIES.find((f) => f.id === id)!;

  it("military is tension", () => expect(byId("cf-military").role).toBe("tension"));
  it("frontier is exploration", () => expect(byId("cf-frontier").role).toBe("exploration"));
  it("combat is combat", () => expect(byId("cf-combat").role).toBe("combat"));
  it("keth is mystery", () => expect(byId("cf-keth").role).toBe("mystery"));
  it("investigation is tension", () => expect(byId("cf-investigation").role).toBe("tension"));
  it("crew is recovery", () => expect(byId("cf-crew").role).toBe("recovery"));
});

// ── Scene coverage ──

describe("scene coverage", () => {
  it("military covers 4 Ardent scenes", () => {
    const mil = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-military")!;
    expect(mil.sceneIds).toContain("sc-ardent-ready");
    expect(mil.sceneIds).toContain("sc-ardent-sweep");
    expect(mil.sceneIds).toContain("sc-court-martial");
    expect(mil.sceneIds).toContain("sc-patrol");
  });

  it("frontier covers 3 Freeport scenes", () => {
    const fr = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-frontier")!;
    expect(fr.sceneIds).toContain("sc-freeport");
    expect(fr.sceneIds).toContain("sc-contracts");
    expect(fr.sceneIds).toContain("sc-lane");
  });

  it("combat covers both combat scenes", () => {
    const cb = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-combat")!;
    expect(cb.sceneIds).toEqual(expect.arrayContaining(["sc-ambush", "sc-derelict"]));
  });

  it("keth covers communion scene", () => {
    const keth = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-keth")!;
    expect(keth.sceneIds).toContain("sc-communion");
  });

  it("crew shares scenes with frontier (lane)", () => {
    const crew = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-crew")!;
    const frontier = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-frontier")!;
    const shared = sharedScenes(crew, frontier);
    expect(shared).toContain("sc-lane");
  });
});

// ── Profile linkage ──

describe("profile linkage", () => {
  it("all scoreProfileIds resolve to real profiles", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      const entry = { id: "tmp", name: "tmp", contextType: "region" as const, scoreProfileId: f.scoreProfileId };
      const profile = resolveProfile(entry, GROUNDED_PROFILES);
      expect(profile).toBeDefined();
    }
  });

  it("military links to sp-ardent", () => {
    expect(GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-military")!.scoreProfileId).toBe("sp-ardent");
  });

  it("keth links to sp-communion", () => {
    expect(GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-keth")!.scoreProfileId).toBe("sp-communion");
  });

  it("combat links to sp-combat", () => {
    expect(GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-combat")!.scoreProfileId).toBe("sp-combat");
  });
});

// ── Motif Family inventory ──

describe("GROUNDED_MOTIF_FAMILIES", () => {
  it("contains exactly 6 families", () => {
    expect(GROUNDED_MOTIF_FAMILIES).toHaveLength(6);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_MOTIF_FAMILIES.map((m) => m.id);
    expect(new Set(ids).size).toBe(6);
  });

  it("all IDs use mf- prefix", () => {
    for (const m of GROUNDED_MOTIF_FAMILIES) {
      expect(m.id).toMatch(/^mf-/);
    }
  });

  it("all motifs have source IDs (clip references)", () => {
    for (const m of GROUNDED_MOTIF_FAMILIES) {
      expect(m.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it("all motifs have related scenes", () => {
    for (const m of GROUNDED_MOTIF_FAMILIES) {
      expect(m.relatedSceneIds!.length).toBeGreaterThan(0);
    }
  });

  it("all source IDs reference cl- clip IDs", () => {
    for (const m of GROUNDED_MOTIF_FAMILIES) {
      for (const src of m.sourceIds) {
        expect(src).toMatch(/^cl-/);
      }
    }
  });
});

// ── Cross-family relationships ──

describe("cross-family relationships", () => {
  it("crew and frontier share motif material", () => {
    const crew = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-crew")!;
    const frontier = GROUNDED_CUE_FAMILIES.find((f) => f.id === "cf-frontier")!;
    const shared = sharedMotifs(crew, frontier);
    expect(shared).toContain("mf-frontier");
  });

  it("collectMotifFamilyIds aggregates all 6 motif IDs", () => {
    const allIds = collectMotifFamilyIds(GROUNDED_CUE_FAMILIES);
    expect(allIds.length).toBeGreaterThanOrEqual(6);
    expect(allIds).toContain("mf-military");
    expect(allIds).toContain("mf-keth");
    expect(allIds).toContain("mf-combat");
  });

  it("no family is isolated (all link to at least one motif)", () => {
    for (const f of GROUNDED_CUE_FAMILIES) {
      expect(f.motifFamilyIds!.length).toBeGreaterThan(0);
    }
  });
});
