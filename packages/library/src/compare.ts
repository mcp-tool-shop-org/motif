import type { LibraryEntityKind } from "@motif-studio/schema";

/** A single field difference between two versions. */
export interface FieldDiff {
  field: string;
  a: unknown;
  b: unknown;
}

/** Result of comparing two entity snapshots. */
export interface CompareResult {
  entityKind: LibraryEntityKind;
  labelA: string;
  labelB: string;
  same: string[];
  changed: FieldDiff[];
  onlyA: string[];
  onlyB: string[];
}

/**
 * Compare two plain data records field by field.
 * Produces a structural diff suitable for side-by-side display.
 */
export function compareEntities(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  entityKind: LibraryEntityKind,
  labelA: string,
  labelB: string,
): CompareResult {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const same: string[] = [];
  const changed: FieldDiff[] = [];
  const onlyA: string[] = [];
  const onlyB: string[] = [];

  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;

    if (inA && !inB) {
      onlyA.push(key);
    } else if (!inA && inB) {
      onlyB.push(key);
    } else if (stableStringify(a[key]) === stableStringify(b[key])) {
      same.push(key);
    } else {
      changed.push({ field: key, a: a[key], b: b[key] });
    }
  }

  return { entityKind, labelA, labelB, same, changed, onlyA, onlyB };
}

/** Sort object keys recursively for stable JSON serialization. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }
  const sorted = Object.keys(value as Record<string, unknown>)
    .sort()
    .map(
      (k) =>
        JSON.stringify(k) +
        ":" +
        stableStringify((value as Record<string, unknown>)[k]),
    );
  return "{" + sorted.join(",") + "}";
}

/** Quick check: are two entities structurally identical? */
export function areEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  return stableStringify(a) === stableStringify(b);
}

/** Count how many fields differ between two entities. */
export function diffCount(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): number {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let count = 0;
  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;
    if (inA !== inB || stableStringify(a[key]) !== stableStringify(b[key])) {
      count++;
    }
  }
  return count;
}

/** Pick a winner — return the data from the chosen side. */
export function promoteVersion(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  choice: "a" | "b",
): Record<string, unknown> {
  return { ...(choice === "a" ? a : b) };
}
