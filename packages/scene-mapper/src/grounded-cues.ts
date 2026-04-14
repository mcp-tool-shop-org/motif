// ────────────────────────────────────────────
// Star Freight: Grounded — Cue Structures
// 12 cues mapping the prologue's 16-beat narrative arc
// Each cue defines section flow (intro/body/escalation/climax/outro)
// ────────────────────────────────────────────

import type { Cue } from "@motif-studio/schema";

// ══════════════════════════════════════════
// ACT 1: THE FALL — TCS Ardent
// ══════════════════════════════════════════

/** Beats 1-3: Ready room camaraderie, routine competence */
const cueArdentReady: Cue = {
  id: "cue-ardent-ready",
  name: "The Last Good Day",
  bpm: 100,
  beatsPerBar: 4,
  keyRoot: 7, // G
  keyScale: "minor",
  sections: [
    { id: "arr-intro", name: "Corridor", role: "intro", durationBars: 4, sceneId: "sc-ardent-ready", intensity: "low" },
    { id: "arr-body", name: "Ready Room", role: "body", durationBars: 8, sceneId: "sc-ardent-ready", intensity: "mid" },
    { id: "arr-outro", name: "Brief Ends", role: "outro", durationBars: 4, sceneId: "sc-ardent-ready", intensity: "low" },
  ],
  emotion: { valence: 0.3, arousal: 0.2, label: "composure" },
  tags: ["grounded", "act-1"],
};

/** Beat 2: Sweep — growing unease at dark relay station */
const cueArdentSweep: Cue = {
  id: "cue-ardent-sweep",
  name: "The Sweep",
  bpm: 100,
  beatsPerBar: 4,
  keyRoot: 7,
  keyScale: "minor",
  sections: [
    { id: "asw-intro", name: "Station Approach", role: "intro", durationBars: 4, sceneId: "sc-ardent-sweep", intensity: "low" },
    { id: "asw-body", name: "Something Wrong", role: "body", durationBars: 6, sceneId: "sc-ardent-sweep", intensity: "mid" },
    { id: "asw-esc", name: "Evidence Found", role: "escalation", durationBars: 4, sceneId: "sc-ardent-sweep", intensity: "high" },
    { id: "asw-outro", name: "Report Back", role: "outro", durationBars: 2, sceneId: "sc-ardent-sweep", intensity: "mid" },
  ],
  emotion: { valence: -0.2, arousal: 0.4, label: "unease" },
  tags: ["grounded", "act-1"],
};

/** Beat 4: Ambush — tutorial combat, designed to lose */
const cueAmbush: Cue = {
  id: "cue-ambush",
  name: "The Ambush",
  bpm: 130,
  beatsPerBar: 4,
  keyRoot: 7,
  keyScale: "minor",
  sections: [
    { id: "amb-intro", name: "Drop", role: "intro", durationBars: 2, sceneId: "sc-ambush", intensity: "mid", transitionMode: "stinger-then-switch" },
    { id: "amb-body", name: "Engagement", role: "body", durationBars: 6, sceneId: "sc-ambush", intensity: "high" },
    { id: "amb-climax", name: "Overrun", role: "climax", durationBars: 4, sceneId: "sc-ambush", intensity: "high" },
    { id: "amb-outro", name: "Wingmate Falls", role: "outro", durationBars: 4, sceneId: "sc-ambush", intensity: "low" },
  ],
  emotion: { valence: -0.7, arousal: 0.9, label: "desperation" },
  tags: ["grounded", "act-1", "combat"],
};

/** Beat 5: Court martial — identity death, requiem */
const cueCourtMartial: Cue = {
  id: "cue-court-martial",
  name: "The Verdict",
  bpm: 100,
  beatsPerBar: 4,
  keyRoot: 7,
  keyScale: "harmonic-minor",
  sections: [
    { id: "cm-intro", name: "Tribunal Assembles", role: "intro", durationBars: 4, sceneId: "sc-court-martial", intensity: "low" },
    { id: "cm-body", name: "Charges Read", role: "body", durationBars: 8, sceneId: "sc-court-martial", intensity: "mid" },
    { id: "cm-climax", name: "Guilty", role: "climax", durationBars: 4, sceneId: "sc-court-martial", intensity: "high" },
    { id: "cm-outro", name: "Identity Dies", role: "outro", durationBars: 8, sceneId: "sc-court-martial", intensity: "low", transitionMode: "cooldown-fade" },
  ],
  emotion: { valence: -0.9, arousal: 0.3, label: "requiem" },
  tags: ["grounded", "act-1"],
};

