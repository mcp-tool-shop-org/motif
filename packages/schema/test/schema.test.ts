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
  ClipNoteSchema,
  SampleSliceSchema,
  SampleInstrumentSchema,
  ScoreProfileSchema,
  PerformanceCaptureSchema,
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

// ── ClipNote MIDI bounds ──

describe("ClipNoteSchema MIDI bounds", () => {
  const validNote = { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 };

  it("accepts valid MIDI note", () => {
    expect(ClipNoteSchema.safeParse(validNote).success).toBe(true);
  });

  it("accepts pitch=0 (min bound)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, pitch: 0 }).success).toBe(true);
  });

  it("accepts pitch=127 (max bound)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, pitch: 127 }).success).toBe(true);
  });

  it("rejects pitch=-1 (below min)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, pitch: -1 }).success).toBe(false);
  });

  it("rejects pitch=128 (above max)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, pitch: 128 }).success).toBe(false);
  });

  it("rejects non-integer pitch", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, pitch: 60.5 }).success).toBe(false);
  });

  it("accepts velocity=0 (min bound)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, velocity: 0 }).success).toBe(true);
  });

  it("accepts velocity=127 (max bound)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, velocity: 127 }).success).toBe(true);
  });

  it("rejects velocity=-1 (below min)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, velocity: -1 }).success).toBe(false);
  });

  it("rejects velocity=128 (above max)", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, velocity: 128 }).success).toBe(false);
  });

  it("rejects non-integer velocity", () => {
    expect(ClipNoteSchema.safeParse({ ...validNote, velocity: 100.5 }).success).toBe(false);
  });
});

// ── SampleSlice endMs > startMs ──

describe("SampleSliceSchema endMs > startMs refinement", () => {
  const validSlice = { id: "s1", assetId: "a1", name: "Slice 1", startMs: 0, endMs: 1000 };

  it("accepts valid slice (endMs > startMs)", () => {
    expect(SampleSliceSchema.safeParse(validSlice).success).toBe(true);
  });

  it("rejects endMs === startMs", () => {
    const result = SampleSliceSchema.safeParse({ ...validSlice, startMs: 500, endMs: 500 });
    expect(result.success).toBe(false);
  });

  it("rejects endMs < startMs", () => {
    const result = SampleSliceSchema.safeParse({ ...validSlice, startMs: 1000, endMs: 500 });
    expect(result.success).toBe(false);
  });

  it("accepts endMs just above startMs", () => {
    expect(SampleSliceSchema.safeParse({ ...validSlice, startMs: 999, endMs: 1000 }).success).toBe(true);
  });
});

// ── SampleInstrument pitchMax >= pitchMin ──

describe("SampleInstrumentSchema pitchMax >= pitchMin refinement", () => {
  const validInstrument = {
    id: "i1",
    name: "Piano",
    assetId: "a1",
    rootNote: 60,
    pitchMin: 36,
    pitchMax: 96,
  };

  it("accepts valid instrument (pitchMax > pitchMin)", () => {
    expect(SampleInstrumentSchema.safeParse(validInstrument).success).toBe(true);
  });

  it("accepts pitchMax === pitchMin (single note)", () => {
    expect(SampleInstrumentSchema.safeParse({ ...validInstrument, pitchMin: 60, pitchMax: 60 }).success).toBe(true);
  });

  it("rejects pitchMax < pitchMin", () => {
    const result = SampleInstrumentSchema.safeParse({ ...validInstrument, pitchMin: 96, pitchMax: 36 });
    expect(result.success).toBe(false);
  });

  it("accepts full MIDI range (0-127)", () => {
    expect(SampleInstrumentSchema.safeParse({ ...validInstrument, pitchMin: 0, pitchMax: 127 }).success).toBe(true);
  });

  it("rejects pitchMin out of MIDI range", () => {
    expect(SampleInstrumentSchema.safeParse({ ...validInstrument, pitchMin: -1 }).success).toBe(false);
  });

  it("rejects pitchMax out of MIDI range", () => {
    expect(SampleInstrumentSchema.safeParse({ ...validInstrument, pitchMax: 128 }).success).toBe(false);
  });
});

