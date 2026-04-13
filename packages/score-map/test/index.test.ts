import { describe, it, expect } from "vitest";
import {
  // motif
  createMotifFamily,
  addVariant,
  removeVariant,
  linkScene,
  unlinkScene,
  motifFamilyRefs,
  familiesReferencingId,
  // profile
  createScoreProfile,
  isTempoInRange,
  isIntensityInRange,
  matchingPaletteTags,
  mergeProfiles,
  // cue-family
  createCueFamily,
  addSceneToCueFamily,
  removeSceneFromCueFamily,
  linkMotifToCueFamily,
  sharedMotifs,
  sharedScenes,
  collectMotifFamilyIds,
  // resolve
  createScoreMapEntry,
  resolveProfile,
  resolveCueFamilies,
  resolveMotifFamilies,
  entrySceneIds,
  entriesByContext,
  entriesSharingMotif,
  resolveEntryContext,
  // derivation
  createDerivation,
  deriveScene,
  derivationsFrom,
  derivationsTo,
  derivationChain,
  derivationGraphIds,
} from "@motif-studio/score-map";
import type { Scene, SoundtrackPack } from "@motif-studio/schema";

// ── Motif Families ──

describe("createMotifFamily", () => {
  it("creates a motif family with id, name, and sourceIds", () => {
    const mf = createMotifFamily("m1", "Boss Motif", ["src-a", "src-b"]);
    expect(mf).toEqual({ id: "m1", name: "Boss Motif", sourceIds: ["src-a", "src-b"] });
  });
});

describe("addVariant / removeVariant", () => {
  it("adds a variant id", () => {
    const mf = createMotifFamily("m1", "M", ["s1"]);
    const updated = addVariant(mf, "v1");
    expect(updated.variantIds).toEqual(["v1"]);
  });

  it("does not duplicate variant ids", () => {
    let mf = createMotifFamily("m1", "M", ["s1"]);
    mf = addVariant(mf, "v1");
    mf = addVariant(mf, "v1");
    expect(mf.variantIds).toEqual(["v1"]);
  });

  it("removes a variant id", () => {
    let mf = createMotifFamily("m1", "M", ["s1"]);
    mf = addVariant(mf, "v1");
    mf = addVariant(mf, "v2");
    mf = removeVariant(mf, "v1");
    expect(mf.variantIds).toEqual(["v2"]);
  });

  it("returns unchanged family when removing absent variant", () => {
    const mf = createMotifFamily("m1", "M", ["s1"]);
    const result = removeVariant(mf, "missing");
    expect(result.variantIds).toEqual([]);
  });
});

describe("linkScene / unlinkScene", () => {
  it("links a scene", () => {
    const mf = createMotifFamily("m1", "M", ["s1"]);
    const updated = linkScene(mf, "scene-1");
    expect(updated.relatedSceneIds).toEqual(["scene-1"]);
  });

  it("does not duplicate scene links", () => {
    let mf = createMotifFamily("m1", "M", ["s1"]);
    mf = linkScene(mf, "scene-1");
    mf = linkScene(mf, "scene-1");
    expect(mf.relatedSceneIds).toEqual(["scene-1"]);
  });

  it("unlinks a scene", () => {
    let mf = createMotifFamily("m1", "M", ["s1"]);
    mf = linkScene(mf, "scene-1");
    mf = linkScene(mf, "scene-2");
    mf = unlinkScene(mf, "scene-1");
    expect(mf.relatedSceneIds).toEqual(["scene-2"]);
  });
});

describe("motifFamilyRefs", () => {
  it("collects all referenced IDs", () => {
    let mf = createMotifFamily("m1", "M", ["s1", "s2"]);
    mf = addVariant(mf, "v1");
    mf = linkScene(mf, "scene-1");
    const refs = motifFamilyRefs(mf);
    expect(refs).toEqual(["s1", "s2", "v1", "scene-1"]);
  });
});

describe("familiesReferencingId", () => {
  it("finds families with a matching source", () => {
    const a = createMotifFamily("a", "A", ["x"]);
    const b = createMotifFamily("b", "B", ["y"]);
    const result = familiesReferencingId([a, b], "x");
    expect(result).toEqual([a]);
  });

  it("finds families with a matching scene", () => {
    const a = linkScene(createMotifFamily("a", "A", ["s"]), "scene-1");
    const result = familiesReferencingId([a], "scene-1");
    expect(result).toHaveLength(1);
  });
});

