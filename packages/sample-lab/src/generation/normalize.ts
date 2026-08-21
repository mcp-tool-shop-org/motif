import {
  BOOST_CAP_DB,
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
  boostCapped: boolean;
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

export interface SharedGain {
  requestedGainDb: number;
  actualGainDb: number;
  actualLinear: number;
  peakLimited: boolean;
  /** True when the requested boost exceeded the boost cap and was clamped. */
  boostCapped: boolean;
  groupPeak: number;
}

/**
 * One clamp for a set of files (mix + stems). Vertical layers must share the
 * same actual gain so they still sum after ingest.
 *
 * Boosts are capped at `boostCapDb` (default +6 dB); cuts are uncapped.
 * `requestedGainDb` in the result stays the UNCAPPED request so records
 * preserve the evidence that a take is a regeneration candidate.
 */
export function resolveSharedGain(
  files: Float32Array[][],
  requestedGainDb: number,
  peakLimit: number = PEAK_LIMIT,
  boostCapDb: number = BOOST_CAP_DB,
): SharedGain {
  let boostCapped = false;
  let cappedGainDb = requestedGainDb;
  if (requestedGainDb > boostCapDb) {
    cappedGainDb = boostCapDb;
    boostCapped = true;
  }
  const requestedLinear = dbToLinear(cappedGainDb);
  let groupPeak = 0;
  for (const file of files) {
    const p = peakOf(file);
    if (p > groupPeak) groupPeak = p;
  }
  let actualLinear = requestedLinear;
  let peakLimited = false;
  if (groupPeak > 0 && groupPeak * requestedLinear > peakLimit) {
    actualLinear = peakLimit / groupPeak;
    peakLimited = true;
  }
  return {
    requestedGainDb,
    actualGainDb: linearToDb(actualLinear),
    actualLinear,
    peakLimited,
    boostCapped,
    groupPeak,
  };
}

/** Scale planar PCM by a already-resolved linear gain. No further clamp. */
export function scalePlanar(channels: Float32Array[], linear: number): Float32Array[] {
  return channels.map((ch) => {
    const copy = new Float32Array(ch.length);
    for (let i = 0; i < ch.length; i++) copy[i] = ch[i]! * linear;
    return copy;
  });
}

/** Single-file gain (SFX). Music units must use resolveSharedGain over mix+stems. */
export function applyGain(
  channels: Float32Array[],
  gainDb: number,
  peakLimit: number = PEAK_LIMIT,
): GainResult {
  const shared = resolveSharedGain([channels], gainDb, peakLimit);
  return {
    channels: scalePlanar(channels, shared.actualLinear),
    requestedGainDb: gainDb,
    actualGainDb: shared.actualGainDb,
    peakLimited: shared.peakLimited,
    boostCapped: shared.boostCapped,
    peak: shared.groupPeak * shared.actualLinear,
  };
}
