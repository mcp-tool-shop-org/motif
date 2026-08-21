import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GenerationParams } from "@motif-studio/schema";
import {
  ACE_STEP_WORKFLOW_ID,
  LIBRARY_DURATION_SEC,
  LIBRARY_LYRICS_TAG,
  LIBRARY_TIMESIGNATURE,
  libraryCatalogCue,
  libraryCueTitle,
  libraryTakes,
  type FoldableGenerated,
  type LibraryArtifactRootId,
  type LibraryTake,
} from "@motif-studio/score-map";
import { GenerationError } from "./errors.js";
import { ingestRunArtifact, type IngestResult } from "./ingest.js";

/**
 * Run artifacts (FLAC masters + stems + LUFS) per artifact tree, one folder per
 * take under `<root>/<dir>/<cueId>-s<seed>/`. `<dir>` is the owning pack id
 * everywhere except the Tier-1 revisions, which sit in a `tier1-revisions`
 * pseudo-pack under the Tier-2 root. All gitignored and outside the tree;
 * override through `roots` when a collection lives elsewhere.
 */
export const LIBRARY_ARTIFACT_ROOTS: Record<LibraryArtifactRootId, string> = {
  tier1: "E:\\AI\\readouts\\model-knowledge\\generated\\library-tier1",
  tier2: "E:\\AI\\readouts\\model-knowledge\\generated\\library-tier2",
  tier3: "E:\\AI\\readouts\\model-knowledge\\generated\\library-tier3",
  "regen-cd": "E:\\AI\\readouts\\model-knowledge\\generated\\library-regen-cd",
};

/** The Tier-1 tree on its own — the shorthand single-tier callers already import. */
export const LIBRARY_TIER1_ARTIFACT_ROOT = LIBRARY_ARTIFACT_ROOTS.tier1;

/** Public audio root inside the studio app; each take lands under `library-packs/<packId>/<folder>/`. */
export const DEFAULT_LIBRARY_PUBLIC_ROOT = "apps/studio/public/audio";

/**
 * Authoritative job_id ↔ cueId/seed/folder map per artifact tree, written by
 * that tree's collection run. Read from the root, never vendored — a receipt,
 * not a spec.
 */
export const LIBRARY_COLLECTION_PLAN_FILES: Record<LibraryArtifactRootId, string> = {
  tier1: "tier1-collection-plan.json",
  tier2: "tier2-collection-plan.json",
  tier3: "tier3-collection-plan.json",
  "regen-cd": "regen-cd-collection-plan.json",
};

/** The Tier-1 plan filename on its own — `loadLibraryCollectionPlan`'s default. */
export const LIBRARY_COLLECTION_PLAN_FILE = LIBRARY_COLLECTION_PLAN_FILES.tier1;

const FULL_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function libraryPublicDir(packId: string): string {
  return join("library-packs", packId).replace(/\\/g, "/");
}

/** Root-relative src the studio serves a take's master from. */
export function libraryPublicSrc(
  packId: string,
  folder: string,
  filename: string,
): string {
  return `/audio/${libraryPublicDir(packId)}/${folder}/masters/${filename}`;
}

// ── Collection plan (job identity) ──

export interface LibraryCollectionPlanItem {
  job_id: string;
  cueId: string;
  seed: number;
  folder: string;
  label: string;
}

export type LibraryCollectionPlan = Record<
  string,
  { batch_id: string; items: LibraryCollectionPlanItem[] }
>;

/**
 * job_id per take, keyed `<dir>/<folder>` — the plan's own top-level key plus
 * the take folder. Read from the artifact root rather than vendored — it is a
 * receipt of the collection run, not a spec.
 */
export function loadLibraryCollectionPlan(
  artifactRoot: string = LIBRARY_ARTIFACT_ROOTS.tier1,
  planFile: string = LIBRARY_COLLECTION_PLAN_FILES.tier1,
): Map<string, string> {
  const path = join(artifactRoot, planFile);
  const plan = JSON.parse(readFileSync(path, "utf-8")) as LibraryCollectionPlan;
  const byTake = new Map<string, string>();
  for (const [dir, entry] of Object.entries(plan)) {
    for (const item of entry.items ?? []) {
      byTake.set(`${dir}/${item.folder}`, item.job_id);
    }
  }
  return byTake;
}