// ── Score Profiles ──

describe("createScoreProfile", () => {
  it("creates a minimal profile", () => {
    const p = createScoreProfile("p1", "Forest");
    expect(p).toEqual({ id: "p1", name: "Forest" });
  });
});

describe("isTempoInRange", () => {
  it("returns true when within range", () => {
    const p = { ...createScoreProfile("p", "P"), tempoMin: 80, tempoMax: 120 };
    expect(isTempoInRange(p, 100)).toBe(true);
  });

  it("returns false below min", () => {
    const p = { ...createScoreProfile("p", "P"), tempoMin: 80 };
    expect(isTempoInRange(p, 60)).toBe(false);
  });

  it("returns false above max", () => {
    const p = { ...createScoreProfile("p", "P"), tempoMax: 120 };
    expect(isTempoInRange(p, 140)).toBe(false);
  });

  it("returns true when no bounds set", () => {
    const p = createScoreProfile("p", "P");
    expect(isTempoInRange(p, 999)).toBe(true);
  });
});

describe("isIntensityInRange", () => {
  it("returns true within range", () => {
    const p = { ...createScoreProfile("p", "P"), intensityMin: 0.2, intensityMax: 0.8 };
    expect(isIntensityInRange(p, 0.5)).toBe(true);
  });

  it("returns false outside range", () => {
    const p = { ...createScoreProfile("p", "P"), intensityMin: 0.5 };
    expect(isIntensityInRange(p, 0.1)).toBe(false);
  });
});

describe("matchingPaletteTags", () => {
  it("returns intersection of profile palette and asset tags", () => {
    const p = { ...createScoreProfile("p", "P"), samplePaletteTags: ["dark", "ambient", "lo-fi"] };
    const result = matchingPaletteTags(p, ["dark", "hi-fi", "lo-fi"]);
    expect(result).toEqual(["dark", "lo-fi"]);
  });

  it("returns empty when no palette tags", () => {
    const p = createScoreProfile("p", "P");
    expect(matchingPaletteTags(p, ["x"])).toEqual([]);
  });
});

describe("mergeProfiles", () => {
  it("overlay wins on conflict", () => {
    const base = { ...createScoreProfile("p1", "Base"), key: "C", tempoMin: 80 };
    const merged = mergeProfiles(base, { key: "Am", tempoMax: 120 });
    expect(merged.key).toBe("Am");
    expect(merged.tempoMin).toBe(80);
    expect(merged.tempoMax).toBe(120);
  });
});

// ── Cue Families ──

describe("createCueFamily", () => {
  it("creates with role and empty scenes", () => {
    const cf = createCueFamily("cf1", "Battle", "combat");
    expect(cf.sceneIds).toEqual([]);
    expect(cf.role).toBe("combat");
  });
});

describe("addSceneToCueFamily / removeSceneFromCueFamily", () => {
  it("adds a scene", () => {
    let cf = createCueFamily("cf1", "Battle", "combat");
    cf = addSceneToCueFamily(cf, "scene-1");
    expect(cf.sceneIds).toEqual(["scene-1"]);
  });

  it("no-ops for duplicate", () => {
    let cf = createCueFamily("cf1", "Battle", "combat");
    cf = addSceneToCueFamily(cf, "scene-1");
    cf = addSceneToCueFamily(cf, "scene-1");
    expect(cf.sceneIds).toEqual(["scene-1"]);
  });

  it("removes a scene", () => {
    let cf = createCueFamily("cf1", "Battle", "combat");
    cf = addSceneToCueFamily(cf, "scene-1");
    cf = addSceneToCueFamily(cf, "scene-2");
    cf = removeSceneFromCueFamily(cf, "scene-1");
    expect(cf.sceneIds).toEqual(["scene-2"]);
  });
});

describe("linkMotifToCueFamily", () => {
  it("links a motif family", () => {
    let cf = createCueFamily("cf1", "Battle", "combat");
    cf = linkMotifToCueFamily(cf, "m1");
    expect(cf.motifFamilyIds).toEqual(["m1"]);
  });

  it("no-ops for duplicate", () => {
    let cf = createCueFamily("cf1", "Battle", "combat");
    cf = linkMotifToCueFamily(cf, "m1");
    cf = linkMotifToCueFamily(cf, "m1");
    expect(cf.motifFamilyIds).toEqual(["m1"]);
  });
});

