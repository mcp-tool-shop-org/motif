const PITCH_CLASS: Record<string, number> = {
  C: 0,
  "C#": 1,
  DB: 1,
  D: 2,
  "D#": 3,
  EB: 3,
  E: 4,
  F: 5,
  "F#": 6,
  GB: 6,
  G: 7,
  "G#": 8,
  AB: 8,
  A: 9,
  "A#": 10,
  BB: 10,
  B: 11,
};

export interface ParsedKeyscale {
  keyRoot: number;
  keyScale: string;
}

/** Parse ACE-Step keyscale strings like "E minor" into Cue fields. */
export function parseKeyscale(keyscale: string): ParsedKeyscale | undefined {
  const trimmed = keyscale.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split(/\s+/);
  const note = parts[0]!.toUpperCase();
  const keyRoot = PITCH_CLASS[note];
  if (keyRoot == null) return undefined;
  const keyScale = parts.slice(1).join(" ").toLowerCase() || "major";
  return { keyRoot, keyScale };
}

/** Accept "4/4" or the ACE widget form "4". */
export function parseBeatsPerBar(timesignature: string | undefined): number {
  if (!timesignature) return 4;
  const num = timesignature.split("/")[0];
  const parsed = Number(num);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
}

export function durationBarsFromSeconds(
  durationSec: number,
  bpm: number,
  beatsPerBar: number,
): number {
  const bars = (durationSec * bpm) / 60 / beatsPerBar;
  return Math.max(1, Math.round(bars));
}
