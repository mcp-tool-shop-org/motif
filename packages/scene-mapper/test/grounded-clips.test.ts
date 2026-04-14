import { describe, it, expect } from "vitest";
import {
  GROUNDED_CLIPS,
  GROUNDED_SCENES,
  buildGroundedPack,
} from "@motif-studio/scene-mapper";
import { SCIFI_PRESETS } from "@motif-studio/instrument-rack";

const presetIds = new Set(SCIFI_PRESETS.map((p) => p.id));

// ── Inventory ──

describe("GROUNDED_CLIPS", () => {
  it("contains exactly 25 clips", () => {
    expect(GROUNDED_CLIPS).toHaveLength(25);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_CLIPS.map((c) => c.id);
    expect(new Set(ids).size).toBe(25);
  });

  it("all IDs use cl- prefix", () => {
    for (const c of GROUNDED_CLIPS) {
      expect(c.id).toMatch(/^cl-/);
    }
  });

  it("all clips loop", () => {
    for (const c of GROUNDED_CLIPS) {
      expect(c.loop).toBe(true);
    }
  });

  it("all clips have notes", () => {
    for (const c of GROUNDED_CLIPS) {
      expect(c.notes.length).toBeGreaterThan(0);
    }
  });
});

// ── Lane coverage ──

describe("lane coverage", () => {
  it("covers all 5 lanes", () => {
    const lanes = new Set(GROUNDED_CLIPS.map((c) => c.lane));
    expect(lanes).toEqual(new Set(["drums", "bass", "harmony", "motif", "accent"]));
  });

  it("5 clips per lane", () => {
    const byCounts: Record<string, number> = {};
    for (const c of GROUNDED_CLIPS) {
      byCounts[c.lane] = (byCounts[c.lane] ?? 0) + 1;
    }
    expect(byCounts["drums"]).toBe(5);
    expect(byCounts["bass"]).toBe(5);
    expect(byCounts["harmony"]).toBe(5);
    expect(byCounts["motif"]).toBe(5);
    expect(byCounts["accent"]).toBe(5);
  });
});

// ── World grouping ──

describe("world grouping", () => {
  const byWorld = (prefix: string) =>
    GROUNDED_CLIPS.filter((c) => c.id.startsWith(`cl-${prefix}-`));

  it("Ardent has 5 clips", () => {
    expect(byWorld("ardent")).toHaveLength(5);
  });

  it("Freeport has 5 clips", () => {
    expect(byWorld("freeport")).toHaveLength(5);
  });

  it("Communion has 5 clips", () => {
    expect(byWorld("communion")).toHaveLength(5);
  });

  it("Combat has 5 clips", () => {
    expect(byWorld("combat")).toHaveLength(5);
  });

  it("Investigation has 5 clips", () => {
    expect(byWorld("investigation")).toHaveLength(5);
  });
});

// ── Note validity ──

