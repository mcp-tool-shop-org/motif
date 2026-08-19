import type { CueFamilyGenerationLock } from "@motif-studio/schema";

export interface GroundedGenerationSpec {
  familyId: string;
  lock: CueFamilyGenerationLock;
  cueIds: string[];
  styleTags: string;
  lyricsTag: "[inst]";
  durationSec: 120;
}

/**
 * Authored generation locks — bpm/keyscale/timesignature taken from the
 * Grounded cue set. Style tags are the proposed ACE-Step conditioning
 * (Director-gated; Advisor runs). One 120 s unit ≈ 8.5 credits.
 */
export const GROUNDED_FAMILY_LOCKS: Record<string, CueFamilyGenerationLock> = {
  "cf-military": { bpm: 100, keyscale: "G minor", timesignature: "4/4" },
  "cf-combat": { bpm: 130, keyscale: "G minor", timesignature: "4/4" },
  "cf-frontier": { bpm: 95, keyscale: "D minor", timesignature: "4/4" },
  "cf-keth": { bpm: 80, keyscale: "F phrygian", timesignature: "4/4" },
  "cf-investigation": { bpm: 88, keyscale: "Db chromatic", timesignature: "4/4" },
  "cf-crew": { bpm: 95, keyscale: "D dorian", timesignature: "4/4" },
};

export const GROUNDED_GENERATION_SPEC: GroundedGenerationSpec[] = [
  {
    familyId: "cf-military",
    lock: GROUNDED_FAMILY_LOCKS["cf-military"]!,
    cueIds: ["cue-ardent-ready", "cue-ardent-sweep", "cue-court-martial"],
    styleTags:
      "compact-fleet military march, structured brass ostinato, heartbeat drums, hierarchical, tense, instrumental",
    lyricsTag: "[inst]",
    durationSec: 120,
  },
  {
    familyId: "cf-combat",
    lock: GROUNDED_FAMILY_LOCKS["cf-combat"]!,
    cueIds: ["cue-ambush", "cue-derelict"],
    styleTags:
      "four-on-floor combat drive, syncopated brass riff, urgent, competence under fire, instrumental",
    lyricsTag: "[inst]",
    durationSec: 120,
  },
  {
    familyId: "cf-frontier",
    lock: GROUNDED_FAMILY_LOCKS["cf-frontier"]!,
    cueIds: ["cue-freeport", "cue-contracts"],
    styleTags:
      "worn frontier station, lo-fi reactor pulse, sparse, survival without dignity, instrumental",
    lyricsTag: "[inst]",
    durationSec: 120,
  },
  {
    familyId: "cf-keth",
    lock: GROUNDED_FAMILY_LOCKS["cf-keth"]!,
    cueIds: ["cue-communion"],
    styleTags:
      "organic alien communion, phrygian bells, 3+3+2 pulse, bioluminescent, wonder, instrumental",
    lyricsTag: "[inst]",
    durationSec: 120,
  },
  {
    familyId: "cf-investigation",
    lock: GROUNDED_FAMILY_LOCKS["cf-investigation"]!,
    cueIds: ["cue-investigation"],
    styleTags:
      "chromatic investigation, isolated data-stream plucks, conspiracy, wide space, instrumental",
    lyricsTag: "[inst]",
    durationSec: 120,
  },
  {
    familyId: "cf-crew",
    lock: GROUNDED_FAMILY_LOCKS["cf-crew"]!,
    cueIds: ["cue-crew"],
    styleTags:
      "crew bond emerging from frontier despair, dorian warmth, two voices finding utility, instrumental",
    lyricsTag: "[inst]",
    durationSec: 120,
  },
];
