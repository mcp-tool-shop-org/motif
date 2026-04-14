import { describe, it, expect } from "vitest";
import type { SoundtrackPack } from "@motif-studio/schema";
import {
  stemRoleToExportRole,
  stemExportPath,
  buildStemExportManifest,
  buildAllStemManifests,
} from "../src/stem-export.js";

// ── Test Pack ──

function buildTestPack(): SoundtrackPack {
  return {
    meta: {
      id: "stem-test",
      name: "Stem Export Test",
      version: "1.0.0",
      schemaVersion: "1",
    },
    assets: [
      { id: "a-bass", name: "Bass Loop", src: "bass.ogg", kind: "loop", durationMs: 8000 },
      { id: "a-pad", name: "Pad", src: "pad.ogg", kind: "loop", durationMs: 16000 },
      { id: "a-perc", name: "Perc", src: "perc.ogg", kind: "loop", durationMs: 4000 },
    ],
    stems: [
      { id: "s-bass", name: "Bass Line", assetId: "a-bass", role: "base", loop: true, gainDb: -3 },
      { id: "s-pad", name: "Atmosphere", assetId: "a-pad", role: "mystery", loop: true },
      { id: "s-perc", name: "Percussion", assetId: "a-perc", role: "combat", loop: true, gainDb: -6 },
    ],
    scenes: [
      {
        id: "sc-explore",
        name: "Exploration",
        category: "exploration",
        layers: [{ stemId: "s-bass" }, { stemId: "s-pad" }],
      },
      {
        id: "sc-combat",
        name: "Combat",
        category: "combat",
        layers: [{ stemId: "s-bass" }, { stemId: "s-pad" }, { stemId: "s-perc" }],
      },
    ],
    bindings: [],
    transitions: [],
  } as SoundtrackPack;
}

// ── stemRoleToExportRole ──

describe("stemRoleToExportRole", () => {
  it("maps base to pad", () => {
    expect(stemRoleToExportRole("base")).toBe("pad");
  });

  it("maps combat to melody", () => {
    expect(stemRoleToExportRole("combat")).toBe("melody");
  });

  it("maps danger to melody", () => {
    expect(stemRoleToExportRole("danger")).toBe("melody");
  });

  it("maps boss to melody", () => {
    expect(stemRoleToExportRole("boss")).toBe("melody");
  });

  it("maps mystery to fx", () => {
    expect(stemRoleToExportRole("mystery")).toBe("fx");
  });

  it("maps faction to accent", () => {
    expect(stemRoleToExportRole("faction")).toBe("accent");
  });

  it("maps accent to accent", () => {
    expect(stemRoleToExportRole("accent")).toBe("accent");
  });

  it("maps recovery to pad", () => {
    expect(stemRoleToExportRole("recovery")).toBe("pad");
  });
});

// ── stemExportPath ──

describe("stemExportPath", () => {
  it("generates conventional path", () => {
    expect(stemExportPath("sc-explore", "s-bass")).toBe(
      "stems/sc-explore_s-bass.wav",
    );
  });

  it("sanitizes special characters", () => {
    expect(stemExportPath("scene/with spaces", "stem#1")).toBe(
      "stems/scene_with_spaces_stem_1.wav",
    );
  });
});

// ── buildStemExportManifest ──

describe("buildStemExportManifest", () => {
  const pack = buildTestPack();

  it("builds manifest for a scene", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore");
    expect(manifest.sceneId).toBe("sc-explore");
    expect(manifest.sceneName).toBe("Exploration");
    expect(manifest.stems).toHaveLength(2);
    expect(manifest.mode).toBe("both"); // default
  });

  it("includes mixed file path in both mode", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore", {
      mode: "both",
    });
    expect(manifest.mixedFilePath).toBe("mixed/sc-explore.wav");
    expect(manifest.stems).toHaveLength(2);
  });

  it("includes mixed file path in mixed mode", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore", {
      mode: "mixed",
    });
    expect(manifest.mixedFilePath).toBeDefined();
    expect(manifest.stems).toHaveLength(2);
  });

  it("omits mixed file path in stems-only mode", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore", {
      mode: "stems",
    });
    expect(manifest.mixedFilePath).toBeUndefined();
    expect(manifest.stems).toHaveLength(2);
  });

  it("maps stem roles to export roles", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore");
    const bassEntry = manifest.stems.find((s) => s.stemId === "s-bass");
    expect(bassEntry?.role).toBe("pad"); // base → pad
    const padEntry = manifest.stems.find((s) => s.stemId === "s-pad");
    expect(padEntry?.role).toBe("fx"); // mystery → fx
  });

  it("carries stem gain through to manifest", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore");
    const bassEntry = manifest.stems.find((s) => s.stemId === "s-bass");
    expect(bassEntry?.defaultGainDb).toBe(-3);
    const padEntry = manifest.stems.find((s) => s.stemId === "s-pad");
    expect(padEntry?.defaultGainDb).toBe(0); // no gainDb = 0
  });

  it("generates correct file paths", () => {
    const manifest = buildStemExportManifest(pack, "sc-combat");
    expect(manifest.stems).toHaveLength(3);
    const paths = manifest.stems.map((s) => s.filePath);
    expect(paths).toContain("stems/sc-combat_s-bass.wav");
    expect(paths).toContain("stems/sc-combat_s-pad.wav");
    expect(paths).toContain("stems/sc-combat_s-perc.wav");
  });

  it("uses default render settings", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore");
    expect(manifest.sampleRate).toBe(48000);
    expect(manifest.bitDepth).toBe(24);
    expect(manifest.channels).toBe(2);
  });

  it("respects custom render settings", () => {
    const manifest = buildStemExportManifest(pack, "sc-explore", {
      sampleRate: 96000,
      bitDepth: 32,
      channels: 1,
    });
    expect(manifest.sampleRate).toBe(96000);
    expect(manifest.bitDepth).toBe(32);
    expect(manifest.channels).toBe(1);
  });

  it("throws for missing scene", () => {
    expect(() =>
      buildStemExportManifest(pack, "sc-nonexistent"),
    ).toThrow("Scene not found");
  });
});

// ── buildAllStemManifests ──

describe("buildAllStemManifests", () => {
  it("builds manifests for all scenes", () => {
    const pack = buildTestPack();
    const manifests = buildAllStemManifests(pack);
    expect(manifests).toHaveLength(2);
    expect(manifests[0].sceneId).toBe("sc-explore");
    expect(manifests[1].sceneId).toBe("sc-combat");
  });

  it("passes options through to each manifest", () => {
    const pack = buildTestPack();
    const manifests = buildAllStemManifests(pack, {
      mode: "stems",
      sampleRate: 96000,
    });
    for (const m of manifests) {
      expect(m.mode).toBe("stems");
      expect(m.sampleRate).toBe(96000);
      expect(m.mixedFilePath).toBeUndefined();
    }
  });
});
