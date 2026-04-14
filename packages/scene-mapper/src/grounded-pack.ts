// ────────────────────────────────────────────
// Star Freight: Grounded — Adaptive Music Pack
// 12 scenes, 14 bindings, 8 stingers, 13 transitions
// ────────────────────────────────────────────

import type {
  Scene,
  SceneClipRef,
  TriggerBinding,
  Stinger,
  TransitionRule,
  SoundtrackPack,
} from "@motif-studio/schema";
import { GROUNDED_CLIPS } from "./grounded-clips.js";
import { GROUNDED_CUES } from "./grounded-cues.js";
import {
  GROUNDED_CUE_FAMILIES,
  GROUNDED_MOTIF_FAMILIES,
  GROUNDED_PROFILES,
  GROUNDED_SCORE_MAP,
} from "@motif-studio/score-map";

// ── Placeholder stem (kept for pack validity) ──

const L = [{ stemId: "s-placeholder" }] as const;

// ── Clip layer mappings per world ──

function worldClips(prefix: string, intensity?: SceneClipRef["intensity"]): SceneClipRef[] {
  return [
    { clipId: `cl-${prefix}-drums`, order: 0 },
    { clipId: `cl-${prefix}-bass`, order: 1 },
    { clipId: `cl-${prefix}-harmony`, order: 2 },
    { clipId: `cl-${prefix}-motif`, order: 3, intensity },
    { clipId: `cl-${prefix}-accent`, order: 4, mutedByDefault: true },
  ];
}

// ══════════════════════════════════════════
// SCENES — 12 scenes covering 16 prologue beats
// ══════════════════════════════════════════

export const GROUNDED_SCENES: Scene[] = [
  // ── Act 1: The Fall (TCS Ardent) ──
  {
    id: "sc-ardent-ready",
    name: "Ardent Ready Room",
    category: "safe-zone",
    layers: [...L],
    clipLayers: worldClips("ardent"),
    emotion: { valence: 0.3, arousal: 0.2, label: "composure" },
    tags: ["grounded", "act-1", "ardent"],
  },
  {
    id: "sc-ardent-sweep",
    name: "Ardent Sweep",
    category: "tension",
    layers: [...L],
    clipLayers: worldClips("ardent", "mid"),
    emotion: { valence: -0.2, arousal: 0.4, label: "unease" },
    tags: ["grounded", "act-1", "ardent"],
  },
  {
    id: "sc-ambush",
    name: "Ambush Combat",
    category: "combat",
    layers: [...L],
    clipLayers: worldClips("combat"),
    emotion: { valence: -0.7, arousal: 0.9, label: "desperation" },
    tags: ["grounded", "act-1", "combat"],
  },
  {
    id: "sc-court-martial",
    name: "Court Martial",
    category: "tension",
    layers: [...L],
    clipLayers: worldClips("ardent", "low"),
    emotion: { valence: -0.9, arousal: 0.3, label: "requiem" },
    tags: ["grounded", "act-1", "ardent"],
  },

  // ── Act 2: Rock Bottom (Freeport) ──
  {
    id: "sc-freeport",
    name: "Freeport",
    category: "exploration",
    layers: [...L],
    clipLayers: worldClips("freeport"),
    emotion: { valence: -0.6, arousal: -0.3, label: "sorrow" },
    tags: ["grounded", "act-2", "freeport"],
  },
  {
    id: "sc-contracts",
    name: "Contracts",
    category: "exploration",
    layers: [...L],
    clipLayers: worldClips("freeport", "mid"),
    emotion: { valence: -0.3, arousal: 0.2, label: "resolve" },
    tags: ["grounded", "act-2", "freeport"],
  },
  {
    id: "sc-crew",
    name: "Crew Recruitment",
    category: "safe-zone",
    layers: [...L],
    clipLayers: worldClips("freeport", "low"),
    emotion: { valence: 0.1, arousal: 0.2, label: "hope" },
    tags: ["grounded", "act-2", "freeport"],
  },
  {
    id: "sc-lane",
    name: "Lane Travel",
    category: "exploration",
    layers: [...L],
    clipLayers: worldClips("freeport"),
    emotion: { valence: 0.2, arousal: 0.1, label: "openness" },
    tags: ["grounded", "act-2", "lane"],
  },

  // ── Act 3: First Light (Communion Relay) ──
  {
    id: "sc-communion",
    name: "Communion Relay",
    category: "exploration",
    layers: [...L],
    clipLayers: worldClips("communion"),
    emotion: { valence: 0.6, arousal: 0.5, label: "wonder" },
    tags: ["grounded", "act-3", "communion", "keth"],
  },
  {
    id: "sc-investigation",
    name: "Investigation",
    category: "tension",
    layers: [...L],
    clipLayers: worldClips("investigation"),
    emotion: { valence: -0.2, arousal: 0.6, label: "mystery" },
    tags: ["grounded", "act-3", "investigation"],
  },
  {
    id: "sc-patrol",
    name: "Compact Patrol",
    category: "tension",
    layers: [...L],
    clipLayers: worldClips("ardent", "high"),
    emotion: { valence: -0.4, arousal: 0.5, label: "threat" },
    tags: ["grounded", "act-3", "compact"],
  },
  {
    id: "sc-derelict",
    name: "Derelict Combat",
    category: "combat",
    layers: [...L],
    clipLayers: worldClips("combat"),
    emotion: { valence: 0.3, arousal: 0.8, label: "redemption" },
    tags: ["grounded", "act-3", "combat"],
  },
];

