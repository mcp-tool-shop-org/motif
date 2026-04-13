import { describe, it, expect } from "vitest";
import {
  resolveTrimRegion,
  resolveLoopRegion,
  applyTrim,
  applyLoopPoints,
} from "../src/trim.js";
import {
  sliceEvenly,
  sliceAtOnsets,
  sliceDurationMs,
} from "../src/slice.js";
import {
  createKit,
  addKitSlot,
  removeKitSlot,
  updateKitSlot,
  kitFromSlices,
  kitAssetIds,
  findDuplicateSlotPitches,
} from "../src/kit.js";
import {
  createSampleInstrument,
  pitchToPlaybackRate,
  isInRange,
  rangeSpan,
} from "../src/instrument.js";
import {
  inferSourceType,
  sourceTypeToKind,
  filenameToId,
  buildImportedAsset,
} from "../src/import.js";
import type { AudioAsset, SampleSlice } from "@motif/schema";

// ── Fixtures ──

const baseAsset: AudioAsset = {
  id: "test-asset",
  name: "Test Asset",
  src: "/audio/test.wav",
  kind: "oneshot",
  durationMs: 4000,
};

// ── Trim ──

describe("trim", () => {
  it("resolveTrimRegion uses defaults when no trim set", () => {
    const region = resolveTrimRegion(baseAsset);
    expect(region).toEqual({ startMs: 0, endMs: 4000 });
  });

  it("resolveTrimRegion uses explicit values", () => {
    const asset = { ...baseAsset, trimStartMs: 500, trimEndMs: 3500 };
    expect(resolveTrimRegion(asset)).toEqual({ startMs: 500, endMs: 3500 });
  });

  it("resolveLoopRegion uses defaults when no loop set", () => {
    const region = resolveLoopRegion(baseAsset);
    expect(region).toEqual({ loopStartMs: 0, loopEndMs: 4000 });
  });

  it("resolveLoopRegion uses explicit values", () => {
    const asset = { ...baseAsset, loopStartMs: 100, loopEndMs: 3900 };
    expect(resolveLoopRegion(asset)).toEqual({ loopStartMs: 100, loopEndMs: 3900 });
  });

  it("applyTrim returns new asset with trim points", () => {
    const trimmed = applyTrim(baseAsset, 200, 3800);
    expect(trimmed.trimStartMs).toBe(200);
    expect(trimmed.trimEndMs).toBe(3800);
    expect(trimmed.id).toBe(baseAsset.id); // original unchanged
  });

  it("applyLoopPoints returns new asset with loop points", () => {
    const looped = applyLoopPoints(baseAsset, 100, 3900);
    expect(looped.loopStartMs).toBe(100);
    expect(looped.loopEndMs).toBe(3900);
  });

  it("applyTrim with inverted range (startMs > endMs) stores values as-is", () => {
    const trimmed = applyTrim(baseAsset, 3000, 1000);
    expect(trimmed.trimStartMs).toBe(3000);
    expect(trimmed.trimEndMs).toBe(1000);
    // applyTrim is a pure setter — validation is the caller's responsibility
  });
});

// ── Slice ──

