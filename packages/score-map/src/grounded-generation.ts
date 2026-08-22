import type { AceStepKeyscale, CueFamilyGenerationLock } from "@motif-studio/schema";

export const ACE_STEP_WORKFLOW_ID = "78a76ecd-7ae2-452a-afea-ad55a8d290f8";

export const GROUNDED_WAVE2_ROOT =
  "E:\\AI\\readouts\\model-knowledge\\generated\\grounded-v2";

export const GROUNDED_WAVE3_ROOT =
  "E:\\AI\\readouts\\model-knowledge\\generated\\grounded-v3";

/** Generation wave a take was produced in. Selects the artifact root and the public audio dir (`grounded-v<wave>`). */
export type GroundedWave = 2 | 3;

export function groundedArtifactRoot(wave: GroundedWave): string {
  return wave === 2 ? GROUNDED_WAVE2_ROOT : GROUNDED_WAVE3_ROOT;
}

/**
 * Family prose version. v1 is the wave-2 grammar; v2 is the Director-ratified
 * 2026-08-21 regeneration grammar (cf-military + cf-frontier only — the other
 * four families never re-ran and stay on v1).
 */
export type GroundedPromptVersion = 1 | 2;

/**
 * Style-tag prose by family and prompt version. Records must echo the EXACT
 * prose a take actually ran with, so superseded versions are preserved here
 * verbatim — never edit a published version string, only add new ones.
 */
export const GROUNDED_STYLE_TAGS: Record<
  string,
  Partial<Record<GroundedPromptVersion, string>>
> = {
  "cf-military": {
    1: "Military March: A tense, disciplined orchestral march. Low brass ostinato and military snare drive a relentless pulse, staccato strings and taiko hits build pressure. Dark, cinematic, restrained power that never fully releases.",
    2: "Military March: A quiet, disciplined orchestral underscore. Soft low brass pedal tones and distant muffled snare keep a slow steady march, muted strings sustain long notes beneath sparse woodwind phrases. Somber, composed, dignified — weight carried in stillness, never aggressive.",
  },
  "cf-combat": {
    1: "Orchestral Combat: A fast, driving orchestral action piece. Four-on-the-floor percussion and urgent low brass riffs, syncopated string stabs and taiko accents push forward relentlessly. Aggressive, precise, cinematic controlled fury.",
  },
  "cf-frontier": {
    1: "Ambient Industrial: A sparse, atmospheric piece built on a low pulsing synth drone. Lonely clean electric guitar phrases and thin sustained strings drift over soft metallic percussion and tape hiss. Desolate, weary, slow-breathing.",
    2: "Ambient Industrial: A steady, full atmospheric bed on a warm continuous synth drone. Lonely clean electric guitar phrases and sustained strings rest on a constant low foundation, soft distant percussion underneath. Desolate but calm, worn, evenly breathing, never fading out.",
  },
  "cf-keth": {
    1: "Ambient Orchestral: A slow, wondrous piece led by glassy bells and bowed metallic tones. Layered choir-like pads swell beneath a floating 3+3+2 percussion pattern, harp arpeggios shimmer at the edges. Mysterious, organic, luminous awe.",
  },
  "cf-investigation": {
    1: "Electronic Noir: A tense minimal underscore. Isolated plucked synth notes and muted piano fragments over a slow pulse, wide reverberant space, chromatic passing tones and low sustained strings. Cold, uneasy, deliberate.",
  },
  "cf-crew": {
    1: "Warm Cinematic Folk: A gentle, hopeful piece. Soft fingerpicked acoustic guitar and warm upright bass in an easy pocket, brushed drums, a modest string line that rises late. Intimate, human, quietly optimistic.",
  },
};

/**
 * The ratified prompt version per family going forward (what a NEW take of the
 * family would run with). cf-military + cf-frontier moved to v2 with wave-3.
 */
export const GROUNDED_CURRENT_PROMPT_VERSION: Record<string, GroundedPromptVersion> = {
  "cf-military": 2,
  "cf-combat": 1,
  "cf-frontier": 2,
  "cf-keth": 1,
  "cf-investigation": 1,
  "cf-crew": 1,
};