// ── ScoreProfile tempo/intensity range refinements ──

describe("ScoreProfileSchema range refinements", () => {
  const validProfile = { id: "sp1", name: "Profile 1" };

  it("accepts profile with no tempo/intensity bounds", () => {
    expect(ScoreProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("accepts tempoMax > tempoMin", () => {
    expect(ScoreProfileSchema.safeParse({ ...validProfile, tempoMin: 80, tempoMax: 140 }).success).toBe(true);
  });

  it("accepts tempoMax === tempoMin", () => {
    expect(ScoreProfileSchema.safeParse({ ...validProfile, tempoMin: 120, tempoMax: 120 }).success).toBe(true);
  });

  it("rejects tempoMax < tempoMin", () => {
    const result = ScoreProfileSchema.safeParse({ ...validProfile, tempoMin: 140, tempoMax: 80 });
    expect(result.success).toBe(false);
  });

  it("accepts intensityMax > intensityMin", () => {
    expect(ScoreProfileSchema.safeParse({ ...validProfile, intensityMin: 0.2, intensityMax: 0.8 }).success).toBe(true);
  });

  it("accepts intensityMax === intensityMin", () => {
    expect(ScoreProfileSchema.safeParse({ ...validProfile, intensityMin: 0.5, intensityMax: 0.5 }).success).toBe(true);
  });

  it("rejects intensityMax < intensityMin", () => {
    const result = ScoreProfileSchema.safeParse({ ...validProfile, intensityMin: 0.8, intensityMax: 0.2 });
    expect(result.success).toBe(false);
  });

  it("accepts only tempoMin set (no tempoMax)", () => {
    expect(ScoreProfileSchema.safeParse({ ...validProfile, tempoMin: 100 }).success).toBe(true);
  });

  it("accepts only intensityMax set (no intensityMin)", () => {
    expect(ScoreProfileSchema.safeParse({ ...validProfile, intensityMax: 0.9 }).success).toBe(true);
  });
});

// ── PerformanceCapture basic validation ──

describe("PerformanceCaptureSchema basic validation", () => {
  const validCapture = {
    id: "pc1",
    name: "Take 1",
    bpm: 120,
    beatsPerBar: 4,
    totalBars: 8,
    events: [
      { tick: 0, bar: 0, beat: 0, action: "scene-launch", sceneId: "sc1" },
    ],
    createdAt: "2026-01-01T00:00:00Z",
  };

  it("accepts valid performance capture", () => {
    expect(PerformanceCaptureSchema.safeParse(validCapture).success).toBe(true);
  });

  it("accepts empty events array", () => {
    expect(PerformanceCaptureSchema.safeParse({ ...validCapture, events: [] }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id, ...rest } = validCapture;
    expect(PerformanceCaptureSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive bpm", () => {
    expect(PerformanceCaptureSchema.safeParse({ ...validCapture, bpm: 0 }).success).toBe(false);
    expect(PerformanceCaptureSchema.safeParse({ ...validCapture, bpm: -1 }).success).toBe(false);
  });

  it("rejects non-integer beatsPerBar", () => {
    expect(PerformanceCaptureSchema.safeParse({ ...validCapture, beatsPerBar: 3.5 }).success).toBe(false);
  });

  it("rejects invalid action type in event", () => {
    const bad = { ...validCapture, events: [{ tick: 0, bar: 0, beat: 0, action: "explode" }] };
    expect(PerformanceCaptureSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects negative tick in event", () => {
    const bad = { ...validCapture, events: [{ tick: -1, bar: 0, beat: 0, action: "stop" }] };
    expect(PerformanceCaptureSchema.safeParse(bad).success).toBe(false);
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
