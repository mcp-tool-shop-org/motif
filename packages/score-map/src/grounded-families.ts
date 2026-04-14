// ────────────────────────────────────────────
// Star Freight: Grounded — Cue Families & Motif Families
// 6 cue families + 6 motif families linking scenes to thematic material
// ────────────────────────────────────────────

import type { CueFamily, MotifFamily } from "@motif-studio/schema";
import { createCueFamily, addSceneToCueFamily, linkMotifToCueFamily } from "./cue-family.js";
import { createMotifFamily, linkScene } from "./motif.js";

// ══════════════════════════════════════════
// MOTIF FAMILIES — 6 thematic threads
// sourceIds reference clip IDs from grounded-clips.ts
// ══════════════════════════════════════════

/** Military march motif — structured authority, heartbeat */
let mfMilitary = createMotifFamily("mf-military", "Military March", [
  "cl-ardent-motif",
  "cl-ardent-drums",
  "cl-ardent-harmony",
]);
mfMilitary = linkScene(mfMilitary, "sc-ardent-ready");
mfMilitary = linkScene(mfMilitary, "sc-ardent-sweep");
mfMilitary = linkScene(mfMilitary, "sc-court-martial");
mfMilitary = linkScene(mfMilitary, "sc-patrol");
mfMilitary = { ...mfMilitary, tags: ["grounded", "military"], notes: "G minor brass theme — competence, hierarchy, and its betrayal" };

/** Frontier survival motif — worn, sparse, pragmatic */
let mfFrontier = createMotifFamily("mf-frontier", "Frontier Survival", [
  "cl-freeport-motif",
  "cl-freeport-harmony",
  "cl-freeport-bass",
]);
mfFrontier = linkScene(mfFrontier, "sc-freeport");
mfFrontier = linkScene(mfFrontier, "sc-contracts");
mfFrontier = linkScene(mfFrontier, "sc-lane");
mfFrontier = { ...mfFrontier, tags: ["grounded", "frontier"], notes: "D minor reactor pulse — survival without dignity, engine hum" };

/** Combat action motif — driving urgency */
let mfCombat = createMotifFamily("mf-combat", "Combat Drive", [
  "cl-combat-motif",
  "cl-combat-drums",
  "cl-combat-bass",
]);
mfCombat = linkScene(mfCombat, "sc-ambush");
mfCombat = linkScene(mfCombat, "sc-derelict");
mfCombat = { ...mfCombat, tags: ["grounded", "combat"], notes: "130 BPM brass riff — syncopated urgency, competence under fire" };

/** Keth alien motif — organic, phrygian wonder */
let mfKeth = createMotifFamily("mf-keth", "Keth Communion", [
  "cl-communion-motif",
  "cl-communion-harmony",
  "cl-communion-bass",
]);
mfKeth = linkScene(mfKeth, "sc-communion");
mfKeth = { ...mfKeth, tags: ["grounded", "keth", "alien"], notes: "F phrygian bell melody — first contact, beauty and alienation" };

/** Investigation motif — conspiracy threads */
let mfInvestigation = createMotifFamily("mf-investigation", "Conspiracy Thread", [
  "cl-investigation-motif",
  "cl-investigation-harmony",
  "cl-investigation-bass",
]);
mfInvestigation = linkScene(mfInvestigation, "sc-investigation");
mfInvestigation = { ...mfInvestigation, tags: ["grounded", "investigation"], notes: "Db chromatic plucks — isolated, wide-spaced, threads being pulled" };

/** Crew bond motif — partnership warmth */
let mfCrew = createMotifFamily("mf-crew", "Crew Bond", [
  "cl-freeport-harmony", // shared with frontier — pragmatic partnership born from survival
  "cl-freeport-motif",
]);
mfCrew = linkScene(mfCrew, "sc-crew");
mfCrew = linkScene(mfCrew, "sc-lane");
mfCrew = { ...mfCrew, tags: ["grounded", "crew"], notes: "D dorian warmth emerging from frontier despair — two broken things finding utility" };

// ══════════════════════════════════════════
// CUE FAMILIES — 6 semantic groupings
// ══════════════════════════════════════════

