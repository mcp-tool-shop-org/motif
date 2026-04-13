<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/library

Modèles, instantés, branches, favoris, collections et comparaison d'entités pour Motif.

## Ce que cela inclut

- Création, instanciation, filtrage et recherche de modèles
- Création, restauration et interrogation d'instantanés
- Création, instanciation et traçage de l'historique des branches
- Gestion des favoris et marquage des entités
- Opérations CRUD (création, lecture, mise à jour, suppression) et résolution des collections
- Comparaison et différentiation des entités

## Principales exportations

### Modèles (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — crée un modèle réutilisable
- `instantiateTemplate(template, newId)` — génère de nouvelles données d'entité à partir d'un modèle
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### Instantanés (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — fige l'état d'une entité
- `restoreSnapshot(snapshot)` — restaure les données d'une entité
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### Branches (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — crée une branche à partir d'un instantané
- `instantiateBranch(snapshot, branch)` — génère de nouvelles données d'entité à partir d'une branche
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### Favoris (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — marque une entité comme favorite
- `isFavorited(favorites, entityId)` — vérifie si une entité est marquée comme favorite
- `favoritesOfKind` — filtre par type d'entité
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### Comparaison (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — comparaison champ par champ
- `areEqual(a, b)` — vérifie l'égalité structurelle
- `diffCount(a, b)` — nombre de champs différents
- `promoteVersion(a, b, choice)` — sélectionne la version gagnante

## Ce que cela n'inclut pas

- Persistance ou stockage des entités
- Composants d'interface utilisateur
- Lecture ou rendu

## Dépendances

- `@motif/schema` — types pour les modèles, les instantés, les branches, les favoris, les collections
