import type { GenerationStemRole } from "@motif-studio/schema";
import { NEAR_SILENT_RELATIVE_DB, NEAR_SILENT_RMS } from "./constants.js";
import { GenerationError } from "./errors.js";

export function rmsOf(channels: Float32Array[]): number {
  let sumSq = 0;
  let n = 0;
  for (const ch of channels) {
    for (let i = 0; i < ch.length; i++) {
      const s = ch[i]!;
      sumSq += s * s;
      n += 1;
    }
  }
  if (n === 0) return 0;
  return Math.sqrt(sumSq / n);
}

export function isNearSilent(
  channels: Float32Array[],
  mixRms?: number,
): boolean {
  const rms = rmsOf(channels);
  if (rms < NEAR_SILENT_RMS) return true;
  if (mixRms != null && mixRms > 0) {
    const relDb = 20 * Math.log10(rms / mixRms);
    if (relDb <= -NEAR_SILENT_RELATIVE_DB) return true;
  }
  return false;
}

export function assertStemSampleCountsEqual(
  counts: Array<{ role: GenerationStemRole; samples: number }>,
): void {
  if (counts.length === 0) return;
  const unique = new Set(counts.map((c) => c.samples));
  if (unique.size !== 1) {
    const detail = counts.map((c) => `${c.role}=${c.samples}`).join(", ");
    throw new GenerationError(
      "STEM_MISALIGN",
      `Stem sample counts are not equal (${detail})`,
    );
  }
}
