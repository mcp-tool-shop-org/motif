// ────────────────────────────────────────────
// Motif Library — catalog-driven pack derivation
// Every library pack (scenes, cue families, generation locks, takes) is
// DERIVED from library-catalog.json. Adding a pack or a cue to an existing
// tier is the whole change; a brand-new tier array additionally needs its
// artifact root listed in LIBRARY_TIER_ARTIFACT_ROOTS.
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
  /** Authored 2026-08-21 — short-form suites (5–10 cues), not the ten-cue tier shape. */
  tier3?: LibraryCatalogPack[];
  tier2_planned: string[];
  tier3_planned: string[];
  /**
   * Re-rolls of published cues at new C/D seeds under REVISED (v2) prose.
   * Carries no `cues` array, so these never derive packs — the original takes
   * keep the exact string they ran.
   */
  tier1_revisions?: LibraryCatalogRevision[];
  /**
   * Re-rolls at new C/D seeds under the cue's UNCHANGED prose — seed is the only
   * lever. Also carries no `cues` array, so no pack derives from it either.
   */
  regen_cd?: LibraryCatalogRegen[];
}

/** A C/D re-roll under rewritten prose; `promptVersion` is the version those takes ran at. */
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
  /** The v1 pair these supersede as playback candidates, kept as a receipt. */
  supersedes?: { seedA: number; seedB: number; proseV1: string };
}

/**
 * A C/D re-roll at the cue's UNCHANGED prose — the wording rule was falsified
 * at n=410, so these test seed variance alone. The prose is stored verbatim
 * anyway, so a take never has to reach back into the cue to know what it ran with.
 */
export interface LibraryCatalogRegen {
  packId: string;
  cueId: string;
  /** Catalog tier the owning pack was authored under. */
  tier: string;
  bpm: number;
  keyscale: string;
  seedC: number;
  seedD: number;
  prose: string;
  lever: string;
}

/**
 * Vendored byte-identical from
 * `E:\AI\readouts\model-knowledge\workflows\audio\library-catalog-v1.json`
 * (ratified 2026-08-21). Pinned in-repo so the studio builds without reaching
 * outside the working tree; re-copy the source file to bump it.
 */
export const LIBRARY_CATALOG = rawCatalog as unknown as LibraryCatalog;

/** A materialized pack plus the catalog key it was authored under. */
export interface LibraryPack extends LibraryCatalogPack {
  /**
   * Top-level catalog array this pack came from — "tier1" / "tier2" / "tier3".
   * Selects the artifact tree its takes were collected into.
   */
  tier: string;
}

/**
 * Every catalog entry that is a materialized pack (i.e. carries cues), tagged
 * with the top-level key it was authored under. A new tier lands as a new
 * top-level array and is picked up here with no change to this function; the
 * planned-name string arrays and the revision / regen entries carry no `cues`
 * and drop out.
 */
function collectCatalogPacks(catalog: LibraryCatalog): LibraryPack[] {
  return Object.entries(catalog as unknown as Record<string, unknown>).flatMap(
    ([tier, value]) =>
      (Array.isArray(value) ? (value as unknown[]) : []).flatMap((entry) =>
        typeof entry === "object" &&
        entry !== null &&
        Array.isArray((entry as LibraryCatalogPack).cues)
          ? [{ ...(entry as LibraryCatalogPack), tier }]
          : [],
      ),
  );
}

/** Every materialized library pack, catalog order. */
export const LIBRARY_PACKS: LibraryPack[] = collectCatalogPacks(LIBRARY_CATALOG);

export function libraryCatalogPack(packId: string): LibraryPack | undefined {
  return LIBRARY_PACKS.find((p) => p.id === packId);
}

/** Catalog tier a pack was authored under. Andon: an unknown pack id is a typo, never an empty tier. */
export function libraryPackTier(packId: string): string {
  const pack = libraryCatalogPack(packId);
  if (!pack) {
    throw new Error(`No library catalog pack ${packId}`);
  }
  return pack.tier;
}

