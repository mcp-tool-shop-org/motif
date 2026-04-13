import type { SoundtrackPack, AudioAsset, Stem, Scene } from "@motif-studio/schema";

/**
 * Find assets not referenced by any stem or transition stinger.
 */
export function findUnusedAssets(pack: SoundtrackPack): AudioAsset[] {
  const usedAssetIds = new Set<string>();
  for (const stem of pack.stems) usedAssetIds.add(stem.assetId);
  for (const tr of pack.transitions) {
    if (tr.stingerAssetId) usedAssetIds.add(tr.stingerAssetId);
  }
  return pack.assets.filter((a) => !usedAssetIds.has(a.id));
}

/**
 * Find stems not referenced by any scene layer.
 */
export function findUnusedStems(pack: SoundtrackPack): Stem[] {
  const usedStemIds = new Set<string>();
  for (const scene of pack.scenes) {
    for (const layer of scene.layers) usedStemIds.add(layer.stemId);
  }
  return pack.stems.filter((s) => !usedStemIds.has(s.id));
}

/**
 * Find scenes not referenced by any binding, fallback, or transition.
 */
export function findUnreferencedScenes(pack: SoundtrackPack): Scene[] {
  const referencedSceneIds = new Set<string>();
  for (const b of pack.bindings) referencedSceneIds.add(b.sceneId);
  for (const s of pack.scenes) {
    if (s.fallbackSceneId) referencedSceneIds.add(s.fallbackSceneId);
  }
  for (const t of pack.transitions) {
    referencedSceneIds.add(t.fromSceneId);
    referencedSceneIds.add(t.toSceneId);
  }
  return pack.scenes.filter((s) => !referencedSceneIds.has(s.id));
}
