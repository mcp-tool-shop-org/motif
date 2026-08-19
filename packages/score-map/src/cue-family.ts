import type {
  CueFamily,
  CueFamilyGenerationLock,
  CueFamilyRole,
  GeneratedCueRecord,
} from "@motif-studio/schema";

export class FamilyAttachError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FamilyAttachError";
    this.code = code;
  }
}

function normalizeKeyscale(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function beatsFromTimesignature(value: string | undefined): number {
  if (!value) return 4;
  const n = Number(value.split("/")[0]);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

export function assertRecordMatchesFamilyLock(
  record: GeneratedCueRecord,
  lock: CueFamilyGenerationLock,
): void {
  if (record.kind !== "music") {
    throw new FamilyAttachError(
      "FAMILY_LOCK_KIND",
      `Only music generated cues attach to a cue family (got ${record.kind})`,
    );
  }
  const g = record.generation;
  const mismatches: string[] = [];
  if (g.bpm !== lock.bpm) {
    mismatches.push(`bpm ${g.bpm} != ${lock.bpm}`);
  }
  if (!g.keyscale || normalizeKeyscale(g.keyscale) !== normalizeKeyscale(lock.keyscale)) {
    mismatches.push(`keyscale ${g.keyscale ?? "(missing)"} != ${lock.keyscale}`);
  }
  if (beatsFromTimesignature(g.timesignature) !== beatsFromTimesignature(lock.timesignature)) {
    mismatches.push(
      `timesignature ${g.timesignature ?? "(missing)"} != ${lock.timesignature}`,
    );
  }
  if (mismatches.length > 0) {
    throw new FamilyAttachError(
      "FAMILY_LOCK_MISMATCH",
      `Generated cue ${record.id} does not match family lock: ${mismatches.join("; ")}`,
    );
  }
}

function locksEqual(a: CueFamilyGenerationLock, b: CueFamilyGenerationLock): boolean {
  return (
    a.bpm === b.bpm &&
    normalizeKeyscale(a.keyscale) === normalizeKeyscale(b.keyscale) &&
    beatsFromTimesignature(a.timesignature) === beatsFromTimesignature(b.timesignature)
  );
}

export function lockCueFamily(
  family: CueFamily,
  lock: CueFamilyGenerationLock,
): CueFamily {
  if (!family.generationLock) return { ...family, generationLock: lock };
  if (locksEqual(family.generationLock, lock)) return family;
  throw new FamilyAttachError(
    "FAMILY_LOCK_CONFLICT",
    `Family ${family.id} already locked to ${family.generationLock.bpm} ${family.generationLock.keyscale} ${family.generationLock.timesignature}`,
  );
}

/**
 * Attach a generated cue to a family. The record must share the family's
 * generation lock (bpm / keyscale / timesignature). Mismatch is an error.
 */
export function attachGeneratedCueRecord(
  family: CueFamily,
  record: GeneratedCueRecord,
  lock?: CueFamilyGenerationLock,
): CueFamily {
  if (lock && family.generationLock && !locksEqual(lock, family.generationLock)) {
    throw new FamilyAttachError(
      "FAMILY_LOCK_CONFLICT",
      `Passed lock does not match family ${family.id} generation lock`,
    );
  }
  const effective = family.generationLock ?? lock;
  if (!effective) {
    throw new FamilyAttachError(
      "FAMILY_LOCK_REQUIRED",
      `Cue family ${family.id} has no generation lock; pass lock or call lockCueFamily first`,
    );
  }
  assertRecordMatchesFamilyLock(record, effective);
  const locked = family.generationLock ? family : { ...family, generationLock: effective };
  return attachGeneratedCueToFamily(locked, record.id);
}

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

/** Attach a generated-cue record (cloud ingest) to a cue family. */
export function attachGeneratedCueToFamily(
  family: CueFamily,
  generatedCueId: string,
): CueFamily {
  const existing = family.generatedCueIds ?? [];
  if (existing.includes(generatedCueId)) return family;
  return { ...family, generatedCueIds: [...existing, generatedCueId] };
}

/** Detach a generated-cue record from a cue family. */
export function detachGeneratedCueFromFamily(
  family: CueFamily,
  generatedCueId: string,
): CueFamily {
  return {
    ...family,
    generatedCueIds: (family.generatedCueIds ?? []).filter((id) => id !== generatedCueId),
  };
}

/** Collect generated-cue ids across a set of cue families. */
export function collectGeneratedCueIds(families: CueFamily[]): string[] {
  return [...new Set(families.flatMap((f) => f.generatedCueIds ?? []))];
}
