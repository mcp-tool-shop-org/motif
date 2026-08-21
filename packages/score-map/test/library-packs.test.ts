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
  librarySceneId,
  libraryTakeFolder,
  libraryTakes,
} from "@motif-studio/score-map";

const FLAGSHIP = "fantasy-jrpg-core";
const flagship = libraryCatalogPack(FLAGSHIP)!;

/** Counted off the raw catalog tiers, NOT off LIBRARY_PACKS — so the derivation
 *  is checked against the spec rather than against itself. Authoring a new tier
 *  moves this number without any edit here. */
const TOTAL_CUES = [...LIBRARY_CATALOG.tier1, ...(LIBRARY_CATALOG.tier2 ?? [])].reduce(
  (n, p) => n + p.cues.length,
  0,
);

// ── Catalog inventory (the spec of record) ──

describe("LIBRARY_CATALOG", () => {
  it("derives one pack per authored catalog entry, across every tier", () => {
    expect(LIBRARY_CATALOG.tier1).toHaveLength(10);
    const authored = [...LIBRARY_CATALOG.tier1, ...(LIBRARY_CATALOG.tier2 ?? [])];
    expect(LIBRARY_PACKS).toHaveLength(authored.length);
    expect(LIBRARY_PACKS.map((p) => p.id)).toEqual(authored.map((p) => p.id));
  });

  it("planned names and cue revisions carry no cues and derive no packs", () => {
    expect(LIBRARY_CATALOG.tier2_planned.length).toBeGreaterThan(0);
    expect(LIBRARY_CATALOG.tier3_planned.length).toBeGreaterThan(0);
    expect(LIBRARY_PACKS.every((p) => Array.isArray(p.cues))).toBe(true);
    // revisions are re-rolls of existing cues, never new packs
    const ids = new Set(LIBRARY_PACKS.map((p) => p.id));
    for (const rev of LIBRARY_CATALOG.tier1_revisions ?? []) {
      expect(ids.has(rev.packId)).toBe(true);
      expect(libraryCatalogPack(rev.packId)!.cues.some((c) => c.id === rev.cueId)).toBe(true);
    }
  });

  it("gives the flagship 15 cues and every other pack exactly 10", () => {
    expect(flagship.flagship).toBe(true);
    expect(flagship.cues).toHaveLength(15);
    for (const pack of LIBRARY_PACKS.filter((p) => p.id !== FLAGSHIP)) {
      expect(pack.cues).toHaveLength(10);
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
  it("derives A/B takes for every catalog cue", () => {
    expect(LIBRARY_TAKES).toHaveLength(TOTAL_CUES * 2);
    expect(libraryTakes(FLAGSHIP)).toHaveLength(30);
  });

  it("makes the lower seed the A take and the only playback default", () => {
    for (const cue of flagship.cues) {
      const takes = libraryTakes(FLAGSHIP).filter((t) => t.cueId === cue.id);
      expect(takes.map((t) => t.seed)).toEqual([cue.seedA, cue.seedB]);
      expect(takes.map((t) => t.take)).toEqual(["A", "B"]);
      expect(takes.filter((t) => t.playbackDefault)).toHaveLength(1);
      expect(takes.find((t) => t.playbackDefault)!.seed).toBe(cue.seedA);
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

  it("throws on an unknown pack id rather than ingesting a typo", () => {
    expect(() => libraryTakes("no-such-pack")).toThrow(/no-such-pack/);
  });
});