/** Exact prose for a family at a given prompt version. Throws on an unknown pair. */
export function styleTagsFor(familyId: string, version: GroundedPromptVersion): string {
  const prose = GROUNDED_STYLE_TAGS[familyId]?.[version];
  if (!prose) {
    throw new Error(`No style tags for family ${familyId} at prompt version ${version}`);
  }
  return prose;
}

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

function spec(familyId: string, cueIds: string[]): GroundedGenerationSpec {
  return {
    familyId,
    lock: GROUNDED_FAMILY_LOCKS[familyId]!,
    cueIds,
    styleTags: styleTagsFor(familyId, GROUNDED_CURRENT_PROMPT_VERSION[familyId]!),
    lyricsTag: "[inst]",
    durationSec: 60,
  };
}

/** Family-level spec at the CURRENT ratified prompt version. Historical takes resolve their own prose via `promptVersion`. */
export const GROUNDED_GENERATION_SPEC: GroundedGenerationSpec[] = [
  spec("cf-military", ["cue-ardent-ready", "cue-ardent-sweep", "cue-court-martial", "cue-patrol"]),
  spec("cf-combat", ["cue-ambush", "cue-derelict"]),
  spec("cf-frontier", ["cue-freeport", "cue-contracts", "cue-lane"]),
  spec("cf-keth", ["cue-communion"]),
  spec("cf-investigation", ["cue-investigation"]),
  spec("cf-crew", ["cue-crew"]),
];

export interface GroundedTake {
  cueId: string;
  seed: number;
  familyId: string;
  sceneId: string;
  folder: string;
  /** Full generation job UUID from the wave receipt (receipts law: full UUIDs, never prefixes). */
  jobId: string;
  playbackDefault: boolean;
  /** Prose version this take ACTUALLY ran with — records echo styleTagsFor(familyId, promptVersion). */
  promptVersion: GroundedPromptVersion;
  /** Generation wave; selects artifact root + public audio dir (grounded-v<wave>). */
  wave: GroundedWave;
}

function take(
  wave: GroundedWave,
  promptVersion: GroundedPromptVersion,
  cueId: string,
  seed: number,
  familyId: string,
  sceneId: string,
  jobId: string,
  playbackDefault: boolean,
): GroundedTake {
  return {
    cueId,
    seed,
    familyId,
    sceneId,
    folder: `${cueId}-s${seed}`,
    jobId,
    playbackDefault,
    promptVersion,
    wave,
  };
}

const w2 = (
  cueId: string,
  seed: number,
  familyId: string,
  sceneId: string,
  jobId: string,
  playbackDefault: boolean,
): GroundedTake => take(2, 1, cueId, seed, familyId, sceneId, jobId, playbackDefault);

const w3 = (
  cueId: string,
  seed: number,
  familyId: string,
  sceneId: string,
  jobId: string,
  playbackDefault: boolean,
): GroundedTake => take(3, 2, cueId, seed, familyId, sceneId, jobId, playbackDefault);

/**
 * Wave-2 60 s regeneration (v1 prose). All takes stay ingested as records;
 * on sc-ardent-ready, sc-ardent-sweep, and sc-contracts the Director failed
 * the wave-2 defaults on audition (2026-08-21) and the wave-3 retakes are
 * the playback defaults instead.
 */
