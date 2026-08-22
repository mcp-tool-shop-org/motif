import { describe, it, expect } from "vitest";
import { ACE_STEP_KEYSCALE_VALUES, validateSoundtrackPack } from "@motif-studio/schema";
import {
  LIBRARY_CATALOG,
  LIBRARY_PACKS,
  LIBRARY_TAKES,
  LIBRARY_TIMESIGNATURE,
  buildLibraryPack,
  buildLibraryPacks,
  libraryCatalogCue,
  libraryCatalogPack,
  libraryCueTitle,
  libraryCueVibe,
  libraryFamilyId,
  libraryPackId,
  libraryPackTier,
  libraryPacksForTier,
  librarySceneId,
  libraryTakeFolder,
  libraryTakes,
} from "@motif-studio/score-map";

const FLAGSHIP = "fantasy-jrpg-core";
const flagship = libraryCatalogPack(FLAGSHIP)!;

/** Counted off the raw catalog tiers, NOT off LIBRARY_PACKS — so the derivation
 *  is checked against the spec rather than against itself. Authoring a new tier
 *  moves this number without any edit here. */
const AUTHORED_PACKS = [
  ...LIBRARY_CATALOG.tier1,
  ...(LIBRARY_CATALOG.tier2 ?? []),
  ...(LIBRARY_CATALOG.tier3 ?? []),
];
const TOTAL_CUES = AUTHORED_PACKS.reduce((n, p) => n + p.cues.length, 0);

/** Every authored C/D re-roll — revised prose and seed-only alike. Each adds two takes. */
const REROLLS = [
  ...(LIBRARY_CATALOG.tier1_revisions ?? []),
  ...(LIBRARY_CATALOG.regen_cd ?? []),
];
const TOTAL_TAKES = TOTAL_CUES * 2 + REROLLS.length * 2;

function rerollsFor(packId: string): typeof REROLLS {
  return REROLLS.filter((r) => r.packId === packId);
}

function extrasFor(packId: string, cueId: string) {
  return libraryTakes(packId).filter(
    (t) => t.cueId === cueId && (t.take === "C" || t.take === "D"),
  );
}

// ── Catalog inventory (the spec of record) ──