// ══════════════════════════════════════════
// BINDINGS — 14 trigger bindings, priority-ordered
// ══════════════════════════════════════════

export const GROUNDED_BINDINGS: TriggerBinding[] = [
  // Priority 60: Combat overrides everything
  {
    id: "b-ambush",
    name: "Ambush Combat",
    sceneId: "sc-ambush",
    conditions: [
      { field: "location", op: "eq", value: "ardent" },
      { field: "combat_active", op: "eq", value: true },
    ],
    priority: 60,
  },
  {
    id: "b-derelict",
    name: "Derelict Combat",
    sceneId: "sc-derelict",
    conditions: [
      { field: "location", op: "eq", value: "derelict" },
      { field: "combat_active", op: "eq", value: true },
    ],
    priority: 60,
  },

  // Priority 45: Investigation overrides location
  {
    id: "b-investigation",
    name: "Investigation Active",
    sceneId: "sc-investigation",
    conditions: [
      { field: "investigation_active", op: "eq", value: true },
    ],
    priority: 45,
  },

  // Priority 42: Patrol intercept
  {
    id: "b-patrol",
    name: "Compact Patrol",
    sceneId: "sc-patrol",
    conditions: [
      { field: "patrol_intercept", op: "eq", value: true },
    ],
    priority: 42,
  },

  // Priority 40: Court martial
  {
    id: "b-court-martial",
    name: "Court Martial Verdict",
    sceneId: "sc-court-martial",
    conditions: [
      { field: "court_martial", op: "eq", value: "guilty" },
    ],
    priority: 40,
  },

  // Priority 25: Freeport sub-states
  {
    id: "b-contracts",
    name: "Contract Browsing",
    sceneId: "sc-contracts",
    conditions: [
      { field: "location", op: "eq", value: "freeport" },
      { field: "contracts_active", op: "eq", value: true },
    ],
    priority: 25,
  },
  {
    id: "b-crew",
    name: "Crew Recruitment",
    sceneId: "sc-crew",
    conditions: [
      { field: "location", op: "eq", value: "freeport" },
      { field: "crew_recruiting", op: "eq", value: true },
    ],
    priority: 25,
  },

  // Priority 22: Ardent alert state
  {
    id: "b-ardent-sweep",
    name: "Ardent Sweep",
    sceneId: "sc-ardent-sweep",
    conditions: [
      { field: "location", op: "eq", value: "ardent" },
      { field: "alert_level", op: "gt", value: 0.2 },
    ],
    priority: 22,
  },

  // Priority 20: Location defaults
  {
    id: "b-ardent",
    name: "Ardent Default",
    sceneId: "sc-ardent-ready",
    conditions: [
      { field: "location", op: "eq", value: "ardent" },
    ],
    priority: 20,
  },
  {
    id: "b-freeport",
    name: "Freeport Default",
    sceneId: "sc-freeport",
    conditions: [
      { field: "location", op: "eq", value: "freeport" },
    ],
    priority: 20,
  },
  {
    id: "b-communion",
    name: "Communion Default",
    sceneId: "sc-communion",
    conditions: [
      { field: "location", op: "eq", value: "communion_relay" },
    ],
    priority: 20,
  },
  {
    id: "b-lane",
    name: "Lane Travel",
    sceneId: "sc-lane",
    conditions: [
      { field: "location", op: "eq", value: "lane" },
    ],
    priority: 20,
  },
  {
    id: "b-lane-derelict",
    name: "Derelict Approach",
    sceneId: "sc-lane",
    conditions: [
      { field: "location", op: "eq", value: "derelict" },
      { field: "combat_active", op: "eq", value: false },
    ],
    priority: 20,
  },
  {
    id: "b-closing",
    name: "Closing — Threshold View",
    sceneId: "sc-lane",
    conditions: [
      { field: "location", op: "eq", value: "threshold_view" },
    ],
    priority: 20,
  },
];

