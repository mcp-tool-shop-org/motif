import type {
  GeneratedCueRecord,
  GenerationStemLayer,
  GenerationStemRole,
  IntensityLevel,
} from "@motif-studio/schema";

/**
 * Demucs stems → authored intensity tiers.
 * low  = no drums (stealth / calm bed)
 * mid  = full instrumental bed
 * high = everything (vocals included; [inst] vocals are near-silent)
 */
export const STEM_ROLES_BY_INTENSITY: Record<IntensityLevel, readonly GenerationStemRole[]> = {
  low: ["bass", "other"],
  mid: ["bass", "drums", "other"],
  high: ["bass", "drums", "other", "vocals"],
};

export function stemRolesForIntensity(level: IntensityLevel): GenerationStemRole[] {
  return [...STEM_ROLES_BY_INTENSITY[level]];
}

export function resolveGeneratedStemLayers(
  record: GeneratedCueRecord,
  level: IntensityLevel,
): GenerationStemLayer[] {
  const wanted = new Set(stemRolesForIntensity(level));
  return (record.stems ?? []).filter((layer) => wanted.has(layer.role));
}

export function resolveGeneratedMasterSrcs(
  record: GeneratedCueRecord,
  level: IntensityLevel,
): string[] {
  return resolveGeneratedStemLayers(record, level).map((layer) => layer.masterSrc);
}
