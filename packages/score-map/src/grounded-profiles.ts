// ────────────────────────────────────────────
// Star Freight: Grounded — Score Profiles
// 5 world profiles defining tonal DNA per location/context
// ────────────────────────────────────────────

import type { ScoreProfile, ScoreMapEntry } from "@motif-studio/schema";
import { createScoreProfile } from "./profile.js";
import { createScoreMapEntry } from "./resolve.js";

// ── TCS Ardent — Military carrier, structured authority ──

const ardent: ScoreProfile = {
  ...createScoreProfile("sp-ardent", "TCS Ardent"),
  key: "G",
  scale: "minor",
  tempoMin: 90,
  tempoMax: 110,
  intensityMin: 0.3,
  intensityMax: 0.7,
  preferredInstrumentIds: [
    "scifi-brass-synth",
    "scifi-march-drum",
    "scifi-tension-drone",
    "scifi-alert-stab",
  ],
  samplePaletteTags: ["scifi-military"],
  tags: ["grounded", "act-1", "military"],
  notes:
    "Compact Fleet aesthetic. Structured, hierarchical, heartbeat underneath. " +
    "Harmonic minor for betrayal/court-martial moments. " +
    "Descending strings for the verdict requiem.",
  defaultIntensity: 0.4,
  defaultBrightness: 0.3,
  defaultSpace: 0.4,
  defaultTransitionEnergy: 0.5,
};

// ── Freeport — Frontier station, worn survival ──

const freeport: ScoreProfile = {
  ...createScoreProfile("sp-freeport", "Freeport"),
  key: "D",
  scale: "minor",
  tempoMin: 85,
  tempoMax: 105,
  intensityMin: 0.2,
  intensityMax: 0.6,
  preferredInstrumentIds: [
    "scifi-drone-station",
    "scifi-metal-percussion",
    "scifi-hull-rumble",
    "scifi-reactor-pulse",
  ],
  samplePaletteTags: ["scifi-industrial"],
  tags: ["grounded", "act-2", "frontier"],
  notes:
    "Sable Reach lawlessness. Worn, lived-in, not hostile but not welcoming. " +
    "Dorian mode for crew recruitment warmth. " +
    "Sparse textures — the sound of survival without dignity.",
  defaultIntensity: 0.3,
  defaultBrightness: 0.25,
  defaultSpace: 0.5,
  defaultTransitionEnergy: 0.3,
};

// ── Communion Relay — Keth alien civilization ──

const communion: ScoreProfile = {
  ...createScoreProfile("sp-communion", "Communion Relay"),
  key: "F",
  scale: "phrygian",
  tempoMin: 70,
  tempoMax: 90,
  intensityMin: 0.2,
  intensityMax: 0.8,
  preferredInstrumentIds: [
    "scifi-keth-voice",
    "scifi-keth-bell",
    "scifi-keth-bass",
    "scifi-keth-rhythm",
  ],
  samplePaletteTags: ["scifi-alien"],
  tags: ["grounded", "act-3", "alien", "keth"],
  notes:
    "Organic, bioluminescent, utterly other. Phrygian on F for exotic flat-2 tension. " +
    "Wind instruments suggesting resin-wall communication network. " +
    "Warm but not human — beauty and alienation in equal measure.",
  defaultIntensity: 0.35,
  defaultBrightness: 0.5,
  defaultSpace: 0.7,
  defaultTransitionEnergy: 0.4,
};

// ── Ground Combat — Cross-cutting overlay ──

const combat: ScoreProfile = {
  ...createScoreProfile("sp-combat", "Ground Combat"),
  scale: "minor",
  tempoMin: 120,
  tempoMax: 140,
  intensityMin: 0.6,
  intensityMax: 1.0,
  preferredInstrumentIds: [
    "scifi-brass-synth",
    "scifi-march-drum",
    "scifi-alert-stab",
    "scifi-metal-percussion",
    "scifi-reactor-pulse",
  ],
  samplePaletteTags: ["scifi-military", "scifi-industrial"],
  tags: ["grounded", "combat", "cross-cutting"],
  notes:
    "Cross-cutting combat profile — overlays on world profile via mergeProfiles(). " +
    "Inherits key/scale from active world, overrides tempo and intensity. " +
    "Beat 4 (ambush): designed to lose, desperation. " +
    "Beat 15 (derelict): redemptive, competence returning.",
  defaultIntensity: 0.8,
  defaultBrightness: 0.4,
  defaultSpace: 0.2,
  defaultTransitionEnergy: 0.8,
};

// ── Investigation — Conspiracy thread ──

const investigation: ScoreProfile = {
  ...createScoreProfile("sp-investigation", "Investigation"),
  key: "Db",
  scale: "chromatic",
  tempoMin: 80,
  tempoMax: 95,
  intensityMin: 0.3,
  intensityMax: 0.7,
  preferredInstrumentIds: [
    "scifi-clue-pluck",
    "scifi-mystery-pad",
    "scifi-data-pulse",
    "scifi-suspense-bass",
  ],
  samplePaletteTags: ["scifi-investigation"],
  tags: ["grounded", "investigation", "cross-cutting"],
  notes:
    "Conspiracy blooming. Chromatic for atonal unease, harmonic-minor for darker reveals. " +
    "Electronic glitches suggesting hidden data. Sparse, reverb-heavy. " +
    "Threads being pulled — tension without combat urgency.",
  defaultIntensity: 0.4,
  defaultBrightness: 0.3,
  defaultSpace: 0.6,
  defaultTransitionEnergy: 0.4,
};

// ── Exports ──

/** All 5 Grounded prologue score profiles. */
export const GROUNDED_PROFILES: ScoreProfile[] = [
  ardent,
  freeport,
  communion,
  combat,
  investigation,
];

/** Score map entries linking profiles to world contexts. */
export const GROUNDED_SCORE_MAP: ScoreMapEntry[] = [
  {
    ...createScoreMapEntry("sme-ardent", "TCS Ardent Region", "region"),
    scoreProfileId: "sp-ardent",
    tags: ["grounded", "act-1"],
  },
  {
    ...createScoreMapEntry("sme-freeport", "Freeport Region", "region"),
    scoreProfileId: "sp-freeport",
    tags: ["grounded", "act-2"],
  },
  {
    ...createScoreMapEntry("sme-communion", "Communion Relay Region", "region"),
    scoreProfileId: "sp-communion",
    tags: ["grounded", "act-3"],
  },
  {
    ...createScoreMapEntry("sme-combat", "Ground Combat Encounter", "encounter"),
    scoreProfileId: "sp-combat",
    tags: ["grounded", "combat"],
  },
  {
    ...createScoreMapEntry("sme-investigation", "Investigation Encounter", "encounter"),
    scoreProfileId: "sp-investigation",
    tags: ["grounded", "investigation"],
  },
];

/** Look up a Grounded profile by ID. */
export function getGroundedProfile(id: string): ScoreProfile | undefined {
  return GROUNDED_PROFILES.find((p) => p.id === id);
}
