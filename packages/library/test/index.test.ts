import { describe, it, expect } from "vitest";
import type { LibraryTemplate, Snapshot, Branch, Favorite, Collection } from "@motif/schema";
import {
  createTemplate,
  instantiateTemplate,
  templatesOfKind,
  searchTemplates,
  templatesByTag,
  takeSnapshot,
  restoreSnapshot,
  snapshotsForEntity,
  snapshotsOfKind,
  latestSnapshot,
  snapshotCounts,
  createBranch,
  instantiateBranch,
  branchesFromSnapshot,
  branchesOfKind,
  traceLineage,
  descendantBranches,
  createFavorite,
  isFavorited,
  favoritesOfKind,
  createCollection,
  addToCollection,
  removeFromCollection,
  resolveCollection,
  searchCollections,
  compareEntities,
  areEqual,
  diffCount,
  promoteVersion,
} from "../src/index.js";

// ── Templates ──

describe("createTemplate", () => {
  it("creates a template with required fields", () => {
    const t = createTemplate("t1", "Combat Loop", "scene", { bpm: 120 });
    expect(t.id).toBe("t1");
    expect(t.name).toBe("Combat Loop");
    expect(t.kind).toBe("scene");
    expect(t.data).toEqual({ bpm: 120 });
    expect(t.createdAt).toBeTruthy();
    expect(t.tags).toBeUndefined();
    expect(t.notes).toBeUndefined();
  });

  it("includes optional tags and notes", () => {
    const t = createTemplate("t2", "Ambient", "clip", { volume: 0.5 }, {
      tags: ["ambient", "loop"],
      notes: "Good for caves",
    });
    expect(t.tags).toEqual(["ambient", "loop"]);
    expect(t.notes).toBe("Good for caves");
  });
});

describe("instantiateTemplate", () => {
  it("returns data with a new id", () => {
    const t = createTemplate("t1", "Tmpl", "scene", { bpm: 120, layers: 3 });
    const data = instantiateTemplate(t, "new-1");
    expect(data.id).toBe("new-1");
    expect(data.bpm).toBe(120);
    expect(data.layers).toBe(3);
  });
});

describe("templatesOfKind", () => {
  it("filters templates by kind", () => {
    const templates: LibraryTemplate[] = [
      createTemplate("t1", "A", "scene", {}),
      createTemplate("t2", "B", "clip", {}),
      createTemplate("t3", "C", "scene", {}),
    ];
    const result = templatesOfKind(templates, "scene");
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });
});

describe("searchTemplates", () => {
  it("matches name case-insensitively", () => {
    const templates = [
      createTemplate("t1", "Combat Loop", "scene", {}),
      createTemplate("t2", "Ambient Pad", "clip", {}),
    ];
    expect(searchTemplates(templates, "combat")).toHaveLength(1);
    expect(searchTemplates(templates, "AMBIENT")).toHaveLength(1);
  });

  it("matches tags", () => {
    const templates = [
      createTemplate("t1", "Foo", "scene", {}, { tags: ["boss", "epic"] }),
      createTemplate("t2", "Bar", "clip", {}),
    ];
    expect(searchTemplates(templates, "epic")).toHaveLength(1);
  });

  it("returns empty for no match", () => {
    const templates = [createTemplate("t1", "Foo", "scene", {})];
    expect(searchTemplates(templates, "zzz")).toHaveLength(0);
  });
});