describe("note validity", () => {
  it("all pitches are 0-127", () => {
    for (const c of GROUNDED_CLIPS) {
      for (const note of c.notes) {
        expect(note.pitch).toBeGreaterThanOrEqual(0);
        expect(note.pitch).toBeLessThanOrEqual(127);
      }
    }
  });

  it("all startTicks are non-negative", () => {
    for (const c of GROUNDED_CLIPS) {
      for (const note of c.notes) {
        expect(note.startTick).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("all velocities are 1-127", () => {
    for (const c of GROUNDED_CLIPS) {
      for (const note of c.notes) {
        expect(note.velocity).toBeGreaterThanOrEqual(1);
        expect(note.velocity).toBeLessThanOrEqual(127);
      }
    }
  });

  it("all durations are positive", () => {
    for (const c of GROUNDED_CLIPS) {
      for (const note of c.notes) {
        expect(note.durationTicks).toBeGreaterThan(0);
      }
    }
  });

  it("notes fit within clip length", () => {
    for (const c of GROUNDED_CLIPS) {
      const maxTick = c.lengthBeats * 480;
      for (const note of c.notes) {
        expect(note.startTick).toBeLessThan(maxTick);
      }
    }
  });
});

// ── Instrument linkage ──

describe("instrument preset linkage", () => {
  it("all instrumentIds reference real sci-fi presets", () => {
    for (const c of GROUNDED_CLIPS) {
      expect(presetIds.has(c.instrumentId)).toBe(true);
    }
  });

  it("Ardent clips use military presets", () => {
    const ardent = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-ardent-"));
    const ids = ardent.map((c) => c.instrumentId);
    expect(ids).toContain("scifi-march-drum");
    expect(ids).toContain("scifi-brass-synth");
    expect(ids).toContain("scifi-hull-rumble");
  });

  it("Communion clips use Keth/alien presets", () => {
    const communion = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-communion-"));
    const ids = communion.map((c) => c.instrumentId);
    expect(ids).toContain("scifi-keth-voice");
    expect(ids).toContain("scifi-keth-bell");
    expect(ids).toContain("scifi-keth-bass");
  });

  it("Investigation clips use investigation presets", () => {
    const inv = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-investigation-"));
    const ids = inv.map((c) => c.instrumentId);
    expect(ids).toContain("scifi-clue-pluck");
    expect(ids).toContain("scifi-mystery-pad");
    expect(ids).toContain("scifi-suspense-bass");
  });
});

// ── Tempo alignment with score profiles ──

describe("tempo alignment", () => {
  it("Ardent clips are 100 BPM (within sp-ardent 90-110)", () => {
    const ardent = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-ardent-"));
    for (const c of ardent) expect(c.bpm).toBe(100);
  });

  it("Freeport clips are 95 BPM (within sp-freeport 85-105)", () => {
    const fp = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-freeport-"));
    for (const c of fp) expect(c.bpm).toBe(95);
  });

  it("Communion clips are 80 BPM (within sp-communion 70-90)", () => {
    const comm = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-communion-"));
    for (const c of comm) expect(c.bpm).toBe(80);
  });

  it("Combat clips are 130 BPM (within sp-combat 120-140)", () => {
    const combat = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-combat-"));
    for (const c of combat) expect(c.bpm).toBe(130);
  });

  it("Investigation clips are 88 BPM (within sp-investigation 80-95)", () => {
    const inv = GROUNDED_CLIPS.filter((c) => c.id.startsWith("cl-investigation-"));
    for (const c of inv) expect(c.bpm).toBe(88);
  });
});

// ── Key alignment ──

describe("key alignment", () => {
  it("Ardent clips use G (keyRoot 7)", () => {
    const tonal = GROUNDED_CLIPS.filter(
      (c) => c.id.startsWith("cl-ardent-") && c.keyRoot != null,
    );
    for (const c of tonal) expect(c.keyRoot).toBe(7);
  });

  it("Communion clips use F phrygian (keyRoot 5)", () => {
    const tonal = GROUNDED_CLIPS.filter(
      (c) => c.id.startsWith("cl-communion-") && c.keyRoot != null,
    );
    for (const c of tonal) {
      expect(c.keyRoot).toBe(5);
      expect(c.keyScale).toBe("phrygian");
    }
  });

  it("Investigation clips use Db chromatic (keyRoot 1)", () => {
    const tonal = GROUNDED_CLIPS.filter(
      (c) => c.id.startsWith("cl-investigation-") && c.keyRoot != null,
    );
    for (const c of tonal) {
      expect(c.keyRoot).toBe(1);
      expect(c.keyScale).toBe("chromatic");
    }
  });
});

// ── Scene clip layer integration ──

describe("scene clipLayers integration", () => {
  it("all scenes have clipLayers", () => {
    for (const s of GROUNDED_SCENES) {
      expect(s.clipLayers).toBeDefined();
      expect(s.clipLayers!.length).toBeGreaterThan(0);
    }
  });

  it("all clipLayer references point to valid clip IDs", () => {
    const clipIds = new Set(GROUNDED_CLIPS.map((c) => c.id));
    for (const s of GROUNDED_SCENES) {
      for (const ref of s.clipLayers!) {
        expect(clipIds.has(ref.clipId)).toBe(true);
      }
    }
  });

  it("each scene has 5 clip layers (one per lane)", () => {
    for (const s of GROUNDED_SCENES) {
      expect(s.clipLayers).toHaveLength(5);
    }
  });

  it("combat scenes use combat clips", () => {
    const combatScenes = GROUNDED_SCENES.filter((s) => s.category === "combat");
    for (const s of combatScenes) {
      const clipIds = s.clipLayers!.map((r) => r.clipId);
      expect(clipIds.some((id) => id.startsWith("cl-combat-"))).toBe(true);
    }
  });

  it("communion scene uses communion clips", () => {
    const comm = GROUNDED_SCENES.find((s) => s.id === "sc-communion")!;
    const clipIds = comm.clipLayers!.map((r) => r.clipId);
    expect(clipIds.every((id) => id.startsWith("cl-communion-"))).toBe(true);
  });
});

// ── Pack integration ──

describe("buildGroundedPack clips", () => {
  const pack = buildGroundedPack();

  it("pack includes all 25 clips", () => {
    expect(pack.clips).toHaveLength(25);
  });

  it("all scene clipLayer refs resolve to pack clips", () => {
    const clipIds = new Set(pack.clips!.map((c) => c.id));
    for (const scene of pack.scenes) {
      for (const ref of scene.clipLayers ?? []) {
        expect(clipIds.has(ref.clipId)).toBe(true);
      }
    }
  });
});
