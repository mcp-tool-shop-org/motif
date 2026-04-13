<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/sample-lab

Outils pour la manipulation, le découpage, la création de kits et l'instrumentation dans le flux de travail des échantillons Motif.

## Ce que cela inclut

- Découpe et gestion des points de boucle des ressources audio.
- Découpage régulier et basé sur les transitoires.
- Construction de kits d'échantillons et gestion des emplacements.
- Création d'instruments d'échantillons et utilitaires de hauteur.
- Outils pour l'importation de fichiers audio (inférence de la ressource à partir du nom de fichier).

## Principales fonctionnalités

### Découpe (`trim.ts`)
- `resolveTrimRegion(asset)` — Délimites de découpe effectifs.
- `resolveLoopRegion(asset)` — Délimites de boucle effectifs.
- `applyTrim(asset, startMs, endMs)` — Définir les points de découpe.
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — Définir les points de boucle.

### Découpage (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — Diviser en parties égales.
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — Découper à des moments précis.
- `sliceDurationMs(slice)` — Durée du découpage.

### Kit (`kit.ts`)
- `createKit(id, name)` — Créer un kit vide.
- `addKitSlot(kit, slot)` / `removeKitSlot(kit, pitch)` / `updateKitSlot(kit, pitch, update)` — Ajouter, supprimer et mettre à jour un emplacement dans un kit.
- `kitFromSlices(id, name, slices, basePitch)` — Mapper automatiquement les découpages aux hauteurs MIDI.
- `kitAssetIds(kit)` / `findDuplicateSlotPitches(kit)` — Obtenir les identifiants des ressources d'un kit / Trouver les hauteurs en double dans un kit.

### Instrument (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)` — Créer un instrument d'échantillon.
- `pitchToPlaybackRate(rootNote, targetNote)` — Rapport de transposition de hauteur.
- `isInRange(instrument, note)` / `rangeSpan(instrument)` — Vérifier si une note est dans la plage de l'instrument / Obtenir l'étendue de la plage de l'instrument.

### Importation (`import.ts`)
- `inferSourceType(name)` — Détecter le type à partir du nom de fichier.
- `sourceTypeToKind(sourceType)` — Mapper le type de source au type de ressource.
- `filenameToId(filename)` — Obtenir un identifiant propre à partir du nom de fichier.
- `buildImportedAsset(filename, durationMs, src)` — Créer une ressource à partir d'un fichier.

## Ce que cela n'inclut pas

- Décodage ou lecture de fichiers audio (voir `@motif/audio-engine`).
- Persistance des ressources audio ou opérations d'entrée/sortie de fichiers.
- Composants d'interface utilisateur.

## Dépendances

- `@motif/schema` — Types pour les ressources, les découpages, les kits et les instruments.
