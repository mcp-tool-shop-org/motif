import type {
  ScoreMapEntry,
  ScoreMapContextType,
  ScoreProfile,
  CueFamily,
  MotifFamily,
  SoundtrackPack,
} from "@motif/schema";

/** Create a new score map entry. */
export function createScoreMapEntry(
  id: string,
  name: string,
  contextType: ScoreMapContextType,
): ScoreMapEntry {
  return { id, name, contextType };
}

/** Resolve the effective score profile for a score map entry. */
export function resolveProfile(
  entry: ScoreMapEntry,
  profiles: ScoreProfile[],
): ScoreProfile | undefined {
  if (!entry.scoreProfileId) return undefined;
  return profiles.find((p) => p.id === entry.scoreProfileId);
}

/** Resolve all cue families linked to a score map entry. */
export function resolveCueFamilies(
  entry: ScoreMapEntry,
  families: CueFamily[],
): CueFamily[] {
  const ids = new Set(entry.cueFamilyIds ?? []);
  return families.filter((f) => ids.has(f.id));
}

/** Resolve all motif families linked to a score map entry. */
export function resolveMotifFamilies(
  entry: ScoreMapEntry,
  motifs: MotifFamily[],
): MotifFamily[] {
  const ids = new Set(entry.motifFamilyIds ?? []);
  return motifs.filter((m) => ids.has(m.id));
}

/** Get all scene IDs reachable from a score map entry through its cue families. */
export function entrySceneIds(
  entry: ScoreMapEntry,
  families: CueFamily[],
): string[] {
  const resolved = resolveCueFamilies(entry, families);
  return [...new Set(resolved.flatMap((f) => f.sceneIds))];
}

/** Filter score map entries by context type. */
export function entriesByContext(
  entries: ScoreMapEntry[],
  contextType: ScoreMapContextType,
): ScoreMapEntry[] {
  return entries.filter((e) => e.contextType === contextType);
}

/** Get all entries that share at least one motif family. */
export function entriesSharingMotif(
  entries: ScoreMapEntry[],
  motifFamilyId: string,
): ScoreMapEntry[] {
  return entries.filter((e) => (e.motifFamilyIds ?? []).includes(motifFamilyId));
}

/** Build a summary of a score map entry's resolved relationships. */
export function resolveEntryContext(
  entry: ScoreMapEntry,
  pack: SoundtrackPack,
): {
  profile: ScoreProfile | undefined;
  cueFamilies: CueFamily[];
  motifFamilies: MotifFamily[];
  sceneIds: string[];
} {
  const profiles = pack.scoreProfiles ?? [];
  const families = pack.cueFamilies ?? [];
  const motifs = pack.motifFamilies ?? [];

  return {
    profile: resolveProfile(entry, profiles),
    cueFamilies: resolveCueFamilies(entry, families),
    motifFamilies: resolveMotifFamilies(entry, motifs),
    sceneIds: entrySceneIds(entry, families),
  };
}
