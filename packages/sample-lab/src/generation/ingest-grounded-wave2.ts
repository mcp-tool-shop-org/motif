import { join } from "node:path";
import type { GenerationParams } from "@motif-studio/schema";
import {
  ACE_STEP_WORKFLOW_ID,
  GROUNDED_WAVE2_ROOT,
  GROUNDED_WAVE2_TAKES,
  specForFamily,
  type GroundedWave2Take,
} from "@motif-studio/score-map";
import { ingestRunArtifact, type IngestResult } from "./ingest.js";
import type { FoldableGenerated } from "@motif-studio/score-map";

export const DEFAULT_WAVE2_PUBLIC_DIR = "apps/studio/public/audio/grounded-v2";

function publicSrc(folder: string, filename: string): string {
  return `/audio/grounded-v2/${folder}/masters/${filename}`;
}

function rewriteSrcs(result: IngestResult, takeId: string): IngestResult {
  const mapSrc = (src: string): string => {
    const base = src.replace(/\\/g, "/").split("/").pop() ?? src;
    return publicSrc(takeId, base);
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

export function generationParamsForTake(take: GroundedWave2Take): GenerationParams {
  const spec = specForFamily(take.familyId);
  if (!spec) {
    throw new Error(`No generation spec for family ${take.familyId}`);
  }
  return {
    bpm: spec.lock.bpm,
    keyscale: spec.lock.keyscale,
    timesignature: spec.lock.timesignature,
    lyricsTag: spec.lyricsTag,
    seed: take.seed,
    workflowId: ACE_STEP_WORKFLOW_ID,
    jobId: take.jobIdPrefix,
    prompt: spec.styleTags,
    requestedDurationSec: spec.durationSec,
  };
}

export async function ingestGroundedWave2Take(
  take: GroundedWave2Take,
  options: { destRoot: string; artifactRoot?: string },
): Promise<FoldableGenerated> {
  const artifactDir = join(options.artifactRoot ?? GROUNDED_WAVE2_ROOT, take.folder);
  const destDir = join(options.destRoot, take.folder);
  const takeId = `${take.cueId}-s${take.seed}`;
  const raw = await ingestRunArtifact(artifactDir, {
    id: takeId,
    name: take.cueId,
    destDir,
    generation: generationParamsForTake(take),
    failOnVocalBleed: false,
  });
  const result = rewriteSrcs(raw, take.folder);
  return {
    record: result.record,
    assets: result.assets,
    stems: result.stems,
    familyId: take.familyId,
    sceneId: take.sceneId,
    playbackDefault: take.playbackDefault,
  };
}

export async function ingestAllGroundedWave2(options: {
  destRoot: string;
  artifactRoot?: string;
  takes?: GroundedWave2Take[];
}): Promise<FoldableGenerated[]> {
  const takes = options.takes ?? GROUNDED_WAVE2_TAKES;
  const out: FoldableGenerated[] = [];
  for (const take of takes) {
    out.push(await ingestGroundedWave2Take(take, options));
  }
  return out;
}
