import type { Snapshot, LibraryEntityKind } from "@motif/schema";

/** Take a snapshot of an entity. */
export function takeSnapshot(
  id: string,
  label: string,
  entityId: string,
  entityKind: LibraryEntityKind,
  data: Record<string, unknown>,
  notes?: string,
): Snapshot {
  const snap: Snapshot = {
    id,
    label,
    entityId,
    entityKind,
    data,
    createdAt: new Date().toISOString(),
  };
  if (notes != null) snap.notes = notes;
  return snap;
}

/** Restore entity data from a snapshot. */
export function restoreSnapshot(snapshot: Snapshot): Record<string, unknown> {
  return { ...snapshot.data };
}

/** Get all snapshots for a specific entity. */
export function snapshotsForEntity(
  snapshots: Snapshot[],
  entityId: string,
): Snapshot[] {
  return snapshots.filter((s) => s.entityId === entityId);
}

/** Get snapshots by kind. */
export function snapshotsOfKind(
  snapshots: Snapshot[],
  kind: LibraryEntityKind,
): Snapshot[] {
  return snapshots.filter((s) => s.entityKind === kind);
}

/** Get the latest snapshot for an entity. */
export function latestSnapshot(
  snapshots: Snapshot[],
  entityId: string,
): Snapshot | undefined {
  const forEntity = snapshotsForEntity(snapshots, entityId);
  if (forEntity.length === 0) return undefined;
  return forEntity.reduce((a, b) =>
    a.createdAt > b.createdAt ? a : b,
  );
}

/** Count how many snapshots exist for each entity. */
export function snapshotCounts(
  snapshots: Snapshot[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of snapshots) {
    counts.set(s.entityId, (counts.get(s.entityId) ?? 0) + 1);
  }
  return counts;
}
