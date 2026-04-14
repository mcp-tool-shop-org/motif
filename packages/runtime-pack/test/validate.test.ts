import { describe, it, expect } from "vitest";
import type { RuntimeSoundtrackPack } from "../src/types.js";
import { auditRuntimePack } from "../src/validate.js";

// ── Helpers ──

function validPack(): RuntimeSoundtrackPack {
  return {
    meta: { id: "test", name: "Test", version: "1.0.0", schemaVersion: "1" },
    assets: [
      { id: "a1", src: "loop.ogg", kind: "loop", durationMs: 4000 },
      { id: "a2", src: "stinger.ogg", kind: "stinger", durationMs: 1000 },
    ],
    stems: [
      { id: "s1", assetId: "a1", role: "base", loop: true },
    ],
    scenes: [
      { id: "sc1", name: "Scene 1", category: "exploration", layers: [{ stemId: "s1" }] },
      { id: "sc2", name: "Scene 2", category: "combat", layers: [{ stemId: "s1" }] },
    ],
    bindings: [
      {
        id: "b1",
        sceneId: "sc1",
        priority: 10,
        conditions: [{ field: "mode", op: "eq", value: "explore" }],
      },
    ],
    transitions: [
      { id: "t1", fromSceneId: "sc1", toSceneId: "sc2", mode: "crossfade", durationMs: 1000 },
    ],
  };
}

// ── Tests ──

describe("auditRuntimePack", () => {
  it("passes a valid pack", () => {
    const result = auditRuntimePack(validPack());
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.stats.assets).toBe(2);
    expect(result.stats.stems).toBe(1);
    expect(result.stats.scenes).toBe(2);
  });

  it("catches missing meta.id", () => {
    const pack = validPack();
    (pack.meta as Record<string, unknown>).id = "";
    const result = auditRuntimePack(pack);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "META_MISSING_ID")).toBe(true);
  });

  it("catches unknown schema version", () => {
    const pack = validPack();
    (pack.meta as Record<string, unknown>).schemaVersion = "99";
    const result = auditRuntimePack(pack);
    expect(result.issues.some((i) => i.code === "META_UNKNOWN_SCHEMA")).toBe(true);
  });

  it("catches duplicate asset IDs", () => {
    const pack = validPack();
    pack.assets.push({ ...pack.assets[0] });
    const result = auditRuntimePack(pack);
    expect(result.issues.some((i) => i.code === "DUPLICATE_ASSET_ID")).toBe(true);
  });

  it("catches duplicate stem IDs", () => {
    const pack = validPack();
    pack.stems.push({ ...pack.stems[0] });
    const result = auditRuntimePack(pack);
    expect(result.issues.some((i) => i.code === "DUPLICATE_STEM_ID")).toBe(true);
  });

  it("catches duplicate scene IDs", () => {
    const pack = validPack();
    pack.scenes.push({ ...pack.scenes[0] });
    const result = auditRuntimePack(pack);
    expect(result.issues.some((i) => i.code === "DUPLICATE_SCENE_ID")).toBe(true);
  });

  it("catches stem referencing missing asset", () => {
    const pack = validPack();
    pack.stems[0].assetId = "nonexistent";
    const result = auditRuntimePack(pack);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "STEM_MISSING_ASSET")).toBe(true);
  });

  it("catches scene layer referencing missing stem", () => {
    const pack = validPack();
    pack.scenes[0].layers[0].stemId = "nonexistent";
    const result = auditRuntimePack(pack);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "SCENE_MISSING_STEM")).toBe(true);
  });

  it("catches binding referencing missing scene", () => {
    const pack = validPack();
    pack.bindings[0].sceneId = "nonexistent";
    const result = auditRuntimePack(pack);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "BINDING_MISSING_SCENE")).toBe(true);
  });

  it("catches transition referencing missing scenes", () => {
    const pack = validPack();
    pack.transitions[0].fromSceneId = "nonexistent";
    const result = auditRuntimePack(pack);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "TRANSITION_MISSING_FROM")).toBe(true);
  });

  it("catches missing fallback scene", () => {
    const pack = validPack();
    pack.scenes[0].fallbackSceneId = "nonexistent";
    const result = auditRuntimePack(pack);
    expect(result.issues.some((i) => i.code === "SCENE_MISSING_FALLBACK")).toBe(true);
  });

  it("warns on binding with no conditions", () => {
    const pack = validPack();
    pack.bindings[0].conditions = [];
    const result = auditRuntimePack(pack);
    // This is a warning, not an error — pack is still valid
    expect(result.valid).toBe(true);
    expect(result.issues.some((i) => i.code === "BINDING_NO_CONDITIONS")).toBe(true);
  });

  it("warns on scene with no layers", () => {
    const pack = validPack();
    pack.scenes[0].layers = [];
    const result = auditRuntimePack(pack);
    expect(result.issues.some((i) => i.code === "SCENE_NO_LAYERS")).toBe(true);
  });

  it("reports stats correctly", () => {
    const result = auditRuntimePack(validPack());
    expect(result.stats).toEqual({
      assets: 2,
      stems: 1,
      scenes: 2,
      bindings: 1,
      transitions: 1,
      stingers: 0,
    });
  });
});
