import type { AudioAsset } from "@motif-studio/schema";

// ── Trim region ──

export interface TrimRegion {
  startMs: number;
  endMs: number;
}

export interface LoopRegion {
  loopStartMs: number;
  loopEndMs: number;
}

/** Resolve effective trim region for an asset-level trim. */
export function resolveTrimRegion(asset: AudioAsset): TrimRegion {
  return {
    startMs: asset.trimStartMs ?? 0,
    endMs: asset.trimEndMs ?? asset.durationMs,
  };
}

/** Resolve effective loop region for an asset. */
export function resolveLoopRegion(asset: AudioAsset): LoopRegion {
  return {
    loopStartMs: asset.loopStartMs ?? 0,
    loopEndMs: asset.loopEndMs ?? asset.durationMs,
  };
}

/** Return a new asset with trim applied. */
export function applyTrim(
  asset: AudioAsset,
  startMs: number,
  endMs: number,
): AudioAsset {
  return { ...asset, trimStartMs: startMs, trimEndMs: endMs };
}

/** Return a new asset with loop points applied. */
export function applyLoopPoints(
  asset: AudioAsset,
  loopStartMs: number,
  loopEndMs: number,
): AudioAsset {
  return { ...asset, loopStartMs, loopEndMs };
}