describe("slice", () => {
  it("sliceEvenly creates correct number of slices", () => {
    const slices = sliceEvenly("a1", 0, 4000, 4);
    expect(slices).toHaveLength(4);
    expect(slices[0].startMs).toBe(0);
    expect(slices[0].endMs).toBe(1000);
    expect(slices[3].endMs).toBe(4000);
  });

  it("sliceEvenly returns empty for count 0", () => {
    expect(sliceEvenly("a1", 0, 1000, 0)).toEqual([]);
  });

  it("sliceEvenly returns empty for negative count", () => {
    expect(sliceEvenly("a1", 0, 1000, -3)).toEqual([]);
  });

  it("sliceAtOnsets handles sorted onsets", () => {
    const slices = sliceAtOnsets("a1", [0, 1000, 2500], 4000);
    expect(slices).toHaveLength(3);
    expect(slices[0].endMs).toBe(1000);
    expect(slices[2].endMs).toBe(4000);
  });

  it("sliceAtOnsets handles unsorted onsets", () => {
    const slices = sliceAtOnsets("a1", [2500, 0, 1000], 4000);
    expect(slices[0].startMs).toBe(0);
    expect(slices[1].startMs).toBe(1000);
  });

  it("sliceAtOnsets returns empty for no onsets", () => {
    expect(sliceAtOnsets("a1", [], 1000)).toEqual([]);
  });

  it("sliceAtOnsets returns empty for empty onsets array", () => {
    const result = sliceAtOnsets("a1", [], 5000);
    expect(result).toEqual([]);
  });

  it("sliceDurationMs computes duration", () => {
    const s: SampleSlice = { id: "s1", assetId: "a1", name: "S1", startMs: 100, endMs: 600 };
    expect(sliceDurationMs(s)).toBe(500);
  });
});

// ── Kit ──

describe("kit", () => {
  it("createKit builds an empty kit", () => {
    const kit = createKit("k1", "Drums");
    expect(kit.slots).toEqual([]);
    expect(kit.name).toBe("Drums");
  });

  it("addKitSlot appends a slot", () => {
    const kit = createKit("k1", "Drums");
    const updated = addKitSlot(kit, { pitch: 36, assetId: "a1" });
    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0].pitch).toBe(36);
  });

  it("removeKitSlot removes by pitch", () => {
    let kit = createKit("k1", "Drums");
    kit = addKitSlot(kit, { pitch: 36, assetId: "a1" });
    kit = addKitSlot(kit, { pitch: 38, assetId: "a2" });
    kit = removeKitSlot(kit, 36);
    expect(kit.slots).toHaveLength(1);
    expect(kit.slots[0].pitch).toBe(38);
  });

  it("updateKitSlot modifies an existing slot", () => {
    let kit = createKit("k1", "Drums");
    kit = addKitSlot(kit, { pitch: 36, assetId: "a1", label: "Kick" });
    kit = updateKitSlot(kit, 36, { label: "Big Kick" });
    expect(kit.slots[0].label).toBe("Big Kick");
    expect(kit.slots[0].assetId).toBe("a1"); // unchanged
  });

  it("kitFromSlices maps slices to ascending pitches", () => {
    const slices: SampleSlice[] = [
      { id: "s1", assetId: "a1", name: "Hit 1", startMs: 0, endMs: 500 },
      { id: "s2", assetId: "a1", name: "Hit 2", startMs: 500, endMs: 1000 },
    ];
    const kit = kitFromSlices("k1", "Auto Kit", slices, 36);
    expect(kit.slots[0].pitch).toBe(36);
    expect(kit.slots[1].pitch).toBe(37);
    expect(kit.slots[0].sliceId).toBe("s1");
  });

  it("kitAssetIds returns unique asset IDs", () => {
    let kit = createKit("k1", "Kit");
    kit = addKitSlot(kit, { pitch: 36, assetId: "a1" });
    kit = addKitSlot(kit, { pitch: 38, assetId: "a1" });
    kit = addKitSlot(kit, { pitch: 40, assetId: "a2" });
    expect(kitAssetIds(kit).sort()).toEqual(["a1", "a2"]);
  });

  it("findDuplicateSlotPitches detects duplicates", () => {
    let kit = createKit("k1", "Kit");
    kit = addKitSlot(kit, { pitch: 36, assetId: "a1" });
    kit = addKitSlot(kit, { pitch: 36, assetId: "a2" });
    kit = addKitSlot(kit, { pitch: 38, assetId: "a3" });
    expect(findDuplicateSlotPitches(kit)).toEqual([36]);
  });

  it("findDuplicateSlotPitches returns empty when no duplicates", () => {
    let kit = createKit("k1", "Kit");
    kit = addKitSlot(kit, { pitch: 36, assetId: "a1" });
    kit = addKitSlot(kit, { pitch: 38, assetId: "a2" });
    expect(findDuplicateSlotPitches(kit)).toEqual([]);
  });
});

