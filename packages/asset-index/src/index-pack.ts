import type { SoundtrackPack } from "@motif-studio/schema";
import type { PackIndex } from "./types.js";

/**
 * Build fast id-based lookup maps and detect duplicate ids within each entity collection.
 */
export function buildPackIndex(pack: SoundtrackPack): PackIndex {
  const assetsById = new Map<string, (typeof pack.assets)[number]>();
  const duplicateAssetIds = collectDuplicates(pack.assets, assetsById);

  const stemsById = new Map<string, (typeof pack.stems)[number]>();
  const duplicateStemIds = collectDuplicates(pack.stems, stemsById);

  const scenesById = new Map<string, (typeof pack.scenes)[number]>();
  const duplicateSceneIds = collectDuplicates(pack.scenes, scenesById);

  const bindingsById = new Map<string, (typeof pack.bindings)[number]>();
  const duplicateBindingIds = collectDuplicates(pack.bindings, bindingsById);

  const transitionsById = new Map<string, (typeof pack.transitions)[number]>();
  const duplicateTransitionIds = collectDuplicates(pack.transitions, transitionsById);

  return {
    assetsById,
    stemsById,
    scenesById,
    bindingsById,
    transitionsById,
    duplicateAssetIds,
    duplicateStemIds,
    duplicateSceneIds,
    duplicateBindingIds,
    duplicateTransitionIds,
  };
}

function collectDuplicates<T extends { id: string }>(
  items: T[],
  map: Map<string, T>,
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    } else {
      seen.add(item.id);
      map.set(item.id, item);
    }
  }
  return [...duplicates].sort();
}