// ══════════════════════════════════════════
// STINGERS — 8 one-shot event punctuation
// ══════════════════════════════════════════

export const GROUNDED_STINGERS: Stinger[] = [
  {
    id: "st-ambush-drop",
    name: "Ambush Drop",
    assetId: "sfx-ambush",
    conditions: [
      { field: "combat_active", op: "eq", value: true },
      { field: "location", op: "eq", value: "ardent" },
    ],
    priority: 25,
    duckDb: -6,
    fadeInMs: 50,
    fadeOutMs: 300,
    cooldownMs: 15000,
    tags: ["grounded", "combat", "act-1"],
  },
  {
    id: "st-wingmate-death",
    name: "Wingmate Death",
    assetId: "sfx-casualty",
    conditions: [
      { field: "casualty", op: "eq", value: true },
    ],
    priority: 35,
    duckDb: -10,
    fadeInMs: 0,
    fadeOutMs: 800,
    cooldownMs: 30000,
    tags: ["grounded", "trauma", "act-1"],
  },
  {
    id: "st-verdict",
    name: "Verdict",
    assetId: "sfx-verdict",
    conditions: [
      { field: "court_martial", op: "eq", value: "guilty" },
    ],
    priority: 40,
    duckDb: -12,
    fadeInMs: 0,
    fadeOutMs: 1500,
    cooldownMs: 60000,
    tags: ["grounded", "requiem", "act-1"],
  },
  {
    id: "st-keth-contact",
    name: "Keth First Contact",
    assetId: "sfx-keth",
    conditions: [
      { field: "location", op: "eq", value: "communion_relay" },
      { field: "first_contact", op: "eq", value: true },
    ],
    priority: 30,
    duckDb: -8,
    fadeInMs: 100,
    fadeOutMs: 500,
    cooldownMs: 10000,
    tags: ["grounded", "keth", "act-3"],
  },
  {
    id: "st-discovery",
    name: "Discovery",
    assetId: "sfx-discovery",
    conditions: [
      { field: "investigation_active", op: "eq", value: true },
    ],
    priority: 20,
    duckDb: -4,
    fadeInMs: 50,
    fadeOutMs: 400,
    cooldownMs: 8000,
    tags: ["grounded", "investigation"],
  },
  {
    id: "st-patrol-hail",
    name: "Patrol Hail",
    assetId: "sfx-patrol",
    conditions: [
      { field: "patrol_intercept", op: "eq", value: true },
    ],
    priority: 15,
    duckDb: -3,
    fadeInMs: 0,
    fadeOutMs: 200,
    cooldownMs: 20000,
    tags: ["grounded", "compact", "act-3"],
  },
  {
    id: "st-combat-victory",
    name: "Combat Victory",
    assetId: "sfx-victory",
    conditions: [
      { field: "victory", op: "eq", value: true },
    ],
    priority: 25,
    duckDb: -6,
    fadeInMs: 0,
    fadeOutMs: 600,
    cooldownMs: 15000,
    tags: ["grounded", "combat"],
  },
  {
    id: "st-threshold",
    name: "Threshold",
    assetId: "sfx-threshold",
    conditions: [
      { field: "location", op: "eq", value: "threshold_view" },
    ],
    priority: 30,
    duckDb: -8,
    fadeInMs: 200,
    fadeOutMs: 1000,
    cooldownMs: 60000,
    tags: ["grounded", "closing"],
  },
];

