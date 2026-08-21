import { readFileSync } from "node:fs";
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
  type LibraryTake,
} from "@motif-studio/score-map";
import { GenerationError } from "./errors.js";
import { ingestRunArtifact, type IngestResult } from "./ingest.js";

/**
 * Tier-1 run artifacts (FLAC masters + stems + LUFS), one folder per take under
 * `<root>/<packId>/<cueId>-s<seed>/`. Gitignored, outside the tree; override
 * through `artifactRoot` when the collection lives elsewhere.
 */
export const LIBRARY_TIER1_ARTIFACT_ROOT =
  "E:\\AI\\readouts\\model-knowledge\\generated\\library-tier1";

/** Public audio root inside the studio app; each take lands under `library-packs/<packId>/<folder>/`. */
export const DEFAULT_LIBRARY_PUBLIC_ROOT = "apps/studio/public/audio";

/** Authoritative job_id ↔ cueId/seed/folder map, written by the collection run. */
export const LIBRARY_COLLECTION_PLAN_FILE = "tier1-collection-plan.json";

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
 * job_id per take, keyed `<packId>/<folder>`. Read from the artifact root
 * rather than vendored — it is a receipt of the collection run, not a spec.
 */
export function loadLibraryCollectionPlan(
  artifactRoot: string = LIBRARY_TIER1_ARTIFACT_ROOT,
): Map<string, string> {
  const path = join(artifactRoot, LIBRARY_COLLECTION_PLAN_FILE);
  const plan = JSON.parse(readFileSync(path, "utf-8")) as LibraryCollectionPlan;
  const byTake = new Map<string, string>();
  for (const [packId, entry] of Object.entries(plan)) {
    for (const item of entry.items ?? []) {
      byTake.set(`${packId}/${item.folder}`, item.job_id);
    }
  }
  return byTake;
}

/** Full generation-job UUID for a take. Andon: a missing or truncated id halts the ingest. */
export function jobIdForTake(take: LibraryTake, plan: Map<string, string>): string {
  const jobId = plan.get(`${take.packId}/${take.folder}`);
  if (!jobId) {
    throw new GenerationError(
      "LIBRARY_JOB_ID",
      `No collection-plan entry for ${take.packId}/${take.folder}`,
    );
  }
  if (!FULL_UUID.test(jobId)) {
    throw new GenerationError(
      "LIBRARY_JOB_ID",
      `Collection-plan job_id for ${take.packId}/${take.folder} is not a full UUID: ${jobId}`,
    );
  }
  return jobId;
}

// ── Generation params ──

/**
 * Exact generation params a take RAN with. bpm / keyscale / prose come from the
 * catalog cue and the seed from the take, so records echo what was actually
 * submitted — never a newer or edited prose string.
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
    prompt: cue.prose,
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
  artifactRoot?: string;
  /** Pre-loaded plan; loaded from `artifactRoot` when omitted. */
  plan?: Map<string, string>;
}

export async function ingestLibraryTake(
  take: LibraryTake,
  options: LibraryIngestOptions,
): Promise<FoldableGenerated> {
  const artifactRoot = options.artifactRoot ?? LIBRARY_TIER1_ARTIFACT_ROOT;
  const plan = options.plan ?? loadLibraryCollectionPlan(artifactRoot);
  const artifactDir = join(artifactRoot, take.packId, take.folder);
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

/** Every take of one catalog pack, catalog order (A take first). */
export async function ingestLibraryPack(
  packId: string,
  options: LibraryIngestOptions,
): Promise<FoldableGenerated[]> {
  const artifactRoot = options.artifactRoot ?? LIBRARY_TIER1_ARTIFACT_ROOT;
  const plan = options.plan ?? loadLibraryCollectionPlan(artifactRoot);
  const out: FoldableGenerated[] = [];
  for (const take of libraryTakes(packId)) {
    out.push(await ingestLibraryTake(take, { ...options, artifactRoot, plan }));
  }
  return out;
}
