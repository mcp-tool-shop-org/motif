import type { ScoreProfile } from "@motif-studio/schema";

/** Create a score profile with defaults. */
export function createScoreProfile(id: string, name: string): ScoreProfile {
  return { id, name };
}

/** Check if a BPM falls within the profile's tempo range. */
export function isTempoInRange(profile: ScoreProfile, bpm: number): boolean {
  if (profile.tempoMin != null && bpm < profile.tempoMin) return false;
  if (profile.tempoMax != null && bpm > profile.tempoMax) return false;
  return true;
}

/** Check if an intensity value falls within the profile's range. */
export function isIntensityInRange(profile: ScoreProfile, intensity: number): boolean {
  if (profile.intensityMin != null && intensity < profile.intensityMin) return false;
  if (profile.intensityMax != null && intensity > profile.intensityMax) return false;
  return true;
}

/** Return the set of tags from sample palette that match a given set of asset tags. */
export function matchingPaletteTags(
  profile: ScoreProfile,
  assetTags: string[],
): string[] {
  const palette = profile.samplePaletteTags ?? [];
  return palette.filter((t) => assetTags.includes(t));
}

/** Merge two profiles, second wins on conflicts. */
export function mergeProfiles(
  base: ScoreProfile,
  overlay: Partial<Omit<ScoreProfile, "id" | "name">>,
): ScoreProfile {
  return {
    ...base,
    ...overlay,
    key: overlay.key ?? base.key,
    scale: overlay.scale ?? base.scale,
    tempoMin: overlay.tempoMin ?? base.tempoMin,
    tempoMax: overlay.tempoMax ?? base.tempoMax,
    intensityMin: overlay.intensityMin ?? base.intensityMin,
    intensityMax: overlay.intensityMax ?? base.intensityMax,
    preferredKitIds: overlay.preferredKitIds ?? base.preferredKitIds,
    preferredInstrumentIds: overlay.preferredInstrumentIds ?? base.preferredInstrumentIds,
    motifFamilyIds: overlay.motifFamilyIds ?? base.motifFamilyIds,
    samplePaletteTags: overlay.samplePaletteTags ?? base.samplePaletteTags,
    tags: overlay.tags ?? base.tags,
    notes: overlay.notes ?? base.notes,
    defaultIntensity: overlay.defaultIntensity ?? base.defaultIntensity,
    defaultBrightness: overlay.defaultBrightness ?? base.defaultBrightness,
    defaultSpace: overlay.defaultSpace ?? base.defaultSpace,
    defaultTransitionEnergy: overlay.defaultTransitionEnergy ?? base.defaultTransitionEnergy,
  };
}
