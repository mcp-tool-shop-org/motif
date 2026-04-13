import type { MotifFamily } from "@motif/schema";

/** Create a new motif family from source IDs. */
export function createMotifFamily(
  id: string,
  name: string,
  sourceIds: string[],
): MotifFamily {
  return { id, name, sourceIds };
}

/** Add a variant ID to a motif family. */
export function addVariant(family: MotifFamily, variantId: string): MotifFamily {
  const existing = family.variantIds ?? [];
  if (existing.includes(variantId)) return family;
  return { ...family, variantIds: [...existing, variantId] };
}

/** Remove a variant ID from a motif family. */
export function removeVariant(family: MotifFamily, variantId: string): MotifFamily {
  return {
    ...family,
    variantIds: (family.variantIds ?? []).filter((v) => v !== variantId),
  };
}

/** Link a scene to this motif family. */
export function linkScene(family: MotifFamily, sceneId: string): MotifFamily {
  const existing = family.relatedSceneIds ?? [];
  if (existing.includes(sceneId)) return family;
  return { ...family, relatedSceneIds: [...existing, sceneId] };
}

/** Unlink a scene from this motif family. */
export function unlinkScene(family: MotifFamily, sceneId: string): MotifFamily {
  return {
    ...family,
    relatedSceneIds: (family.relatedSceneIds ?? []).filter((s) => s !== sceneId),
  };
}

/** Get all IDs referenced by the motif family (sources + variants + scenes). */
export function motifFamilyRefs(family: MotifFamily): string[] {
  return [
    ...family.sourceIds,
    ...(family.variantIds ?? []),
    ...(family.relatedSceneIds ?? []),
  ];
}

/** Find all motif families that reference a given ID (as source, variant, or scene). */
export function familiesReferencingId(
  families: MotifFamily[],
  id: string,
): MotifFamily[] {
  return families.filter((f) => motifFamilyRefs(f).includes(id));
}
