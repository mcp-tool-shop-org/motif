// ────────────────────────────────────────────
// Motif Library — catalog-driven pack derivation
// Every library pack (scenes, cue families, generation locks, takes) is
// DERIVED from library-catalog.json. Adding a pack or a cue to the catalog
// is the whole change — no code lands here for Tier-2 / Tier-3.
// ────────────────────────────────────────────

import type {
  AceStepKeyscale,
  CueFamily,
  CueFamilyGenerationLock,
  CueFamilyRole,
  EmotionTag,
  Scene,
  SceneCategory,
  SoundtrackPack,
  TransitionRule,
  TriggerBinding,
} from "@motif-studio/schema";
import rawCatalog from "./library-catalog.json" with { type: "json" };

// ══════════════════════════════════════════
// CATALOG — the spec of record
// ══════════════════════════════════════════

/** One cue: the generation identity a pair of takes ran with. */
export interface LibraryCatalogCue {
  id: string;
  bpm: number;
  /** ACE-Step keyscale enum (modes are rejected server-side). */
  keyscale: AceStepKeyscale;
  /** Take A seed — the lower of the pair, and the scene-bed default. */
  seedA: number;
  /** Take B seed — the curation alternative. */
  seedB: number;
  /** EXACT prose both takes were submitted with. Records echo this verbatim. */
  prose: string;
}

export interface LibraryCatalogPack {
  id: string;
  name: string;
  flagship?: boolean;
  /** seed = seedBase + cueIndex*10 + take (1 = A, 2 = B). */
  seedBase: number;
  palette: string;
  cues: LibraryCatalogCue[];
}

export interface LibraryCatalogMeta {
  name: string;
  ratified: string;
  config: string;
  seed_rule: string;
}

export interface LibraryCatalog {
  meta: LibraryCatalogMeta;
  tier1: LibraryCatalogPack[];
  /** Authored 2026-08-21; absent until a tier is written. */
  tier2?: LibraryCatalogPack[];
  tier2_planned: string[];
  tier3_planned: string[];
  /**
   * Re-rolls of published cues at new C/D seeds under revised prose. Carries no
   * `cues` array, so these never derive packs — the original takes keep the
   * exact string they ran.
   */
  tier1_revisions?: LibraryCatalogRevision[];
}

export interface LibraryCatalogRevision {
  packId: string;
  cueId: string;
  promptVersion: number;
  bpm: number;
  keyscale: string;
  seedC: number;
  seedD: number;
  prose: string;
  reason: string;
}

/**
 * Vendored byte-identical from
 * `E:\AI\readouts\model-knowledge\workflows\audio\library-catalog-v1.json`
 * (ratified 2026-08-21). Pinned in-repo so the studio builds without reaching
 * outside the working tree; re-copy the source file to bump it.
 */
export const LIBRARY_CATALOG = rawCatalog as unknown as LibraryCatalog;

/**
 * Every catalog entry that is a materialized pack (i.e. carries cues).
 * Tier-2 / Tier-3 land either as more `tier1` entries or as a new top-level
 * array — both are picked up here without a code change. The planned-name
 * string arrays carry no cues and drop out.
 */
function collectCatalogPacks(catalog: LibraryCatalog): LibraryCatalogPack[] {
  return Object.values(catalog as unknown as Record<string, unknown>)
    .filter((v): v is unknown[] => Array.isArray(v))
    .flat()
    .filter(
      (e): e is LibraryCatalogPack =>
        typeof e === "object" &&
        e !== null &&
        Array.isArray((e as LibraryCatalogPack).cues),
    );
}

/** Every materialized library pack, catalog order. */
export const LIBRARY_PACKS: LibraryCatalogPack[] = collectCatalogPacks(LIBRARY_CATALOG);

export function libraryCatalogPack(packId: string): LibraryCatalogPack | undefined {
  return LIBRARY_PACKS.find((p) => p.id === packId);
}

export function libraryCatalogCue(
  packId: string,
  cueId: string,
): LibraryCatalogCue | undefined {
  return libraryCatalogPack(packId)?.cues.find((c) => c.id === cueId);
}

// ── Submission constants (what every library take actually ran with) ──

/** Production music unit — every library take was submitted at 60 s. */
export const LIBRARY_DURATION_SEC = 60;

/** ACE widget time-signature form used by every library submission. */
export const LIBRARY_TIMESIGNATURE = "4";