// ══════════════════════════════════════════
// ACT 2: ROCK BOTTOM — Freeport
// ══════════════════════════════════════════

/** Beats 6-7: Freeport arrival — desperation, worn frontier */
const cueFreeport: Cue = {
  id: "cue-freeport",
  name: "Rock Bottom",
  bpm: 95,
  beatsPerBar: 4,
  keyRoot: 2, // D
  keyScale: "minor",
  sections: [
    { id: "fp-intro", name: "Bunk Wakes", role: "intro", durationBars: 4, sceneId: "sc-freeport", intensity: "low" },
    { id: "fp-body", name: "Station Walk", role: "body", durationBars: 12, sceneId: "sc-freeport", intensity: "mid" },
    { id: "fp-outro", name: "200 Credits", role: "outro", durationBars: 4, sceneId: "sc-freeport", intensity: "low" },
  ],
  emotion: { valence: -0.6, arousal: -0.3, label: "sorrow" },
  tags: ["grounded", "act-2"],
};

/** Beat 8: Contracts — agency returning */
const cueContracts: Cue = {
  id: "cue-contracts",
  name: "First Contract",
  bpm: 95,
  beatsPerBar: 4,
  keyRoot: 2,
  keyScale: "minor",
  sections: [
    { id: "ct-intro", name: "Contract Board", role: "intro", durationBars: 4, sceneId: "sc-contracts", intensity: "low" },
    { id: "ct-body", name: "Weighing Options", role: "body", durationBars: 8, sceneId: "sc-contracts", intensity: "mid" },
    { id: "ct-outro", name: "Choice Made", role: "outro", durationBars: 4, sceneId: "sc-contracts", intensity: "mid" },
  ],
  emotion: { valence: -0.3, arousal: 0.2, label: "resolve" },
  tags: ["grounded", "act-2"],
};

/** Beat 9: Crew recruitment — first hope */
const cueCrew: Cue = {
  id: "cue-crew",
  name: "Partnership",
  bpm: 95,
  beatsPerBar: 4,
  keyRoot: 2,
  keyScale: "dorian",
  sections: [
    { id: "cr-intro", name: "Renna Approaches", role: "intro", durationBars: 4, sceneId: "sc-crew", intensity: "low" },
    { id: "cr-body", name: "The Deal", role: "body", durationBars: 8, sceneId: "sc-crew", intensity: "mid" },
    { id: "cr-outro", name: "Handshake", role: "outro", durationBars: 4, sceneId: "sc-crew", intensity: "mid", transitionMode: "bar-sync" },
  ],
  emotion: { valence: 0.1, arousal: 0.2, label: "hope" },
  tags: ["grounded", "act-2"],
};

/** Beat 10: Lane travel — open space, crew presence */
const cueLane: Cue = {
  id: "cue-lane",
  name: "The Lane",
  bpm: 95,
  beatsPerBar: 4,
  keyRoot: 2,
  keyScale: "minor",
  sections: [
    { id: "ln-intro", name: "Launch", role: "intro", durationBars: 4, sceneId: "sc-lane", intensity: "low" },
    { id: "ln-body", name: "Open Void", role: "body", durationBars: 12, sceneId: "sc-lane", intensity: "mid" },
    { id: "ln-outro", name: "Destination Ahead", role: "outro", durationBars: 4, sceneId: "sc-lane", intensity: "low" },
  ],
  emotion: { valence: 0.2, arousal: 0.1, label: "openness" },
  tags: ["grounded", "act-2"],
};

// ══════════════════════════════════════════
// ACT 3: FIRST LIGHT — Communion Relay
// ══════════════════════════════════════════

