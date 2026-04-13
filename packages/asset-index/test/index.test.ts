import { describe, it, expect } from "vitest";
import type { SoundtrackPack } from "@motif-studio/schema";
import { FIXTURES, loadFixture } from "@motif-studio/test-kit";
import {
  buildPackIndex,
  auditPackIntegrity,
  findUnusedAssets,
  findUnusedStems,
  findUnreferencedScenes,
  summarizePackIntegrity,
} from "../src/index.js";

const load = (name: string) => loadFixture(name) as SoundtrackPack;

// ── buildPackIndex ──

describe("buildPackIndex", () => {
  it("builds maps for a valid pack", () => {
    const pack = load(FIXTURES.INTEGRITY_VALID);
    const idx = buildPackIndex(pack);

    expect(idx.assetsById.size).toBe(3);
    expect(idx.stemsById.size).toBe(2);
    expect(idx.scenesById.size).toBe(3);
    expect(idx.bindingsById.size).toBe(3);
    expect(idx.transitionsById.size).toBe(1);

    expect(idx.assetsById.get("a1")?.name).toBe("Loop A");
    expect(idx.scenesById.get("sc-combat")?.category).toBe("combat");
  });

  it("reports no duplicates for a valid pack", () => {
    const pack = load(FIXTURES.INTEGRITY_VALID);
    const idx = buildPackIndex(pack);

    expect(idx.duplicateAssetIds).toEqual([]);
    expect(idx.duplicateStemIds).toEqual([]);
    expect(idx.duplicateSceneIds).toEqual([]);
    expect(idx.duplicateBindingIds).toEqual([]);
    expect(idx.duplicateTransitionIds).toEqual([]);
  });

  it("detects duplicate ids in every entity collection", () => {
    const pack = load(FIXTURES.INTEGRITY_DUPLICATE_IDS);
    const idx = buildPackIndex(pack);

    expect(idx.duplicateAssetIds).toEqual(["a1"]);
    expect(idx.duplicateStemIds).toEqual(["s1"]);
    expect(idx.duplicateSceneIds).toEqual(["sc1"]);
    expect(idx.duplicateBindingIds).toEqual(["b1"]);
    expect(idx.duplicateTransitionIds).toEqual(["t1"]);
  });
});

// ── auditPackIntegrity ──

