import type { SampleKit, SampleKitSlot, SampleSlice } from "@motif-studio/schema";

/** Create a new empty kit. */
export function createKit(id: string, name: string): SampleKit {
  return { id, name, slots: [] };
}

/** Return a new kit with a slot added. */
export function addKitSlot(kit: SampleKit, slot: SampleKitSlot): SampleKit {
  return { ...kit, slots: [...kit.slots, slot] };
}

/** Return a new kit with a slot removed by pitch. */
export function removeKitSlot(kit: SampleKit, pitch: number): SampleKit {
  return { ...kit, slots: kit.slots.filter((s) => s.pitch !== pitch) };
}

/** Return a new kit with a slot updated at a given pitch. */
export function updateKitSlot(
  kit: SampleKit,
  pitch: number,
  update: Partial<Omit<SampleKitSlot, "pitch">>,
): SampleKit {
  return {
    ...kit,
    slots: kit.slots.map((s) =>
      s.pitch === pitch ? { ...s, ...update } : s,
    ),
  };
}

/** Build a kit from a set of slices, mapping each to ascending pitches starting at `basePitch`. */
export function kitFromSlices(
  id: string,
  name: string,
  slices: SampleSlice[],
  basePitch = 36,
): SampleKit {
  return {
    id,
    name,
    slots: slices.map((slice, i) => ({
      pitch: basePitch + i,
      assetId: slice.assetId,
      sliceId: slice.id,
      label: slice.name,
    })),
  };
}

/** Return all unique asset IDs referenced by the kit. */
export function kitAssetIds(kit: SampleKit): string[] {
  return [...new Set(kit.slots.map((s) => s.assetId))];
}

/** Find duplicate pitches within a kit. */
export function findDuplicateSlotPitches(kit: SampleKit): number[] {
  const seen = new Set<number>();
  const dupes = new Set<number>();
  for (const slot of kit.slots) {
    if (seen.has(slot.pitch)) dupes.add(slot.pitch);
    seen.add(slot.pitch);
  }
  return [...dupes];
}
