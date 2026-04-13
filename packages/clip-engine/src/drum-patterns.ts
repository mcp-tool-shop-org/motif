// ────────────────────────────────────────────
// Drum Pattern Presets — kickstart composition with classic patterns
// ────────────────────────────────────────────

import type { ClipNote } from "@motif/schema";

/** Standard GM MIDI drum mapping */
const KICK = 36;
const SNARE = 38;
const CLOSED_HAT = 42;
const OPEN_HAT = 46;
const RIDE = 51;
const CRASH = 49;
const TOM = 45;
const CLAP = 39;

export interface DrumPattern {
  name: string;
  notes: ClipNote[];
}

/** Ticks per beat (standard MIDI PPQ) */
const TPB = 480;



/** 4-beat pattern builder: places hits on specific 16th-note positions (0-15) */
function grid(
  pitch: number,
  positions: number[],
  velocity: number = 100,
): ClipNote[] {
  const step = TPB / 4; // 120 ticks per 16th
  return positions.map((pos) => ({
    pitch,
    startTick: pos * step,
    durationTicks: step,
    velocity,
  }));
}

// ── Pattern definitions (4 beats = 16 sixteenths each) ──

function fourOnFloor(): ClipNote[] {
  return [
    // Kick on every beat
    ...grid(KICK, [0, 4, 8, 12]),
    // Snare on 2 and 4
    ...grid(SNARE, [4, 12]),
    // Closed hat on every 8th
    ...grid(CLOSED_HAT, [0, 2, 4, 6, 8, 10, 12, 14], 80),
  ];
}

function breakbeat(): ClipNote[] {
  return [
    // Syncopated kick
    ...grid(KICK, [0, 3, 6, 10]),
    // Snare with ghost
    ...grid(SNARE, [4, 12]),
    ...grid(SNARE, [7, 15], 50), // ghost snares
    // Hi-hat pattern
    ...grid(CLOSED_HAT, [0, 2, 4, 6, 8, 10, 12, 14], 75),
    ...grid(OPEN_HAT, [3, 11], 85),
  ];
}

function halfTime(): ClipNote[] {
  return [
    // Kick on 1
    ...grid(KICK, [0, 1]),
    // Snare on beat 3 only
    ...grid(SNARE, [8]),
    // Slow hats
    ...grid(CLOSED_HAT, [0, 4, 8, 12], 70),
    ...grid(OPEN_HAT, [14], 85),
  ];
}

function shuffle(): ClipNote[] {
  // Triplet feel — hats on triplet subdivisions (approximate with 16ths + swing)
  const triplet = TPB / 3; // ~160 ticks
  const hatNotes: ClipNote[] = [];
  for (let beat = 0; beat < 4; beat++) {
    const base = beat * TPB;
    hatNotes.push({ pitch: CLOSED_HAT, startTick: base, durationTicks: 120, velocity: 90 });
    hatNotes.push({ pitch: CLOSED_HAT, startTick: base + triplet, durationTicks: 120, velocity: 60 });
    hatNotes.push({ pitch: CLOSED_HAT, startTick: base + triplet * 2, durationTicks: 120, velocity: 70 });
  }
  return [
    ...grid(KICK, [0, 6, 8, 14]),
    ...grid(SNARE, [4, 12]),
    ...hatNotes,
  ];
}

function trap(): ClipNote[] {
  return [
    // Sparse kick
    ...grid(KICK, [0, 7, 10]),
    // Snare/clap on 2 and 4
    ...grid(CLAP, [4, 12]),
    // Rapid hi-hat rolls
    ...grid(CLOSED_HAT, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 70),
    // Open hat accents
    ...grid(OPEN_HAT, [6, 14], 90),
  ];
}

function latin(): ClipNote[] {
  // Son clave: 3-2 pattern
  return [
    // Clave hits (using rim/clap for clave feel)
    ...grid(CLAP, [0, 3, 6, 10, 12]),
    // Kick
    ...grid(KICK, [0, 8]),
    // Congas (using tom)
    ...grid(TOM, [0, 3, 4, 6, 8, 10, 12, 14], 75),
    // Hat
    ...grid(CLOSED_HAT, [0, 2, 4, 6, 8, 10, 12, 14], 65),
  ];
}

