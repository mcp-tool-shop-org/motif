import type { Branch, Snapshot, LibraryEntityKind } from "@motif-studio/schema";

/** Create a branch from a snapshot. */
export function createBranch(
  id: string,
  name: string,
  sourceSnapshot: Snapshot,
  newEntityId: string,
  notes?: string,
): Branch {
  const b: Branch = {
    id,
    name,
    sourceSnapshotId: sourceSnapshot.id,
    entityId: newEntityId,
    entityKind: sourceSnapshot.entityKind,
    createdAt: new Date().toISOString(),
  };
  if (notes != null) b.notes = notes;
  return b;
}

/** Instantiate a branch, returning new entity data with the branch's entity ID. */
export function instantiateBranch(
  snapshot: Snapshot,
  branch: Branch,
): Record<string, unknown> {
  return { ...snapshot.data, id: branch.entityId };
}

/** Get all branches originating from a specific snapshot. */
export function branchesFromSnapshot(
  branches: Branch[],
  snapshotId: string,
): Branch[] {
  return branches.filter((b) => b.sourceSnapshotId === snapshotId);
}

/** Get branches by entity kind. */
export function branchesOfKind(
  branches: Branch[],
  kind: LibraryEntityKind,
): Branch[] {
  return branches.filter((b) => b.entityKind === kind);
}

/** Trace full lineage: snapshot → branch chain for an entity. */
export function traceLineage(
  entityId: string,
  branches: Branch[],
  snapshots: Snapshot[],
): { snapshotId: string; branchId: string }[] {
  const chain: { snapshotId: string; branchId: string }[] = [];
  const visited = new Set<string>();
  let currentId = entityId;

  for (let i = 0; i < branches.length; i++) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const branch = branches.find((b) => b.entityId === currentId);
    if (!branch) break;

    chain.unshift({
      snapshotId: branch.sourceSnapshotId,
      branchId: branch.id,
    });

    const snap = snapshots.find((s) => s.id === branch.sourceSnapshotId);
    if (!snap) break;
    currentId = snap.entityId;
  }

  return chain;
}

/** Get all branches that produced entities derived from a given entity. */
export function descendantBranches(
  entityId: string,
  branches: Branch[],
  snapshots: Snapshot[],
): Branch[] {
  const snapshotIds = new Set(
    snapshots.filter((s) => s.entityId === entityId).map((s) => s.id),
  );
  return branches.filter((b) => snapshotIds.has(b.sourceSnapshotId));
}