describe("sharedMotifs", () => {
  it("finds common motif family ids", () => {
    let a = createCueFamily("a", "A", "combat");
    a = linkMotifToCueFamily(a, "m1");
    a = linkMotifToCueFamily(a, "m2");
    let b = createCueFamily("b", "B", "exploration");
    b = linkMotifToCueFamily(b, "m2");
    b = linkMotifToCueFamily(b, "m3");
    expect(sharedMotifs(a, b)).toEqual(["m2"]);
  });
});

describe("sharedScenes", () => {
  it("finds common scene ids", () => {
    let a = addSceneToCueFamily(createCueFamily("a", "A", "combat"), "s1");
    a = addSceneToCueFamily(a, "s2");
    let b = addSceneToCueFamily(createCueFamily("b", "B", "exploration"), "s2");
    b = addSceneToCueFamily(b, "s3");
    expect(sharedScenes(a, b)).toEqual(["s2"]);
  });
});

describe("collectMotifFamilyIds", () => {
  it("collect unique motif family ids from multiple families", () => {
    let a = linkMotifToCueFamily(createCueFamily("a", "A", "combat"), "m1");
    a = linkMotifToCueFamily(a, "m2");
    const b = linkMotifToCueFamily(createCueFamily("b", "B", "exploration"), "m2");
    expect(collectMotifFamilyIds([a, b]).sort()).toEqual(["m1", "m2"]);
  });
});

// ── Resolve ──

describe("createScoreMapEntry", () => {
  it("creates a minimal entry", () => {
    const e = createScoreMapEntry("sme1", "Dark Forest", "region");
    expect(e).toEqual({ id: "sme1", name: "Dark Forest", contextType: "region" });
  });
});

describe("resolveProfile", () => {
  it("returns matching profile", () => {
    const profile = createScoreProfile("p1", "Forest");
    const entry = { ...createScoreMapEntry("sme1", "E", "region"), scoreProfileId: "p1" };
    expect(resolveProfile(entry, [profile])).toEqual(profile);
  });

  it("returns undefined if no profile linked", () => {
    const entry = createScoreMapEntry("sme1", "E", "region");
    expect(resolveProfile(entry, [])).toBeUndefined();
  });
});

describe("resolveCueFamilies", () => {
  it("resolves linked cue families", () => {
    const cf1 = createCueFamily("cf1", "Battle", "combat");
    const cf2 = createCueFamily("cf2", "Explore", "exploration");
    const entry = { ...createScoreMapEntry("sme1", "E", "region"), cueFamilyIds: ["cf1"] };
    expect(resolveCueFamilies(entry, [cf1, cf2])).toEqual([cf1]);
  });
});

describe("resolveMotifFamilies", () => {
  it("resolves linked motif families", () => {
    const m1 = createMotifFamily("m1", "Boss", ["s1"]);
    const m2 = createMotifFamily("m2", "Explore", ["s2"]);
    const entry = { ...createScoreMapEntry("sme1", "E", "region"), motifFamilyIds: ["m2"] };
    expect(resolveMotifFamilies(entry, [m1, m2])).toEqual([m2]);
  });
});

describe("entrySceneIds", () => {
  it("collects scenes from resolved cue families", () => {
    let cf = addSceneToCueFamily(createCueFamily("cf1", "Battle", "combat"), "s1");
    cf = addSceneToCueFamily(cf, "s2");
    const entry = { ...createScoreMapEntry("sme1", "E", "region"), cueFamilyIds: ["cf1"] };
    expect(entrySceneIds(entry, [cf]).sort()).toEqual(["s1", "s2"]);
  });
});

describe("entriesByContext", () => {
  it("filters by context type", () => {
    const a = createScoreMapEntry("a", "A", "region");
    const b = createScoreMapEntry("b", "B", "faction");
    const c = createScoreMapEntry("c", "C", "region");
    expect(entriesByContext([a, b, c], "region")).toEqual([a, c]);
  });
});

