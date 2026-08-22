import { describe, it, expect } from "vitest";
import {
  LIBRARY_PACKS,
  libraryCatalogCue,
  libraryPackId,
  librarySceneId,
  libraryTakes,
} from "@motif-studio/score-map";
import { examplePacks } from "../src/app/seed-data";
import libraryFolded from "../src/app/library-folded.json";

interface FoldedItem {
  record: { id: string; generation: { seed: number }; boostCapped?: boolean };
  playbackDefault: boolean;
}
type LibraryFolded = { packs?: Record<string, { items?: FoldedItem[] }> };

const FLAGSHIP = "fantasy-jrpg-core";
const catalogPack = LIBRARY_PACKS.find((p) => p.id === FLAGSHIP)!;
const flagship = examplePacks.find((p) => p.id === libraryPackId(FLAGSHIP))!.pack;

/**
 * The flagship's folded takes, read from the manifest rather than hard-coded.
 * A cue carries its A/B pair and, once its C/D re-roll is ingested, up to four
 * records — so a fixed count here would fail on the re-roll landing rather than
 * on a real regression.
 */
const foldedItems: FoldedItem[] =
  (libraryFolded as LibraryFolded).packs?.[FLAGSHIP]?.items ?? [];

function scene(cueId: string) {
  const s = flagship.scenes.find((sc) => sc.id === librarySceneId(FLAGSHIP, cueId));
  if (!s) throw new Error(`scene for ${cueId} missing`);
  return s;
}

function record(id: string) {
  const r = (flagship.generatedCues ?? []).find((g) => g.id === id);
  if (!r) throw new Error(`generated cue ${id} missing`);
  return r;
}

describe("library pack registry", () => {
  it("registers exactly the packs that have ingested audio, and no others", () => {
    // Derived from the folded manifest, never hard-coded: packs land one at a
    // time as `ingest:library` works through the catalog, so a fixed list here
    // would fail on every pack that lands rather than on a real regression.
    const folded = (libraryFolded as LibraryFolded).packs ?? {};
    const withAudio = Object.entries(folded)
      .filter(([, v]) => (v?.items?.length ?? 0) > 0)
      .map(([packId]) => libraryPackId(packId));
    const registered = examplePacks
      .map((p) => p.id)
      .filter((id) => id.startsWith("library-"));
    expect([...registered].sort()).toEqual([...withAudio].sort());
    expect(registered).toContain(libraryPackId(FLAGSHIP));
  });

  it("keeps the five authored example packs ahead of the library", () => {
    expect(examplePacks.slice(0, 5).map((p) => p.id)).toEqual([
      "minimal-pack",
      "starter-pack",
      "combat-escalation-pack",
      "synth-demo-pack",
      "star-freight-grounded",
    ]);
  });
});

describe("fantasy-jrpg-core fold (flagship, 15 cues)", () => {
  it("folds every ingested take as a generated cue record", () => {
    expect(foldedItems.length).toBeGreaterThanOrEqual(catalogPack.cues.length * 2);
    expect(flagship.generatedCues).toHaveLength(foldedItems.length);
    // every folded record id is a take the catalog derives — no orphans
    const derived = new Set(libraryTakes(FLAGSHIP).map((t) => t.folder));
    for (const item of foldedItems) expect(derived.has(item.record.id)).toBe(true);
  });

  it("beds exactly one take per scene — the one the ingest marked default", () => {
    for (const cue of catalogPack.cues) {
      const cueItems = foldedItems.filter((i) =>
        i.record.id.startsWith(`${cue.id}-s`),
      );
      const bedded = cueItems.filter((i) => i.playbackDefault);
      expect(bedded, cue.id).toHaveLength(1);
      const stemIds = scene(cue.id).layers.map((l) => l.stemId);
      expect(stemIds).toContain(`${bedded[0]!.record.id}-stem-bass`);
      for (const other of cueItems.filter((i) => !i.playbackDefault)) {
        expect(stemIds.some((id) => id.startsWith(`${other.record.id}-`))).toBe(false);
      }
      expect(stemIds).not.toContain("s-placeholder");
      expect(scene(cue.id).tags).toContain("generated-audio");
    }
  });

  it("beds the lowest-seed take that cleared the boost cap", () => {
    // The rescue rule, checked against what actually shipped: a capped take is
    // only bedded when every take of that cue capped.
    for (const cue of catalogPack.cues) {
      const cueItems = foldedItems
        .filter((i) => i.record.id.startsWith(`${cue.id}-s`))
        .sort((a, b) => a.record.generation.seed - b.record.generation.seed);
      const expected =
        cueItems.find((i) => !i.record.boostCapped) ?? cueItems[0];
      expect(cueItems.find((i) => i.playbackDefault)?.record.id, cue.id).toBe(
        expected!.record.id,
      );
    }
  });

  it("keeps every non-default take attached to the family as a record", () => {
    for (const item of foldedItems) {
      expect(record(item.record.id).kind).toBe("music");
    }
  });

  it("every family attach succeeded (lock-checked) for every folded record", () => {
    const attached = (flagship.cueFamilies ?? []).flatMap((f) => f.generatedCueIds ?? []);
    expect(attached).toHaveLength(foldedItems.length);
    for (const family of flagship.cueFamilies ?? []) {
      expect(family.generatedCueIds!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("records echo the prose their take ran with and lock their cue's bpm / keyscale", () => {
    for (const take of libraryTakes(FLAGSHIP)) {
      if (!foldedItems.some((i) => i.record.id === take.folder)) continue;
      const catalogCue = libraryCatalogCue(FLAGSHIP, take.cueId)!;
      const rec = record(take.folder);
      expect(rec.generation.prompt).toBe(take.prose);
      expect(rec.generation.bpm).toBe(catalogCue.bpm);
      expect(rec.generation.keyscale).toBe(catalogCue.keyscale);
      expect(rec.generation.seed).toBe(take.seed);
      expect(rec.generation.requestedDurationSec).toBe(60);
    }
  });

  it("records carry full job UUIDs and pack-scoped public srcs", () => {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    for (const rec of flagship.generatedCues ?? []) {
      expect(rec.generation.jobId).toMatch(UUID_RE);
      expect(rec.mix?.masterSrc).toMatch(
        /^\/audio\/library-packs\/fantasy-jrpg-core\/[a-z-]+-s\d+\/masters\//,
      );
    }
    expect(record("town-s2011").mix?.masterSrc).toBe(
      "/audio/library-packs/fantasy-jrpg-core/town-s2011/masters/town-s2011-mix.wav",
    );
  });

  it("carries one mix + four stem assets per take", () => {
    expect(flagship.assets.filter((a) => a.tags?.includes("generation:mix"))).toHaveLength(
      foldedItems.length,
    );
    expect(flagship.stems.filter((s) => s.tags?.includes("generation"))).toHaveLength(
      foldedItems.length * 4,
    );
  });
});
