import type { SoundtrackPack } from "@motif/schema";
import type { ActiveLayerPlan } from "./types.js";

/**
 * Resolve activated stems for a given scene.
 *
 * - Returns stemIds in scene-layer order, de-duped (first occurrence wins).
 * - Warns on missing scene or missing stems; never throws.
 */
export function resolveActiveLayers(
  pack: SoundtrackPack,
  sceneId: string,
): ActiveLayerPlan {
  const scene = pack.scenes.find((s) => s.id === sceneId);
  if (!scene) {
    return {
      sceneId,
      stemIds: [],
      requiredStemIds: [],
      warnings: [`scene not found: ${sceneId}`],
    };
  }

  const warnings: string[] = [];
  const stemIds: string[] = [];
  const requiredStemIds: string[] = [];
  const seen = new Set<string>();

  const stemsById = new Map(pack.stems.map((s) => [s.id, s]));

  for (const layer of scene.layers) {
    if (seen.has(layer.stemId)) continue;
    seen.add(layer.stemId);

    if (!stemsById.has(layer.stemId)) {
      warnings.push(
        `scene ${sceneId} references missing stem: ${layer.stemId}`,
      );
      continue;
    }

    stemIds.push(layer.stemId);
    if (layer.required) {
      requiredStemIds.push(layer.stemId);
    }
  }

  return {
    sceneId,
    sceneName: scene.name,
    stemIds,
    requiredStemIds,
    warnings,
  };
}
