# Library / Recall Model

The library system makes creative reuse a first-class action.

## Templates

Templates capture reusable patterns:

- `createTemplate(id, name, kind, data)` — freeze a pattern
- `instantiateTemplate(template, newId)` — produce new entity data from the template
- `searchTemplates` / `templatesByTag` — discovery

Templates can represent any entity kind: scenes, clips, instruments, cue structures.

## Snapshots

Snapshots freeze the state of any entity at a point in time:

- `takeSnapshot(id, label, entityId, entityKind, data)` — freeze
- `restoreSnapshot(snapshot)` — recover
- `snapshotsForEntity` / `latestSnapshot` — query history

Snapshots are the foundation for branching and comparison.

## Branches

Branches create variations from snapshots:

- `createBranch(id, name, sourceSnapshot, newEntityId)` — diverge
- `traceLineage` — follow the ancestry chain
- `descendantBranches` — find all children

Branches enable non-destructive experimentation: fork a scene, try a variation, keep or discard.

## Favorites and Collections

- `createFavorite` — bookmark any entity
- `isFavorited` — check status
- `createCollection` / `addToCollection` — organize bookmarks into groups
- `resolveCollection` — retrieve all entities in a collection

## Compare

- `compareEntities(a, b, entityKind)` — field-by-field diff
- `areEqual(a, b)` — structural equality
- `diffCount(a, b)` — number of fields that differ
- `promoteVersion(a, b, choice)` — pick a winner from two versions
