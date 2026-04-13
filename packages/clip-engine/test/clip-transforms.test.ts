import { describe, it, expect } from "vitest";
import {
  clipKey,
  clipTranspose,
  clipTransposeInKey,
  clipInvert,
  clipReverse,
  clipOctaveShift,
  clipRhythmScale,
  clipDuplicateWithVariation,
  clipSnapToScale,
  clipFindOutOfScale,
  clipRhythmicVariation,
  clipMelodicVariation,
  clipThinNotes,
  clipDensifyNotes,
  clipAccentEveryN,
  clipAddGhostHits,
  clipRemoveGhostHits,
  clipDeriveIntensity,
  clipAddTension,
  clipBrighten,
  clipPadVoicing,
  clipBassLine,
  clipArpeggiate,
  createTransformedVariant,
} from "../src/clip-transforms";
import type { Clip, ClipNote } from "@motif/schema";
import type { Key, ChordMarker } from "@motif/music-theory";

const C_MAJOR: Key = { root: 0, scale: "major" };

const testNotes: ClipNote[] = [
  { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
  { pitch: 64, startTick: 480, durationTicks: 480, velocity: 80 },
  { pitch: 67, startTick: 960, durationTicks: 480, velocity: 90 },
];

const testClip: Clip = {
  id: "test",
  name: "Test",
  lane: "motif",
  instrumentId: "lead-pluck",
  bpm: 120,
  lengthBeats: 4,
  notes: testNotes,
  loop: true,
  keyRoot: 0,
  keyScale: "major",
};

const noKeyClip: Clip = { ...testClip, keyRoot: undefined, keyScale: undefined };

describe("clipKey", () => {
  it("extracts key from clip with keyRoot and keyScale", () => {
    const key = clipKey(testClip);
    expect(key).toEqual({ root: 0, scale: "major" });
  });

  it("returns null when no key set", () => {
    expect(clipKey(noKeyClip)).toBeNull();
  });
});

describe("Clip motif transforms", () => {
  it("clipTranspose shifts pitches", () => {
    const result = clipTranspose(testNotes, 3);
    expect(result[0].pitch).toBe(63);
    expect(result[1].pitch).toBe(67);
  });

  it("clipTransposeInKey shifts by degrees", () => {
    const result = clipTransposeInKey(testNotes, 2, C_MAJOR);
    expect(result[0].pitch).toBe(64); // C→E
  });

  it("clipInvert mirrors pitches", () => {
    const result = clipInvert(testNotes);
    expect(result[0].pitch).toBe(60);
    expect(result[1].pitch).toBe(56);
  });

  it("clipReverse mirrors time", () => {
    const result = clipReverse(testNotes);
    expect(result).toHaveLength(3);
  });

  it("clipOctaveShift moves by 12", () => {
    const result = clipOctaveShift(testNotes, 1);
    expect(result[0].pitch).toBe(72);
  });

  it("clipRhythmScale doubles timing", () => {
    const result = clipRhythmScale(testNotes, 2);
    expect(result[1].startTick).toBe(960);
  });

  it("clipDuplicateWithVariation preserves count", () => {
    const result = clipDuplicateWithVariation(testNotes);
    expect(result).toHaveLength(3);
  });
});

describe("Clip scale tools", () => {
  it("clipSnapToScale corrects out-of-scale notes", () => {
    const notes: ClipNote[] = [{ pitch: 61, startTick: 0, durationTicks: 100, velocity: 80 }];
    const result = clipSnapToScale(notes, C_MAJOR);
    expect([60, 62]).toContain(result[0].pitch);
  });

  it("clipFindOutOfScale returns indices", () => {
    const notes: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 100, velocity: 80 },
      { pitch: 61, startTick: 100, durationTicks: 100, velocity: 80 },
    ];
    expect(clipFindOutOfScale(notes, C_MAJOR)).toEqual([1]);
  });
});

describe("Clip variation tools", () => {
  it("clipRhythmicVariation shifts timing", () => {
    const result = clipRhythmicVariation(testNotes, 60);
    expect(result.some((n, i) => n.startTick !== testNotes[i].startTick)).toBe(true);
  });

  it("clipMelodicVariation shifts pitches", () => {
    const result = clipMelodicVariation(testNotes, 2);
    expect(result.some((n, i) => n.pitch !== testNotes[i].pitch)).toBe(true);
  });

  it("clipThinNotes reduces count", () => {
    expect(clipThinNotes(testNotes, 2)).toHaveLength(2);
  });

  it("clipDensifyNotes increases count", () => {
    expect(clipDensifyNotes(testNotes, 2, 120)).toHaveLength(6);
  });

  it("clipAccentEveryN boosts velocity", () => {
    const result = clipAccentEveryN(testNotes, 2, 20);
    expect(result[0].velocity).toBe(120);
    expect(result[1].velocity).toBe(80);
  });

  it("clipAddGhostHits adds notes", () => {
    const result = clipAddGhostHits(testNotes, 30, 60);
    expect(result.length).toBeGreaterThan(testNotes.length);
  });

  it("clipRemoveGhostHits filters low velocity", () => {
    const notes: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 100, velocity: 100 },
      { pitch: 60, startTick: 60, durationTicks: 50, velocity: 20 },
    ];
    expect(clipRemoveGhostHits(notes, 50)).toHaveLength(1);
  });
});

describe("Clip intensity tools", () => {
  it("clipDeriveIntensity low reduces notes", () => {
    const result = clipDeriveIntensity(testNotes, "low");
    expect(result.length).toBeLessThanOrEqual(testNotes.length);
  });

  it("clipDeriveIntensity high adds notes", () => {
    const result = clipDeriveIntensity(testNotes, "high");
    expect(result.length).toBeGreaterThan(testNotes.length);
  });

  it("clipAddTension shifts some pitches", () => {
    const result = clipAddTension(testNotes, 1);
    expect(result.some((n, i) => n.pitch !== testNotes[i].pitch)).toBe(true);
  });

  it("clipBrighten boosts higher notes", () => {
    const result = clipBrighten(testNotes, 15);
    expect(result.length).toBe(3);
  });
});

describe("Clip chord/bass generation", () => {
  it("clipPadVoicing creates notes from chord markers", () => {
    const markers: ChordMarker[] = [{ tick: 0, chord: { root: 0, quality: "major" } }];
    const result = clipPadVoicing(markers, 4, 480);
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result[0].startTick).toBe(0);
  });

  it("clipBassLine creates one note per chord", () => {
    const markers: ChordMarker[] = [
      { tick: 0, chord: { root: 0, quality: "major" } },
      { tick: 480, chord: { root: 7, quality: "major" } },
    ];
    const result = clipBassLine(markers, 2, 480);
    expect(result).toHaveLength(2);
  });

  it("clipArpeggiate creates cycling notes", () => {
    const result = clipArpeggiate({ root: 0, quality: "major" }, 4, 0, 120, 480);
    expect(result).toHaveLength(4);
  });
});

describe("createTransformedVariant", () => {
  it("creates a variant with correct structure", () => {
    const notes = clipTranspose(testNotes, 5);
    const variant = createTransformedVariant(testClip, "Transposed", notes);
    expect(variant.name).toBe("Transposed");
    expect(variant.notes).toEqual(notes);
    expect(variant.id).toContain("var-transposed");
    expect(variant.tags).toContain("derived:transposed");
  });
});
