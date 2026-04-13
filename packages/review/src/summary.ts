import type { SoundtrackPack } from "@motif/schema";
import {
  findUnusedAssets,
  findUnusedStems,
  findUnreferencedScenes,
} from "@motif/asset-index";
import type { PackSummary } from "./types.js";

/**
 * Build a top-level summary of pack contents and structure.
 */
export function summarizePack(pack: SoundtrackPack): PackSummary {
  // ── Categories ──
  const categoriesPresent = [
    ...new Set(pack.scenes.map((s) => s.category)),
  ].sort();

  // ── Stem role distribution (present roles only) ──
  const stemRoleDistribution: Record<string, number> = {};
  for (const stem of pack.stems) {
    stemRoleDistribution[stem.role] =
      (stemRoleDistribution[stem.role] ?? 0) + 1;
  }

  // ── Unused counts ──
  const unusedAssets = findUnusedAssets(pack).length;
  const unusedStems = findUnusedStems(pack).length;
  const unreferencedScenes = findUnreferencedScenes(pack).length;

  return {
    meta: {
      id: pack.meta.id,
      name: pack.meta.name,
      version: pack.meta.version,
      schemaVersion: pack.meta.schemaVersion,
    },
    counts: {
      assets: pack.assets.length,
      stems: pack.stems.length,
      scenes: pack.scenes.length,
      bindings: pack.bindings.length,
      transitions: pack.transitions.length,
    },
    categoriesPresent,
    stemRoleDistribution,
    unused: {
      assets: unusedAssets,
      stems: unusedStems,
      scenes: unreferencedScenes,
    },
  };
}
