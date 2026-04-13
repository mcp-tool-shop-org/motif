import { describe, it, expect, beforeAll } from "vitest";
import { getDrumPatterns, GM_DRUMS } from "../src/drum-patterns";
import type { DrumPattern } from "../src/drum-patterns";

const VALID_DRUMS = new Set([
  GM_DRUMS.KICK,
  GM_DRUMS.SNARE,
  GM_DRUMS.CLOSED_HAT,
  GM_DRUMS.OPEN_HAT,
  GM_DRUMS.RIDE,
  GM_DRUMS.CRASH,
  GM_DRUMS.TOM,
  GM_DRUMS.CLAP,
]);

describe("getDrumPatterns", () => {
  let patterns: DrumPattern[];

  beforeAll(() => {
    patterns = getDrumPatterns();
  });

  it("returns exactly 10 patterns", () => {
    expect(patterns).toHaveLength(10);
  });

  it("every pattern has a non-empty name", () => {
    for (const p of patterns) {
      expect(p.name).toBeTruthy();
      expect(typeof p.name).toBe("string");
    }
  });

  it("all pattern names are unique", () => {
    const names = patterns.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every pattern has at least 1 note", () => {
    for (const p of patterns) {
      expect(p.notes.length).toBeGreaterThan(0);
    }
  });

  it("all notes use valid GM drum MIDI values", () => {
    for (const p of patterns) {
      for (const n of p.notes) {
        expect(VALID_DRUMS.has(n.pitch)).toBe(true);
      }
    }
  });

  it("all notes have valid structure (positive startTick, durationTicks, velocity)", () => {
    for (const p of patterns) {
      for (const n of p.notes) {
        expect(n.startTick).toBeGreaterThanOrEqual(0);
        expect(n.durationTicks).toBeGreaterThan(0);
        expect(n.velocity).toBeGreaterThan(0);
        expect(n.velocity).toBeLessThanOrEqual(127);
      }
    }
  });

  it("returns fresh arrays each call (safe to mutate)", () => {
    const a = getDrumPatterns();
    const b = getDrumPatterns();
    expect(a).not.toBe(b);
    expect(a[0].notes).not.toBe(b[0].notes);
    a[0].notes.push({ pitch: 36, startTick: 9999, durationTicks: 120, velocity: 100 });
    expect(b[0].notes.length).not.toBe(a[0].notes.length);
  });

  it("includes expected named patterns", () => {
    const names = patterns.map((p) => p.name);
    expect(names).toContain("Four on the Floor");
    expect(names).toContain("Breakbeat");
    expect(names).toContain("Half Time");
    expect(names).toContain("Shuffle");
    expect(names).toContain("Trap");
    expect(names).toContain("Latin");
    expect(names).toContain("Waltz");
    expect(names).toContain("Drill");
    expect(names).toContain("Lo-Fi");
    expect(names).toContain("Ambient");
  });

  it("Four on the Floor has kick on every beat", () => {
    const fof = patterns.find((p) => p.name === "Four on the Floor")!;
    const kicks = fof.notes.filter((n) => n.pitch === GM_DRUMS.KICK);
    expect(kicks).toHaveLength(4);
    // Verify kick positions: beat 1,2,3,4 = ticks 0, 480, 960, 1440
    const kickTicks = kicks.map((k) => k.startTick).sort((a, b) => a - b);
    expect(kickTicks).toEqual([0, 480, 960, 1440]);
  });

  it("Four on the Floor has snare on 2 and 4", () => {
    const fof = patterns.find((p) => p.name === "Four on the Floor")!;
    const snares = fof.notes.filter((n) => n.pitch === GM_DRUMS.SNARE);
    expect(snares).toHaveLength(2);
    const snareTicks = snares.map((s) => s.startTick).sort((a, b) => a - b);
    expect(snareTicks).toEqual([480, 1440]);
  });

  it("Waltz pattern fits 3/4 time (notes within 3 beats)", () => {
    const waltz = patterns.find((p) => p.name === "Waltz")!;
    const maxTick = Math.max(...waltz.notes.map((n) => n.startTick));
    // 3 beats = 1440 ticks, all notes should be within
    expect(maxTick).toBeLessThanOrEqual(1440);
  });

  it("Trap pattern has rapid hi-hat rolls (16 closed hat hits)", () => {
    const trap = patterns.find((p) => p.name === "Trap")!;
    const hats = trap.notes.filter((n) => n.pitch === GM_DRUMS.CLOSED_HAT);
    expect(hats.length).toBeGreaterThanOrEqual(16);
  });
});

describe("GM_DRUMS constants", () => {
  it("has standard MIDI values", () => {
    expect(GM_DRUMS.KICK).toBe(36);
    expect(GM_DRUMS.SNARE).toBe(38);
    expect(GM_DRUMS.CLOSED_HAT).toBe(42);
    expect(GM_DRUMS.OPEN_HAT).toBe(46);
    expect(GM_DRUMS.RIDE).toBe(51);
    expect(GM_DRUMS.CRASH).toBe(49);
    expect(GM_DRUMS.TOM).toBe(45);
    expect(GM_DRUMS.CLAP).toBe(39);
  });
});
