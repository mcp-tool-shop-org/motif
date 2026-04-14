// ────────────────────────────────────────────
// Star Freight: Grounded — MIDI Clips
// 25 clips across 5 worlds × 5 lanes
// ────────────────────────────────────────────

import type { Clip, ClipNote } from "@motif-studio/schema";

// ── Timing constants ──

const T = 480; // ticks per beat
const T8 = 240; // eighth note
const T16 = 120; // sixteenth note

// ── GM drum MIDI ──

const KICK = 36;
const SNARE = 38;
const CLOSED_HAT = 42;
const OPEN_HAT = 46;
const RIDE = 51;
const CRASH = 49;

// ── Helper: 16th-note grid (4 beats = 16 positions) ──

function g(pitch: number, positions: number[], velocity = 100): ClipNote[] {
  return positions.map((pos) => ({
    pitch,
    startTick: pos * T16,
    durationTicks: T16,
    velocity,
  }));
}

// ── Helper: sustained note ──

function n(pitch: number, startTick: number, durationTicks: number, velocity = 80): ClipNote {
  return { pitch, startTick, durationTicks, velocity };
}

// ══════════════════════════════════════════
// ARDENT — G minor, 100 BPM, military precision
// G=43(G2), Bb=46(Bb2), C=48(C3), D=50(D3), Eb=51(Eb3)
// ══════════════════════════════════════════

const ardentDrums: Clip = {
  id: "cl-ardent-drums",
  name: "Ardent March",
  lane: "drums",
  instrumentId: "scifi-march-drum",
  bpm: 100,
  lengthBeats: 8,
  loop: true,
  tags: ["grounded", "ardent", "military"],
  notes: [
    // Bar 1: half-time feel — kick on 1, snare on 3
    ...g(KICK, [0, 1]),
    ...g(SNARE, [8]),
    ...g(CLOSED_HAT, [0, 4, 8, 12], 70),
    ...g(OPEN_HAT, [14], 75),
    // Bar 2: variation — kick on 1, snare on 3 with ghost
    ...g(KICK, [16, 17]),
    ...g(SNARE, [24]),
    ...g(SNARE, [27], 45), // ghost
    ...g(CLOSED_HAT, [16, 20, 24, 28], 70),
    ...g(RIDE, [30], 55),
  ],
};

const ardentBass: Clip = {
  id: "cl-ardent-bass",
  name: "Ardent Hull Pulse",
  lane: "bass",
  instrumentId: "scifi-hull-rumble",
  bpm: 100,
  lengthBeats: 8,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "ardent", "military"],
  notes: [
    // Bar 1: G2 root pulse, quarter notes with octave drop
    n(43, 0, T - 60, 95),       // G2
    n(43, T, T - 60, 80),       // G2
    n(31, 2 * T, T - 60, 100),  // G1 (octave drop)
    n(43, 3 * T, T - 60, 75),   // G2
    // Bar 2: movement to Cm territory
    n(48, 4 * T, T - 60, 90),   // C3
    n(48, 5 * T, T - 60, 75),   // C3
    n(50, 6 * T, T - 60, 95),   // D3
    n(43, 7 * T, T - 60, 85),   // G2 (home)
  ],
};

const ardentHarmony: Clip = {
  id: "cl-ardent-harmony",
  name: "Ardent Tension Pad",
  lane: "harmony",
  instrumentId: "scifi-tension-drone",
  bpm: 100,
  lengthBeats: 8,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "ardent", "military"],
  notes: [
    // Bar 1: Gm chord (G-Bb-D) — 4 beats sustain
    n(55, 0, 4 * T, 65),  // G3
    n(58, 0, 4 * T, 60),  // Bb3
    n(62, 0, 4 * T, 55),  // D4
    // Bar 2: Cm chord (C-Eb-G) — 4 beats sustain
    n(60, 4 * T, 4 * T, 65),  // C4
    n(63, 4 * T, 4 * T, 60),  // Eb4
    n(67, 4 * T, 4 * T, 55),  // G4
  ],
};

