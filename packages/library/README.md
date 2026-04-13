<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/library

Templates, snapshots, branches, favorites, collections, and entity comparison for Motif.

## What It Owns

- Template creation, instantiation, filtering, and search
- Snapshot creation, restoration, and querying
- Branch creation, instantiation, and lineage tracing
- Favorite management and entity bookmarking
- Collection CRUD and resolution
- Entity comparison and diffing

## Key Exports

### Templates (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — create a reusable template
- `instantiateTemplate(template, newId)` — produce new entity data from template
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### Snapshots (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — freeze entity state
- `restoreSnapshot(snapshot)` — recover entity data
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### Branches (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — branch from snapshot
- `instantiateBranch(snapshot, branch)` — produce new entity data from branch
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### Favorites (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — bookmark an entity
- `isFavorited(favorites, entityId)` — check if bookmarked
- `favoritesOfKind` — filter by entity kind
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### Compare (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — field-by-field diff
- `areEqual(a, b)` — structural equality check
- `diffCount(a, b)` — number of differing fields
- `promoteVersion(a, b, choice)` — pick a winner

## What It Does Not Own

- Entity persistence or storage
- UI components
- Playback or rendering

## Dependencies

- `@motif-studio/schema` — types for templates, snapshots, branches, favorites, collections