// ══════════════════════════════════════════
// TRANSITIONS — 13 scene-to-scene rules
// ══════════════════════════════════════════

export const GROUNDED_TRANSITIONS: TransitionRule[] = [
  // Act 1 flow
  {
    id: "tr-ready-sweep",
    name: "Ready Room → Sweep",
    fromSceneId: "sc-ardent-ready",
    toSceneId: "sc-ardent-sweep",
    mode: "crossfade",
    durationMs: 2000,
    notes: "Unease creeps in as alert level rises",
  },
  {
    id: "tr-sweep-ambush",
    name: "Sweep → Ambush",
    fromSceneId: "sc-ardent-sweep",
    toSceneId: "sc-ambush",
    mode: "stinger-then-switch",
    stingerAssetId: "sfx-ambush",
    notes: "st-ambush-drop fires, then combat music hits",
  },
  {
    id: "tr-ambush-court",
    name: "Ambush → Court Martial",
    fromSceneId: "sc-ambush",
    toSceneId: "sc-court-martial",
    mode: "cooldown-fade",
    durationMs: 3000,
    notes: "Silence before judgment — 3s fade into requiem",
  },
  {
    id: "tr-court-freeport",
    name: "Court Martial → Freeport",
    fromSceneId: "sc-court-martial",
    toSceneId: "sc-freeport",
    mode: "crossfade",
    durationMs: 4000,
    notes: "6-month time skip — slow dissolve into frontier",
  },

  // Act 2 flow
  {
    id: "tr-freeport-contracts",
    name: "Freeport → Contracts",
    fromSceneId: "sc-freeport",
    toSceneId: "sc-contracts",
    mode: "crossfade",
    durationMs: 1000,
    notes: "Subtle agency shift as player browses board",
  },
  {
    id: "tr-contracts-crew",
    name: "Contracts → Crew",
    fromSceneId: "sc-contracts",
    toSceneId: "sc-crew",
    mode: "crossfade",
    durationMs: 1500,
    notes: "Warmth entering — partnership forming",
  },
  {
    id: "tr-crew-lane",
    name: "Crew → Lane Travel",
    fromSceneId: "sc-crew",
    toSceneId: "sc-lane",
    mode: "bar-sync",
    notes: "Wait for bar boundary, then open up into space",
  },

  // Act 3 flow
  {
    id: "tr-lane-communion",
    name: "Lane → Communion Relay",
    fromSceneId: "sc-lane",
    toSceneId: "sc-communion",
    mode: "crossfade",
    durationMs: 3000,
    notes: "Scale shift: D minor → F phrygian — alien world opens",
  },
  {
    id: "tr-communion-investigation",
    name: "Communion → Investigation",
    fromSceneId: "sc-communion",
    toSceneId: "sc-investigation",
    mode: "crossfade",
    durationMs: 2000,
    notes: "Tension threading into wonder — Tessik approaches",
  },
  {
    id: "tr-investigation-patrol",
    name: "Investigation → Patrol",
    fromSceneId: "sc-investigation",
    toSceneId: "sc-patrol",
    mode: "stinger-then-switch",
    stingerAssetId: "sfx-patrol",
    notes: "st-patrol-hail fires, authority theme takes over",
  },
  {
    id: "tr-patrol-derelict",
    name: "Patrol → Derelict",
    fromSceneId: "sc-patrol",
    toSceneId: "sc-derelict",
    mode: "stinger-then-switch",
    stingerAssetId: "sfx-ambush",
    notes: "Combat re-entry — distress beacon triggers action",
  },
  {
    id: "tr-derelict-lane",
    name: "Derelict → Lane (Victory)",
    fromSceneId: "sc-derelict",
    toSceneId: "sc-lane",
    mode: "cooldown-fade",
    durationMs: 2500,
    notes: "Victory settling into reflection — closing viewport",
  },

  // Cross-cutting: Freeport combat (if it happens)
  {
    id: "tr-freeport-ambush",
    name: "Freeport → Combat",
    fromSceneId: "sc-freeport",
    toSceneId: "sc-ambush",
    mode: "stinger-then-switch",
    stingerAssetId: "sfx-ambush",
    notes: "Freeport combat variant — if combat triggers at station",
  },
];

