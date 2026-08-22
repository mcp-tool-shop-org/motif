import { join } from "node:path";
import type { GenerationParams } from "@motif-studio/schema";
import {
  ACE_STEP_WORKFLOW_ID,
  GROUNDED_TAKES,
  groundedArtifactRoot,
  specForFamily,
  styleTagsFor,
  type GroundedTake,
} from "@motif-studio/score-map";
import { ingestRunArtifact, type IngestResult } from "./ingest.js";
import type { FoldableGenerated } from "@motif-studio/score-map";

/** Public audio root inside the studio app; each take lands under `grounded-v<wave>/<folder>/`. */
export const DEFAULT_GROUNDED_PUBLIC_ROOT = "apps/studio/public/audio";

export function groundedPublicDir(wave: GroundedTake["wave"]): string {
  return `grounded-v${wave}`;
}

function publicSrc(wave: GroundedTake["wave"], folder: string, filename: string): string {
  return `/audio/${groundedPublicDir(wave)}/${folder}/masters/${filename}`;
}

function rewriteSrcs(result: IngestResult, take: GroundedTake): IngestResult {
  const mapSrc = (src: string): string => {
    const base = src.replace(/\\/g, "/").split("/").pop() ?? src;
    return publicSrc(take.wave, take.folder, base);
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

/**
 * Exact generation params a take RAN with. Prose resolves through the take's
 * promptVersion (wave-2 = v1, wave-3 = v2) — never the family's current
 * grammar — so records echo what was actually submitted.
 */
export function generationParamsForTake(take: GroundedTake): GenerationParams {
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
    jobId: take.jobId,
    prompt: styleTagsFor(take.familyId, take.promptVersion),
    requestedDurationSec: spec.durationSec,
  };
}

export async function ingestGroundedTake(
  take: GroundedTake,
  options: { publicAudioRoot: string; artifactRoot?: string },
): Promise<FoldableGenerated> {
  const artifactDir = join(
    options.artifactRoot ?? groundedArtifactRoot(take.wave),
    take.folder,
  );
  const destDir = join(options.publicAudioRoot, groundedPublicDir(take.wave), take.folder);
  const takeId = `${take.cueId}-s${take.seed}`;
  const raw = await ingestRunArtifact(artifactDir, {
    id: takeId,
    name: take.cueId,
    destDir,
    generation: generationParamsForTake(take),
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

export async function ingestAllGrounded(options: {
  publicAudioRoot: string;
  artifactRoot?: string;
  takes?: GroundedTake[];
}): Promise<FoldableGenerated[]> {
  const takes = options.takes ?? GROUNDED_TAKES;
  const out: FoldableGenerated[] = [];
  for (const take of takes) {
    out.push(await ingestGroundedTake(take, options));
  }
  return out;
}