const ardentMotif: Clip = {
  id: "cl-ardent-motif",
  name: "Ardent Brass Theme",
  lane: "motif",
  instrumentId: "scifi-brass-synth",
  bpm: 100,
  lengthBeats: 8,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "ardent", "military"],
  notes: [
    // 4-note military theme: G-Bb-D-C descending resolution
    n(67, 0, T, 90),           // G4 (beat 1)
    n(70, T, T, 85),           // Bb4 (beat 2)
    n(74, 2 * T, T + T8, 95), // D5 (beat 3, held)
    n(72, 4 * T, 2 * T, 80),  // C5 (beat 5, long resolve)
    // Silence beats 7-8 (let it breathe)
  ],
};

const ardentAccent: Clip = {
  id: "cl-ardent-accent",
  name: "Ardent Alert Stab",
  lane: "accent",
  instrumentId: "scifi-alert-stab",
  bpm: 100,
  lengthBeats: 8,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "ardent", "military"],
  notes: [
    // Sparse downbeat stabs — structural punctuation
    n(67, 0, T16, 55),       // G4 on beat 1
    n(62, 4 * T, T16, 50),   // D4 on beat 5
  ],
};

// ══════════════════════════════════════════
// FREEPORT — D minor, 95 BPM, worn frontier
// D=38(D2), F=41(F2), A=45(A2), Bb=46(Bb2)
// ══════════════════════════════════════════

const freeportDrums: Clip = {
  id: "cl-freeport-drums",
  name: "Freeport Lo-Fi Beat",
  lane: "drums",
  instrumentId: "scifi-metal-percussion",
  bpm: 95,
  lengthBeats: 8,
  loop: true,
  tags: ["grounded", "freeport", "frontier"],
  notes: [
    // Bar 1: sparse lo-fi — kick on 1, hat on offbeats
    ...g(KICK, [0]),
    ...g(CLOSED_HAT, [3, 6, 8, 11, 14], 60),
    ...g(SNARE, [12], 75),
    // Bar 2: even sparser — just kick and a few hats
    ...g(KICK, [16, 23]),
    ...g(CLOSED_HAT, [19, 22, 25, 30], 55),
    ...g(SNARE, [28], 70),
  ],
};

const freeportBass: Clip = {
  id: "cl-freeport-bass",
  name: "Freeport Hull Drone",
  lane: "bass",
  instrumentId: "scifi-hull-rumble",
  bpm: 95,
  lengthBeats: 8,
  keyRoot: 2, // D
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "freeport", "frontier"],
  notes: [
    // Sparse half-note movement — D minor territory
    n(38, 0, 2 * T, 85),          // D2 (2 beats)
    n(38, 2 * T, 2 * T, 70),      // D2 (sustain)
    n(36, 4 * T, 2 * T, 80),      // C2
    n(33, 6 * T, 2 * T, 75),      // A1 (low register)
  ],
};

const freeportHarmony: Clip = {
  id: "cl-freeport-harmony",
  name: "Freeport Station Drone",
  lane: "harmony",
  instrumentId: "scifi-drone-station",
  bpm: 95,
  lengthBeats: 8,
  keyRoot: 2, // D
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "freeport", "frontier"],
  notes: [
    // Bar 1: Dm (D-F-A) — wide voicing, slow pad
    n(50, 0, 4 * T, 55),  // D3
    n(53, 0, 4 * T, 50),  // F3
    n(57, 0, 4 * T, 45),  // A3
    // Bar 2: Bbmaj (Bb-D-F)
    n(58, 4 * T, 4 * T, 55),  // Bb3
    n(50, 4 * T, 4 * T, 50),  // D3
    n(53, 4 * T, 4 * T, 45),  // F3
  ],
};

