import { describe, it, expect } from "vitest";
import {
  GROUNDED_CUES,
  GROUNDED_SCENES,
  buildGroundedPack,
} from "@motif-studio/scene-mapper";
import { resolveCuePlan } from "@motif-studio/clip-engine";

const sceneIds = new Set(GROUNDED_SCENES.map((s) => s.id));

// ── Inventory ──

describe("GROUNDED_CUES", () => {
  it("contains exactly 12 cues", () => {
    expect(GROUNDED_CUES).toHaveLength(12);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_CUES.map((c) => c.id);
    expect(new Set(ids).size).toBe(12);
  });

  it("all IDs use cue- prefix", () => {
    for (const c of GROUNDED_CUES) {
      expect(c.id).toMatch(/^cue-/);
    }
  });

  it("all cues have emotion tags", () => {
    for (const c of GROUNDED_CUES) {
      expect(c.emotion).toBeDefined();
      expect(c.emotion!.label).toBeTruthy();
    }
  });

  it("all cues have bpm and beatsPerBar", () => {
    for (const c of GROUNDED_CUES) {
      expect(c.bpm).toBeGreaterThan(0);
      expect(c.beatsPerBar).toBeGreaterThan(0);
    }
  });

  it("all cues have at least 2 sections", () => {
    for (const c of GROUNDED_CUES) {
      expect(c.sections.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("all cues are tagged grounded", () => {
    for (const c of GROUNDED_CUES) {
      expect(c.tags).toContain("grounded");
    }
  });
});

// ── Section architecture ──

describe("section architecture", () => {
  it("all section IDs are unique within each cue", () => {
    for (const cue of GROUNDED_CUES) {
      const ids = cue.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("all sections have positive durationBars", () => {
    for (const cue of GROUNDED_CUES) {
      for (const s of cue.sections) {
        expect(s.durationBars).toBeGreaterThan(0);
      }
    }
  });

  it("all section sceneIds reference valid scenes", () => {
    for (const cue of GROUNDED_CUES) {
      for (const s of cue.sections) {
        if (s.sceneId) {
          expect(sceneIds.has(s.sceneId)).toBe(true);
        }
      }
    }
  });

  it("combat cues have climax sections", () => {
    const combatCues = GROUNDED_CUES.filter((c) => c.tags?.includes("combat"));
    for (const cue of combatCues) {
      const roles = cue.sections.map((s) => s.role);
      expect(roles).toContain("climax");
    }
  });

  it("every cue starts with intro", () => {
    for (const cue of GROUNDED_CUES) {
      expect(cue.sections[0].role).toBe("intro");
    }
  });

  it("every cue ends with outro", () => {
    for (const cue of GROUNDED_CUES) {
      expect(cue.sections[cue.sections.length - 1].role).toBe("outro");
    }
  });
});

// ── Act distribution ──

describe("act distribution", () => {
  it("Act 1 has 4 cues", () => {
    const act1 = GROUNDED_CUES.filter((c) => c.tags?.includes("act-1"));
    expect(act1).toHaveLength(4);
  });

  it("Act 2 has 4 cues", () => {
    const act2 = GROUNDED_CUES.filter((c) => c.tags?.includes("act-2"));
    expect(act2).toHaveLength(4);
  });

  it("Act 3 has 4 cues", () => {
    const act3 = GROUNDED_CUES.filter((c) => c.tags?.includes("act-3"));
    expect(act3).toHaveLength(4);
  });
});

// ── Tempo alignment with score profiles ──

describe("tempo alignment", () => {
  it("Ardent cues are 100 BPM", () => {
    const ardent = GROUNDED_CUES.filter((c) => c.id.includes("ardent"));
    for (const c of ardent) expect(c.bpm).toBe(100);
  });

  it("Freeport cues are 95 BPM", () => {
    const fp = GROUNDED_CUES.filter((c) =>
      ["cue-freeport", "cue-contracts", "cue-crew", "cue-lane"].includes(c.id),
    );
    for (const c of fp) expect(c.bpm).toBe(95);
  });

  it("Communion cue is 80 BPM", () => {
    expect(GROUNDED_CUES.find((c) => c.id === "cue-communion")!.bpm).toBe(80);
  });

  it("Combat cues are 130 BPM", () => {
    const combat = GROUNDED_CUES.filter((c) => c.bpm === 130);
    expect(combat.map((c) => c.id).sort()).toEqual(["cue-ambush", "cue-derelict"]);
  });

  it("Investigation cue is 88 BPM", () => {
    expect(GROUNDED_CUES.find((c) => c.id === "cue-investigation")!.bpm).toBe(88);
  });
});

// ── resolveCuePlan integration ──

describe("resolveCuePlan integration", () => {
  it("all cues produce valid playback plans", () => {
    for (const cue of GROUNDED_CUES) {
      const plan = resolveCuePlan(cue);
      expect(plan.cueId).toBe(cue.id);
      expect(plan.totalBars).toBeGreaterThan(0);
      expect(plan.totalSeconds).toBeGreaterThan(0);
      expect(plan.sections).toHaveLength(cue.sections.length);
    }
  });

  it("communion is the longest cue (28 bars)", () => {
    const comm = resolveCuePlan(GROUNDED_CUES.find((c) => c.id === "cue-communion")!);
    for (const cue of GROUNDED_CUES) {
      const plan = resolveCuePlan(cue);
      expect(comm.totalBars).toBeGreaterThanOrEqual(plan.totalBars);
    }
  });

  it("ambush starts at intro tick 0", () => {
    const plan = resolveCuePlan(GROUNDED_CUES.find((c) => c.id === "cue-ambush")!);
    expect(plan.sections[0].startTick).toBe(0);
    expect(plan.sections[0].role).toBe("intro");
  });
});

// ── Pack integration ──

describe("buildGroundedPack cues", () => {
  const pack = buildGroundedPack();

  it("pack includes all 12 cues", () => {
    expect(pack.cues).toHaveLength(12);
  });

  it("pack includes 6 cue families", () => {
    expect(pack.cueFamilies).toHaveLength(6);
  });

  it("pack includes 6 motif families", () => {
    expect(pack.motifFamilies).toHaveLength(6);
  });

  it("pack includes 5 score profiles", () => {
    expect(pack.scoreProfiles).toHaveLength(5);
  });

  it("pack includes 5 score map entries", () => {
    expect(pack.scoreMap).toHaveLength(5);
  });
});
