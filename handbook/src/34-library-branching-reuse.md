# Library, Branching, and Reuse

The Library system makes recall and reuse first-class creative actions. Instead of losing good ideas to iteration, Motif preserves them — and makes it easy to build new work from existing material.

## Templates

A template captures the shape of an entity — its data, kind, and metadata — as a reusable starting point.

### Creating Templates

`createTemplate(id, name, kind, data, options?)`:
- **kind**: what entity type this template represents (scene, clip, sample-kit, score-profile, cue-family, etc.)
- **data**: the entity data as a `Record<string, unknown>`
- **options**: optional tags and notes

### Using Templates

`instantiateTemplate(template, newId)` — returns new entity data with a fresh ID. The template's data is copied, not referenced — changes to the new entity don't affect the template.

### Finding Templates

- `templatesOfKind(templates, kind)` — filter by entity kind
- `searchTemplates(templates, query)` — case-insensitive search across name and tags
- `templatesByTag(templates, tags)` — filter by any matching tag

### When to Use

Templates are for **starting points**. When you find yourself creating the same kind of entity repeatedly with similar settings, save a template. Future creates start from there instead of from scratch.

## Snapshots

A snapshot freezes the state of an entity at a moment in time.

### Taking Snapshots

`takeSnapshot(id, label, entityId, entityKind, data, notes?)`:
- **label**: human-readable name ("Before boss rework", "v3 with reverb")
- **entityId**: which entity is being snapshotted
- **data**: the complete entity data at that moment

### Restoring Snapshots

`restoreSnapshot(snapshot)` — returns a copy of the snapshot's data. You can use this to revert an entity or create a new entity from the old state.

### Querying Snapshots

- `snapshotsForEntity(snapshots, entityId)` — all snapshots of a specific entity
- `snapshotsOfKind(snapshots, kind)` — all snapshots of a specific entity kind
- `latestSnapshot(snapshots, entityId)` — most recent snapshot for an entity
- `snapshotCounts(snapshots)` — how many snapshots exist per entity (useful for UI indicators)

### When to Use

Snapshot **before destructive changes**. About to rework a combat scene? Snapshot it. About to strip down a cue? Snapshot it. Snapshots are cheap and preserve the exact state for later recall.

## Branches

A branch creates a new, independent entity from a snapshot — diverging from the original while preserving lineage.

### Creating Branches

`createBranch(id, name, sourceSnapshot, newEntityId, notes?)`:
- **sourceSnapshot**: the snapshot to branch from
- **newEntityId**: a fresh ID for the branched entity

### Instantiating Branches

`instantiateBranch(snapshot, branch)` — returns the snapshot's data with the branch's entity ID. The new entity is fully independent.

### Lineage Tracking

- `branchesFromSnapshot(branches, snapshotId)` — all branches from a specific snapshot
- `branchesOfKind(branches, kind)` — filter by entity kind
- `traceLineage(entityId, branches, snapshots)` — walk the full chain of snapshot → branch links back to the root entity
- `descendantBranches(entityId, branches, snapshots)` — find all branches derived from an entity's snapshots

### When to Use

Branch when you want to **try something radically different** without losing the original. Unlike snapshots (which are read-only records), branches create new entities that evolve independently.

## Favorites

A favorite is a bookmark — a lightweight reference to any entity.

### Operations

- `createFavorite(id, entityId, entityKind, notes?)` — mark an entity as favorite
- `isFavorited(favorites, entityId)` — check if an entity is favorited
- `favoritesOfKind(favorites, kind)` — get favorites by entity kind

### When to Use

Favorite things you want to find again quickly. A clip that sounds great, a scene that nailed the mood, a score profile that works perfectly — mark it. The Library screen's Favorites tab surfaces them all.

## Collections

A collection is a named group of favorites.

### Operations

- `createCollection(id, name, favoriteIds?, options?)` — create a named collection
- `addToCollection(collection, favoriteId)` — add a favorite (deduplicates automatically)
- `removeFromCollection(collection, favoriteId)` — remove a favorite
- `resolveCollection(collection, favorites)` — get the actual Favorite objects in a collection
- `searchCollections(collections, query)` — search by name and tags

### When to Use

Collections organize favorites into meaningful groups: "Combat sounds", "Boss themes", "Exploration beds", "Ready to ship". They are free-form — any favorite can belong to multiple collections.

## Compare

Compare shows exactly how two entity states differ — field by field.

### Operations

- `compareEntities(a, b, entityKind, labelA, labelB)` — produces a `CompareResult` with `same`, `changed`, `onlyA`, and `onlyB` field lists
- `areEqual(a, b)` — quick structural equality check
- `diffCount(a, b)` — count of differing fields
- `promoteVersion(a, b, choice)` — return one side's data as the winner

### When to Use

Compare two snapshots of the same entity to see exactly what changed. Compare a branch against its origin. Compare two templates to decide which one to use. The Compare tab in Library provides a visual side-by-side view.

## The Reuse Philosophy

The Library system is designed around a specific philosophy:

1. **Recall is a creative act.** Finding and reusing a great idea from last week should be as natural as composing a new one.
2. **Divergence, not duplication.** Branches and templates produce starting points, not clones. The expectation is that every instantiation will evolve.
3. **Lineage matters.** When you branch from a snapshot, the relationship is preserved. You can always trace how a piece of music evolved.
4. **Lightweight bookmarking.** Favorites and collections are cheap. Mark freely, organize loosely. Don't overthink taxonomy — just mark what matters.
5. **Comparison is underrated.** Seeing exactly what changed between two versions is the fastest way to evaluate your own creative decisions.