const freeportMotif: Clip = {
  id: "cl-freeport-motif",
  name: "Freeport Reactor Pulse",
  lane: "motif",
  instrumentId: "scifi-reactor-pulse",
  bpm: 95,
  lengthBeats: 8,
  keyRoot: 2, // D
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "freeport", "frontier"],
  notes: [
    // 16th-note engine hum — rhythmic pulse on D
    ...Array.from({ length: 16 }, (_, i) => n(
      50, // D3
      i * T16,
      T16 - 20,
      i % 4 === 0 ? 80 : i % 2 === 0 ? 60 : 40,
    )),
    // Bar 2: same pattern, slightly varied pitch
    ...Array.from({ length: 16 }, (_, i) => n(
      i >= 12 ? 53 : 50, // F3 on last 4 sixteenths
      4 * T + i * T16,
      T16 - 20,
      i % 4 === 0 ? 75 : i % 2 === 0 ? 55 : 35,
    )),
  ],
};

const freeportAccent: Clip = {
  id: "cl-freeport-accent",
  name: "Freeport Metal Hit",
  lane: "accent",
  instrumentId: "scifi-metal-percussion",
  bpm: 95,
  lengthBeats: 8,
  keyRoot: 2, // D
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "freeport", "frontier"],
  notes: [
    // Very sparse metallic hits — worn station ambience
    n(62, 2 * T, T16, 45),   // D4 — beat 3
    n(65, 6 * T, T16, 40),   // F4 — beat 7
  ],
};

// ══════════════════════════════════════════
// COMMUNION — F phrygian, 80 BPM, alien wonder
// F=41(F2), Gb=42(Gb2), Ab=44(Ab2), Bb=46(Bb2)
// Phrygian: F-Gb-Ab-Bb-C-Db-Eb
// ══════════════════════════════════════════

const communionDrums: Clip = {
  id: "cl-communion-drums",
  name: "Keth Organic Pulse",
  lane: "drums",
  instrumentId: "scifi-keth-rhythm",
  bpm: 80,
  lengthBeats: 8,
  loop: true,
  tags: ["grounded", "communion", "keth", "alien"],
  notes: [
    // Organic irregular pulse — not grid-locked, breathing feel
    // Bar 1: asymmetric — 3+3+2 grouping
    n(KICK, 0, T16, 70),
    n(CLOSED_HAT, 3 * T16, T16, 50),
    n(KICK, 6 * T16, T16, 65),
    n(CLOSED_HAT, 9 * T16, T16, 45),
    n(KICK, 11 * T16, T16, 75),
    n(CLOSED_HAT, 14 * T16, T16, 40),
    // Bar 2: sparser — room for bells
    n(KICK, 16 * T16, T16, 65),
    n(RIDE, 20 * T16, T16, 40),
    n(KICK, 22 * T16, T16, 60),
    n(RIDE, 26 * T16, T16, 35),
    n(CLOSED_HAT, 30 * T16, T16, 50),
  ],
};

const communionBass: Clip = {
  id: "cl-communion-bass",
  name: "Keth Resonance",
  lane: "bass",
  instrumentId: "scifi-keth-bass",
  bpm: 80,
  lengthBeats: 8,
  keyRoot: 5, // F
  keyScale: "phrygian",
  loop: true,
  tags: ["grounded", "communion", "keth", "alien"],
  notes: [
    // Phrygian bass movement: F → Gb → Ab (flat-2 tension)
    n(41, 0, 2 * T, 80),          // F2 (2 beats)
    n(42, 2 * T, T, 75),          // Gb2 (the exotic flat-2)
    n(41, 3 * T, T, 70),          // F2 (resolve)
    n(44, 4 * T, 2 * T, 80),      // Ab2
    n(46, 6 * T, T, 75),          // Bb2
    n(41, 7 * T, T, 85),          // F2 (home)
  ],
};