/** Beats 11-12: Communion Relay — alien wonder, first contact */
const cueCommunion: Cue = {
  id: "cue-communion",
  name: "First Contact",
  bpm: 80,
  beatsPerBar: 4,
  keyRoot: 5, // F
  keyScale: "phrygian",
  sections: [
    { id: "com-intro", name: "Docking Protocol", role: "intro", durationBars: 4, sceneId: "sc-communion", intensity: "low" },
    { id: "com-body", name: "Alien Wonder", role: "body", durationBars: 12, sceneId: "sc-communion", intensity: "mid" },
    { id: "com-esc", name: "Keth Culture", role: "escalation", durationBars: 8, sceneId: "sc-communion", intensity: "high" },
    { id: "com-outro", name: "Trade Complete", role: "outro", durationBars: 4, sceneId: "sc-communion", intensity: "mid" },
  ],
  emotion: { valence: 0.6, arousal: 0.5, label: "wonder" },
  tags: ["grounded", "act-3", "keth"],
};

/** Beat 13: Investigation — conspiracy blooming */
const cueInvestigation: Cue = {
  id: "cue-investigation",
  name: "The Fragment",
  bpm: 88,
  beatsPerBar: 4,
  keyRoot: 1, // Db
  keyScale: "chromatic",
  sections: [
    { id: "inv-intro", name: "Tessik Approaches", role: "intro", durationBars: 4, sceneId: "sc-investigation", intensity: "low" },
    { id: "inv-body", name: "Transmission Found", role: "body", durationBars: 6, sceneId: "sc-investigation", intensity: "mid" },
    { id: "inv-climax", name: "Solen's Code", role: "climax", durationBars: 4, sceneId: "sc-investigation", intensity: "high" },
    { id: "inv-outro", name: "Don't Come Back", role: "outro", durationBars: 4, sceneId: "sc-investigation", intensity: "low" },
  ],
  emotion: { valence: -0.2, arousal: 0.6, label: "mystery" },
  tags: ["grounded", "act-3", "investigation"],
};

/** Beat 14: Compact patrol — authority returns */
const cuePatrol: Cue = {
  id: "cue-patrol",
  name: "Compact Patrol",
  bpm: 100,
  beatsPerBar: 4,
  keyRoot: 7,
  keyScale: "minor",
  sections: [
    { id: "pt-intro", name: "Hail", role: "intro", durationBars: 2, sceneId: "sc-patrol", intensity: "mid", transitionMode: "stinger-then-switch" },
    { id: "pt-body", name: "Inspection", role: "body", durationBars: 8, sceneId: "sc-patrol", intensity: "mid" },
    { id: "pt-outro", name: "Move Along", role: "outro", durationBars: 4, sceneId: "sc-patrol", intensity: "low" },
  ],
  emotion: { valence: -0.4, arousal: 0.5, label: "threat" },
  tags: ["grounded", "act-3"],
};

/** Beat 15: Derelict combat — redemptive action */
const cueDerelict: Cue = {
  id: "cue-derelict",
  name: "Derelict Rescue",
  bpm: 130,
  beatsPerBar: 4,
  keyRoot: 7,
  keyScale: "minor",
  sections: [
    { id: "der-intro", name: "Distress Beacon", role: "intro", durationBars: 4, sceneId: "sc-lane", intensity: "low" },
    { id: "der-body", name: "Boarding", role: "body", durationBars: 6, sceneId: "sc-derelict", intensity: "mid" },
    { id: "der-esc", name: "Crew Synergy", role: "escalation", durationBars: 4, sceneId: "sc-derelict", intensity: "high" },
    { id: "der-climax", name: "Cleared", role: "climax", durationBars: 4, sceneId: "sc-derelict", intensity: "high" },
    { id: "der-outro", name: "Callum Saved", role: "outro", durationBars: 4, sceneId: "sc-lane", intensity: "low", transitionMode: "cooldown-fade" },
  ],
  emotion: { valence: 0.3, arousal: 0.8, label: "redemption" },
  tags: ["grounded", "act-3", "combat"],
};

// ── Exports ──

/** All 12 Grounded prologue cues. */
export const GROUNDED_CUES: Cue[] = [
  // Act 1
  cueArdentReady,
  cueArdentSweep,
  cueAmbush,
  cueCourtMartial,
  // Act 2
  cueFreeport,
  cueContracts,
  cueCrew,
  cueLane,
  // Act 3
  cueCommunion,
  cueInvestigation,
  cuePatrol,
  cueDerelict,
];
