import {
  MUSIC_BED_TARGET_LUFS,
  PEAK_LIMIT,
  SFX_CEILING_LUFS,
} from "./constants.js";
import type { GenerationKind } from "@motif-studio/schema";

export interface GainResult {
  channels: Float32Array[];
  requestedGainDb: number;
  actualGainDb: number;
  peakLimited: boolean;
  peak: number;
}

export function dbToLinear(db: number): number {
  return 10 ** (db / 20);
}

export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}

/**
 * Music: always hit the bed target.
 * SFX: never boost; only attenuate if hotter than the ceiling.
 */
export function ingestGainDb(
  kind: GenerationKind,
  measuredLufs: number,
  musicTarget: number = MUSIC_BED_TARGET_LUFS,
  sfxCeiling: number = SFX_CEILING_LUFS,
): number {
  if (kind === "music") return musicTarget - measuredLufs;
  return Math.min(0, sfxCeiling - measuredLufs);
}

export function peakOf(channels: Float32Array[]): number {
  let peak = 0;
  for (const ch of channels) {
    for (let i = 0; i < ch.length; i++) {
      const a = Math.abs(ch[i]!);
      if (a > peak) peak = a;
    }
  }
  return peak;
}

export function applyGain(
  channels: Float32Array[],
  gainDb: number,
  peakLimit: number = PEAK_LIMIT,
): GainResult {
  const linear = dbToLinear(gainDb);
  const peak = peakOf(channels);
  let actualLinear = linear;
  let peakLimited = false;
  if (peak > 0 && peak * linear > peakLimit) {
    actualLinear = peakLimit / peak;
    peakLimited = true;
  }
  const actualGainDb = linearToDb(actualLinear);
  const out = channels.map((ch) => {
    const copy = new Float32Array(ch.length);
    for (let i = 0; i < ch.length; i++) copy[i] = ch[i]! * actualLinear;
    return copy;
  });
  return {
    channels: out,
    requestedGainDb: gainDb,
    actualGainDb,
    peakLimited,
    peak: peak * actualLinear,
  };
}
