import type { AceStepKeyscale, CueFamilyGenerationLock } from "@motif-studio/schema";

export const ACE_STEP_WORKFLOW_ID = "78a76ecd-7ae2-452a-afea-ad55a8d290f8";

export const GROUNDED_WAVE2_ROOT =
  "E:\\AI\\readouts\\model-knowledge\\generated\\grounded-v2";

export interface GroundedGenerationSpec {
  familyId: string;
  lock: CueFamilyGenerationLock;
  cueIds: string[];
  styleTags: string;
  lyricsTag: "[inst]";
  /** Production music unit (Director-ratified 2026-08-19). */
  durationSec: 60;
}

/**
 * Authored generation locks. keyscale values are the ACE-Step 34-value enum
 * (modes rejected server-side). Style tags are the house "Genre: musical prose"
 * grammar. One 60 s unit ≈ 3.4 credits warm / ~8.5 cold.
 */
export const GROUNDED_FAMILY_LOCKS: Record<string, CueFamilyGenerationLock> = {
  "cf-military": { bpm: 100, keyscale: "G minor", timesignature: "4/4" },
  "cf-combat": { bpm: 130, keyscale: "G minor", timesignature: "4/4" },
  "cf-frontier": { bpm: 95, keyscale: "D minor", timesignature: "4/4" },
  "cf-keth": { bpm: 80, keyscale: "F minor", timesignature: "4/4" },
  "cf-investigation": { bpm: 88, keyscale: "Db minor", timesignature: "4/4" },
  "cf-crew": { bpm: 95, keyscale: "D minor", timesignature: "4/4" },
};

export const GROUNDED_GENERATION_SPEC: GroundedGenerationSpec[] = [
  {
    familyId: "cf-military",
    lock: GROUNDED_FAMILY_LOCKS["cf-military"]!,
    cueIds: ["cue-ardent-ready", "cue-ardent-sweep", "cue-court-martial"],
    styleTags:
      "Military March: A tense, disciplined orchestral march. Low brass ostinato and military snare drive a relentless pulse, staccato strings and taiko hits build pressure. Dark, cinematic, restrained power that never fully releases.",
    lyricsTag: "[inst]",
    durationSec: 60,
  },
  {
    familyId: "cf-combat",
    lock: GROUNDED_FAMILY_LOCKS["cf-combat"]!,
    cueIds: ["cue-ambush", "cue-derelict"],
    styleTags:
      "Orchestral Combat: A fast, driving orchestral action piece. Four-on-the-floor percussion and urgent low brass riffs, syncopated string stabs and taiko accents push forward relentlessly. Aggressive, precise, cinematic controlled fury.",
    lyricsTag: "[inst]",
    durationSec: 60,
  },
  {
    familyId: "cf-frontier",
    lock: GROUNDED_FAMILY_LOCKS["cf-frontier"]!,
    cueIds: ["cue-freeport", "cue-contracts"],
    styleTags:
      "Ambient Industrial: A sparse, atmospheric piece built on a low pulsing synth drone. Lonely clean electric guitar phrases and thin sustained strings drift over soft metallic percussion and tape hiss. Desolate, weary, slow-breathing.",
    lyricsTag: "[inst]",
    durationSec: 60,
  },
  {
    familyId: "cf-keth",
    lock: GROUNDED_FAMILY_LOCKS["cf-keth"]!,
    cueIds: ["cue-communion"],
    styleTags:
      "Ambient Orchestral: A slow, wondrous piece led by glassy bells and bowed metallic tones. Layered choir-like pads swell beneath a floating 3+3+2 percussion pattern, harp arpeggios shimmer at the edges. Mysterious, organic, luminous awe.",
    lyricsTag: "[inst]",
    durationSec: 60,
  },
  {
    familyId: "cf-investigation",
    lock: GROUNDED_FAMILY_LOCKS["cf-investigation"]!,
    cueIds: ["cue-investigation"],
    styleTags:
      "Electronic Noir: A tense minimal underscore. Isolated plucked synth notes and muted piano fragments over a slow pulse, wide reverberant space, chromatic passing tones and low sustained strings. Cold, uneasy, deliberate.",
    lyricsTag: "[inst]",
    durationSec: 60,
  },
  {
    familyId: "cf-crew",
    lock: GROUNDED_FAMILY_LOCKS["cf-crew"]!,
    cueIds: ["cue-crew"],
    styleTags:
      "Warm Cinematic Folk: A gentle, hopeful piece. Soft fingerpicked acoustic guitar and warm upright bass in an easy pocket, brushed drums, a modest string line that rises late. Intimate, human, quietly optimistic.",
    lyricsTag: "[inst]",
    durationSec: 60,
  },
];

export interface GroundedWave2Take {
  cueId: string;
  seed: number;
  familyId: string;
  sceneId: string;
  folder: string;
  /** 8-char prefix from the wave-2 receipt (full UUID not published). */
  jobIdPrefix: string;
  playbackDefault: boolean;
}

function take(
  cueId: string,
  seed: number,
  familyId: string,
  sceneId: string,
  jobIdPrefix: string,
  playbackDefault: boolean,
): GroundedWave2Take {
  return {
    cueId,
    seed,
    familyId,
    sceneId,
    folder: `${cueId}-s${seed}`,
    jobIdPrefix,
    playbackDefault,
  };
}

/** Wave-2 60 s regeneration. Military A/B: lower seed is the default playback take. */
export const GROUNDED_WAVE2_TAKES: GroundedWave2Take[] = [
  take("cue-ardent-ready", 101, "cf-military", "sc-ardent-ready", "e83f8c6a", true),
  take("cue-ardent-ready", 102, "cf-military", "sc-ardent-ready", "05cc6407", false),
  take("cue-ardent-sweep", 103, "cf-military", "sc-ardent-sweep", "d18db88e", true),
  take("cue-ardent-sweep", 104, "cf-military", "sc-ardent-sweep", "3f8f3b19", false),
  take("cue-court-martial", 105, "cf-military", "sc-court-martial", "96ef5e80", true),
  take("cue-court-martial", 106, "cf-military", "sc-court-martial", "49302474", false),
  take("cue-ambush", 201, "cf-combat", "sc-ambush", "4f819e4a", true),
  take("cue-derelict", 202, "cf-combat", "sc-derelict", "a1c7124a", true),
  take("cue-freeport", 301, "cf-frontier", "sc-freeport", "e0a02201", true),
  take("cue-contracts", 302, "cf-frontier", "sc-contracts", "d10d018f", true),
  take("cue-communion", 401, "cf-keth", "sc-communion", "f46f9e57", true),
  take("cue-investigation", 501, "cf-investigation", "sc-investigation", "5cf1e2fe", true),
  take("cue-crew", 601, "cf-crew", "sc-crew", "d1d14809", true),
];

export function specForFamily(familyId: string): GroundedGenerationSpec | undefined {
  return GROUNDED_GENERATION_SPEC.find((s) => s.familyId === familyId);
}

export function lockKeyscale(familyId: string): AceStepKeyscale {
  return GROUNDED_FAMILY_LOCKS[familyId]!.keyscale;
}
