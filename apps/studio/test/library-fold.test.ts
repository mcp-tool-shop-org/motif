import { describe, it, expect } from "vitest";
import {
  LIBRARY_PACKS,
  libraryCatalogCue,
  libraryPackId,
  librarySceneId,
} from "@motif-studio/score-map";
import { examplePacks } from "../src/app/seed-data";

const FLAGSHIP = "fantasy-jrpg-core";
const catalogPack = LIBRARY_PACKS.find((p) => p.id === FLAGSHIP)!;
const flagship = examplePacks.find((p) => p.id === libraryPackId(FLAGSHIP))!.pack;

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
  it("registers only the packs that have ingested audio", () => {
    const registered = examplePacks
      .map((p) => p.id)
      .filter((id) => id.startsWith("library-"));
    expect(registered).toEqual([libraryPackId(FLAGSHIP)]);
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

describe("fantasy-jrpg-core fold (flagship, 15 cues × A/B)", () => {
  it("folds all 30 takes as generated cue records", () => {
    expect(flagship.generatedCues).toHaveLength(30);
  });

  it("beds exactly one take per scene — the A take (lower seed)", () => {
    for (const cue of catalogPack.cues) {
      const stemIds = scene(cue.id).layers.map((l) => l.stemId);
      expect(stemIds).toContain(`${cue.id}-s${cue.seedA}-stem-bass`);
      expect(stemIds.some((id) => id.startsWith(`${cue.id}-s${cue.seedB}-`))).toBe(false);
      expect(stemIds).not.toContain("s-placeholder");
      expect(scene(cue.id).tags).toContain("generated-audio");
    }
  });

  it("keeps the B take attached to the family as a non-default record", () => {
    for (const cue of catalogPack.cues) {
      expect(record(`${cue.id}-s${cue.seedB}`).kind).toBe("music");
    }
  });

  it("every family attach succeeded (lock-checked) for all 30 records", () => {
    const attached = (flagship.cueFamilies ?? []).flatMap((f) => f.generatedCueIds ?? []);
    expect(attached).toHaveLength(30);
    for (const family of flagship.cueFamilies ?? []) {
      expect(family.generatedCueIds).toHaveLength(2);
    }
  });

  it("records echo the catalog prose and lock their cue's bpm / keyscale", () => {
    for (const cue of catalogPack.cues) {
      const catalogCue = libraryCatalogCue(FLAGSHIP, cue.id)!;
      for (const seed of [cue.seedA, cue.seedB]) {
        const rec = record(`${cue.id}-s${seed}`);
        expect(rec.generation.prompt).toBe(catalogCue.prose);
        expect(rec.generation.bpm).toBe(catalogCue.bpm);
        expect(rec.generation.keyscale).toBe(catalogCue.keyscale);
        expect(rec.generation.seed).toBe(seed);
        expect(rec.generation.requestedDurationSec).toBe(60);
      }
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
    expect(flagship.assets.filter((a) => a.tags?.includes("generation:mix"))).toHaveLength(30);
    expect(flagship.stems.filter((s) => s.tags?.includes("generation"))).toHaveLength(120);
  });
});