describe("auditPackIntegrity", () => {
  it("returns clean audit for valid pack", () => {
    const pack = load(FIXTURES.INTEGRITY_VALID);
    const audit = auditPackIntegrity(pack);

    expect(audit.errors).toEqual([]);
    expect(audit.warnings).toEqual([]);
    expect(audit.notes).toEqual([]);
  });

  describe("duplicate ids", () => {
    it("reports errors for all duplicate entity types", () => {
      const pack = load(FIXTURES.INTEGRITY_DUPLICATE_IDS);
      const audit = auditPackIntegrity(pack);
      const codes = audit.errors.map((f) => f.code);

      expect(codes).toContain("duplicate_asset_id");
      expect(codes).toContain("duplicate_stem_id");
      expect(codes).toContain("duplicate_scene_id");
      expect(codes).toContain("duplicate_binding_id");
      expect(codes).toContain("duplicate_transition_id");
    });
  });

  describe("missing asset refs", () => {
    it("detects stem → missing asset and transition → missing stinger", () => {
      const pack = load(FIXTURES.INTEGRITY_MISSING_ASSET_REF);
      const audit = auditPackIntegrity(pack);
      const codes = audit.errors.map((f) => f.code);

      expect(codes).toContain("missing_asset_ref");
      expect(codes).toContain("missing_stinger_asset_ref");

      const stemErr = audit.errors.find((f) => f.code === "missing_asset_ref")!;
      expect(stemErr.entityType).toBe("stem");
      expect(stemErr.entityId).toBe("s2");
      expect(stemErr.path).toBe("stems[1].assetId");

      const stingerErr = audit.errors.find((f) => f.code === "missing_stinger_asset_ref")!;
      expect(stingerErr.entityType).toBe("transition");
      expect(stingerErr.entityId).toBe("t1");
    });
  });

  describe("missing stem refs", () => {
    it("detects scene layer → missing stem", () => {
      const pack = load(FIXTURES.INTEGRITY_MISSING_STEM_REF);
      const audit = auditPackIntegrity(pack);
      const err = audit.errors.find((f) => f.code === "missing_stem_ref")!;

      expect(err).toBeDefined();
      expect(err.entityType).toBe("scene");
      expect(err.entityId).toBe("sc1");
      expect(err.path).toBe("scenes[0].layers[1].stemId");
    });
  });

  describe("missing scene refs", () => {
    it("detects fallback, binding, and transition → missing scene", () => {
      const pack = load(FIXTURES.INTEGRITY_MISSING_SCENE_REF);
      const audit = auditPackIntegrity(pack);
      const codes = audit.errors.map((f) => f.code);

      expect(codes).toContain("missing_fallback_scene_ref");
      expect(codes).toContain("missing_binding_scene_ref");
      expect(codes).toContain("missing_transition_from_scene_ref");
      expect(codes).toContain("missing_transition_to_scene_ref");
    });
  });

  describe("self-references", () => {
    it("warns on scene self-fallback and transition self-reference", () => {
      const pack = load(FIXTURES.INTEGRITY_SELF_REFERENCE);
      const audit = auditPackIntegrity(pack);
      const warnCodes = audit.warnings.map((f) => f.code);

      expect(warnCodes).toContain("scene_self_fallback");
      expect(warnCodes).toContain("transition_self_reference");
    });
  });

  describe("unused entities", () => {
    it("warns on unused assets and stems, notes unreferenced scenes", () => {
      const pack = load(FIXTURES.INTEGRITY_UNUSED_ENTITIES);
      const audit = auditPackIntegrity(pack);

      const warnCodes = audit.warnings.map((f) => f.code);
      expect(warnCodes).toContain("unused_asset");
      expect(warnCodes).toContain("unused_stem");

      const noteCodes = audit.notes.map((f) => f.code);
      expect(noteCodes).toContain("unreferenced_scene");

      const unusedAsset = audit.warnings.find(
        (f) => f.code === "unused_asset" && f.entityId === "a-orphan",
      );
      expect(unusedAsset).toBeDefined();

      const unusedStem = audit.warnings.find(
        (f) => f.code === "unused_stem" && f.entityId === "s-orphan",
      );
      expect(unusedStem).toBeDefined();

      const unreferencedScene = audit.notes.find(
        (f) => f.code === "unreferenced_scene" && f.entityId === "sc-orphan",
      );
      expect(unreferencedScene).toBeDefined();
    });
  });

  describe("finding ordering", () => {
    it("sorts findings by entityType → entityId → path → code", () => {
      const pack = load(FIXTURES.INTEGRITY_MISSING_SCENE_REF);
      const audit = auditPackIntegrity(pack);

      for (const bucket of [audit.errors, audit.warnings, audit.notes]) {
        for (let i = 1; i < bucket.length; i++) {
          const prev = bucket[i - 1];
          const curr = bucket[i];
          const cmp =
            (prev.entityType ?? "").localeCompare(curr.entityType ?? "") ||
            (prev.entityId ?? "").localeCompare(curr.entityId ?? "") ||
            (prev.path ?? "").localeCompare(curr.path ?? "") ||
            prev.code.localeCompare(curr.code);
          expect(cmp).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});

// ── Unused helpers ──

describe("findUnusedAssets", () => {
  it("returns empty for valid pack", () => {
    expect(findUnusedAssets(load(FIXTURES.INTEGRITY_VALID))).toEqual([]);
  });

  it("finds orphan assets", () => {
    const unused = findUnusedAssets(load(FIXTURES.INTEGRITY_UNUSED_ENTITIES));
    expect(unused.map((a) => a.id)).toEqual(["a-orphan"]);
  });
});

describe("findUnusedStems", () => {
  it("returns empty for valid pack", () => {
    expect(findUnusedStems(load(FIXTURES.INTEGRITY_VALID))).toEqual([]);
  });

  it("finds orphan stems", () => {
    const unused = findUnusedStems(load(FIXTURES.INTEGRITY_UNUSED_ENTITIES));
    expect(unused.map((s) => s.id)).toEqual(["s-orphan"]);
  });
});

describe("findUnreferencedScenes", () => {
  it("returns empty for valid pack", () => {
    expect(findUnreferencedScenes(load(FIXTURES.INTEGRITY_VALID))).toEqual([]);
  });

  it("finds orphan scenes", () => {
    const unreferenced = findUnreferencedScenes(load(FIXTURES.INTEGRITY_UNUSED_ENTITIES));
    expect(unreferenced.map((s) => s.id)).toEqual(["sc-orphan"]);
  });
});

// ── summarizePackIntegrity ──

describe("summarizePackIntegrity", () => {
  it("counts entities correctly for valid pack", () => {
    const summary = summarizePackIntegrity(load(FIXTURES.INTEGRITY_VALID));

    expect(summary.assetCount).toBe(3);
    expect(summary.stemCount).toBe(2);
    expect(summary.sceneCount).toBe(3);
    expect(summary.bindingCount).toBe(3);
    expect(summary.transitionCount).toBe(1);

    expect(summary.unusedAssetCount).toBe(0);
    expect(summary.unusedStemCount).toBe(0);
    expect(summary.unreferencedSceneCount).toBe(0);

    expect(summary.errorCount).toBe(0);
    expect(summary.warningCount).toBe(0);
    expect(summary.noteCount).toBe(0);
  });

  it("counts unused entities and findings", () => {
    const summary = summarizePackIntegrity(load(FIXTURES.INTEGRITY_UNUSED_ENTITIES));

    expect(summary.unusedAssetCount).toBe(1);
    expect(summary.unusedStemCount).toBe(1);
    expect(summary.unreferencedSceneCount).toBe(1);

    expect(summary.warningCount).toBeGreaterThan(0);
    expect(summary.noteCount).toBeGreaterThan(0);
  });

  it("counts errors for broken refs", () => {
    const summary = summarizePackIntegrity(load(FIXTURES.INTEGRITY_MISSING_ASSET_REF));
    expect(summary.errorCount).toBeGreaterThan(0);
  });
});