function waltz(): ClipNote[] {
  // 3/4 time — 3 beats, 12 sixteenths
  const step = TPB / 4;
  return [
    // Kick on 1
    { pitch: KICK, startTick: 0, durationTicks: step, velocity: 100 },
    // Hat on 2 and 3
    { pitch: CLOSED_HAT, startTick: 4 * step, durationTicks: step, velocity: 75 },
    { pitch: CLOSED_HAT, startTick: 8 * step, durationTicks: step, velocity: 75 },
    // Subtle snare on 3
    { pitch: SNARE, startTick: 8 * step, durationTicks: step, velocity: 60 },
  ];
}

function drill(): ClipNote[] {
  // UK drill: sliding hats, sparse rhythmic kick/snare
  return [
    // Kick pattern
    ...grid(KICK, [0, 5, 10]),
    // Snare
    ...grid(SNARE, [4, 12]),
    // Sliding hi-hats (varied velocity)
    { pitch: CLOSED_HAT, startTick: 0, durationTicks: 120, velocity: 90 },
    { pitch: CLOSED_HAT, startTick: 120, durationTicks: 120, velocity: 50 },
    { pitch: CLOSED_HAT, startTick: 240, durationTicks: 120, velocity: 70 },
    { pitch: CLOSED_HAT, startTick: 360, durationTicks: 120, velocity: 40 },
    { pitch: CLOSED_HAT, startTick: 480, durationTicks: 120, velocity: 85 },
    { pitch: CLOSED_HAT, startTick: 600, durationTicks: 120, velocity: 45 },
    { pitch: CLOSED_HAT, startTick: 720, durationTicks: 120, velocity: 75 },
    { pitch: CLOSED_HAT, startTick: 840, durationTicks: 120, velocity: 35 },
    { pitch: CLOSED_HAT, startTick: 960, durationTicks: 120, velocity: 90 },
    { pitch: CLOSED_HAT, startTick: 1080, durationTicks: 120, velocity: 55 },
    { pitch: CLOSED_HAT, startTick: 1200, durationTicks: 120, velocity: 65 },
    { pitch: CLOSED_HAT, startTick: 1320, durationTicks: 120, velocity: 40 },
    { pitch: CLOSED_HAT, startTick: 1440, durationTicks: 120, velocity: 85 },
    { pitch: CLOSED_HAT, startTick: 1560, durationTicks: 120, velocity: 50 },
    { pitch: CLOSED_HAT, startTick: 1680, durationTicks: 120, velocity: 70 },
    { pitch: CLOSED_HAT, startTick: 1800, durationTicks: 120, velocity: 45 },
    // Open hat accent
    ...grid(OPEN_HAT, [7, 15], 80),
  ];
}

function lofi(): ClipNote[] {
  return [
    // Laid-back kick (slightly sparse)
    ...grid(KICK, [0, 7]),
    // Snare on backbeat
    ...grid(SNARE, [4, 12], 85),
    // Sparse hats — skip some steps for that lazy feel
    ...grid(CLOSED_HAT, [0, 3, 6, 8, 11, 14], 65),
  ];
}

function ambient(): ClipNote[] {
  return [
    // Minimal, wide-spaced
    ...grid(KICK, [0], 70),
    ...grid(RIDE, [4, 12], 50),
    ...grid(CRASH, [0], 40),
    // One distant snare
    ...grid(SNARE, [8], 45),
  ];
}

// ── Public API ──

const ALL_PATTERNS: readonly DrumPattern[] = [
  { name: "Four on the Floor", notes: fourOnFloor() },
  { name: "Breakbeat", notes: breakbeat() },
  { name: "Half Time", notes: halfTime() },
  { name: "Shuffle", notes: shuffle() },
  { name: "Trap", notes: trap() },
  { name: "Latin", notes: latin() },
  { name: "Waltz", notes: waltz() },
  { name: "Drill", notes: drill() },
  { name: "Lo-Fi", notes: lofi() },
  { name: "Ambient", notes: ambient() },
];

/**
 * Get all available drum pattern presets.
 * Each pattern returns fresh ClipNote[] arrays (safe to mutate).
 */
export function getDrumPatterns(): DrumPattern[] {
  return ALL_PATTERNS.map((p) => ({
    name: p.name,
    notes: p.notes.map((n) => ({ ...n })),
  }));
}

/** GM drum MIDI constants for reference */
export const GM_DRUMS = {
  KICK,
  SNARE,
  CLOSED_HAT,
  OPEN_HAT,
  RIDE,
  CRASH,
  TOM,
  CLAP,
} as const;
