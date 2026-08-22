import { describe, it, expect } from "vitest";
import { styleTagsFor } from "@motif-studio/score-map";
import { examplePacks } from "../src/app/seed-data";

const grounded = examplePacks.find((p) => p.id === "star-freight-grounded")!.pack;

function scene(id: string) {
  const s = grounded.scenes.find((sc) => sc.id === id);
  if (!s) throw new Error(`scene ${id} missing`);
  return s;
}

function record(id: string) {
  const r = (grounded.generatedCues ?? []).find((g) => g.id === id);
  if (!r) throw new Error(`generated cue ${id} missing`);
  return r;
}

describe("grounded pack fold (wave-2 + wave-3)", () => {
  it("folds all 23 takes as generated cue records", () => {
    expect(grounded.generatedCues).toHaveLength(23);
  });

  it("wave-3 default stems drive the three regenerated scenes", () => {
    for (const [sceneId, seed] of [
      ["sc-ardent-ready", 111],
      ["sc-ardent-sweep", 113],
      ["sc-contracts", 311],
    ] as const) {
      const stemIds = scene(sceneId).layers.map((l) => l.stemId);
      const rec = record(`${sceneId.replace("sc-", "cue-")}-s${seed}`);
      expect(rec.sceneId).toBeDefined();
      expect(stemIds).toContain(`cue-${sceneId.replace("sc-", "")}-s${seed}-stem-bass`);
      expect(stemIds.some((id) => id.includes("-s101-") || id.includes("-s103-") || id.includes("-s302-"))).toBe(false);
    }
  });

  it("unregenerated scenes keep their wave-2 default stems", () => {
    expect(scene("sc-court-martial").layers.map((l) => l.stemId)).toContain(
      "cue-court-martial-s105-stem-bass",
    );
    expect(scene("sc-freeport").layers.map((l) => l.stemId)).toContain(
      "cue-freeport-s301-stem-bass",
    );
  });

  it("new-coverage scenes (patrol, lane) get wave-3 default beds", () => {
    expect(scene("sc-patrol").layers.map((l) => l.stemId)).toContain(
      "cue-patrol-s121-stem-bass",
    );
    expect(scene("sc-lane").layers.map((l) => l.stemId)).toContain(
      "cue-lane-s321-stem-bass",
    );
    expect(record("cue-patrol-s121").generation.prompt).toBe(styleTagsFor("cf-military", 2));
    expect(record("cue-lane-s321").generation.prompt).toBe(styleTagsFor("cf-frontier", 2));
  });

  it("records echo the exact prose their wave ran with", () => {
    expect(record("cue-ardent-ready-s101").generation.prompt).toBe(styleTagsFor("cf-military", 1));
    expect(record("cue-ardent-ready-s111").generation.prompt).toBe(styleTagsFor("cf-military", 2));
    expect(record("cue-contracts-s302").generation.prompt).toBe(styleTagsFor("cf-frontier", 1));
    expect(record("cue-contracts-s311").generation.prompt).toBe(styleTagsFor("cf-frontier", 2));
  });

  it("records carry full job UUIDs and wave-scoped public srcs", () => {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    for (const rec of grounded.generatedCues ?? []) {
      expect(rec.generation.jobId).toMatch(UUID_RE);
    }
    expect(record("cue-ardent-ready-s101").mix?.masterSrc).toBe(
      "/audio/grounded-v2/cue-ardent-ready-s101/masters/cue-ardent-ready-s101-mix.wav",
    );
    expect(record("cue-ardent-ready-s111").mix?.masterSrc).toBe(
      "/audio/grounded-v3/cue-ardent-ready-s111/masters/cue-ardent-ready-s111-mix.wav",
    );
  });

  it("every family attach succeeded (lock-checked) for all 23 records", () => {
    const attached = (grounded.cueFamilies ?? []).flatMap((f) => f.generatedCueIds ?? []);
    expect(attached).toHaveLength(23);
  });
});