describe("LIBRARY_CATALOG", () => {
  it("derives one pack per authored catalog entry, across every tier", () => {
    expect(LIBRARY_CATALOG.tier1).toHaveLength(10);
    expect(LIBRARY_PACKS).toHaveLength(AUTHORED_PACKS.length);
    expect(LIBRARY_PACKS.map((p) => p.id)).toEqual(AUTHORED_PACKS.map((p) => p.id));
  });

  it("tags every pack with the catalog key it was authored under", () => {
    for (const pack of LIBRARY_CATALOG.tier1) expect(libraryPackTier(pack.id)).toBe("tier1");
    for (const pack of LIBRARY_CATALOG.tier2 ?? []) expect(libraryPackTier(pack.id)).toBe("tier2");
    for (const pack of LIBRARY_CATALOG.tier3 ?? []) expect(libraryPackTier(pack.id)).toBe("tier3");
    expect(libraryPacksForTier("tier1").map((p) => p.id)).toEqual(
      LIBRARY_CATALOG.tier1.map((p) => p.id),
    );
    expect(libraryPacksForTier("tier2_planned")).toEqual([]);
    expect(() => libraryPackTier("no-such-pack")).toThrow(/no-such-pack/);
  });

  it("planned names, revisions and re-rolls carry no cues and derive no packs", () => {
    expect(LIBRARY_CATALOG.tier2_planned.length).toBeGreaterThan(0);
    expect(LIBRARY_CATALOG.tier3_planned.length).toBeGreaterThan(0);
    expect(LIBRARY_PACKS.every((p) => Array.isArray(p.cues))).toBe(true);
    // re-rolls are extra takes on existing cues, never new packs
    const ids = new Set(LIBRARY_PACKS.map((p) => p.id));
    for (const reroll of REROLLS) {
      expect(ids.has(reroll.packId)).toBe(true);
      expect(
        libraryCatalogPack(reroll.packId)!.cues.some((c) => c.id === reroll.cueId),
      ).toBe(true);
    }
  });

  it("gives the flagship 15 cues, other tier-1/2 packs 10, and tier-3 short-form suites", () => {
    expect(flagship.flagship).toBe(true);
    expect(flagship.cues).toHaveLength(15);
    for (const pack of [...LIBRARY_CATALOG.tier1, ...(LIBRARY_CATALOG.tier2 ?? [])]) {
      if (pack.id === FLAGSHIP) continue;
      expect(pack.cues, pack.id).toHaveLength(10);
    }
    for (const pack of LIBRARY_CATALOG.tier3 ?? []) {
      expect(pack.cues.length, pack.id).toBeGreaterThanOrEqual(5);
      expect(pack.cues.length, pack.id).toBeLessThanOrEqual(10);
    }
    expect(LIBRARY_PACKS.reduce((n, p) => n + p.cues.length, 0)).toBe(TOTAL_CUES);
  });

  it("every keyscale is an ACE-Step enum value (modes are rejected server-side)", () => {
    const allowed = new Set<string>(ACE_STEP_KEYSCALE_VALUES);
    for (const pack of LIBRARY_PACKS) {
      for (const cue of pack.cues) {
        expect(allowed.has(cue.keyscale), `${pack.id}/${cue.id} ${cue.keyscale}`).toBe(true);
      }
    }
  });

  it("seeds follow seedBase + cueIndex*10 + take and are globally unique", () => {
    const seen = new Set<number>();
    for (const pack of LIBRARY_PACKS) {
      pack.cues.forEach((cue, i) => {
        expect(cue.seedA).toBe(pack.seedBase + (i + 1) * 10 + 1);
        expect(cue.seedB).toBe(pack.seedBase + (i + 1) * 10 + 2);
        expect(cue.seedA).toBeLessThan(cue.seedB);
        seen.add(cue.seedA).add(cue.seedB);
      });
    }
    expect(seen.size).toBe(TOTAL_CUES * 2);

    // C/D re-rolls continue the same ladder (take 3 and 4) rather than
    // inventing a seed space — that is what keeps A < B < C < D per cue.
    for (const reroll of REROLLS) {
      const pack = libraryCatalogPack(reroll.packId)!;
      const i = pack.cues.findIndex((c) => c.id === reroll.cueId);
      expect(reroll.seedC, `${reroll.packId}/${reroll.cueId}`).toBe(
        pack.seedBase + (i + 1) * 10 + 3,
      );
      expect(reroll.seedD).toBe(pack.seedBase + (i + 1) * 10 + 4);
      expect(seen.has(reroll.seedC)).toBe(false);
      expect(seen.has(reroll.seedD)).toBe(false);
      seen.add(reroll.seedC).add(reroll.seedD);
    }
    expect(seen.size).toBe(TOTAL_TAKES);
  });

  it("every cue carries prose (the exact string its takes ran with)", () => {
    for (const pack of LIBRARY_PACKS) {
      for (const cue of pack.cues) {
        expect(cue.prose.length).toBeGreaterThan(40);
      }
    }
  });
});

// ── Deterministic ids ──

describe("library ids", () => {
  it("namespace every id by pack, so cue ids may repeat across packs", () => {
    expect(libraryPackId(FLAGSHIP)).toBe("library-fantasy-jrpg-core");
    expect(librarySceneId(FLAGSHIP, "town")).toBe("sc-fantasy-jrpg-core-town");
    expect(libraryFamilyId(FLAGSHIP, "town")).toBe("cf-fantasy-jrpg-core-town");
    expect(libraryTakeFolder("town", 2011)).toBe("town-s2011");
    expect(libraryCueTitle("cave-dungeon")).toBe("Cave Dungeon");
  });

  it("scene and family ids are unique within and across packs", () => {
    const scenes = new Set<string>();
    const families = new Set<string>();
    for (const pack of buildLibraryPacks()) {
      for (const s of pack.scenes) scenes.add(s.id);
      for (const f of pack.cueFamilies ?? []) families.add(f.id);
    }
    expect(scenes.size).toBe(TOTAL_CUES);
    expect(families.size).toBe(TOTAL_CUES);
  });
});