/** Every pack authored under one catalog tier key. */
export function libraryPacksForTier(tier: string): LibraryPack[] {
  return LIBRARY_PACKS.filter((p) => p.tier === tier);
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

/** Take letter, assigned by seed order within a cue. A/B are the catalog pair; C/D are re-rolls. */
export type LibraryTakeLetter = "A" | "B" | "C" | "D";

const LIBRARY_TAKE_LETTERS: readonly LibraryTakeLetter[] = ["A", "B", "C", "D"];

/**
 * Prose version a take ran at. 1 is the catalog cue's prose — which the
 * seed-only C/D re-rolls also ran, deliberately; 2 is a `tier1_revisions`
 * rewrite.
 */
export type LibraryPromptVersion = 1 | 2;

/** Artifact tree a take's masters were collected into. */
export type LibraryArtifactRootId = "tier1" | "tier2" | "tier3" | "regen-cd";

/** Where a take's masters live: which artifact tree, and which directory under that tree's root. */
export interface LibraryTakeArtifact {
  root: LibraryArtifactRootId;
  /** Directory under the root that holds `<folder>/` — the owning pack id, except for revisions. */
  dir: string;
}

/**
 * Catalog tiers that have their own artifact tree, in tier order. Authoring a
 * `tier4` array means adding its root id here and its filesystem path in
 * sample-lab; until then a tier-4 take andons rather than silently reading
 * tier-1 masters.
 */
export const LIBRARY_TIER_ARTIFACT_ROOTS: readonly LibraryArtifactRootId[] = [
  "tier1",
  "tier2",
  "tier3",
];

/**
 * The Tier-1 revision takes were generated inside the Tier-2 wave, so their
 * masters AND their collection-plan entries sit under the TIER-2 root in a
 * `tier1-revisions` pseudo-pack — not beside the pack that owns the cue.
 */
export const LIBRARY_REVISION_ARTIFACT_ROOT: LibraryArtifactRootId = "tier2";
export const LIBRARY_REVISION_ARTIFACT_DIR = "tier1-revisions";

/** Artifact tree the seed-only C/D re-rolls were collected into, as `<root>/<packId>/<folder>/`. */
export const LIBRARY_REGEN_ARTIFACT_ROOT: LibraryArtifactRootId = "regen-cd";

function tierArtifactRoot(tier: string): LibraryArtifactRootId {
  const root = LIBRARY_TIER_ARTIFACT_ROOTS.find((r) => r === tier);
  if (!root) {
    throw new Error(
      `No artifact tree for catalog tier ${tier} — add one to LIBRARY_TIER_ARTIFACT_ROOTS`,
    );
  }
  return root;
}

/** One generated take. Seeds come straight from the catalog; A is the lowest. */
export interface LibraryTake {
  packId: string;
  cueId: string;
  seed: number;
  /** Seed order within the cue — A is the lowest seed, D the highest. */
  take: LibraryTakeLetter;
  familyId: string;
  sceneId: string;
  /** Artifact + public folder name, and the take/record id. */
  folder: string;
  /**
   * Catalog PRIOR for the scene bed (lowest seed). The shipped default is
   * chosen from the MEASURED ingest instead — see `selectPlaybackDefaults`.
   */
  playbackDefault: boolean;
  /** Prose version this take ACTUALLY ran with; records echo `prose`, never a newer string. */
  promptVersion: LibraryPromptVersion;
  /** EXACT prose this take was submitted with. */
  prose: string;
  /** Artifact tree + directory holding this take's masters. */
  artifact: LibraryTakeArtifact;
}

/** A seed plus the identity it ran under, before letters and ids are assigned. */
interface LibrarySeededTake {
  seed: number;
  promptVersion: LibraryPromptVersion;
  prose: string;
  artifact: LibraryTakeArtifact;
}

/** C/D seeds a cue was re-rolled at under rewritten (v2) prose. */
function revisionSeededTakes(packId: string, cueId: string): LibrarySeededTake[] {
  const artifact: LibraryTakeArtifact = {
    root: LIBRARY_REVISION_ARTIFACT_ROOT,
    dir: LIBRARY_REVISION_ARTIFACT_DIR,
  };
  return (LIBRARY_CATALOG.tier1_revisions ?? [])
    .filter((r) => r.packId === packId && r.cueId === cueId)
    .flatMap((r) =>
      [r.seedC, r.seedD].map((seed) => ({
        seed,
        promptVersion: (r.promptVersion === 2 ? 2 : 1) as LibraryPromptVersion,
        prose: r.prose,
        artifact,
      })),
    );
}

/** C/D seeds a cue was re-rolled at with the prose held identical — seed is the only lever. */
function regenSeededTakes(packId: string, cueId: string): LibrarySeededTake[] {
  const artifact: LibraryTakeArtifact = { root: LIBRARY_REGEN_ARTIFACT_ROOT, dir: packId };
  return (LIBRARY_CATALOG.regen_cd ?? [])
    .filter((r) => r.packId === packId && r.cueId === cueId)
    .flatMap((r) =>
      [r.seedC, r.seedD].map((seed) => ({
        seed,
        promptVersion: 1 as LibraryPromptVersion,
        prose: r.prose,
        artifact,
      })),
    );
}

/**
 * Every take of every cue in a pack, catalog order, lowest seed first.
 *
 * Each cue always has its catalog A/B pair. A cue the catalog re-rolled also
 * carries C/D takes — ADDITIONAL records on the same cue family, sourced from a
 * different artifact tree. They add no scene, no family and no binding, so
 * those counts stay 1:1 with cues.
 */
export function libraryTakesForPack(pack: LibraryPack): LibraryTake[] {
  const baseArtifact: LibraryTakeArtifact = { root: tierArtifactRoot(pack.tier), dir: pack.id };
  return pack.cues.flatMap((cue) => {
    const base: LibrarySeededTake[] = [cue.seedA, cue.seedB].map((seed) => ({
      seed,
      promptVersion: 1 as LibraryPromptVersion,
      prose: cue.prose,
      artifact: baseArtifact,
    }));
    const seeded = [
      ...base,
      ...revisionSeededTakes(pack.id, cue.id),
      ...regenSeededTakes(pack.id, cue.id),
    ].sort((a, b) => a.seed - b.seed);
    if (seeded.length > LIBRARY_TAKE_LETTERS.length) {
      throw new Error(
        `${pack.id}/${cue.id} derives ${seeded.length} takes; the letter ladder stops at ` +
          `${LIBRARY_TAKE_LETTERS[LIBRARY_TAKE_LETTERS.length - 1]}`,
      );
    }
    return seeded.map((t, i) => ({
      packId: pack.id,
      cueId: cue.id,
      seed: t.seed,
      take: LIBRARY_TAKE_LETTERS[i]!,
      familyId: libraryFamilyId(pack.id, cue.id),
      sceneId: librarySceneId(pack.id, cue.id),
      folder: libraryTakeFolder(cue.id, t.seed),
      playbackDefault: i === 0,
      promptVersion: t.promptVersion,
      prose: t.prose,
      artifact: t.artifact,
    }));
  });
}

/** Every take across every materialized pack. Exactly one catalog-prior default per cue. */
export const LIBRARY_TAKES: LibraryTake[] = LIBRARY_PACKS.flatMap((p) => libraryTakesForPack(p));

/** Takes for one pack. Throws on an unknown pack id (andon: never ingest a typo). */
export function libraryTakes(packId: string): LibraryTake[] {
  const pack = libraryCatalogPack(packId);
  if (!pack) {
    throw new Error(`No library catalog pack ${packId}`);
  }
  return libraryTakesForPack(pack);
}