/**
 * Every artifact tree's plan merged into one map. Trees whose collection run
 * has not happened yet have no plan file and are simply absent — their takes
 * skip on missing masters, which live in the same tree.
 *
 * Seeds are globally unique across the catalog, and a folder is
 * `<cueId>-s<seed>`, so `<dir>/<folder>` cannot collide across trees. A
 * duplicate key therefore means two collection runs disagree — andon.
 */
export function loadLibraryPlans(
  roots: Partial<Record<LibraryArtifactRootId, string>> = LIBRARY_ARTIFACT_ROOTS,
): Map<string, string> {
  const merged = new Map<string, string>();
  for (const [rootId, root] of Object.entries(roots) as Array<
    [LibraryArtifactRootId, string]
  >) {
    const planFile = LIBRARY_COLLECTION_PLAN_FILES[rootId];
    if (!existsSync(join(root, planFile))) continue;
    for (const [key, jobId] of loadLibraryCollectionPlan(root, planFile)) {
      const seen = merged.get(key);
      if (seen && seen !== jobId) {
        throw new GenerationError(
          "LIBRARY_JOB_ID",
          `Collection plans disagree on ${key}: ${seen} vs ${jobId}`,
        );
      }
      merged.set(key, jobId);
    }
  }
  return merged;
}

/** Plan key for a take: its artifact directory plus its folder. */
export function libraryTakePlanKey(take: LibraryTake): string {
  return `${take.artifact.dir}/${take.folder}`;
}

/** Full generation-job UUID for a take. Andon: a missing or truncated id halts the ingest. */
export function jobIdForTake(take: LibraryTake, plan: Map<string, string>): string {
  const key = libraryTakePlanKey(take);
  const jobId = plan.get(key);
  if (!jobId) {
    throw new GenerationError("LIBRARY_JOB_ID", `No collection-plan entry for ${key}`);
  }
  if (!FULL_UUID.test(jobId)) {
    throw new GenerationError(
      "LIBRARY_JOB_ID",
      `Collection-plan job_id for ${key} is not a full UUID: ${jobId}`,
    );
  }
  return jobId;
}

// ── Generation params ──

/**
 * Exact generation params a take RAN with. bpm / keyscale come from the catalog
 * cue — every re-roll held them identical, prose was the only lever ever pulled
 * — while the seed and the prose come from the take itself, so a v2 revision
 * echoes its own string instead of the cue's v1 one.
 */
export function generationParamsForLibraryTake(
  take: LibraryTake,
  jobId: string,
): GenerationParams {
  const cue = libraryCatalogCue(take.packId, take.cueId);
  if (!cue) {
    throw new GenerationError(
      "LIBRARY_CUE",
      `No catalog cue ${take.packId}/${take.cueId}`,
    );
  }
  return {
    bpm: cue.bpm,
    keyscale: cue.keyscale,
    timesignature: LIBRARY_TIMESIGNATURE,
    lyricsTag: LIBRARY_LYRICS_TAG,
    seed: take.seed,
    workflowId: ACE_STEP_WORKFLOW_ID,
    jobId,
    prompt: take.prose,
    requestedDurationSec: LIBRARY_DURATION_SEC,
  };
}

// ── Ingest ──

function rewriteSrcs(result: IngestResult, take: LibraryTake): IngestResult {
  const mapSrc = (src: string): string => {
    const base = src.replace(/\\/g, "/").split("/").pop() ?? src;
    return libraryPublicSrc(take.packId, take.folder, base);
  };
  const assets = result.assets.map((a) => ({ ...a, src: mapSrc(a.src) }));
  const record = {
    ...result.record,
    mix: result.record.mix
      ? { ...result.record.mix, masterSrc: mapSrc(result.record.mix.masterSrc) }
      : result.record.mix,
    stems: result.record.stems?.map((s) => ({ ...s, masterSrc: mapSrc(s.masterSrc) })),
  };
  return { ...result, assets, record };
}

export interface LibraryIngestOptions {
  publicAudioRoot: string;
  /** Filesystem root per artifact tree; defaults to `LIBRARY_ARTIFACT_ROOTS`. */
  roots?: Partial<Record<LibraryArtifactRootId, string>>;
  /**
   * Collapse every artifact tree onto one root — the single-tier escape hatch
   * a relocated Tier-1 collection used before there were other trees.
   */
  artifactRoot?: string;
  /** Pre-loaded merged plan; loaded from `roots` when omitted. */
  plan?: Map<string, string>;
  /** Explicit take list; defaults to every take the catalog derives for the pack. */
  takes?: LibraryTake[];
  /** Called instead of ingesting when a take's masters are not on disk yet. */
  onSkip?: (take: LibraryTake, artifactDir: string) => void;
}

