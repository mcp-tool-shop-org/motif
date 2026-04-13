<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/library

Modelli, istantanee, rami, preferiti, raccolte e confronto di entità per Motif.

## Cosa include

- Creazione, istanziazione, filtraggio e ricerca di modelli
- Creazione, ripristino e interrogazione di istantanee
- Creazione, istanziazione e tracciamento della genealogia dei rami
- Gestione dei preferiti e segnalibri delle entità
- Operazioni CRUD (Creazione, Lettura, Aggiornamento, Eliminazione) e risoluzione delle raccolte
- Confronto e differenziazione delle entità

## Esportazioni principali

### Modelli (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — crea un modello riutilizzabile
- `instantiateTemplate(template, newId)` — genera nuovi dati di entità a partire da un modello
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### Istantanee (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — congela lo stato di un'entità
- `restoreSnapshot(snapshot)` — recupera i dati di un'entità
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### Rami (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — crea un ramo a partire da un'istantanea
- `instantiateBranch(snapshot, branch)` — genera nuovi dati di entità a partire da un ramo
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### Preferiti (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — crea un segnalibro per un'entità
- `isFavorited(favorites, entityId)` — verifica se un'entità è stata aggiunta ai preferiti
- `favoritesOfKind` — filtra per tipo di entità
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### Confronta (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — confronto campo per campo
- `areEqual(a, b)` — verifica di uguaglianza strutturale
- `diffCount(a, b)` — numero di campi diversi
- `promoteVersion(a, b, choice)` — seleziona la versione preferita

## Cosa non include

- Persistenza o archiviazione delle entità
- Componenti dell'interfaccia utente
- Riproduzione o rendering

## Dipendenze

- `@motif-studio/schema` — tipi per modelli, istantanee, rami, preferiti, raccolte
