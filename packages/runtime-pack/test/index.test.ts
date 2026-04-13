import { describe, it, expect } from "vitest";
import { loadFixture, FIXTURES } from "@motif/test-kit";
import type { SoundtrackPack } from "@motif/schema";
import {
  exportRuntimePack,
  parseRuntimePack,
  safeParseRuntimePack,
  validateRuntimePack,
  serializeRuntimePack,
  roundTripRuntimePack,
} from "../src/index.js";
import type { RuntimeSoundtrackPack } from "../src/index.js";

// ── Helpers ──

function loadPack(name: string): SoundtrackPack {
  return loadFixture(name) as SoundtrackPack;
}

// ────────────────────────────────────────────
// exportRuntimePack
// ────────────────────────────────────────────

describe("exportRuntimePack", () => {
  it("preserves pack metadata", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    expect(rt.meta.id).toBe("starter-pack");
    expect(rt.meta.name).toBe("Starter Adventure Pack");
    expect(rt.meta.version).toBe("1.0.0");
    expect(rt.meta.schemaVersion).toBe("1");
  });

  it("preserves optional meta fields when present", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    expect(rt.meta.description).toBe(
      "A basic exploration and combat soundtrack pack.",
    );
    expect(rt.meta.author).toBe("motif");
    expect(rt.meta.tags).toEqual(["starter", "rpg"]);
  });

  it("omits optional meta fields when absent", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const rt = exportRuntimePack(pack);
    expect(rt.meta).not.toHaveProperty("description");
    expect(rt.meta).not.toHaveProperty("author");
    expect(rt.meta).not.toHaveProperty("tags");
  });

  it("preserves asset runtime fields and strips notes", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const asset = rt.assets[0];
    expect(asset.id).toBe("asset-explore-base");
    expect(asset.src).toBe("audio/explore-base.ogg");
    expect(asset.kind).toBe("loop");
    expect(asset.durationMs).toBe(16000);
    // name is stripped from runtime assets
    expect(asset).not.toHaveProperty("name");
    // notes is stripped
    expect(asset).not.toHaveProperty("notes");
  });

  it("preserves stem runtime fields", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const stem = rt.stems[0];
    expect(stem.id).toBe("stem-explore-base");
    expect(stem.assetId).toBe("asset-explore-base");
    expect(stem.role).toBe("base");
    expect(stem.loop).toBe(true);
    // name is stripped from runtime stems
    expect(stem).not.toHaveProperty("name");
  });

  it("preserves scene structure and strips notes", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const scene = rt.scenes[0];
    expect(scene.id).toBe("scene-exploration");
    expect(scene.name).toBe("Exploration");
    expect(scene.category).toBe("exploration");
    expect(scene.layers.length).toBe(2);
    expect(scene).not.toHaveProperty("notes");
  });

  it("strips binding name (editor-only)", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const binding = rt.bindings[0];
    expect(binding.id).toBe("bind-explore");
    expect(binding.sceneId).toBe("scene-exploration");
    expect(binding).not.toHaveProperty("name");
    expect(binding.conditions.length).toBeGreaterThan(0);
  });

  it("strips transition name and notes", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const trans = rt.transitions[0];
    expect(trans.id).toBe("trans-explore-to-tension");
    expect(trans.fromSceneId).toBe("scene-exploration");
    expect(trans.toSceneId).toBe("scene-tension");
    expect(trans.mode).toBe("crossfade");
    expect(trans).not.toHaveProperty("name");
    expect(trans).not.toHaveProperty("notes");
  });

  it("preserves array ordering", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    expect(rt.assets.map((a) => a.id)).toEqual(pack.assets.map((a) => a.id));
    expect(rt.stems.map((s) => s.id)).toEqual(pack.stems.map((s) => s.id));
    expect(rt.scenes.map((s) => s.id)).toEqual(pack.scenes.map((s) => s.id));
  });

  it("exports minimal pack", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const rt = exportRuntimePack(pack);
    expect(rt.assets.length).toBe(1);
    expect(rt.stems.length).toBe(1);
    expect(rt.scenes.length).toBe(1);
    expect(rt.bindings.length).toBe(1);
    expect(rt.transitions.length).toBe(0);
  });

  it("produces expected runtime shape snapshot from starter pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    expect(rt).toMatchSnapshot();
  });
});

// ────────────────────────────────────────────
// parseRuntimePack
// ────────────────────────────────────────────