// ══════════════════════════════════════════
// PACK BUILDER
// ══════════════════════════════════════════

/** Assemble the full Grounded prologue SoundtrackPack skeleton. */
export function buildGroundedPack(): SoundtrackPack {
  return {
    meta: {
      id: "star-freight-grounded",
      name: "Star Freight: Grounded — Prologue Score",
      version: "0.1.0",
      description:
        "Adaptive soundtrack pack for the Grounded prologue. " +
        "3 acts, 12 scenes, 14 bindings, 8 stingers, 13 transitions.",
      author: "mcp-tool-shop",
      tags: ["star-freight", "grounded", "prologue", "adaptive"],
      schemaVersion: "1",
    },
    assets: [
      // Placeholder assets for stinger references
      { id: "sfx-ambush", name: "Ambush Stinger", src: "stingers/ambush.ogg", kind: "stinger", durationMs: 2000 },
      { id: "sfx-casualty", name: "Casualty Stinger", src: "stingers/casualty.ogg", kind: "stinger", durationMs: 3000 },
      { id: "sfx-verdict", name: "Verdict Stinger", src: "stingers/verdict.ogg", kind: "stinger", durationMs: 4000 },
      { id: "sfx-keth", name: "Keth Contact Stinger", src: "stingers/keth.ogg", kind: "stinger", durationMs: 3000 },
      { id: "sfx-discovery", name: "Discovery Stinger", src: "stingers/discovery.ogg", kind: "stinger", durationMs: 2000 },
      { id: "sfx-patrol", name: "Patrol Hail Stinger", src: "stingers/patrol.ogg", kind: "stinger", durationMs: 1500 },
      { id: "sfx-victory", name: "Victory Stinger", src: "stingers/victory.ogg", kind: "stinger", durationMs: 2500 },
      { id: "sfx-threshold", name: "Threshold Stinger", src: "stingers/threshold.ogg", kind: "stinger", durationMs: 4000 },
      { id: "a-placeholder", name: "Placeholder Loop", src: "placeholder.ogg", kind: "loop", durationMs: 30000 },
    ],
    stems: [
      { id: "s-placeholder", name: "Placeholder Stem", assetId: "a-placeholder", role: "base", loop: true },
    ],
    scenes: GROUNDED_SCENES,
    bindings: GROUNDED_BINDINGS,
    transitions: GROUNDED_TRANSITIONS,
    stingers: GROUNDED_STINGERS,
    clips: GROUNDED_CLIPS,
    cues: GROUNDED_CUES,
    cueFamilies: GROUNDED_CUE_FAMILIES,
    motifFamilies: GROUNDED_MOTIF_FAMILIES,
    scoreProfiles: GROUNDED_PROFILES,
    scoreMap: GROUNDED_SCORE_MAP,
  } as SoundtrackPack;
}
