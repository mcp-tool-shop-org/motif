import type { DerivationRecord, DerivationTransform, Scene } from "@motif-studio/schema";

/** Create a derivation record. */
export function createDerivation(
  id: string,
  sourceId: string,
  targetId: string,
  transform: DerivationTransform,
): DerivationRecord {
  return { id, sourceId, targetId, transform };
}

/** Derive a new scene from an existing one, applying a name transform. */
export function deriveScene(
  source: Scene,
  newId: string,
  transform: DerivationTransform,
): Scene {
  const nameMap: Record<DerivationTransform, string> = {
    intensify: "Intensified",
    resolve: "Resolution",
    darken: "Darkened",
    brighten: "Brightened",
    simplify: "Simplified",
    elaborate: "Elaborated",
    reharmonize: "Reharmonized",
  };
  return {
    ...source,
    id: newId,
    name: `${source.name} (${nameMap[transform]})`,
    tags: [...(source.tags ?? []), `derived:${transform}`],
  };
}

/** Find all derivations sourced from a given ID. */
export function derivationsFrom(
  records: DerivationRecord[],
  sourceId: string,
): DerivationRecord[] {
  return records.filter((r) => r.sourceId === sourceId);
}

/** Find all derivations targeting a given ID. */
export function derivationsTo(
  records: DerivationRecord[],
  targetId: string,
): DerivationRecord[] {
  return records.filter((r) => r.targetId === targetId);
}

/** Build the full derivation chain starting from a source ID. */
export function derivationChain(
  records: DerivationRecord[],
  startId: string,
): DerivationRecord[] {
  const chain: DerivationRecord[] = [];
  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const children = derivationsFrom(records, current);
    for (const child of children) {
      chain.push(child);
      queue.push(child.targetId);
    }
  }

  return chain;
}

/** Get all unique IDs in a derivation graph (sources + targets). */
export function derivationGraphIds(records: DerivationRecord[]): string[] {
  const ids = new Set<string>();
  for (const r of records) {
    ids.add(r.sourceId);
    ids.add(r.targetId);
  }
  return [...ids];
}