/** Every library cue is instrumental. */
export const LIBRARY_LYRICS_TAG = "[inst]";

/**
 * Placeholder asset/stem kept so a derived pack validates before any audio is
 * folded in (a scene needs at least one layer). `foldGeneratedIntoPack` strips
 * the `s-placeholder` layer from every scene it beds, which is why these ids
 * match the Grounded pack's.
 */
export const LIBRARY_PLACEHOLDER_ASSET_ID = "a-placeholder";
export const LIBRARY_PLACEHOLDER_STEM_ID = "s-placeholder";

// ── Deterministic ids ──

export function libraryPackId(packId: string): string {
  return `library-${packId}`;
}

export function librarySceneId(packId: string, cueId: string): string {
  return `sc-${packId}-${cueId}`;
}

export function libraryFamilyId(packId: string, cueId: string): string {
  return `cf-${packId}-${cueId}`;
}

/** Take id AND artifact/public folder name — the house `<cueId>-s<seed>` form. */
export function libraryTakeFolder(cueId: string, seed: number): string {
  return `${cueId}-s${seed}`;
}

/** "cave-dungeon" → "Cave Dungeon". */
export function libraryCueTitle(cueId: string): string {
  return cueId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ══════════════════════════════════════════
// VIBE — the one classifier
// ══════════════════════════════════════════

/**
 * Cue "vibe" — the single derived signal behind scene category, cue-family
 * role, emotion, binding priority, and the transition graph. Purely a function
 * of the cue id, so a new catalog cue classifies itself.
 */
export type LibraryCueVibe =
  | "boss"
  | "combat"
  | "victory"
  | "aftermath"
  | "stealth"
  | "mystery"
  | "tension"
  | "safe"
  | "exploration";

/**
 * Vibe by hyphen-token match, first entry wins — so "final-boss" reads as boss
 * and "horror-ambush" as combat. Unmatched ids fall through to `exploration`,
 * which is why an unfamiliar Tier-2 cue still yields a valid scene.
 */
const VIBE_TOKENS: Array<[LibraryCueVibe, string[]]> = [
  ["boss", ["boss"]],
  [
    "combat",
    [
      "battle", "ambush", "duel", "dogfight", "skirmish",
      "showdown", "standoff", "siege", "boarding", "uprising",
    ],
  ],
  ["victory", ["victory", "triumph", "heroics"]],
  [
    "aftermath",
    [
      "aftermath", "defeat", "sorrow", "lament", "requiem",
      "memorial", "relief", "homecoming", "memory",
    ],
  ],
  ["stealth", ["stealth", "intrigue", "escape", "scavenge", "netdive", "alley"]],
  [
    "mystery",
    [
      "ruins", "temple", "catacombs", "oracle", "wonder", "ritual",
      "underworld", "olympus", "derelict", "dungeon", "cave", "tomb",
      "contact", "starfall", "warp",
    ],
  ],
  [
    "tension",
    [
      "dread", "horror", "madness", "storm", "briefing",
      "council", "descent", "chase", "pursuit",
    ],
  ],
  [
    "safe",
    [
      "town", "inn", "rest", "tavern", "saloon", "campfire", "shelter",
      "safe", "alcove", "village", "festival", "feast", "port", "agora",
      "workshop", "club", "oasis", "hamlet", "love",
    ],
  ],
];

export function libraryCueVibe(cueId: string): LibraryCueVibe {
  const tokens = new Set(cueId.split("-"));
  for (const [vibe, words] of VIBE_TOKENS) {
    if (words.some((w) => tokens.has(w))) return vibe;
  }
  return "exploration";
}

const SCENE_CATEGORY_BY_VIBE: Record<LibraryCueVibe, SceneCategory> = {
  boss: "boss",
  combat: "combat",
  victory: "victory",
  aftermath: "aftermath",
  stealth: "stealth",
  mystery: "tension",
  tension: "tension",
  safe: "safe-zone",
  exploration: "exploration",
};

const FAMILY_ROLE_BY_VIBE: Record<LibraryCueVibe, CueFamilyRole> = {
  boss: "boss",
  combat: "combat",
  victory: "victory",
  aftermath: "recovery",
  stealth: "stealth",
  mystery: "mystery",
  tension: "tension",
  safe: "recovery",
  exploration: "exploration",
};

const EMOTION_BY_VIBE: Record<LibraryCueVibe, EmotionTag> = {
  boss: { valence: -0.4, arousal: 0.95, label: "menace" },
  combat: { valence: -0.2, arousal: 0.85, label: "action" },
  victory: { valence: 0.8, arousal: 0.7, label: "triumph" },
  aftermath: { valence: -0.6, arousal: 0.2, label: "grief" },
  stealth: { valence: -0.2, arousal: 0.5, label: "caution" },
  mystery: { valence: 0.1, arousal: 0.45, label: "wonder" },
  tension: { valence: -0.3, arousal: 0.6, label: "unease" },
  safe: { valence: 0.5, arousal: 0.2, label: "warmth" },
  exploration: { valence: 0.2, arousal: 0.35, label: "journey" },
};

/** Ladder so the resolver reads like the authored packs; the conditions are already exclusive. */
const BINDING_PRIORITY_BY_VIBE: Record<LibraryCueVibe, number> = {
  boss: 70,
  combat: 60,
  tension: 40,
  stealth: 40,
  mystery: 35,
  victory: 30,
  aftermath: 25,
  safe: 10,
  exploration: 0,
};

/** Combat-ish vibes — the encounter side of the derived transition graph. */
function isEncounter(vibe: LibraryCueVibe): boolean {
  return vibe === "combat" || vibe === "boss";
}

// ══════════════════════════════════════════
// DERIVATION
// ══════════════════════════════════════════

/** The lock a cue's takes ran under — bpm / keyscale from the catalog, 4/4 throughout. */
export function libraryGenerationLock(cue: LibraryCatalogCue): CueFamilyGenerationLock {
  return { bpm: cue.bpm, keyscale: cue.keyscale, timesignature: LIBRARY_TIMESIGNATURE };
}

/** One scene per cue, 1:1. */
export function libraryScenes(pack: LibraryCatalogPack): Scene[] {
  return pack.cues.map((cue) => {
    const vibe = libraryCueVibe(cue.id);
    return {
      id: librarySceneId(pack.id, cue.id),
      name: libraryCueTitle(cue.id),
      category: SCENE_CATEGORY_BY_VIBE[vibe],
      layers: [{ stemId: LIBRARY_PLACEHOLDER_STEM_ID }],
      emotion: EMOTION_BY_VIBE[vibe],
      tags: ["motif-library", pack.id, vibe],
    };
  });
}

/** One cue family per cue, each carrying that cue's generation lock. */
export function libraryCueFamilies(pack: LibraryCatalogPack): CueFamily[] {
  return pack.cues.map((cue) => {
    const vibe = libraryCueVibe(cue.id);
    return {
      id: libraryFamilyId(pack.id, cue.id),
      name: libraryCueTitle(cue.id),
      role: FAMILY_ROLE_BY_VIBE[vibe],
      sceneIds: [librarySceneId(pack.id, cue.id)],
      generationLock: libraryGenerationLock(cue),
      emotion: EMOTION_BY_VIBE[vibe],
      tags: ["motif-library", pack.id, vibe],
      notes: cue.prose,
    };
  });
}

/** One binding per cue — the game names the cue it wants. */
export function libraryBindings(pack: LibraryCatalogPack): TriggerBinding[] {
  return pack.cues.map((cue) => ({
    id: `b-${pack.id}-${cue.id}`,
    name: libraryCueTitle(cue.id),
    sceneId: librarySceneId(pack.id, cue.id),
    conditions: [{ field: "cue", op: "eq" as const, value: cue.id }],
    priority: BINDING_PRIORITY_BY_VIBE[libraryCueVibe(cue.id)],
  }));
}

/**
 * The battle flow every library pack has: field scenes cut into encounters,
 * encounters settle into victory, and encounters fall away into the pack's
 * first aftermath cue. A pack with no encounter cue derives no transitions.
 */
export function libraryTransitions(pack: LibraryCatalogPack): TransitionRule[] {
  const vibes = new Map(pack.cues.map((c) => [c.id, libraryCueVibe(c.id)]));
  const idsWhere = (pred: (v: LibraryCueVibe) => boolean): string[] =>
    pack.cues.filter((c) => pred(vibes.get(c.id)!)).map((c) => c.id);

  const encounters = idsWhere(isEncounter);
  const field = idsWhere((v) => !isEncounter(v) && v !== "victory" && v !== "aftermath");
  const victories = idsWhere((v) => v === "victory");
  const firstAftermath = idsWhere((v) => v === "aftermath")[0];

  const scene = (cueId: string): string => librarySceneId(pack.id, cueId);
  const rule = (
    from: string,
    to: string,
    mode: TransitionRule["mode"],
    durationMs: number | undefined,
    notes: string,
  ): TransitionRule => ({
    id: `tr-${pack.id}-${from}-${to}`,
    name: `${libraryCueTitle(from)} → ${libraryCueTitle(to)}`,
    fromSceneId: scene(from),
    toSceneId: scene(to),
    mode,
    ...(durationMs != null ? { durationMs } : {}),
    notes,
  });

  const out: TransitionRule[] = [];
  for (const encounter of encounters) {
    for (const from of field) {
      out.push(rule(from, encounter, "immediate", undefined, "Encounter cut"));
    }
    for (const victory of victories) {
      out.push(rule(encounter, victory, "cooldown-fade", 2500, "Encounter resolved"));
    }
    if (firstAftermath) {
      out.push(rule(encounter, firstAftermath, "cooldown-fade", 3000, "Encounter lost"));
    }
  }
  return out;
}

/**
 * Assemble a library pack skeleton: one scene and one locked cue family per
 * catalog cue. Audio arrives later through `foldGeneratedIntoPack`.
 */
export function buildLibraryPack(pack: LibraryCatalogPack): SoundtrackPack {
  return {
    meta: {
      id: libraryPackId(pack.id),
      name: pack.name,
      version: "1.0.0",
      description: `${pack.cues.length} cues, A/B takes each. ${pack.palette}`,
      author: "mcp-tool-shop",
      tags: ["motif-library", pack.id, ...(pack.flagship ? ["flagship"] : [])],
      schemaVersion: "1",
    },
    assets: [
      {
        id: LIBRARY_PLACEHOLDER_ASSET_ID,
        name: "Placeholder Loop",
        src: "placeholder.ogg",
        kind: "loop",
        durationMs: LIBRARY_DURATION_SEC * 1000,
      },
    ],
    stems: [
      {
        id: LIBRARY_PLACEHOLDER_STEM_ID,
        name: "Placeholder Stem",
        assetId: LIBRARY_PLACEHOLDER_ASSET_ID,
        role: "base",
        loop: true,
      },
    ],
    scenes: libraryScenes(pack),
    bindings: libraryBindings(pack),
    transitions: libraryTransitions(pack),
    cueFamilies: libraryCueFamilies(pack),
  };
}

/** Every materialized library pack as a SoundtrackPack skeleton. */
export function buildLibraryPacks(): SoundtrackPack[] {
  return LIBRARY_PACKS.map(buildLibraryPack);
}

// ══════════════════════════════════════════
// TAKES
// ══════════════════════════════════════════

/** One generated take. Seeds come straight from the catalog; A is the lower one. */
export interface LibraryTake {
  packId: string;
  cueId: string;
  seed: number;
  /** A is the catalog's lower seed and the scene-bed default; B is the curation alternative. */
  take: "A" | "B";
  familyId: string;
  sceneId: string;
  /** Artifact + public folder name, and the take/record id. */
  folder: string;
  playbackDefault: boolean;
}

/** Both takes of every cue in a pack, catalog order, A before B. */
export function libraryTakesForPack(pack: LibraryCatalogPack): LibraryTake[] {
  return pack.cues.flatMap((cue) => {
    const seeds = [cue.seedA, cue.seedB].sort((a, b) => a - b);
    return seeds.map((seed, i) => ({
      packId: pack.id,
      cueId: cue.id,
      seed,
      take: (i === 0 ? "A" : "B") as LibraryTake["take"],
      familyId: libraryFamilyId(pack.id, cue.id),
      sceneId: librarySceneId(pack.id, cue.id),
      folder: libraryTakeFolder(cue.id, seed),
      playbackDefault: i === 0,
    }));
  });
}

/** Every take across every materialized pack. Exactly one playback default per cue. */
export const LIBRARY_TAKES: LibraryTake[] = LIBRARY_PACKS.flatMap(libraryTakesForPack);

/** Takes for one pack. Throws on an unknown pack id (andon: never ingest a typo). */
export function libraryTakes(packId: string): LibraryTake[] {
  const pack = libraryCatalogPack(packId);
  if (!pack) {
    throw new Error(`No library catalog pack ${packId}`);
  }
  return libraryTakesForPack(pack);
}