function rootsFor(options: LibraryIngestOptions): Record<LibraryArtifactRootId, string> {
  if (options.artifactRoot != null) {
    const one = options.artifactRoot;
    return { tier1: one, tier2: one, tier3: one, "regen-cd": one };
  }
  return { ...LIBRARY_ARTIFACT_ROOTS, ...options.roots };
}

/** Folder holding a take's masters: `<tree root>/<artifact dir>/<folder>/`. */
export function libraryTakeArtifactDir(
  take: LibraryTake,
  roots: Partial<Record<LibraryArtifactRootId, string>> = LIBRARY_ARTIFACT_ROOTS,
): string {
  const root = roots[take.artifact.root];
  if (!root) {
    throw new GenerationError(
      "LIBRARY_ARTIFACT_ROOT",
      `No artifact root configured for tree ${take.artifact.root} (${take.packId}/${take.folder})`,
    );
  }
  return join(root, take.artifact.dir, take.folder);
}

export async function ingestLibraryTake(
  take: LibraryTake,
  options: LibraryIngestOptions,
): Promise<FoldableGenerated> {
  const roots = rootsFor(options);
  const plan = options.plan ?? loadLibraryPlans(roots);
  const artifactDir = libraryTakeArtifactDir(take, roots);
  const destDir = join(options.publicAudioRoot, libraryPublicDir(take.packId), take.folder);
  const raw = await ingestRunArtifact(artifactDir, {
    id: take.folder,
    name: libraryCueTitle(take.cueId),
    destDir,
    generation: generationParamsForLibraryTake(take, jobIdForTake(take, plan)),
    failOnVocalBleed: false,
  });
  const result = rewriteSrcs(raw, take);
  return {
    record: result.record,
    assets: result.assets,
    stems: result.stems,
    familyId: take.familyId,
    sceneId: take.sceneId,
    playbackDefault: take.playbackDefault,
  };
}

/**
 * Pick one playback default per cue family from the MEASURED ingest: the
 * lowest-seed take that cleared the +6 dB boost cap, falling back to the lowest
 * seed when every take of that cue capped.
 *
 * Why not simply lowest-seed-wins: nine cues lost BOTH their A and B takes to
 * the cap, and the C/D re-rolls exist purely to rescue them. Under a
 * lowest-seed rule the rescue is inert — the studio keeps bedding a near-silent
 * take with a good one sitting right beside it in the same family. `boostCapped`
 * is only known after normalization, which is why this runs on ingest results
 * and not on the catalog.
 */
export function selectPlaybackDefaults(items: FoldableGenerated[]): FoldableGenerated[] {
  const byFamily = new Map<string, FoldableGenerated[]>();
  for (const item of items) {
    const bucket = byFamily.get(item.familyId);
    if (bucket) bucket.push(item);
    else byFamily.set(item.familyId, [item]);
  }
  const defaults = new Set<FoldableGenerated>();
  for (const bucket of byFamily.values()) {
    const bySeed = [...bucket].sort((a, b) => a.record.generation.seed - b.record.generation.seed);
    const chosen = bySeed.find((i) => !i.record.boostCapped) ?? bySeed[0];
    if (chosen) defaults.add(chosen);
  }
  return items.map((item) => ({ ...item, playbackDefault: defaults.has(item) }));
}

/**
 * Every take of one catalog pack — its A/B pair plus any C/D re-rolls, in seed
 * order — with the playback default re-decided from the measured result.
 *
 * A take whose masters are not on disk yet is skipped rather than andoned: the
 * re-roll trees are collected wave by wave, so an absent folder means "not
 * collected", while a folder that exists but is incomplete still halts.
 */
export async function ingestLibraryPack(
  packId: string,
  options: LibraryIngestOptions,
): Promise<FoldableGenerated[]> {
  const roots = rootsFor(options);
  const plan = options.plan ?? loadLibraryPlans(roots);
  const out: FoldableGenerated[] = [];
  for (const take of options.takes ?? libraryTakes(packId)) {
    const artifactDir = libraryTakeArtifactDir(take, roots);
    if (!existsSync(artifactDir)) {
      options.onSkip?.(take, artifactDir);
      continue;
    }
    out.push(await ingestLibraryTake(take, { ...options, roots, plan }));
  }
  return selectPlaybackDefaults(out);
}
