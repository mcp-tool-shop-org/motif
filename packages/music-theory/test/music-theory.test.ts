import { describe, it, expect } from "vitest";
import {
  // scales
  pitchClass,
  octave,
  midiNote,
  noteName,
  parseMidi,
  scalePitchClasses,
  isInScale,
  snapToScale,
  snapNotesToScale,
  findOutOfScale,
  transposeDiatonic,
  SCALES,
  SCALE_NAMES,
  // chords
  chordPitches,
  diatonicChord,
  diatonicChords,
  chordPalette,
  generatePadVoicing,
  generateBassLine,
  arpeggiateChord,
  progressionFromDegrees,
  // motif
  transpose,
  transposeInKey,
  invert,
  reverse,
  octaveShift,
  rhythmScale,
  duplicateWithVariation,
  transposeAndSnap,
  // variation
  rhythmicVariation,
  melodicVariation,
  thinNotes,
  densifyNotes,
  accentEveryN,
  addGhostHits,
  removeGhostHits,
  // intensity
  lowIntensity,
  midIntensity,
  highIntensity,
  deriveIntensity,
  addTension,
  brighten,
} from "../src/index";
import type { Key, NoteEvent, Chord, ChordMarker } from "../src/index";

// ── helpers ──

const C_MAJOR: Key = { root: 0, scale: "major" };
const A_MINOR: Key = { root: 9, scale: "minor" };

