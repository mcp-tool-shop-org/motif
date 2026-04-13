import { describe, it, expect } from "vitest";
import { pitchClass, octave, parseMidi } from "../src/scales.js";

describe("pitchClass — negative MIDI values", () => {
  it("returns correct pitch class for -1", () => {
    // -1 % 12 = -1, then (-1 + 12) % 12 = 11 → B
    expect(pitchClass(-1)).toBe(11);
  });

  it("returns 0 for -12 (one octave below zero)", () => {
    expect(pitchClass(-12)).toBe(0);
  });

  it("returns correct pitch class for -7", () => {
    // -7 % 12 = -7, then (-7 + 12) % 12 = 5 → F
    expect(pitchClass(-7)).toBe(5);
  });

  it("returns 0 for MIDI 0", () => {
    expect(pitchClass(0)).toBe(0);
  });

  it("handles large negative values", () => {
    // -25 % 12 = -1, then (-1 + 12) % 12 = 11
    expect(pitchClass(-25)).toBe(11);
  });
});

describe("octave — negative MIDI values", () => {
  it("returns -1 for MIDI 0", () => {
    expect(octave(0)).toBe(-1);
  });

  it("returns -2 for MIDI -1", () => {
    // Math.floor(-1 / 12) - 1 = -1 - 1 = -2
    expect(octave(-1)).toBe(-2);
  });

  it("returns -2 for MIDI -12", () => {
    // Math.floor(-12 / 12) - 1 = -1 - 1 = -2
    expect(octave(-12)).toBe(-2);
  });

  it("returns -3 for MIDI -13", () => {
    // Math.floor(-13 / 12) - 1 = -2 - 1 = -3
    expect(octave(-13)).toBe(-3);
  });
});

describe("parseMidi — flat notation not supported", () => {
  it("returns -1 for flat notation like Db4", () => {
    // parseMidi only accepts sharp notation (e.g. C#4), not flat (e.g. Db4)
    expect(parseMidi("Db4")).toBe(-1);
  });

  it("returns -1 for Bb3", () => {
    expect(parseMidi("Bb3")).toBe(-1);
  });

  it("returns -1 for Eb5", () => {
    expect(parseMidi("Eb5")).toBe(-1);
  });

  it("still parses sharp notation correctly", () => {
    expect(parseMidi("C#4")).toBe(61);
    expect(parseMidi("A#3")).toBe(58);
  });

  it("parses natural notes correctly", () => {
    expect(parseMidi("C4")).toBe(60);
    expect(parseMidi("A4")).toBe(69);
  });
});
