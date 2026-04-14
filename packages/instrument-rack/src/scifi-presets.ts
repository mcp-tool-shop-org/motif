// ────────────────────────────────────────────
// Sci-fi instrument presets — Star Freight: Grounded aesthetic
// Four categories: Industrial, Military, Alien (Keth), Investigation
// ────────────────────────────────────────────

import type { InstrumentPreset } from "@motif-studio/schema";

/**
 * Sci-fi preset aesthetic tags.
 */
export const SCIFI_TAGS = {
  INDUSTRIAL: "scifi-industrial",
  MILITARY: "scifi-military",
  ALIEN: "scifi-alien",
  INVESTIGATION: "scifi-investigation",
} as const;

export type SciFiTag = (typeof SCIFI_TAGS)[keyof typeof SCIFI_TAGS];

/**
 * Sci-fi instrument presets for adaptive game scoring.
 * Designed for gritty space station, military tension, alien culture,
 * and investigation/mystery aesthetics.
 */
export const SCIFI_PRESETS: InstrumentPreset[] = [
  // ══════════════════════════════════════════
  // INDUSTRIAL — station ambience, metallic texture, gritty
  // ══════════════════════════════════════════

  {
    id: "scifi-drone-station",
    name: "Station Drone",
    category: "pad",
    tags: [SCIFI_TAGS.INDUSTRIAL],
    suggestedScale: "minor",
    suggestedKeyRoot: 2, // D
    params: {
      oscillatorType: "sawtooth",
      attack: 2.0,
      decay: 1.0,
      sustain: 0.6,
      release: 3.0,
      filterFreq: 400,
      filterQ: 2,
      filterType: "lowpass",
      gain: 0.3,
      osc2Waveform: "sawtooth",
      osc2Detune: 25,
      osc2Mix: 0.7,
      unisonVoices: 4,
      unisonSpread: 60,
      lfoRate: 0.05,
      lfoDepth: 0.3,
      lfoWaveform: "sine",
      lfoTarget: "filter",
    },
  },
  {
    id: "scifi-metal-percussion",
    name: "Metallic Hit",
    category: "drums",
    tags: [SCIFI_TAGS.INDUSTRIAL],
    params: {
      oscillatorType: "triangle",
      attack: 0.001,
      decay: 0.15,
      sustain: 0.0,
      release: 0.3,
      filterFreq: 6000,
      filterQ: 8,
      filterType: "bandpass",
      gain: 0.5,
      osc2Waveform: "square",
      osc2Detune: 700,
      osc2Mix: 0.4,
    },
  },
  {
    id: "scifi-hull-rumble",
    name: "Hull Rumble",
    category: "bass",
    tags: [SCIFI_TAGS.INDUSTRIAL],
    suggestedScale: "minor",
    suggestedKeyRoot: 0, // C
    params: {
      oscillatorType: "sawtooth",
      attack: 0.1,
      decay: 0.5,
      sustain: 0.8,
      release: 0.8,
      filterFreq: 200,
      filterQ: 3,
      filterType: "lowpass",
      gain: 0.7,
      subOscMix: 0.8,
      subOscWaveform: "sine",
      lfoRate: 0.15,
      lfoDepth: 0.2,
      lfoWaveform: "sine",
      lfoTarget: "amplitude",
    },
  },
  {
    id: "scifi-reactor-pulse",
    name: "Reactor Pulse",
    category: "pulse",
    tags: [SCIFI_TAGS.INDUSTRIAL],
    params: {
      oscillatorType: "square",
      attack: 0.002,
      decay: 0.06,
      sustain: 0.2,
      release: 0.15,
      filterFreq: 1500,
      filterQ: 4,
      filterType: "lowpass",
      gain: 0.35,
      lfoRate: 2.0,
      lfoDepth: 0.5,
      lfoWaveform: "square",
      lfoTarget: "amplitude",
    },
  },

  // ══════════════════════════════════════════
  // MILITARY — Compact Fleet, tension, brass-like, march
  // ══════════════════════════════════════════

  {
    id: "scifi-brass-synth",
    name: "Fleet Brass",
    category: "lead",
    tags: [SCIFI_TAGS.MILITARY],
    suggestedScale: "minor",
    suggestedKeyRoot: 7, // G
    params: {
      oscillatorType: "sawtooth",
      attack: 0.05,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
      filterFreq: 3000,
      filterQ: 1.5,
      filterType: "lowpass",
      gain: 0.55,
      osc2Waveform: "sawtooth",
      osc2Detune: 5,
      osc2Mix: 0.7,
      unisonVoices: 3,
      unisonSpread: 15,
    },
  },
  {
    id: "scifi-march-drum",
    name: "March Snare",
    category: "drums",
    tags: [SCIFI_TAGS.MILITARY],
    params: {
      oscillatorType: "triangle",
      attack: 0.001,
      decay: 0.12,
      sustain: 0.0,
      release: 0.15,
      filterFreq: 4000,
      filterQ: 1,
      filterType: "highpass",
      gain: 0.6,
      osc2Waveform: "sawtooth",
      osc2Detune: 200,
      osc2Mix: 0.3,
    },
  },
  {
    id: "scifi-tension-drone",
    name: "Tension Drone",
    category: "pad",
    tags: [SCIFI_TAGS.MILITARY],
    suggestedScale: "harmonic-minor",
    suggestedKeyRoot: 4, // E
    params: {
      oscillatorType: "sawtooth",
      attack: 1.5,
      decay: 0.8,
      sustain: 0.5,
      release: 2.5,
      filterFreq: 800,
      filterQ: 3,
      filterType: "lowpass",
      gain: 0.35,
      osc2Waveform: "square",
      osc2Detune: 3,
      osc2Mix: 0.5,
      lfoRate: 0.08,
      lfoDepth: 0.5,
      lfoWaveform: "sine",
      lfoTarget: "filter",
    },
  },
  {
    id: "scifi-alert-stab",
    name: "Alert Stab",
    category: "lead",
    tags: [SCIFI_TAGS.MILITARY],
    params: {
      oscillatorType: "square",
      attack: 0.001,
      decay: 0.1,
      sustain: 0.4,
      release: 0.15,
      filterFreq: 4000,
      filterQ: 2,
      filterType: "lowpass",
      gain: 0.6,
      osc2Waveform: "sawtooth",
      osc2Detune: 10,
      osc2Mix: 0.5,
    },
  },

  // ══════════════════════════════════════════
  // ALIEN (KETH) — organic, microtonal feel, chorus-heavy, harmonic
  // ══════════════════════════════════════════

  {
    id: "scifi-keth-voice",
    name: "Keth Chorus",
    category: "pad",
    tags: [SCIFI_TAGS.ALIEN],
    suggestedScale: "phrygian",
    suggestedKeyRoot: 5, // F
    params: {
      oscillatorType: "sine",
      attack: 1.0,
      decay: 0.6,
      sustain: 0.7,
      release: 2.0,
      filterFreq: 2000,
      filterQ: 0.5,
      filterType: "lowpass",
      gain: 0.4,
      osc2Waveform: "sine",
      osc2Detune: 30, // microtonal shimmer
      osc2Mix: 0.6,
      unisonVoices: 6,
      unisonSpread: 70,
      lfoRate: 0.2,
      lfoDepth: 0.3,
      lfoWaveform: "sine",
      lfoTarget: "pitch",
    },
  },
  {
    id: "scifi-keth-bell",
    name: "Keth Bell",
    category: "lead",
    tags: [SCIFI_TAGS.ALIEN],
    suggestedScale: "phrygian",
    suggestedKeyRoot: 5, // F
    params: {
      oscillatorType: "sine",
      attack: 0.002,
      decay: 0.8,
      sustain: 0.1,
      release: 1.5,
      filterFreq: 5000,
      filterQ: 0.3,
      filterType: "lowpass",
      gain: 0.45,
      osc2Waveform: "sine",
      osc2Detune: 700, // bell-like inharmonic partial
      osc2Mix: 0.3,
    },
  },
  {
    id: "scifi-keth-bass",
    name: "Keth Resonance",
    category: "bass",
    tags: [SCIFI_TAGS.ALIEN],
    suggestedScale: "phrygian",
    suggestedKeyRoot: 5, // F
    params: {
      oscillatorType: "triangle",
      attack: 0.08,
      decay: 0.4,
      sustain: 0.6,
      release: 0.5,
      filterFreq: 500,
      filterQ: 5,
      filterType: "lowpass",
      gain: 0.6,
      subOscMix: 0.4,
      subOscWaveform: "sine",
      lfoRate: 0.3,
      lfoDepth: 0.4,
      lfoWaveform: "sine",
      lfoTarget: "filter",
    },
  },
  {
    id: "scifi-keth-rhythm",
    name: "Keth Pulse",
    category: "pulse",
    tags: [SCIFI_TAGS.ALIEN],
    params: {
      oscillatorType: "sine",
      attack: 0.005,
      decay: 0.15,
      sustain: 0.2,
      release: 0.3,
      filterFreq: 3000,
      filterQ: 1,
      filterType: "lowpass",
      gain: 0.3,
      osc2Waveform: "sine",
      osc2Detune: 500, // organic metallic overtone
      osc2Mix: 0.2,
    },
  },

  // ══════════════════════════════════════════
  // INVESTIGATION — sparse, reverb-heavy, chromatic, mystery
  // ══════════════════════════════════════════

  {
    id: "scifi-clue-pluck",
    name: "Clue Pluck",
    category: "lead",
    tags: [SCIFI_TAGS.INVESTIGATION],
    suggestedScale: "chromatic",
    params: {
      oscillatorType: "triangle",
      attack: 0.001,
      decay: 0.5,
      sustain: 0.05,
      release: 1.0,
      filterFreq: 3500,
      filterQ: 1,
      filterType: "lowpass",
      gain: 0.4,
    },
  },
  {
    id: "scifi-mystery-pad",
    name: "Mystery Pad",
    category: "pad",
    tags: [SCIFI_TAGS.INVESTIGATION],
    suggestedScale: "harmonic-minor",
    suggestedKeyRoot: 1, // Db
    params: {
      oscillatorType: "sine",
      attack: 2.0,
      decay: 1.0,
      sustain: 0.4,
      release: 3.5,
      filterFreq: 1000,
      filterQ: 1,
      filterType: "lowpass",
      gain: 0.25,
      osc2Waveform: "triangle",
      osc2Detune: 15,
      osc2Mix: 0.5,
      unisonVoices: 3,
      unisonSpread: 40,
      lfoRate: 0.07,
      lfoDepth: 0.4,
      lfoWaveform: "sine",
      lfoTarget: "filter",
    },
  },
  {
    id: "scifi-data-pulse",
    name: "Data Stream",
    category: "pulse",
    tags: [SCIFI_TAGS.INVESTIGATION],
    params: {
      oscillatorType: "square",
      attack: 0.001,
      decay: 0.04,
      sustain: 0.1,
      release: 0.05,
      filterFreq: 5000,
      filterQ: 2,
      filterType: "bandpass",
      gain: 0.2,
      lfoRate: 4.0,
      lfoDepth: 0.3,
      lfoWaveform: "square",
      lfoTarget: "amplitude",
    },
  },
  {
    id: "scifi-suspense-bass",
    name: "Suspense Bass",
    category: "bass",
    tags: [SCIFI_TAGS.INVESTIGATION],
    suggestedScale: "chromatic",
    params: {
      oscillatorType: "sine",
      attack: 0.3,
      decay: 0.5,
      sustain: 0.5,
      release: 1.0,
      filterFreq: 300,
      filterQ: 2,
      filterType: "lowpass",
      gain: 0.5,
      subOscMix: 0.6,
      subOscWaveform: "sine",
    },
  },
];
