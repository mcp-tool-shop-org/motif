import type { CueFamily, CueFamilyRole } from "@motif/schema";

/** Create a new cue family. */
export function createCueFamily(
  id: string,
  name: string,
  role: CueFamilyRole,
): CueFamily {
  return { id, name, role, sceneIds: [] };
}

/** Add a scene to a cue family. */
export function addSceneToCueFamily(family: CueFamily, sceneId: string): CueFamily {
  if (family.sceneIds.includes(sceneId)) return family;
  return { ...family, sceneIds: [...family.sceneIds, sceneId] };
}

/** Remove a scene from a cue family. */
export function removeSceneFromCueFamily(family: CueFamily, sceneId: string): CueFamily {
  return { ...family, sceneIds: family.sceneIds.filter((s) => s !== sceneId) };
}

/** Link a motif family to a cue family. */
export function linkMotifToCueFamily(family: CueFamily, motifFamilyId: string): CueFamily {
  const existing = family.motifFamilyIds ?? [];
  if (existing.includes(motifFamilyId)) return family;
  return { ...family, motifFamilyIds: [...existing, motifFamilyId] };
}

/** Find shared motif family IDs between two cue families. */
export function sharedMotifs(a: CueFamily, b: CueFamily): string[] {
  const setA = new Set(a.motifFamilyIds ?? []);
  return (b.motifFamilyIds ?? []).filter((m) => setA.has(m));
}

/** Find shared scene IDs between two cue families. */
export function sharedScenes(a: CueFamily, b: CueFamily): string[] {
  const setA = new Set(a.sceneIds);
  return b.sceneIds.filter((s) => setA.has(s));
}

/** Get all motif families used across a set of cue families. */
export function collectMotifFamilyIds(families: CueFamily[]): string[] {
  return [...new Set(families.flatMap((f) => f.motifFamilyIds ?? []))];
}