describe("templatesByTag", () => {
  it("returns templates matching any tag", () => {
    const templates = [
      createTemplate("t1", "A", "scene", {}, { tags: ["boss"] }),
      createTemplate("t2", "B", "clip", {}, { tags: ["ambient", "loop"] }),
      createTemplate("t3", "C", "scene", {}, { tags: ["combat"] }),
    ];
    const result = templatesByTag(templates, ["boss", "loop"]);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("is case-insensitive", () => {
    const templates = [
      createTemplate("t1", "X", "scene", {}, { tags: ["Boss"] }),
    ];
    expect(templatesByTag(templates, ["boss"])).toHaveLength(1);
  });
});

// ── Snapshots ──

describe("takeSnapshot", () => {
  it("creates a snapshot with required fields", () => {
    const s = takeSnapshot("s1", "Before edit", "entity-1", "scene", { name: "A" });
    expect(s.id).toBe("s1");
    expect(s.label).toBe("Before edit");
    expect(s.entityId).toBe("entity-1");
    expect(s.entityKind).toBe("scene");
    expect(s.data).toEqual({ name: "A" });
    expect(s.createdAt).toBeTruthy();
    expect(s.notes).toBeUndefined();
  });

  it("includes optional notes", () => {
    const s = takeSnapshot("s1", "V2", "e1", "clip", {}, "milestone");
    expect(s.notes).toBe("milestone");
  });
});

describe("restoreSnapshot", () => {
  it("returns a shallow copy of data", () => {
    const snap = takeSnapshot("s1", "L", "e1", "scene", { bpm: 100 });
    const restored = restoreSnapshot(snap);
    expect(restored).toEqual({ bpm: 100 });
    expect(restored).not.toBe(snap.data);
  });
});

describe("snapshotsForEntity", () => {
  it("returns snapshots for a specific entity", () => {
    const snaps: Snapshot[] = [
      takeSnapshot("s1", "A", "e1", "scene", {}),
      takeSnapshot("s2", "B", "e2", "scene", {}),
      takeSnapshot("s3", "C", "e1", "scene", {}),
    ];
    expect(snapshotsForEntity(snaps, "e1")).toHaveLength(2);
  });
});

describe("snapshotsOfKind", () => {
  it("filters by kind", () => {
    const snaps: Snapshot[] = [
      takeSnapshot("s1", "A", "e1", "scene", {}),
      takeSnapshot("s2", "B", "e2", "clip", {}),
    ];
    expect(snapshotsOfKind(snaps, "scene")).toHaveLength(1);
    expect(snapshotsOfKind(snaps, "clip")).toHaveLength(1);
  });
});

describe("latestSnapshot", () => {
  it("returns the most recent snapshot for an entity", () => {
    const s1: Snapshot = { id: "s1", label: "A", entityId: "e1", entityKind: "scene", data: {}, createdAt: "2024-01-01T00:00:00Z" };
    const s2: Snapshot = { id: "s2", label: "B", entityId: "e1", entityKind: "scene", data: {}, createdAt: "2024-06-01T00:00:00Z" };
    const s3: Snapshot = { id: "s3", label: "C", entityId: "e2", entityKind: "scene", data: {}, createdAt: "2025-01-01T00:00:00Z" };
    expect(latestSnapshot([s1, s2, s3], "e1")?.id).toBe("s2");
  });

  it("returns undefined when no snapshots exist", () => {
    expect(latestSnapshot([], "e1")).toBeUndefined();
  });
});

describe("snapshotCounts", () => {
  it("counts snapshots per entity", () => {
    const snaps: Snapshot[] = [
      takeSnapshot("s1", "A", "e1", "scene", {}),
      takeSnapshot("s2", "B", "e1", "scene", {}),
      takeSnapshot("s3", "C", "e2", "clip", {}),
    ];
    const counts = snapshotCounts(snaps);
    expect(counts.get("e1")).toBe(2);
    expect(counts.get("e2")).toBe(1);
  });

  it("returns empty map for empty array", () => {
    expect(snapshotCounts([]).size).toBe(0);
  });
});

// ── Branches ──

describe("createBranch", () => {
  it("creates a branch from a snapshot", () => {
    const snap = takeSnapshot("s1", "V1", "e1", "scene", { bpm: 100 });
    const b = createBranch("b1", "Alt version", snap, "e2");
    expect(b.id).toBe("b1");
    expect(b.name).toBe("Alt version");
    expect(b.sourceSnapshotId).toBe("s1");
    expect(b.entityId).toBe("e2");
    expect(b.entityKind).toBe("scene");
    expect(b.createdAt).toBeTruthy();
    expect(b.notes).toBeUndefined();
  });

  it("includes optional notes", () => {
    const snap = takeSnapshot("s1", "V1", "e1", "clip", {});
    const b = createBranch("b1", "Alt", snap, "e2", "experimental");
    expect(b.notes).toBe("experimental");
  });
});

describe("instantiateBranch", () => {
  it("returns snapshot data with branch entity ID", () => {
    const snap = takeSnapshot("s1", "V1", "e1", "scene", { bpm: 100, name: "Original" });
    const branch: Branch = { id: "b1", name: "Alt", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-01T00:00:00Z" };
    const data = instantiateBranch(snap, branch);
    expect(data.id).toBe("e2");
    expect(data.bpm).toBe(100);
    expect(data.name).toBe("Original");
  });
});

describe("branchesFromSnapshot", () => {
  it("finds branches from a specific snapshot", () => {
    const branches: Branch[] = [
      { id: "b1", name: "A", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-01" },
      { id: "b2", name: "B", sourceSnapshotId: "s2", entityId: "e3", entityKind: "scene", createdAt: "2024-01-01" },
      { id: "b3", name: "C", sourceSnapshotId: "s1", entityId: "e4", entityKind: "scene", createdAt: "2024-01-01" },
    ];
    expect(branchesFromSnapshot(branches, "s1")).toHaveLength(2);
  });
});

describe("branchesOfKind", () => {
  it("filters by kind", () => {
    const branches: Branch[] = [
      { id: "b1", name: "A", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-01" },
      { id: "b2", name: "B", sourceSnapshotId: "s2", entityId: "e3", entityKind: "clip", createdAt: "2024-01-01" },
    ];
    expect(branchesOfKind(branches, "scene")).toHaveLength(1);
  });
});

describe("traceLineage", () => {
  it("traces a single-link lineage", () => {
    const snapshots: Snapshot[] = [
      { id: "s1", label: "V1", entityId: "e1", entityKind: "scene", data: {}, createdAt: "2024-01-01" },
    ];
    const branches: Branch[] = [
      { id: "b1", name: "Fork", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-02" },
    ];
    const chain = traceLineage("e2", branches, snapshots);
    expect(chain).toEqual([{ snapshotId: "s1", branchId: "b1" }]);
  });

  it("traces multi-step lineage", () => {
    const snapshots: Snapshot[] = [
      { id: "s1", label: "V1", entityId: "e1", entityKind: "scene", data: {}, createdAt: "2024-01-01" },
      { id: "s2", label: "V2", entityId: "e2", entityKind: "scene", data: {}, createdAt: "2024-01-03" },
    ];
    const branches: Branch[] = [
      { id: "b1", name: "Fork1", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-02" },
      { id: "b2", name: "Fork2", sourceSnapshotId: "s2", entityId: "e3", entityKind: "scene", createdAt: "2024-01-04" },
    ];
    const chain = traceLineage("e3", branches, snapshots);
    expect(chain).toHaveLength(2);
    expect(chain[0]).toEqual({ snapshotId: "s1", branchId: "b1" });
    expect(chain[1]).toEqual({ snapshotId: "s2", branchId: "b2" });
  });

  it("returns empty for root entity", () => {
    expect(traceLineage("e1", [], [])).toEqual([]);
  });

  it("terminates on cyclic lineage without infinite loop", () => {
    const snapshots: Snapshot[] = [
      { id: "s1", label: "V1", entityId: "e1", entityKind: "scene", data: {}, createdAt: "2024-01-01" },
      { id: "s2", label: "V2", entityId: "e2", entityKind: "scene", data: {}, createdAt: "2024-01-02" },
    ];
    // e1 → e2 → e1 (cycle)
    const branches: Branch[] = [
      { id: "b1", name: "Fork1", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-01" },
      { id: "b2", name: "Fork2", sourceSnapshotId: "s2", entityId: "e1", entityKind: "scene", createdAt: "2024-01-02" },
    ];
    // Should terminate (the visited set prevents infinite loops)
    const chain = traceLineage("e2", branches, snapshots);
    expect(chain.length).toBeLessThanOrEqual(2);
  });
});

describe("descendantBranches", () => {
  it("returns branches derived from an entity's snapshots", () => {
    const snapshots: Snapshot[] = [
      { id: "s1", label: "V1", entityId: "e1", entityKind: "scene", data: {}, createdAt: "2024-01-01" },
      { id: "s2", label: "V2", entityId: "e2", entityKind: "scene", data: {}, createdAt: "2024-01-02" },
    ];
    const branches: Branch[] = [
      { id: "b1", name: "A", sourceSnapshotId: "s1", entityId: "e2", entityKind: "scene", createdAt: "2024-01-01" },
      { id: "b2", name: "B", sourceSnapshotId: "s1", entityId: "e3", entityKind: "scene", createdAt: "2024-01-02" },
      { id: "b3", name: "C", sourceSnapshotId: "s2", entityId: "e4", entityKind: "scene", createdAt: "2024-01-03" },
    ];
    const result = descendantBranches("e1", branches, snapshots);
    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id)).toEqual(["b1", "b2"]);
  });
});

// ── Favorites ──

describe("createFavorite", () => {
  it("creates a favorite with required fields", () => {
    const f = createFavorite("f1", "e1", "scene");
    expect(f.id).toBe("f1");
    expect(f.entityId).toBe("e1");
    expect(f.entityKind).toBe("scene");
    expect(f.addedAt).toBeTruthy();
    expect(f.notes).toBeUndefined();
  });

  it("includes optional notes", () => {
    const f = createFavorite("f1", "e1", "clip", "love this");
    expect(f.notes).toBe("love this");
  });
});

describe("isFavorited", () => {
  it("returns true if entity is favorited", () => {
    const favs: Favorite[] = [
      { id: "f1", entityId: "e1", entityKind: "scene", addedAt: "2024-01-01" },
    ];
    expect(isFavorited(favs, "e1")).toBe(true);
  });

  it("returns false if not favorited", () => {
    expect(isFavorited([], "e1")).toBe(false);
  });
});

describe("favoritesOfKind", () => {
  it("filters by kind", () => {
    const favs: Favorite[] = [
      { id: "f1", entityId: "e1", entityKind: "scene", addedAt: "2024-01-01" },
      { id: "f2", entityId: "e2", entityKind: "clip", addedAt: "2024-01-01" },
      { id: "f3", entityId: "e3", entityKind: "scene", addedAt: "2024-01-01" },
    ];
    expect(favoritesOfKind(favs, "scene")).toHaveLength(2);
  });
});

describe("createCollection", () => {
  it("creates a collection with defaults", () => {
    const c = createCollection("c1", "Best Of");
    expect(c.id).toBe("c1");
    expect(c.name).toBe("Best Of");
    expect(c.favoriteIds).toEqual([]);
    expect(c.createdAt).toBeTruthy();
  });

  it("supports initial favoriteIds and options", () => {
    const c = createCollection("c1", "Epic", ["f1", "f2"], { tags: ["epic"], notes: "Awesome" });
    expect(c.favoriteIds).toEqual(["f1", "f2"]);
    expect(c.tags).toEqual(["epic"]);
    expect(c.notes).toBe("Awesome");
  });
});

describe("addToCollection", () => {
  it("adds a favorite to a collection", () => {
    const c = createCollection("c1", "My Collection");
    const updated = addToCollection(c, "f1");
    expect(updated.favoriteIds).toEqual(["f1"]);
  });

  it("deduplicates existing favorites", () => {
    const c = createCollection("c1", "My Collection", ["f1"]);
    const updated = addToCollection(c, "f1");
    expect(updated.favoriteIds).toEqual(["f1"]);
    expect(updated).toBe(c);
  });
});

describe("removeFromCollection", () => {
  it("removes a favorite from a collection", () => {
    const c = createCollection("c1", "Col", ["f1", "f2"]);
    const updated = removeFromCollection(c, "f1");
    expect(updated.favoriteIds).toEqual(["f2"]);
  });

  it("is a no-op if favorite not present", () => {
    const c = createCollection("c1", "Col", ["f1"]);
    const updated = removeFromCollection(c, "f99");
    expect(updated.favoriteIds).toEqual(["f1"]);
  });
});

describe("resolveCollection", () => {
  it("returns matching favorites from a collection", () => {
    const favs: Favorite[] = [
      { id: "f1", entityId: "e1", entityKind: "scene", addedAt: "2024-01-01" },
      { id: "f2", entityId: "e2", entityKind: "clip", addedAt: "2024-01-01" },
      { id: "f3", entityId: "e3", entityKind: "scene", addedAt: "2024-01-01" },
    ];
    const c = createCollection("c1", "My Col", ["f1", "f3"]);
    const result = resolveCollection(c, favs);
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.id)).toEqual(["f1", "f3"]);
  });
});

describe("searchCollections", () => {
  it("matches by name case-insensitively", () => {
    const cols = [
      createCollection("c1", "Epic Battles"),
      createCollection("c2", "Calm Vibes"),
    ];
    expect(searchCollections(cols, "epic")).toHaveLength(1);
  });

  it("matches by tag", () => {
    const cols = [
      createCollection("c1", "Stuff", [], { tags: ["boss"] }),
      createCollection("c2", "Other", []),
    ];
    expect(searchCollections(cols, "boss")).toHaveLength(1);
  });
});

// ── Compare ──

describe("compareEntities", () => {
  it("identifies same, changed, onlyA, onlyB fields", () => {
    const a = { id: "e1", bpm: 120, name: "Battle", reverb: 0.5 };
    const b = { id: "e1", bpm: 140, name: "Battle", chorus: true };
    const result = compareEntities(a, b, "scene", "V1", "V2");

    expect(result.entityKind).toBe("scene");
    expect(result.labelA).toBe("V1");
    expect(result.labelB).toBe("V2");
    expect(result.same).toContain("id");
    expect(result.same).toContain("name");
    expect(result.changed).toEqual(
      expect.arrayContaining([{ field: "bpm", a: 120, b: 140 }]),
    );
    expect(result.onlyA).toContain("reverb");
    expect(result.onlyB).toContain("chorus");
  });

  it("handles identical objects", () => {
    const a = { x: 1, y: 2 };
    const result = compareEntities(a, { ...a }, "clip", "A", "B");
    expect(result.same).toEqual(["x", "y"]);
    expect(result.changed).toEqual([]);
    expect(result.onlyA).toEqual([]);
    expect(result.onlyB).toEqual([]);
  });
});

describe("areEqual", () => {
  it("returns true for identical data", () => {
    expect(areEqual({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] })).toBe(true);
  });

  it("returns false for different data", () => {
    expect(areEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
});

describe("diffCount", () => {
  it("counts differing fields", () => {
    expect(diffCount({ a: 1, b: 2, c: 3 }, { a: 1, b: 99, d: 4 })).toBe(3);
    // b changed, c only in a, d only in b
  });

  it("returns 0 for identical objects", () => {
    expect(diffCount({ x: 1 }, { x: 1 })).toBe(0);
  });
});

describe("promoteVersion", () => {
  it("returns a copy of chosen side", () => {
    const a = { bpm: 120 };
    const b = { bpm: 140 };
    const result = promoteVersion(a, b, "b");
    expect(result).toEqual({ bpm: 140 });
    expect(result).not.toBe(b);
  });

  it("promotes side a", () => {
    expect(promoteVersion({ x: 1 }, { x: 2 }, "a")).toEqual({ x: 1 });
  });
});