export const GROUNDED_WAVE2_TAKES: GroundedTake[] = [
  w2("cue-ardent-ready", 101, "cf-military", "sc-ardent-ready", "e83f8c6a-3c26-463a-9ab9-804b0933fa0c", false),
  w2("cue-ardent-ready", 102, "cf-military", "sc-ardent-ready", "05cc6407-23db-41fb-a6e3-ec5b369e872b", false),
  w2("cue-ardent-sweep", 103, "cf-military", "sc-ardent-sweep", "d18db88e-4d63-4cf6-a5ff-9287a60552b8", false),
  w2("cue-ardent-sweep", 104, "cf-military", "sc-ardent-sweep", "3f8f3b19-c721-4500-b22e-134b29cfe889", false),
  w2("cue-court-martial", 105, "cf-military", "sc-court-martial", "96ef5e80-5357-4139-add7-e0b46595790f", true),
  w2("cue-court-martial", 106, "cf-military", "sc-court-martial", "49302474-cbda-4027-a1ed-27ef0c06a879", false),
  w2("cue-ambush", 201, "cf-combat", "sc-ambush", "4f819e4a-5093-440a-9f6d-4ee0d917c6d9", true),
  w2("cue-derelict", 202, "cf-combat", "sc-derelict", "a1c7124a-7a04-4a81-ab16-9c36192d173b", true),
  w2("cue-freeport", 301, "cf-frontier", "sc-freeport", "e0a02201-715b-4daa-ba71-c098b83badaf", true),
  w2("cue-contracts", 302, "cf-frontier", "sc-contracts", "d10d018f-df80-4343-b4c4-2821d8786071", false),
  w2("cue-communion", 401, "cf-keth", "sc-communion", "f46f9e57-e127-4121-83b9-f9bd27e126ff", true),
  w2("cue-investigation", 501, "cf-investigation", "sc-investigation", "5cf1e2fe-705e-4dc5-a7bc-74517d8a177a", true),
  w2("cue-crew", 601, "cf-crew", "sc-crew", "d1d14809-a283-4ac3-931c-f4de6d8a717a", true),
];

/**
 * Wave-3 (v2 prose). Six regeneration takes Director-auditioned + passed
 * 2026-08-21 — their defaults replace the failed wave-2 defaults on their
 * scenes. Plus four new-coverage takes (cue-patrol, cue-lane) landing beds
 * on the last two uncovered scenes; lower seed is the playback default.
 */
export const GROUNDED_WAVE3_TAKES: GroundedTake[] = [
  w3("cue-ardent-ready", 111, "cf-military", "sc-ardent-ready", "d1432095-2636-47a2-8b5f-6e692930e94a", true),
  w3("cue-ardent-ready", 112, "cf-military", "sc-ardent-ready", "8a3ba716-efa6-4dab-b3a0-69647fbcf140", false),
  w3("cue-ardent-sweep", 113, "cf-military", "sc-ardent-sweep", "f5c4e728-04b7-46e1-bf7c-fe29e943dfc5", true),
  w3("cue-ardent-sweep", 114, "cf-military", "sc-ardent-sweep", "6d89310a-a4e2-4808-91e0-1864911aeedc", false),
  w3("cue-patrol", 121, "cf-military", "sc-patrol", "185411ed-a211-4265-8a6b-d6711c48240b", true),
  w3("cue-patrol", 122, "cf-military", "sc-patrol", "1195221a-c12f-4cdf-b0ed-02695322a052", false),
  w3("cue-contracts", 311, "cf-frontier", "sc-contracts", "0793108e-e336-465f-8ffb-60808aafa1be", true),
  w3("cue-contracts", 312, "cf-frontier", "sc-contracts", "fc08e48a-03c3-4998-8809-ecd402c665e2", false),
  w3("cue-lane", 321, "cf-frontier", "sc-lane", "13c67778-1617-4b87-b735-b2b2d1a0834b", true),
  w3("cue-lane", 322, "cf-frontier", "sc-lane", "59d23d8a-8cd8-4415-ae54-50bdd8d1a1c2", false),
];

/** Every ingested Grounded take, wave order. Exactly one playback default per scene. */
export const GROUNDED_TAKES: GroundedTake[] = [
  ...GROUNDED_WAVE2_TAKES,
  ...GROUNDED_WAVE3_TAKES,
];

export function specForFamily(familyId: string): GroundedGenerationSpec | undefined {
  return GROUNDED_GENERATION_SPEC.find((s) => s.familyId === familyId);
}

export function lockKeyscale(familyId: string): AceStepKeyscale {
  return GROUNDED_FAMILY_LOCKS[familyId]!.keyscale;
}
