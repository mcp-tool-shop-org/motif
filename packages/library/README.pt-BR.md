<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/library

Modelos, instantâneos, ramificações, favoritos, coleções e comparação de entidades para Motif.

## O que esta biblioteca oferece:

- Criação, instanciação, filtragem e pesquisa de modelos.
- Criação, restauração e consulta de instantâneos.
- Criação, instanciação e rastreamento de ramificações.
- Gerenciamento de favoritos e marcação de entidades.
- Operações CRUD (criação, leitura, atualização, exclusão) e resolução de coleções.
- Comparação e identificação de diferenças entre entidades.

## Principais funcionalidades:

### Modelos (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — Cria um modelo reutilizável.
- `instantiateTemplate(template, newId)` — Gera novos dados de entidade a partir de um modelo.
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### Instantâneos (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — Congela o estado de uma entidade.
- `restoreSnapshot(snapshot)` — Recupera dados de uma entidade a partir de um instantâneo.
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### Ramificações (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — Cria uma ramificação a partir de um instantâneo.
- `instantiateBranch(snapshot, branch)` — Gera novos dados de entidade a partir de uma ramificação.
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### Favoritos (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — Marca uma entidade como favorita.
- `isFavorited(favorites, entityId)` — Verifica se uma entidade está marcada como favorita.
- `favoritesOfKind` — Filtra por tipo de entidade.
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### Comparar (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — Identifica as diferenças entre entidades, campo a campo.
- `areEqual(a, b)` — Verifica a igualdade estrutural.
- `diffCount(a, b)` — Número de campos diferentes.
- `promoteVersion(a, b, choice)` — Escolhe a versão "vencedora".

## O que esta biblioteca não oferece:

- Persistência ou armazenamento de entidades.
- Componentes de interface do usuário (UI).
- Reprodução ou renderização.

## Dependências:

- `@motif/schema` — Tipos para modelos, instantâneos, ramificações, favoritos e coleções.
