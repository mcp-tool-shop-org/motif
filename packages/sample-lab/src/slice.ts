import type { SampleSlice } from "@motif/schema";

/** Create evenly spaced slices across a region. */
export function sliceEvenly(
  assetId: string,
  startMs: number,
  endMs: number,
  count: number,
  namePrefix = "Slice",
): SampleSlice[] {
  if (count <= 0) return [];
  const span = endMs - startMs;
  const step = span / count;
  const slices: SampleSlice[] = [];
  for (let i = 0; i < count; i++) {
    slices.push({
      id: `${assetId}-slice-${i}`,
      assetId,
      name: `${namePrefix} ${i + 1}`,
      startMs: startMs + i * step,
      endMs: startMs + (i + 1) * step,
    });
  }
  return slices;
}

/** Create slices from a list of onset times (ms). */
export function sliceAtOnsets(
  assetId: string,
  onsets: number[],
  totalEndMs: number,
  namePrefix = "Hit",
): SampleSlice[] {
  if (onsets.length === 0) return [];
  const sorted = [...onsets].sort((a, b) => a - b);
  return sorted.map((onset, i) => ({
    id: `${assetId}-hit-${i}`,
    assetId,
    name: `${namePrefix} ${i + 1}`,
    startMs: onset,
    endMs: i < sorted.length - 1 ? sorted[i + 1] : totalEndMs,
  }));
}

/** Duration of a single slice. */
export function sliceDurationMs(slice: SampleSlice): number {
  return slice.endMs - slice.startMs;
}