describe("parseRuntimePack", () => {
  it("parses valid exported runtime pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const parsed = parseRuntimePack(rt);
    expect(parsed.meta.id).toBe("starter-pack");
  });

  it("parses valid exported minimal pack", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const rt = exportRuntimePack(pack);
    const parsed = parseRuntimePack(rt);
    expect(parsed.meta.id).toBe("minimal-pack");
  });

  it("throws on missing meta", () => {
    const invalid = loadFixture(FIXTURES.RUNTIME_INVALID_MISSING_META);
    expect(() => parseRuntimePack(invalid)).toThrow();
  });

  it("throws on invalid transition (missing durationMs for crossfade)", () => {
    const invalid = loadFixture(FIXTURES.RUNTIME_INVALID_BAD_TRANSITION);
    expect(() => parseRuntimePack(invalid)).toThrow();
  });

  it("throws on empty scene layers", () => {
    const invalid = loadFixture(FIXTURES.RUNTIME_INVALID_EMPTY_LAYERS);
    expect(() => parseRuntimePack(invalid)).toThrow();
  });

  it("throws on wrong schemaVersion", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const rt = exportRuntimePack(pack);
    const broken = { ...rt, meta: { ...rt.meta, schemaVersion: "2" } };
    expect(() => parseRuntimePack(broken)).toThrow();
  });

  it("throws on null input", () => {
    expect(() => parseRuntimePack(null)).toThrow();
  });

  it("throws on undefined input", () => {
    expect(() => parseRuntimePack(undefined)).toThrow();
  });

  it("throws on non-object input", () => {
    expect(() => parseRuntimePack("hello")).toThrow();
  });
});

// ────────────────────────────────────────────
// safeParseRuntimePack
// ────────────────────────────────────────────

describe("safeParseRuntimePack", () => {
  it("returns success for valid runtime pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const result = safeParseRuntimePack(rt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.meta.id).toBe("starter-pack");
    }
  });

  it("returns structured issues for missing meta", () => {
    const invalid = loadFixture(FIXTURES.RUNTIME_INVALID_MISSING_META);
    const result = safeParseRuntimePack(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toHaveProperty("path");
      expect(result.issues[0]).toHaveProperty("code");
      expect(result.issues[0]).toHaveProperty("message");
    }
  });

  it("returns structured issues for bad transition", () => {
    const invalid = loadFixture(FIXTURES.RUNTIME_INVALID_BAD_TRANSITION);
    const result = safeParseRuntimePack(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.path.includes("transition"))).toBe(
        true,
      );
    }
  });
});

// ────────────────────────────────────────────
// validateRuntimePack
// ────────────────────────────────────────────

describe("validateRuntimePack", () => {
  it("returns ok:true for valid pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const result = validateRuntimePack(rt);
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.issues).toEqual([]);
  });

  it("returns ok:false with issues for invalid pack", () => {
    const invalid = loadFixture(FIXTURES.RUNTIME_INVALID_EMPTY_LAYERS);
    const result = validateRuntimePack(invalid);
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────
// serializeRuntimePack
// ────────────────────────────────────────────

describe("serializeRuntimePack", () => {
  it("produces deterministic output", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const a = serializeRuntimePack(rt);
    const b = serializeRuntimePack(rt);
    expect(a).toBe(b);
  });

  it("output is valid JSON that round-trips through JSON.parse", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.meta.id).toBe("starter-pack");
  });

  it("uses two-space indentation", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    expect(json).toContain('  "meta"');
  });

  it("ends with trailing newline", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    expect(json.endsWith("\n")).toBe(true);
  });

  it("snapshot: serialized starter pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    expect(json).toMatchSnapshot();
  });
});

// ────────────────────────────────────────────
// roundTripRuntimePack
// ────────────────────────────────────────────

describe("roundTripRuntimePack", () => {
  it("export → serialize → parse yields equivalent runtime pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const { exported, parsed } = roundTripRuntimePack(pack);
    expect(parsed).toEqual(exported);
  });

  it("minimal pack round-trips cleanly", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const { exported, parsed } = roundTripRuntimePack(pack);
    expect(parsed).toEqual(exported);
  });

  it("multiple runs produce identical serialized JSON", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const a = roundTripRuntimePack(pack);
    const b = roundTripRuntimePack(pack);
    expect(a.serialized).toBe(b.serialized);
  });

  it("parsed pack validates successfully", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const { parsed } = roundTripRuntimePack(pack);
    const result = validateRuntimePack(parsed);
    expect(result.ok).toBe(true);
  });
});