const SIMPLE_MOTIF: NoteEvent[] = [
  { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
  { pitch: 64, startTick: 480, durationTicks: 480, velocity: 80 },
  { pitch: 67, startTick: 960, durationTicks: 480, velocity: 90 },
];

// ── Scale tests ──

describe("Scales", () => {
  it("pitchClass extracts mod-12", () => {
    expect(pitchClass(60)).toBe(0); // C
    expect(pitchClass(69)).toBe(9); // A
    expect(pitchClass(61)).toBe(1); // C#
  });

  it("octave computes correctly", () => {
    expect(octave(60)).toBe(4);
    expect(octave(0)).toBe(-1);
    expect(octave(127)).toBe(9);
  });

  it("midiNote round-trips with pitchClass + octave", () => {
    expect(midiNote(0, 4)).toBe(60);
    expect(midiNote(9, 4)).toBe(69);
  });

  it("noteName formats correctly", () => {
    expect(noteName(60)).toBe("C4");
    expect(noteName(69)).toBe("A4");
    expect(noteName(61)).toBe("C#4");
  });

  it("parseMidi parses note names", () => {
    expect(parseMidi("C4")).toBe(60);
    expect(parseMidi("A4")).toBe(69);
    expect(parseMidi("C#4")).toBe(61);
    expect(parseMidi("invalid")).toBe(-1);
  });

  it("scalePitchClasses returns correct PCs for C major", () => {
    const pcs = scalePitchClasses(C_MAJOR);
    expect(pcs).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("scalePitchClasses returns correct PCs for A minor", () => {
    const pcs = scalePitchClasses(A_MINOR);
    expect(pcs).toEqual([9, 11, 0, 2, 4, 5, 7]);
  });

  it("isInScale checks membership", () => {
    expect(isInScale(60, C_MAJOR)).toBe(true);  // C
    expect(isInScale(61, C_MAJOR)).toBe(false);  // C#
    expect(isInScale(62, C_MAJOR)).toBe(true);  // D
  });

  it("snapToScale snaps C# to nearest in C major", () => {
    const snapped = snapToScale(61, C_MAJOR); // C# → C or D
    expect([60, 62]).toContain(snapped);
  });

  it("snapToScale preserves in-scale notes", () => {
    expect(snapToScale(60, C_MAJOR)).toBe(60);
  });

  it("snapNotesToScale corrects all notes", () => {
    const notes: NoteEvent[] = [
      { pitch: 61, startTick: 0, durationTicks: 100, velocity: 80 },
    ];
    const snapped = snapNotesToScale(notes, C_MAJOR);
    expect(isInScale(snapped[0].pitch, C_MAJOR)).toBe(true);
  });

  it("findOutOfScale returns indices of non-scale notes", () => {
    const notes: NoteEvent[] = [
      { pitch: 60, startTick: 0, durationTicks: 100, velocity: 80 },
      { pitch: 61, startTick: 100, durationTicks: 100, velocity: 80 },
      { pitch: 62, startTick: 200, durationTicks: 100, velocity: 80 },
    ];
    expect(findOutOfScale(notes, C_MAJOR)).toEqual([1]);
  });

  it("transposeDiatonic moves by scale degrees", () => {
    // C4 (60) up 2 degrees in C major → E4 (64)
    expect(transposeDiatonic(60, 2, C_MAJOR)).toBe(64);
    // E4 (64) up 1 degree in C major → F4 (65)
    expect(transposeDiatonic(64, 1, C_MAJOR)).toBe(65);
  });

  it("transposeDiatonic handles negative degrees", () => {
    // E4 (64) down 2 degrees in C major → C4 (60)
    expect(transposeDiatonic(64, -2, C_MAJOR)).toBe(60);
  });

  it("SCALES has standard set", () => {
    expect(SCALE_NAMES).toContain("major");
    expect(SCALE_NAMES).toContain("minor");
    expect(SCALE_NAMES).toContain("pentatonic");
    expect(SCALE_NAMES).toContain("blues");
    expect(SCALE_NAMES).toContain("chromatic");
    expect(SCALES.major.intervals).toHaveLength(7);
    expect(SCALES.chromatic.intervals).toHaveLength(12);
  });
});

// ── Chord tests ──

describe("Chords", () => {
  it("chordPitches builds major triad", () => {
    const pitches = chordPitches({ root: 0, quality: "major" }, 4);
    expect(pitches).toEqual([60, 64, 67]); // C E G
  });

  it("chordPitches builds minor triad", () => {
    const pitches = chordPitches({ root: 9, quality: "minor" }, 4);
    expect(pitches).toEqual([69, 72, 76]); // A C E
  });

  it("chordPitches handles dominant7", () => {
    const pitches = chordPitches({ root: 7, quality: "dominant7" }, 4);
    expect(pitches).toEqual([67, 71, 74, 77]); // G B D F
  });

  it("chordPitches applies bass inversion", () => {
    const pitches = chordPitches({ root: 0, quality: "major", bass: 4 }, 4);
    // E below C major → bass E3, then C4 E4 G4
    expect(pitches[0]).toBeLessThan(60);
    expect(pitches).toContain(60);
  });

  it("diatonicChord returns correct triads for C major", () => {
    const I = diatonicChord(C_MAJOR, 0);
    expect(I.root).toBe(0);
    expect(I.quality).toBe("major");

    const ii = diatonicChord(C_MAJOR, 1);
    expect(ii.root).toBe(2);
    expect(ii.quality).toBe("minor");

    const vii = diatonicChord(C_MAJOR, 6);
    expect(vii.root).toBe(11);
    expect(vii.quality).toBe("diminished");
  });

  it("diatonicChords returns 7 chords for major key", () => {
    const chords = diatonicChords(C_MAJOR);
    expect(chords).toHaveLength(7);
  });

  it("chordPalette returns numerals", () => {
    const p = chordPalette(C_MAJOR);
    expect(p).toHaveLength(7);
    expect(p[0].numeral).toBe("I");
    expect(p[1].numeral).toBe("ii");
    expect(p[6].numeral).toBe("vii°");
  });

  it("generatePadVoicing creates notes for each chord", () => {
    const markers: ChordMarker[] = [
      { tick: 0, chord: { root: 0, quality: "major" } },
      { tick: 480, chord: { root: 5, quality: "major" } },
    ];
    const notes = generatePadVoicing(markers, 4, 480);
    expect(notes.length).toBeGreaterThanOrEqual(6); // 3 per chord
    expect(notes[0].startTick).toBe(0);
  });

  it("generateBassLine creates one root note per chord", () => {
    const markers: ChordMarker[] = [
      { tick: 0, chord: { root: 0, quality: "major" } },
      { tick: 480, chord: { root: 7, quality: "major" } },
    ];
    const notes = generateBassLine(markers, 2, 480);
    expect(notes).toHaveLength(2);
    expect(pitchClass(notes[0].pitch)).toBe(0); // C
    expect(pitchClass(notes[1].pitch)).toBe(7); // G
  });

  it("arpeggiateChord fills time with cycling notes", () => {
    const chord: Chord = { root: 0, quality: "major" };
    const notes = arpeggiateChord(chord, 4, 0, 120, 480);
    expect(notes).toHaveLength(4); // 480 / 120 = 4
    expect(notes[0].pitch).toBe(60); // C
    expect(notes[1].pitch).toBe(64); // E
    expect(notes[2].pitch).toBe(67); // G
    expect(notes[3].pitch).toBe(60); // C again (cycle)
  });

  it("progressionFromDegrees builds chord markers", () => {
    const prog = progressionFromDegrees(C_MAJOR, [0, 3, 4, 0], 0, 480);
    expect(prog).toHaveLength(4);
    expect(prog[0].chord.root).toBe(0);  // I
    expect(prog[1].chord.root).toBe(5);  // IV
    expect(prog[2].chord.root).toBe(7);  // V
    expect(prog[3].chord.root).toBe(0);  // I
    expect(prog[1].tick).toBe(480);
  });
});

// ── Motif transform tests ──

describe("Motif transforms", () => {
  it("transpose shifts all pitches", () => {
    const result = transpose(SIMPLE_MOTIF, 5);
    expect(result[0].pitch).toBe(65);
    expect(result[1].pitch).toBe(69);
    expect(result[2].pitch).toBe(72);
  });

  it("transpose clamps to 0–127", () => {
    const high = [{ pitch: 125, startTick: 0, durationTicks: 100, velocity: 80 }];
    const result = transpose(high, 10);
    expect(result[0].pitch).toBeLessThanOrEqual(127);
  });

  it("transposeInKey shifts by scale degrees", () => {
    const result = transposeInKey(SIMPLE_MOTIF, 2, C_MAJOR);
    // C→E, E→G, G→B
    expect(result[0].pitch).toBe(64); // E4
    expect(result[1].pitch).toBe(67); // G4
    expect(result[2].pitch).toBe(71); // B4
  });

  it("invert mirrors around pivot", () => {
    const result = invert(SIMPLE_MOTIF);
    // Pivot = 60 (C4). C→C, E(64)→56, G(67)→53
    expect(result[0].pitch).toBe(60);
    expect(result[1].pitch).toBe(56);
    expect(result[2].pitch).toBe(53);
  });

  it("invert with explicit pivot", () => {
    const result = invert(SIMPLE_MOTIF, 64);
    expect(result[0].pitch).toBe(68); // 2*64 - 60
    expect(result[1].pitch).toBe(64); // 2*64 - 64
  });

  it("reverse mirrors time positions", () => {
    const result = reverse(SIMPLE_MOTIF);
    // Original: 0,480,960. Total = 960+480 = 1440
    // First note (was at 960, dur 480) → startTick = 0
    // Third note sorted to end up at reversed positions
    expect(result.length).toBe(3);
    const starts = result.map((n) => n.startTick).sort((a, b) => a - b);
    expect(starts[0]).toBeLessThan(starts[2]);
  });

  it("octaveShift moves by 12", () => {
    const result = octaveShift(SIMPLE_MOTIF, 1);
    expect(result[0].pitch).toBe(72);
    expect(result[1].pitch).toBe(76);
  });

  it("octaveShift down", () => {
    const result = octaveShift(SIMPLE_MOTIF, -1);
    expect(result[0].pitch).toBe(48);
  });

  it("rhythmScale doubles times", () => {
    const result = rhythmScale(SIMPLE_MOTIF, 2);
    expect(result[0].startTick).toBe(0);
    expect(result[1].startTick).toBe(960);
    expect(result[0].durationTicks).toBe(960);
  });

  it("rhythmScale compresses", () => {
    const result = rhythmScale(SIMPLE_MOTIF, 0.5);
    expect(result[1].startTick).toBe(240);
    expect(result[0].durationTicks).toBe(240);
  });

  it("duplicateWithVariation preserves length", () => {
    const result = duplicateWithVariation(SIMPLE_MOTIF);
    expect(result).toHaveLength(3);
  });

  it("duplicateWithVariation applies velocity jitter", () => {
    const result = duplicateWithVariation(SIMPLE_MOTIF, { velocityJitter: 20 });
    const differs = result.some((n, i) => n.velocity !== SIMPLE_MOTIF[i].velocity);
    expect(differs).toBe(true);
  });

  it("transposeAndSnap keeps notes in scale", () => {
    const result = transposeAndSnap(SIMPLE_MOTIF, 1, C_MAJOR);
    for (const n of result) {
      expect(isInScale(n.pitch, C_MAJOR)).toBe(true);
    }
  });
});

// ── Variation tests ──

describe("Variation tools", () => {
  it("rhythmicVariation shifts timing", () => {
    const result = rhythmicVariation(SIMPLE_MOTIF, 60);
    const timingChanged = result.some((n, i) => n.startTick !== SIMPLE_MOTIF[i].startTick);
    expect(timingChanged).toBe(true);
  });

  it("melodicVariation shifts pitches", () => {
    const result = melodicVariation(SIMPLE_MOTIF, 2);
    const pitchChanged = result.some((n, i) => n.pitch !== SIMPLE_MOTIF[i].pitch);
    expect(pitchChanged).toBe(true);
  });

  it("melodicVariation snaps to key when provided", () => {
    const result = melodicVariation(SIMPLE_MOTIF, 2, C_MAJOR);
    for (const n of result) {
      expect(isInScale(n.pitch, C_MAJOR)).toBe(true);
    }
  });

  it("thinNotes keeps every Nth note", () => {
    const result = thinNotes(SIMPLE_MOTIF, 2);
    expect(result).toHaveLength(2); // indices 0 and 2
  });

  it("densifyNotes adds subdivisions", () => {
    const result = densifyNotes(SIMPLE_MOTIF, 2, 120);
    expect(result).toHaveLength(6); // 3 * 2
    expect(result[1].startTick).toBe(120); // subdivision of first note
    expect(result[1].velocity).toBeLessThan(result[0].velocity); // softer
  });

  it("accentEveryN boosts regular positions", () => {
    const notes: NoteEvent[] = Array.from({ length: 8 }, (_, i) => ({
      pitch: 60,
      startTick: i * 120,
      durationTicks: 120,
      velocity: 80,
    }));
    const result = accentEveryN(notes, 4, 20);
    expect(result[0].velocity).toBe(100); // boosted
    expect(result[1].velocity).toBe(80);  // unchanged
    expect(result[4].velocity).toBe(100); // boosted
  });

  it("addGhostHits inserts between existing notes", () => {
    const result = addGhostHits(SIMPLE_MOTIF, 30, 60);
    expect(result.length).toBeGreaterThan(SIMPLE_MOTIF.length);
    const ghosts = result.filter((n) =>
      !SIMPLE_MOTIF.some(
        (orig) => orig.startTick === n.startTick && orig.velocity === n.velocity,
      ),
    );
    expect(ghosts.length).toBeGreaterThan(0);
    for (const g of ghosts) {
      expect(g.velocity).toBeLessThanOrEqual(30);
    }
  });

  it("removeGhostHits filters below threshold", () => {
    const notes: NoteEvent[] = [
      { pitch: 60, startTick: 0, durationTicks: 100, velocity: 100 },
      { pitch: 60, startTick: 60, durationTicks: 50, velocity: 30 },
      { pitch: 60, startTick: 120, durationTicks: 100, velocity: 90 },
    ];
    const result = removeGhostHits(notes, 50);
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.velocity >= 50)).toBe(true);
  });
});

// ── Intensity tests ──

describe("Intensity transforms", () => {
  it("lowIntensity reduces notes and velocity", () => {
    const result = lowIntensity(SIMPLE_MOTIF);
    expect(result.length).toBeLessThanOrEqual(SIMPLE_MOTIF.length);
    const avgVel = result.reduce((s, n) => s + n.velocity, 0) / result.length;
    const origAvg = SIMPLE_MOTIF.reduce((s, n) => s + n.velocity, 0) / SIMPLE_MOTIF.length;
    expect(avgVel).toBeLessThan(origAvg);
  });

  it("midIntensity accents notes", () => {
    const result = midIntensity(SIMPLE_MOTIF);
    expect(result).toHaveLength(3);
    // First note (index 0) should be accented
    expect(result[0].velocity).toBeGreaterThanOrEqual(SIMPLE_MOTIF[0].velocity);
  });

  it("highIntensity adds density and octave doublings", () => {
    const result = highIntensity(SIMPLE_MOTIF);
    expect(result.length).toBeGreaterThan(SIMPLE_MOTIF.length);
  });

  it("deriveIntensity dispatches correctly", () => {
    const low = deriveIntensity(SIMPLE_MOTIF, "low");
    const mid = deriveIntensity(SIMPLE_MOTIF, "mid");
    const high = deriveIntensity(SIMPLE_MOTIF, "high");
    expect(low.length).toBeLessThanOrEqual(mid.length);
    expect(high.length).toBeGreaterThan(mid.length);
  });

  it("addTension shifts some pitches up", () => {
    const result = addTension(SIMPLE_MOTIF, 1);
    const shifted = result.filter((n, i) => n.pitch !== SIMPLE_MOTIF[i].pitch);
    expect(shifted.length).toBeGreaterThan(0);
    for (const n of shifted) {
      const orig = SIMPLE_MOTIF.find((_, i) => result[i] === n);
      if (orig) expect(n.pitch).toBeGreaterThan(orig.pitch);
    }
  });

  it("brighten boosts velocity of higher notes", () => {
    const result = brighten(SIMPLE_MOTIF, 15);
    // G4 (67) is above median → should be boosted
    const highNote = result.find((n) => n.pitch === 67 || n.pitch === SIMPLE_MOTIF[2].pitch);
    expect(highNote!.velocity).toBeGreaterThanOrEqual(SIMPLE_MOTIF[2].velocity);
  });
});