/** Military — Ardent authority scenes */
let cfMilitary = createCueFamily("cf-military", "Military Authority", "tension");
cfMilitary = addSceneToCueFamily(cfMilitary, "sc-ardent-ready");
cfMilitary = addSceneToCueFamily(cfMilitary, "sc-ardent-sweep");
cfMilitary = addSceneToCueFamily(cfMilitary, "sc-court-martial");
cfMilitary = addSceneToCueFamily(cfMilitary, "sc-patrol");
cfMilitary = linkMotifToCueFamily(cfMilitary, "mf-military");
cfMilitary = {
  ...cfMilitary,
  scoreProfileId: "sp-ardent",
  emotion: { valence: -0.2, arousal: 0.4, label: "authority" },
  tags: ["grounded", "act-1"],
  notes: "Compact Fleet scenes — structured, hierarchical, heartbeat underneath",
};

/** Frontier — Freeport survival scenes */
let cfFrontier = createCueFamily("cf-frontier", "Frontier Survival", "exploration");
cfFrontier = addSceneToCueFamily(cfFrontier, "sc-freeport");
cfFrontier = addSceneToCueFamily(cfFrontier, "sc-contracts");
cfFrontier = addSceneToCueFamily(cfFrontier, "sc-lane");
cfFrontier = linkMotifToCueFamily(cfFrontier, "mf-frontier");
cfFrontier = {
  ...cfFrontier,
  scoreProfileId: "sp-freeport",
  emotion: { valence: -0.3, arousal: 0.0, label: "survival" },
  tags: ["grounded", "act-2"],
  notes: "Sable Reach scenes — worn, functional, sparse but alive",
};

/** Combat — cross-cutting action scenes */
let cfCombat = createCueFamily("cf-combat", "Ground Combat", "combat");
cfCombat = addSceneToCueFamily(cfCombat, "sc-ambush");
cfCombat = addSceneToCueFamily(cfCombat, "sc-derelict");
cfCombat = linkMotifToCueFamily(cfCombat, "mf-combat");
cfCombat = {
  ...cfCombat,
  scoreProfileId: "sp-combat",
  emotion: { valence: -0.2, arousal: 0.85, label: "action" },
  tags: ["grounded", "combat"],
  notes: "Both combat encounters — ambush (desperation) and derelict (redemption)",
};

/** Keth — Communion alien wonder */
let cfKeth = createCueFamily("cf-keth", "Keth Communion", "mystery");
cfKeth = addSceneToCueFamily(cfKeth, "sc-communion");
cfKeth = linkMotifToCueFamily(cfKeth, "mf-keth");
cfKeth = {
  ...cfKeth,
  scoreProfileId: "sp-communion",
  emotion: { valence: 0.6, arousal: 0.5, label: "wonder" },
  tags: ["grounded", "act-3", "keth"],
  notes: "Communion Relay — organic, bioluminescent, phrygian alien culture",
};

/** Investigation — conspiracy thread */
let cfInvestigation = createCueFamily("cf-investigation", "Investigation", "tension");
cfInvestigation = addSceneToCueFamily(cfInvestigation, "sc-investigation");
cfInvestigation = linkMotifToCueFamily(cfInvestigation, "mf-investigation");
cfInvestigation = {
  ...cfInvestigation,
  scoreProfileId: "sp-investigation",
  emotion: { valence: -0.2, arousal: 0.6, label: "mystery" },
  tags: ["grounded", "investigation"],
  notes: "Conspiracy scenes — chromatic unease, data fragments, Solen's code",
};

/** Crew — partnership and hope */
let cfCrew = createCueFamily("cf-crew", "Crew Bond", "recovery");
cfCrew = addSceneToCueFamily(cfCrew, "sc-crew");
cfCrew = addSceneToCueFamily(cfCrew, "sc-lane");
cfCrew = linkMotifToCueFamily(cfCrew, "mf-crew");
cfCrew = linkMotifToCueFamily(cfCrew, "mf-frontier"); // crew emerges from frontier
cfCrew = {
  ...cfCrew,
  scoreProfileId: "sp-freeport",
  emotion: { valence: 0.15, arousal: 0.15, label: "hope" },
  tags: ["grounded", "act-2", "crew"],
  notes: "Partnership forming — pragmatic bond, first non-transactional connection",
};

// ── Exports ──

/** All 6 Grounded motif families. */
export const GROUNDED_MOTIF_FAMILIES: MotifFamily[] = [
  mfMilitary, mfFrontier, mfCombat, mfKeth, mfInvestigation, mfCrew,
];

/** All 6 Grounded cue families. */
export const GROUNDED_CUE_FAMILIES: CueFamily[] = [
  cfMilitary, cfFrontier, cfCombat, cfKeth, cfInvestigation, cfCrew,
];
