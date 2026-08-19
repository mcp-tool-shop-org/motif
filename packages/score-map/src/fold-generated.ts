import type {
  AudioAsset,
  GeneratedCueRecord,
  Scene,
  SoundtrackPack,
  Stem,
} from "@motif-studio/schema";
import { attachGeneratedCueRecord } from "./cue-family.js";

export interface FoldableGenerated {
  record: GeneratedCueRecord;
  assets: AudioAsset[];
  stems: Stem[];
  familyId: string;
  sceneId: string;
  playbackDefault: boolean;
}

/**
 * Fold ingested generated cues into a pack: assets + stems, family attach
 * (lock-checked), and — for the playback-default take — scene layers.
 */
export function foldGeneratedIntoPack(
  pack: SoundtrackPack,
  items: FoldableGenerated[],
): SoundtrackPack {
  let next: SoundtrackPack = {
    ...pack,
    assets: [...pack.assets],
    stems: [...pack.stems],
    scenes: pack.scenes.map((s) => ({ ...s, layers: [...s.layers] })),
    cueFamilies: pack.cueFamilies ? [...pack.cueFamilies] : [],
    generatedCues: [...(pack.generatedCues ?? [])],
    cues: pack.cues ? [...pack.cues] : pack.cues,
  };

  for (const item of items) {
    const familyIndex = (next.cueFamilies ?? []).findIndex((f) => f.id === item.familyId);
    if (familyIndex < 0) {
      throw new Error(`foldGeneratedIntoPack: family ${item.familyId} not in pack`);
    }
    const attached = attachGeneratedCueRecord(next.cueFamilies![familyIndex]!, item.record);
    const families = [...(next.cueFamilies ?? [])];
    families[familyIndex] = attached;

    const scenes = next.scenes.map((scene) =>
      item.playbackDefault && scene.id === item.sceneId
        ? applyGeneratedLayers(scene, item.stems)
        : scene,
    );

    next = {
      ...next,
      assets: [...next.assets, ...item.assets],
      stems: [...next.stems, ...item.stems],
      scenes,
      cueFamilies: families,
      generatedCues: [...(next.generatedCues ?? []), item.record],
    };
  }

  return next;
}

function applyGeneratedLayers(scene: Scene, stems: Stem[]): Scene {
  const generatedLayers = stems.map((stem) => ({
    stemId: stem.id,
    required: stem.role === "base",
  }));
  const kept = scene.layers.filter((l) => l.stemId !== "s-placeholder");
  return {
    ...scene,
    layers: [...generatedLayers, ...kept.filter((l) => !stems.some((s) => s.id === l.stemId))],
    tags: [...new Set([...(scene.tags ?? []), "generated-audio"])],
  };
}