// ── Vibe classifier ──

describe("libraryCueVibe", () => {
  it("classifies by hyphen token, first match wins", () => {
    expect(libraryCueVibe("final-boss")).toBe("boss");
    expect(libraryCueVibe("horror-ambush")).toBe("combat");
    expect(libraryCueVibe("inn-rest")).toBe("safe");
    expect(libraryCueVibe("cave-dungeon")).toBe("mystery");
    expect(libraryCueVibe("rad-storm")).toBe("tension");
    expect(libraryCueVibe("back-alley")).toBe("stealth");
    expect(libraryCueVibe("victory")).toBe("victory");
    expect(libraryCueVibe("defeat")).toBe("aftermath");
  });

  it("falls back to exploration so an unfamiliar Tier-2 cue still derives", () => {
    expect(libraryCueVibe("gear-city")).toBe("exploration");
    expect(libraryCueVibe("some-unlisted-cue")).toBe("exploration");
  });
});

// ── Derivation ──

describe("buildLibraryPack", () => {
  const pack = buildLibraryPack(flagship);

  it("derives one scene, one family, and one binding per catalog cue", () => {
    expect(pack.scenes).toHaveLength(flagship.cues.length);
    expect(pack.cueFamilies).toHaveLength(flagship.cues.length);
    expect(pack.bindings).toHaveLength(flagship.cues.length);
  });

  it("ships only the placeholder asset/stem — audio arrives through the fold", () => {
    expect(pack.assets).toHaveLength(1);
    expect(pack.stems).toHaveLength(1);
    expect(pack.stems[0]!.id).toBe("s-placeholder");
    for (const scene of pack.scenes) {
      expect(scene.layers).toEqual([{ stemId: "s-placeholder" }]);
    }
  });

  it("locks every family to its cue's bpm / keyscale / 4-4", () => {
    for (const cue of flagship.cues) {
      const family = pack.cueFamilies!.find((f) => f.id === libraryFamilyId(FLAGSHIP, cue.id))!;
      expect(family.generationLock).toEqual({
        bpm: cue.bpm,
        keyscale: cue.keyscale,
        timesignature: LIBRARY_TIMESIGNATURE,
      });
      expect(family.sceneIds).toEqual([librarySceneId(FLAGSHIP, cue.id)]);
      expect(family.notes).toBe(cue.prose);
    }
  });

  it("binds and transitions only to scenes the pack owns", () => {
    const sceneIds = new Set(pack.scenes.map((s) => s.id));
    for (const b of pack.bindings) expect(sceneIds.has(b.sceneId)).toBe(true);
    for (const t of pack.transitions) {
      expect(sceneIds.has(t.fromSceneId)).toBe(true);
      expect(sceneIds.has(t.toSceneId)).toBe(true);
    }
    expect(pack.transitions.length).toBeGreaterThan(0);
    expect(new Set(pack.transitions.map((t) => t.id)).size).toBe(pack.transitions.length);
  });

  it("validates every derived pack against the pack schema", () => {
    for (const derived of buildLibraryPacks()) {
      const result = validateSoundtrackPack(derived);
      expect(result.issues, derived.meta.id).toEqual([]);
      expect(result.ok).toBe(true);
    }
  });
});

// ── Takes ──

