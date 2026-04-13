import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fixturePath, FIXTURES } from "@motif/test-kit";
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
  SoundtrackPackSchema,
  AudioAssetSchema,
  StemSchema,
  SceneSchema,
  TriggerBindingSchema,
  TransitionRuleSchema,
} from "../src/index.js";

function loadJSON(name: string): unknown {
  return JSON.parse(readFileSync(fixturePath(name), "utf-8"));
}

// ── Valid packs ──

describe("valid packs", () => {
  it("parses minimal-pack.json", () => {
    const data = loadJSON(FIXTURES.MINIMAL_PACK);
    const pack = parseSoundtrackPack(data);
    expect(pack.meta.id).toBe("minimal-pack");
    expect(pack.meta.schemaVersion).toBe("1");
    expect(pack.assets).toHaveLength(1);
    expect(pack.stems).toHaveLength(1);
    expect(pack.scenes).toHaveLength(1);
    expect(pack.bindings).toHaveLength(1);
    expect(pack.transitions).toHaveLength(0);
  });

  it("parses starter-pack.json", () => {
    const data = loadJSON(FIXTURES.STARTER_PACK);
    const pack = parseSoundtrackPack(data);
    expect(pack.meta.id).toBe("starter-pack");
    expect(pack.assets.length).toBeGreaterThan(1);
    expect(pack.scenes.length).toBe(5);
    expect(pack.bindings.length).toBe(5);
    expect(pack.transitions.length).toBe(4);
  });

  it("safeParse returns success for valid pack", () => {
    const data = loadJSON(FIXTURES.MINIMAL_PACK);
    const result = safeParseSoundtrackPack(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.meta.name).toBe("Minimal Pack");
    }
  });

  it("validate returns ok for valid pack", () => {
    const data = loadJSON(FIXTURES.STARTER_PACK);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.data).toBeDefined();
  });
});

// ── Invalid packs ──

describe("invalid: missing meta", () => {
  it("fails parse", () => {
    const data = loadJSON(FIXTURES.INVALID_MISSING_META);
    expect(() => parseSoundtrackPack(data)).toThrow();
  });

  it("safeParse returns structured errors", () => {
    const data = loadJSON(FIXTURES.INVALID_MISSING_META);
    const result = safeParseSoundtrackPack(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      const metaIssue = result.errors.find((e) => e.path === "meta");
      expect(metaIssue).toBeDefined();
    }
  });

  it("validate returns issues with paths", () => {
    const data = loadJSON(FIXTURES.INVALID_MISSING_META);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].path).toBeTruthy();
    expect(result.issues[0].code).toBeTruthy();
    expect(result.issues[0].message).toBeTruthy();
  });
});

describe("invalid: bad transition (crossfade without durationMs)", () => {
  it("fails validation", () => {
    const data = loadJSON(FIXTURES.INVALID_BAD_TRANSITION);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(false);
    const durationIssue = result.issues.find((i) => i.path.includes("durationMs"));
    expect(durationIssue).toBeDefined();
    expect(durationIssue!.message).toContain("durationMs");
  });
});

describe("invalid: empty scene layers", () => {
  it("fails validation", () => {
    const data = loadJSON(FIXTURES.INVALID_EMPTY_SCENE_LAYERS);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(false);
    const layerIssue = result.issues.find((i) => i.path.includes("layers"));
    expect(layerIssue).toBeDefined();
    expect(layerIssue!.message).toContain("at least one layer");
  });
});

describe("invalid: bad asset duration", () => {
  it("catches negative durationMs", () => {
    const data = loadJSON(FIXTURES.INVALID_BAD_ASSET_DURATION);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(false);
    const durationIssue = result.issues.find(
      (i) => i.path.includes("durationMs") && i.message.includes("greater than 0"),
    );
    expect(durationIssue).toBeDefined();
  });

  it("catches loopEndMs <= loopStartMs", () => {
    const data = loadJSON(FIXTURES.INVALID_BAD_ASSET_DURATION);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(false);
    const loopIssue = result.issues.find(
      (i) => i.path.includes("loopEndMs") && i.message.includes("loopStartMs"),
    );
    expect(loopIssue).toBeDefined();
  });
});

// ── Enum validation ──

describe("enum validation", () => {
  it("rejects invalid asset kind", () => {
    const result = AudioAssetSchema.safeParse({
      id: "a",
      name: "a",
      src: "a.ogg",
      kind: "orchestra",
      durationMs: 1000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stem role", () => {
    const result = StemSchema.safeParse({
      id: "s",
      name: "s",
      assetId: "a",
      role: "drums",
      loop: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid scene category", () => {
    const result = SceneSchema.safeParse({
      id: "sc",
      name: "sc",
      category: "dancing",
      layers: [{ stemId: "s" }],
    });
    expect(result.success).toBe(false);
  });
});

// ── Cross-field rules ──

describe("cross-field validation", () => {
  it("rejects binding with empty conditions", () => {
    const result = TriggerBindingSchema.safeParse({
      id: "b",
      name: "b",
      sceneId: "s",
      conditions: [],
      priority: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer priority", () => {
    const result = TriggerBindingSchema.safeParse({
      id: "b",
      name: "b",
      sceneId: "s",
      conditions: [{ field: "mode", op: "eq", value: "x" }],
      priority: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("allows stingerAssetId on stinger-then-switch mode", () => {
    const result = TransitionRuleSchema.safeParse({
      id: "t",
      name: "t",
      fromSceneId: "a",
      toSceneId: "b",
      mode: "stinger-then-switch",
      stingerAssetId: "stinger-01",
    });
    expect(result.success).toBe(true);
  });

  it("requires durationMs for cooldown-fade", () => {
    const result = TransitionRuleSchema.safeParse({
      id: "t",
      name: "t",
      fromSceneId: "a",
      toSceneId: "b",
      mode: "cooldown-fade",
    });
    expect(result.success).toBe(false);
  });
});

// ── Schema version enforcement ──

describe("schema version", () => {
  it("rejects missing schemaVersion", () => {
    const data = loadJSON(FIXTURES.MINIMAL_PACK) as Record<string, unknown>;
    const meta = { ...(data.meta as Record<string, unknown>) };
    delete meta.schemaVersion;
    const result = validateSoundtrackPack({ ...data, meta });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path.includes("schemaVersion"))).toBe(true);
  });

  it("rejects wrong schemaVersion", () => {
    const data = loadJSON(FIXTURES.MINIMAL_PACK) as Record<string, unknown>;
    const meta = { ...(data.meta as Record<string, unknown>), schemaVersion: "2" };
    const result = validateSoundtrackPack({ ...data, meta });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path.includes("schemaVersion"))).toBe(true);
  });
});

// ── Issue formatting ──

describe("issue formatting", () => {
  it("issues have stable ordering by path", () => {
    const data = loadJSON(FIXTURES.INVALID_BAD_ASSET_DURATION);
    const result = validateSoundtrackPack(data);
    expect(result.ok).toBe(false);
    const paths = result.issues.map((i) => i.path);
    const sorted = [...paths].sort();
    expect(paths).toEqual(sorted);
  });

  it("issues contain path, code, and message", () => {
    const data = loadJSON(FIXTURES.INVALID_MISSING_META);
    const result = validateSoundtrackPack(data);
    for (const issue of result.issues) {
      expect(typeof issue.path).toBe("string");
      expect(issue.path.length).toBeGreaterThan(0);
      expect(typeof issue.code).toBe("string");
      expect(issue.code.length).toBeGreaterThan(0);
      expect(typeof issue.message).toBe("string");
      expect(issue.message.length).toBeGreaterThan(0);
    }
  });
});