const communionHarmony: Clip = {
  id: "cl-communion-harmony",
  name: "Keth Chorus Pad",
  lane: "harmony",
  instrumentId: "scifi-keth-voice",
  bpm: 80,
  lengthBeats: 8,
  keyRoot: 5, // F
  keyScale: "phrygian",
  loop: true,
  tags: ["grounded", "communion", "keth", "alien"],
  notes: [
    // Bar 1: Fm (F-Ab-C) — phrygian home, ethereal shimmer
    n(53, 0, 4 * T, 60),  // F3
    n(56, 0, 4 * T, 55),  // Ab3
    n(60, 0, 4 * T, 50),  // C4
    // Bar 2: Gbmaj (Gb-Bb-Db) — alien flat-2 chord
    n(54, 4 * T, 4 * T, 60),  // Gb3
    n(58, 4 * T, 4 * T, 55),  // Bb3
    n(61, 4 * T, 4 * T, 50),  // Db4
  ],
};

const communionMotif: Clip = {
  id: "cl-communion-motif",
  name: "Keth Bell Melody",
  lane: "motif",
  instrumentId: "scifi-keth-bell",
  bpm: 80,
  lengthBeats: 8,
  keyRoot: 5, // F
  keyScale: "phrygian",
  loop: true,
  tags: ["grounded", "communion", "keth", "alien"],
  notes: [
    // Bell melody — pentatonic subset of F phrygian, wide intervals
    n(77, 0, T + T8, 70),         // F5 (high, bell-like)
    n(73, 2 * T, T, 65),          // Db5
    n(68, 3 * T, T8, 60),         // Ab4 (grace note)
    n(65, 4 * T, T + T8, 75),     // F4 (octave below, anchor)
    n(68, 6 * T, T, 65),          // Ab4 (rising)
    n(70, 7 * T, T8, 55),         // Bb4 (trailing)
  ],
};

const communionAccent: Clip = {
  id: "cl-communion-accent",
  name: "Keth Ghost Pulse",
  lane: "accent",
  instrumentId: "scifi-keth-rhythm",
  bpm: 80,
  lengthBeats: 8,
  keyRoot: 5, // F
  keyScale: "phrygian",
  loop: true,
  tags: ["grounded", "communion", "keth", "alien"],
  notes: [
    // Ghost velocities — organic texture beneath the bells
    n(53, T, T16, 30),            // F3 ghost
    n(56, 3 * T + T8, T16, 25),   // Ab3 ghost
    n(53, 5 * T, T16, 35),        // F3 ghost
    n(58, 7 * T + T8, T16, 28),   // Bb3 ghost
  ],
};

// ══════════════════════════════════════════
// COMBAT — minor, 130 BPM, driving action
// Key inherited from world — notes written relative to G minor default
// ══════════════════════════════════════════

const combatDrums: Clip = {
  id: "cl-combat-drums",
  name: "Combat Drive",
  lane: "drums",
  instrumentId: "scifi-march-drum",
  bpm: 130,
  lengthBeats: 4,
  loop: true,
  tags: ["grounded", "combat"],
  notes: [
    // Aggressive four-on-floor with crash accents
    ...g(KICK, [0, 4, 8, 12], 110),
    ...g(SNARE, [4, 12], 105),
    ...g(CLOSED_HAT, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 75),
    ...g(CRASH, [0], 90),
    ...g(OPEN_HAT, [7, 15], 85),
  ],
};

const combatBass: Clip = {
  id: "cl-combat-bass",
  name: "Combat Bass Drive",
  lane: "bass",
  instrumentId: "scifi-hull-rumble",
  bpm: 130,
  lengthBeats: 4,
  keyRoot: 7, // G (default, overridden by world)
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "combat"],
  notes: [
    // Driving 8th-note bass — G minor root movement
    n(43, 0, T8 - 20, 100),       // G2
    n(43, T8, T8 - 20, 85),       // G2
    n(43, T, T8 - 20, 95),        // G2
    n(46, T + T8, T8 - 20, 90),   // Bb2
    n(48, 2 * T, T8 - 20, 100),   // C3
    n(48, 2 * T + T8, T8 - 20, 80), // C3
    n(50, 3 * T, T8 - 20, 95),    // D3
    n(43, 3 * T + T8, T8 - 20, 90), // G2 (reset)
  ],
};