describe("library takes", () => {
  it("derives an A/B pair per catalog cue, plus C/D for every re-roll", () => {
    expect(LIBRARY_TAKES).toHaveLength(TOTAL_TAKES);
    expect(libraryTakes(FLAGSHIP)).toHaveLength(
      flagship.cues.length * 2 + rerollsFor(FLAGSHIP).length * 2,
    );
  });

  it("orders takes by seed and letters them A → D, one prior default per cue", () => {
    const byCue = new Map<string, typeof LIBRARY_TAKES>();
    for (const take of LIBRARY_TAKES) {
      const bucket = byCue.get(take.familyId);
      if (bucket) bucket.push(take);
      else byCue.set(take.familyId, [take]);
    }
    expect(byCue.size).toBe(TOTAL_CUES);
    for (const [familyId, takes] of byCue) {
      const seeds = takes.map((t) => t.seed);
      expect(seeds, familyId).toEqual([...seeds].sort((a, b) => a - b));
      expect(takes.map((t) => t.take)).toEqual(["A", "B", "C", "D"].slice(0, takes.length));
      expect(takes.filter((t) => t.playbackDefault)).toHaveLength(1);
      expect(takes.find((t) => t.playbackDefault)!.take).toBe("A");
    }
  });

  it("points every take at its own scene, family, and artifact folder", () => {
    for (const take of LIBRARY_TAKES) {
      expect(take.sceneId).toBe(librarySceneId(take.packId, take.cueId));
      expect(take.familyId).toBe(libraryFamilyId(take.packId, take.cueId));
      expect(take.folder).toBe(`${take.cueId}-s${take.seed}`);
      expect(libraryCatalogCue(take.packId, take.cueId)).toBeDefined();
    }
  });

  it("sources the A/B pair from the pack's own tier tree, at the cue's own prose", () => {
    for (const take of LIBRARY_TAKES) {
      if (take.take !== "A" && take.take !== "B") continue;
      expect(take.artifact).toEqual({ root: libraryPackTier(take.packId), dir: take.packId });
      expect(take.promptVersion).toBe(1);
      expect(take.prose).toBe(libraryCatalogCue(take.packId, take.cueId)!.prose);
    }
  });

  it("sources revision C/D takes from the tier-2 revisions tree, at v2 prose", () => {
    for (const rev of LIBRARY_CATALOG.tier1_revisions ?? []) {
      const extras = extrasFor(rev.packId, rev.cueId);
      expect(extras.map((t) => t.seed), `${rev.packId}/${rev.cueId}`).toEqual([
        rev.seedC,
        rev.seedD,
      ]);
      for (const take of extras) {
        expect(take.promptVersion).toBe(2);
        expect(take.prose).toBe(rev.prose);
        // the v1 pair keeps the string it actually ran — prose is append-only
        expect(take.prose).not.toBe(libraryCatalogCue(rev.packId, rev.cueId)!.prose);
        expect(take.artifact).toEqual({ root: "tier2", dir: "tier1-revisions" });
      }
    }
  });

  it("sources seed-only C/D re-rolls from the regen tree, at the cue's unchanged prose", () => {
    for (const regen of LIBRARY_CATALOG.regen_cd ?? []) {
      const extras = extrasFor(regen.packId, regen.cueId);
      expect(extras.map((t) => t.seed), `${regen.packId}/${regen.cueId}`).toEqual([
        regen.seedC,
        regen.seedD,
      ]);
      for (const take of extras) {
        expect(take.promptVersion).toBe(1);
        expect(take.prose).toBe(libraryCatalogCue(regen.packId, regen.cueId)!.prose);
        expect(take.artifact).toEqual({ root: "regen-cd", dir: regen.packId });
      }
    }
  });

  it("adds no scene, family or binding for an extra take", () => {
    const built = buildLibraryPacks();
    expect(built.reduce((n, p) => n + p.scenes.length, 0)).toBe(TOTAL_CUES);
    expect(built.reduce((n, p) => n + (p.cueFamilies?.length ?? 0), 0)).toBe(TOTAL_CUES);
    expect(built.reduce((n, p) => n + p.bindings.length, 0)).toBe(TOTAL_CUES);
    for (const reroll of REROLLS) {
      expect(extrasFor(reroll.packId, reroll.cueId)).toHaveLength(2);
    }
  });

  it("throws on an unknown pack id rather than ingesting a typo", () => {
    expect(() => libraryTakes("no-such-pack")).toThrow(/no-such-pack/);
  });
});