describe("entriesSharingMotif", () => {
  it("finds entries referencing a motif family", () => {
    const a = { ...createScoreMapEntry("a", "A", "region"), motifFamilyIds: ["m1", "m2"] };
    const b = { ...createScoreMapEntry("b", "B", "faction"), motifFamilyIds: ["m3"] };
    expect(entriesSharingMotif([a, b], "m1")).toEqual([a]);
  });
});

describe("resolveEntryContext", () => {
  it("builds full context from a pack", () => {
    const profile = createScoreProfile("p1", "Forest");
    const motif = createMotifFamily("m1", "Boss", ["s1"]);
    let cf = createCueFamily("cf1", "Battle", "combat");
    cf = addSceneToCueFamily(cf, "scene-1");

    const entry = {
      ...createScoreMapEntry("sme1", "E", "region"),
      scoreProfileId: "p1",
      cueFamilyIds: ["cf1"],
      motifFamilyIds: ["m1"],
    };

    const pack = {
      id: "pack-1",
      name: "Test Pack",
      version: "1.0.0",
      scenes: [{ id: "scene-1", name: "Battle", stems: [] }],
      assets: [],
      scoreProfiles: [profile],
      cueFamilies: [cf],
      motifFamilies: [motif],
      scoreMap: [entry],
    } as SoundtrackPack;

    const ctx = resolveEntryContext(entry, pack);
    expect(ctx.profile).toEqual(profile);
    expect(ctx.cueFamilies).toEqual([cf]);
    expect(ctx.motifFamilies).toEqual([motif]);
    expect(ctx.sceneIds).toEqual(["scene-1"]);
  });
});

// ── Derivation ──

describe("createDerivation", () => {
  it("creates a derivation record", () => {
    const d = createDerivation("d1", "src", "tgt", "darken");
    expect(d).toEqual({ id: "d1", sourceId: "src", targetId: "tgt", transform: "darken" });
  });
});

describe("deriveScene", () => {
  it("creates a derived scene with transformed name and tags", () => {
    const source: Scene = { id: "s1", name: "Battle", stems: [], tags: ["action"] };
    const derived = deriveScene(source, "s2", "intensify");
    expect(derived.id).toBe("s2");
    expect(derived.name).toBe("Battle (Intensified)");
    expect(derived.tags).toEqual(["action", "derived:intensify"]);
  });

  it("handles source with no tags", () => {
    const source: Scene = { id: "s1", name: "Calm", stems: [] };
    const derived = deriveScene(source, "s2", "brighten");
    expect(derived.tags).toEqual(["derived:brighten"]);
  });
});

describe("derivationsFrom / derivationsTo", () => {
  it("finds children", () => {
    const records = [
      createDerivation("d1", "a", "b", "darken"),
      createDerivation("d2", "a", "c", "brighten"),
      createDerivation("d3", "b", "d", "intensify"),
    ];
    expect(derivationsFrom(records, "a")).toHaveLength(2);
    expect(derivationsTo(records, "b")).toHaveLength(1);
    expect(derivationsTo(records, "b")[0].sourceId).toBe("a");
  });
});

describe("derivationChain", () => {
  it("follows the full chain via BFS", () => {
    const records = [
      createDerivation("d1", "a", "b", "darken"),
      createDerivation("d2", "b", "c", "intensify"),
      createDerivation("d3", "c", "d", "brighten"),
      createDerivation("d4", "x", "y", "resolve"), // unrelated
    ];
    const chain = derivationChain(records, "a");
    expect(chain).toHaveLength(3);
    expect(chain.map((c) => c.targetId)).toEqual(["b", "c", "d"]);
  });

  it("returns empty for leaf node", () => {
    const records = [createDerivation("d1", "a", "b", "darken")];
    expect(derivationChain(records, "b")).toEqual([]);
  });

  it("handles cycles gracefully", () => {
    const records = [
      createDerivation("d1", "a", "b", "darken"),
      createDerivation("d2", "b", "a", "brighten"),
    ];
    const chain = derivationChain(records, "a");
    expect(chain).toHaveLength(2);
  });
});

describe("derivationGraphIds", () => {
  it("returns all unique IDs in the graph", () => {
    const records = [
      createDerivation("d1", "a", "b", "darken"),
      createDerivation("d2", "b", "c", "intensify"),
    ];
    expect(derivationGraphIds(records).sort()).toEqual(["a", "b", "c"]);
  });
});