const combatHarmony: Clip = {
  id: "cl-combat-harmony",
  name: "Combat Power Stabs",
  lane: "harmony",
  instrumentId: "scifi-tension-drone",
  bpm: 130,
  lengthBeats: 4,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "combat"],
  notes: [
    // Short power chord stabs — Gm5 (G-D)
    n(55, 0, T8, 85),            // G3
    n(62, 0, T8, 80),            // D4
    // Rest beat 2
    // Stab on beat 3
    n(55, 2 * T, T8, 90),        // G3
    n(62, 2 * T, T8, 85),        // D4
    // Stab beat 3.5
    n(58, 2 * T + T8, T8, 80),   // Bb3
    n(65, 2 * T + T8, T8, 75),   // F4
  ],
};

const combatMotif: Clip = {
  id: "cl-combat-motif",
  name: "Combat Brass Riff",
  lane: "motif",
  instrumentId: "scifi-brass-synth",
  bpm: 130,
  lengthBeats: 4,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "combat"],
  notes: [
    // Urgent syncopated brass riff
    n(67, 0, T16, 100),            // G4 (hard attack)
    n(70, T8, T16, 90),            // Bb4 (syncopated)
    n(74, T, T8, 95),              // D5 (sustained)
    n(72, 2 * T, T8 + T16, 100),   // C5 (driving)
    n(67, 3 * T, T8, 85),          // G4 (reset)
  ],
};

const combatAccent: Clip = {
  id: "cl-combat-accent",
  name: "Combat Alert Hits",
  lane: "accent",
  instrumentId: "scifi-alert-stab",
  bpm: 130,
  lengthBeats: 4,
  keyRoot: 7, // G
  keyScale: "minor",
  loop: true,
  tags: ["grounded", "combat"],
  notes: [
    // High-velocity alert stabs on key rhythmic hits
    n(67, 0, T16, 100),           // G4 on downbeat
    n(74, 2 * T, T16, 95),        // D5 on beat 3
    n(67, 3 * T + T8, T16, 90),   // G4 syncopated
  ],
};

// ══════════════════════════════════════════
// INVESTIGATION — Db chromatic, 88 BPM, conspiracy
// Db=37(Db2), D=38(D2), Eb=39(Eb2), E=40(E2)
// ══════════════════════════════════════════

const investigationDrums: Clip = {
  id: "cl-investigation-drums",
  name: "Investigation Data Stream",
  lane: "drums",
  instrumentId: "scifi-data-pulse",
  bpm: 88,
  lengthBeats: 8,
  loop: true,
  tags: ["grounded", "investigation"],
  notes: [
    // Minimal data-stream rhythm — mechanical, sparse
    // Bar 1: isolated clicks
    n(CLOSED_HAT, 0, T16, 55),
    n(CLOSED_HAT, 3 * T16, T16, 40),
    n(KICK, 4 * T16, T16, 50),
    n(CLOSED_HAT, 7 * T16, T16, 45),
    n(CLOSED_HAT, 10 * T16, T16, 35),
    n(RIDE, 13 * T16, T16, 30),
    // Bar 2: even sparser
    n(KICK, 16 * T16, T16, 50),
    n(CLOSED_HAT, 20 * T16, T16, 40),
    n(CLOSED_HAT, 26 * T16, T16, 35),
    n(RIDE, 31 * T16, T16, 30),
  ],
};

