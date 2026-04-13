import { describe, it, expect } from "vitest";
import { scheduleNotes, clipLengthSeconds, quantizedLaunchTime } from "../src/scheduler";
import type { ClipNote } from "@motif/schema";

describe("scheduleNotes", () => {
  const bpm = 120; // 0.5s per beat, 480 ticks per beat
  const startTime = 1.0;

  it("converts ticks to seconds correctly", () => {
    const notes: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
    ];
    const result = scheduleNotes(notes, bpm, startTime);
    expect(result).toHaveLength(1);
    expect(result[0].startTime).toBeCloseTo(1.0);
    expect(result[0].duration).toBeCloseTo(0.5); // 480 ticks at 120 bpm = 0.5s
  });

  it("offsets notes correctly", () => {
    const notes: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 240, velocity: 100 },
      { pitch: 64, startTick: 240, durationTicks: 240, velocity: 80 },
      { pitch: 67, startTick: 480, durationTicks: 240, velocity: 90 },
    ];
    const result = scheduleNotes(notes, bpm, startTime);
    expect(result).toHaveLength(3);
    expect(result[0].startTime).toBeCloseTo(1.0);
    expect(result[1].startTime).toBeCloseTo(1.25); // 240 ticks = 0.25s at 120bpm
    expect(result[2].startTime).toBeCloseTo(1.5);
  });

  it("preserves pitch and velocity", () => {
    const notes: ClipNote[] = [
      { pitch: 48, startTick: 0, durationTicks: 120, velocity: 127 },
    ];
    const result = scheduleNotes(notes, bpm, startTime);
    expect(result[0].pitch).toBe(48);
    expect(result[0].velocity).toBe(127);
  });

  it("handles empty notes array", () => {
    expect(scheduleNotes([], 120, 0)).toEqual([]);
  });

  it("handles different BPMs", () => {
    const notes: ClipNote[] = [
      { pitch: 60, startTick: 480, durationTicks: 480, velocity: 100 },
    ];
    // 60 BPM = 1s per beat
    const result60 = scheduleNotes(notes, 60, 0);
    expect(result60[0].startTime).toBeCloseTo(1.0);
    expect(result60[0].duration).toBeCloseTo(1.0);

    // 240 BPM = 0.25s per beat
    const result240 = scheduleNotes(notes, 240, 0);
    expect(result240[0].startTime).toBeCloseTo(0.25);
    expect(result240[0].duration).toBeCloseTo(0.25);
  });
});

describe("clipLengthSeconds", () => {
  it("calculates correct length at 120 BPM", () => {
    expect(clipLengthSeconds(120, 4)).toBeCloseTo(2.0); // 4 beats at 120bpm = 2s
  });

  it("calculates correct length at 60 BPM", () => {
    expect(clipLengthSeconds(60, 4)).toBeCloseTo(4.0); // 4 beats at 60bpm = 4s
  });

  it("handles odd beat counts", () => {
    expect(clipLengthSeconds(120, 3)).toBeCloseTo(1.5);
  });
});

describe("quantizedLaunchTime", () => {
  it("returns currentTime for mode 'none'", () => {
    expect(quantizedLaunchTime(1.5, 120, "none")).toBe(1.5);
  });

  it("snaps to next beat boundary", () => {
    // 120 BPM = 0.5s per beat
    // currentTime = 0.3 → next beat at 0.5
    expect(quantizedLaunchTime(0.3, 120, "beat")).toBeCloseTo(0.5);
  });

  it("returns exact time when already on beat boundary", () => {
    // currentTime = 1.0 → already on beat, ceil(1.0/0.5)*0.5 = 1.0
    expect(quantizedLaunchTime(1.0, 120, "beat")).toBeCloseTo(1.0);
  });

  it("snaps to next bar boundary (4 beats)", () => {
    // 120 BPM = 0.5s/beat, 2s/bar
    // currentTime = 1.5 → next bar at 2.0
    expect(quantizedLaunchTime(1.5, 120, "bar")).toBeCloseTo(2.0);
  });

  it("snaps to next bar with custom beatsPerBar", () => {
    // 120 BPM = 0.5s/beat, 3 beats/bar = 1.5s/bar
    // currentTime = 0.8 → next bar at 1.5
    expect(quantizedLaunchTime(0.8, 120, "bar", 3)).toBeCloseTo(1.5);
  });

  it("returns at least currentTime", () => {
    const result = quantizedLaunchTime(5.0, 120, "beat");
    expect(result).toBeGreaterThanOrEqual(5.0);
  });

  it("handles very small times", () => {
    expect(quantizedLaunchTime(0.001, 120, "beat")).toBeCloseTo(0.5);
  });

  it("handles 60 BPM correctly", () => {
    // 60 BPM = 1s/beat
    // currentTime = 0.5 → next beat at 1.0
    expect(quantizedLaunchTime(0.5, 60, "beat")).toBeCloseTo(1.0);
    // next bar at 4.0 (4 beats * 1s/beat)
    expect(quantizedLaunchTime(0.5, 60, "bar")).toBeCloseTo(4.0);
  });
});
