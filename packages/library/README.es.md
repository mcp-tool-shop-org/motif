<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/library

Plantillas, instantáneas, ramas, favoritos, colecciones y comparación de entidades para Motif.

## Funcionalidades

- Creación, instanciación, filtrado y búsqueda de plantillas.
- Creación, restauración y consulta de instantáneas.
- Creación, instanciación y trazado de la línea de descendencia de ramas.
- Gestión de favoritos y marcadores de entidades.
- Operaciones CRUD (creación, lectura, actualización, eliminación) y resolución de colecciones.
- Comparación y detección de diferencias entre entidades.

## Exportaciones Principales

### Plantillas (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — crea una plantilla reutilizable.
- `instantiateTemplate(template, newId)` — genera nuevos datos de entidad a partir de una plantilla.
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### Instantáneas (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — congela el estado de una entidad.
- `restoreSnapshot(snapshot)` — recupera los datos de una entidad.
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### Ramas (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — crea una rama a partir de una instantánea.
- `instantiateBranch(snapshot, branch)` — genera nuevos datos de entidad a partir de una rama.
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### Favoritos (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — marca una entidad como favorita.
- `isFavorited(favorites, entityId)` — verifica si una entidad está marcada como favorita.
- `favoritesOfKind` — filtra por tipo de entidad.
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### Comparar (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — comparación campo por campo.
- `areEqual(a, b)` — verificación de igualdad estructural.
- `diffCount(a, b)` — número de campos diferentes.
- `promoteVersion(a, b, choice)` — elige una versión.

## Funcionalidades No Incluidas

- Persistencia o almacenamiento de entidades.
- Componentes de interfaz de usuario.
- Reproducción o renderizado.

## Dependencias

- `@motif-studio/schema` — tipos para plantillas, instantáneas, ramas, favoritos y colecciones.