// ── Instrument ──

describe("instrument", () => {
  it("createSampleInstrument has ADSR defaults", () => {
    const inst = createSampleInstrument("i1", "Piano", "a1", 60);
    expect(inst.attackMs).toBe(5);
    expect(inst.decayMs).toBe(100);
    expect(inst.sustainLevel).toBe(0.8);
    expect(inst.releaseMs).toBe(200);
    expect(inst.pitchMin).toBe(0);
    expect(inst.pitchMax).toBe(127);
  });

  it("pitchToPlaybackRate returns 1.0 at root", () => {
    expect(pitchToPlaybackRate(60, 60)).toBe(1);
  });

  it("pitchToPlaybackRate doubles for +12 semitones", () => {
    expect(pitchToPlaybackRate(60, 72)).toBeCloseTo(2, 5);
  });

  it("pitchToPlaybackRate halves for -12 semitones", () => {
    expect(pitchToPlaybackRate(60, 48)).toBeCloseTo(0.5, 5);
  });

  it("isInRange checks pitch bounds", () => {
    const inst = createSampleInstrument("i1", "Test", "a1", 60, 48, 72);
    expect(isInRange(inst, 60)).toBe(true);
    expect(isInRange(inst, 48)).toBe(true);
    expect(isInRange(inst, 72)).toBe(true);
    expect(isInRange(inst, 47)).toBe(false);
    expect(isInRange(inst, 73)).toBe(false);
  });

  it("rangeSpan computes semitone count", () => {
    const inst = createSampleInstrument("i1", "Test", "a1", 60, 48, 72);
    expect(rangeSpan(inst)).toBe(24);
  });
});

// ── Import ──

describe("import", () => {
  it("inferSourceType recognises drum patterns", () => {
    expect(inferSourceType("808-kick-hard.wav")).toBe("drums");
    expect(inferSourceType("Snare_Roll.aif")).toBe("drums");
    expect(inferSourceType("Hi-Hat-Closed.wav")).toBe("drums");
  });

  it("inferSourceType recognises tonal patterns", () => {
    expect(inferSourceType("Pad-Warm-C3.wav")).toBe("tonal");
    expect(inferSourceType("Bass-Sub-E1.wav")).toBe("tonal");
    expect(inferSourceType("Piano-Layer.wav")).toBe("tonal");
  });

  it("inferSourceType returns undefined for unrecognised names", () => {
    expect(inferSourceType("random-file-name.wav")).toBeUndefined();
  });

  it("sourceTypeToKind maps correctly", () => {
    expect(sourceTypeToKind("drums")).toBe("oneshot");
    expect(sourceTypeToKind("tonal")).toBe("loop");
    expect(sourceTypeToKind("ambience")).toBe("ambient");
    expect(sourceTypeToKind("stinger")).toBe("stinger");
    expect(sourceTypeToKind("texture")).toBe("ambient");
    expect(sourceTypeToKind("fx")).toBe("oneshot");
  });

  it("filenameToId produces kebab-case slug", () => {
    expect(filenameToId("808 Kick Hard.wav")).toBe("808-kick-hard");
    expect(filenameToId("  leading---trailing--.mp3")).toBe("leading-trailing");
  });

  it("buildImportedAsset creates a complete asset", () => {
    const asset = buildImportedAsset("808-Kick.wav", 500, "/uploads/808-Kick.wav");
    expect(asset.id).toBe("808-kick");
    expect(asset.kind).toBe("oneshot");
    expect(asset.sourceType).toBe("drums");
    expect(asset.imported).toBe(true);
    expect(asset.originalFilename).toBe("808-Kick.wav");
    expect(asset.durationMs).toBe(500);
  });

  it("buildImportedAsset falls back to oneshot for unknown", () => {
    const asset = buildImportedAsset("mystery.wav", 1000, "/uploads/mystery.wav");
    expect(asset.kind).toBe("oneshot");
    expect(asset.sourceType).toBeUndefined();
  });
});
