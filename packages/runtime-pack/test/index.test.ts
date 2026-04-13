import { describe, it, expect } from "vitest";
import { loadFixture, FIXTURES } from "@motif-studio/test-kit";
import type { SoundtrackPack } from "@motif-studio/schema";
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
// AE-FT003: Audio format metadata
// ────────────────────────────────────────────

describe("audio format metadata", () => {
  it("populates codec from .ogg file extension", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const oggAsset = rt.assets.find((a) => a.src.endsWith(".ogg"));
    expect(oggAsset).toBeDefined();
    expect(oggAsset!.codec).toBe("ogg");
  });

  it("populates codec from .wav file extension", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    // Mutate a source asset to have a .wav extension for testing
    const mutated = JSON.parse(JSON.stringify(pack)) as SoundtrackPack;
    mutated.assets[0].src = "audio/test-file.wav";
    const rt = exportRuntimePack(mutated);
    expect(rt.assets[0].codec).toBe("wav");
  });

  it("populates codec from .mp3 file extension", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const mutated = JSON.parse(JSON.stringify(pack)) as SoundtrackPack;
    mutated.assets[0].src = "audio/test-file.mp3";
    const rt = exportRuntimePack(mutated);
    expect(rt.assets[0].codec).toBe("mp3");
  });

  it("populates codec from .flac file extension", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const mutated = JSON.parse(JSON.stringify(pack)) as SoundtrackPack;
    mutated.assets[0].src = "audio/test-file.flac";
    const rt = exportRuntimePack(mutated);
    expect(rt.assets[0].codec).toBe("flac");
  });

  it("omits codec for unknown file extensions", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const mutated = JSON.parse(JSON.stringify(pack)) as SoundtrackPack;
    mutated.assets[0].src = "audio/test-file.aac";
    const rt = exportRuntimePack(mutated);
    expect(rt.assets[0].codec).toBeUndefined();
  });
});

// ────────────────────────────────────────────
// serializeRuntimePack
// ────────────────────────────────────────────

describe("serializeRuntimePack", () => {
  it("produces deterministic contentHash across runs", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const a = JSON.parse(serializeRuntimePack(rt));
    const b = JSON.parse(serializeRuntimePack(rt));
    expect(a.meta.contentHash).toBe(b.meta.contentHash);
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

  it("snapshot: serialized starter pack (without volatile stamps)", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    const parsed = JSON.parse(json);
    // Strip volatile fields so snapshot is deterministic
    delete parsed.meta.exportedAt;
    expect(parsed).toMatchSnapshot();
  });

  it("contentHash is a non-empty hex string", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    const parsed = JSON.parse(json);
    expect(parsed.meta.contentHash).toBeDefined();
    expect(typeof parsed.meta.contentHash).toBe("string");
    expect(parsed.meta.contentHash.length).toBeGreaterThan(0);
    expect(parsed.meta.contentHash).toMatch(/^[0-9a-f]+$/);
  });

  it("exportedAt is a valid ISO timestamp", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const json = serializeRuntimePack(rt);
    const parsed = JSON.parse(json);
    expect(parsed.meta.exportedAt).toBeDefined();
    expect(typeof parsed.meta.exportedAt).toBe("string");
    const date = new Date(parsed.meta.exportedAt);
    expect(date.toISOString()).toBe(parsed.meta.exportedAt);
  });

  it("contentHash is stable for same content", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const rt = exportRuntimePack(pack);
    const jsonA = serializeRuntimePack(rt);
    const jsonB = serializeRuntimePack(rt);
    const hashA = JSON.parse(jsonA).meta.contentHash;
    const hashB = JSON.parse(jsonB).meta.contentHash;
    expect(hashA).toBe(hashB);
  });
});

// ────────────────────────────────────────────
// roundTripRuntimePack
// ────────────────────────────────────────────

describe("roundTripRuntimePack", () => {
  it("export → serialize → parse preserves all non-stamp fields", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const { exported, parsed } = roundTripRuntimePack(pack);
    // parsed includes contentHash + exportedAt stamps from serialization;
    // strip them for structural comparison against the raw export
    const { contentHash: _ch, exportedAt: _ea, ...parsedMetaRest } = parsed.meta;
    const parsedWithoutStamps = { ...parsed, meta: parsedMetaRest };
    expect(parsedWithoutStamps).toEqual(exported);
  });

  it("minimal pack round-trips cleanly", () => {
    const pack = loadPack(FIXTURES.MINIMAL_PACK);
    const { exported, parsed } = roundTripRuntimePack(pack);
    const { contentHash: _ch, exportedAt: _ea, ...parsedMetaRest } = parsed.meta;
    const parsedWithoutStamps = { ...parsed, meta: parsedMetaRest };
    expect(parsedWithoutStamps).toEqual(exported);
  });

  it("multiple runs produce identical contentHash", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const a = roundTripRuntimePack(pack);
    const b = roundTripRuntimePack(pack);
    const hashA = JSON.parse(a.serialized).meta.contentHash;
    const hashB = JSON.parse(b.serialized).meta.contentHash;
    expect(hashA).toBe(hashB);
  });

  it("parsed pack validates successfully", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const { parsed } = roundTripRuntimePack(pack);
    const result = validateRuntimePack(parsed);
    expect(result.ok).toBe(true);
  });
});