const investigationBass: Clip = {
  id: "cl-investigation-bass",
  name: "Investigation Suspense Bass",
  lane: "bass",
  instrumentId: "scifi-suspense-bass",
  bpm: 88,
  lengthBeats: 8,
  keyRoot: 1, // Db
  keyScale: "chromatic",
  loop: true,
  tags: ["grounded", "investigation"],
  notes: [
    // Chromatic creep — long notes, sinister movement
    n(37, 0, 3 * T, 75),          // Db2 (3 beats, ominous sustain)
    n(38, 3 * T, T, 65),          // D2 (chromatic step up)
    n(36, 4 * T, 3 * T, 70),      // C2 (step down, unsettled)
    n(37, 7 * T, T, 80),          // Db2 (home, but uneasy)
  ],
};

const investigationHarmony: Clip = {
  id: "cl-investigation-harmony",
  name: "Investigation Mystery Pad",
  lane: "harmony",
  instrumentId: "scifi-mystery-pad",
  bpm: 88,
  lengthBeats: 8,
  keyRoot: 1, // Db
  keyScale: "chromatic",
  loop: true,
  tags: ["grounded", "investigation"],
  notes: [
    // Dissonant cluster chords — tritone tension
    // Bar 1: Db-E-Ab cluster (maj7 tension)
    n(49, 0, 4 * T, 50),  // Db3
    n(52, 0, 4 * T, 45),  // E3 (tritone from Bb, creates unease)
    n(56, 0, 4 * T, 40),  // Ab3
    // Bar 2: C-Eb-Gb cluster (diminished feel)
    n(48, 4 * T, 4 * T, 50),  // C3
    n(51, 4 * T, 4 * T, 45),  // Eb3
    n(54, 4 * T, 4 * T, 40),  // Gb3 (tritone from C)
  ],
};

const investigationMotif: Clip = {
  id: "cl-investigation-motif",
  name: "Investigation Clue Pluck",
  lane: "motif",
  instrumentId: "scifi-clue-pluck",
  bpm: 88,
  lengthBeats: 8,
  keyRoot: 1, // Db
  keyScale: "chromatic",
  loop: true,
  tags: ["grounded", "investigation"],
  notes: [
    // Isolated pluck notes — wide spacing, threads being pulled
    n(73, 0, T8, 70),             // Db5 (high, isolated)
    // 2 beats of silence
    n(68, 3 * T, T8, 60),         // Ab4 (answer, lower)
    // 2 beats of silence
    n(76, 6 * T, T8, 65),         // E5 (tritone from Bb, unsettling)
    // Trails off
  ],
};

const investigationAccent: Clip = {
  id: "cl-investigation-accent",
  name: "Investigation Data Glitch",
  lane: "accent",
  instrumentId: "scifi-data-pulse",
  bpm: 88,
  lengthBeats: 8,
  keyRoot: 1, // Db
  keyScale: "chromatic",
  loop: true,
  tags: ["grounded", "investigation"],
  notes: [
    // Secondary data pulse — offset timing, electronic glitch feel
    n(61, T + T8, T16, 40),        // Db4 (offset from main pulse)
    n(64, 3 * T + T16, T16, 35),   // E4 (chromatic neighbor)
    n(61, 5 * T + T8, T16, 42),    // Db4
    n(59, 7 * T, T16, 38),         // B3 (chromatic tension)
  ],
};

// ── Exports ──

/** All 25 Grounded prologue MIDI clips. */
export const GROUNDED_CLIPS: Clip[] = [
  // Ardent (5)
  ardentDrums, ardentBass, ardentHarmony, ardentMotif, ardentAccent,
  // Freeport (5)
  freeportDrums, freeportBass, freeportHarmony, freeportMotif, freeportAccent,
  // Communion (5)
  communionDrums, communionBass, communionHarmony, communionMotif, communionAccent,
  // Combat (5)
  combatDrums, combatBass, combatHarmony, combatMotif, combatAccent,
  // Investigation (5)
  investigationDrums, investigationBass, investigationHarmony, investigationMotif, investigationAccent,
];
