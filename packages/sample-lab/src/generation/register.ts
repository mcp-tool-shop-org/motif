import type { SoundtrackPack } from "@motif-studio/schema";
import type { IngestResult } from "./ingest.js";

/** Fold an ingested generation unit into a pack for score-map / clip-engine. */
export function registerGeneratedCue(
  pack: SoundtrackPack,
  ingested: IngestResult,
): SoundtrackPack {
  return {
    ...pack,
    assets: [...pack.assets, ...ingested.assets],
    stems: [...pack.stems, ...ingested.stems],
    scenes: ingested.scene ? [...pack.scenes, ingested.scene] : pack.scenes,
    cues: ingested.cue ? [...(pack.cues ?? []), ingested.cue] : pack.cues,
    generatedCues: [...(pack.generatedCues ?? []), ingested.record],
  };
}
