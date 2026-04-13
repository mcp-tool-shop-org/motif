<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/score-map

Logica di punteggio globale per Motif: famiglie di motivi, profili di punteggio, famiglie di segnali, voci della mappa globale e derivazioni.

## Cosa include

- Gestione delle famiglie di motivi (varianti, collegamenti con le scene)
- Creazione e controllo dei limiti dei profili di punteggio
- Costruzione delle famiglie di segnali e associazione con scene/motivi
- Risoluzione delle voci della mappa di punteggio (profilo, famiglie, motivi)
- Registri di derivazione e tracciamento della genealogia

## Esportazioni principali

### Motivo (`motif.ts`)
- `createMotifFamily(id, name)` — crea una famiglia di motivi
- `addVariant(family, variant)` / `removeVariant(family, variantId)`
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`
- `motifFamilyRefs(family)` — tutti gli ID delle entità referenziate
- `familiesReferencingId(families, entityId)` — trova le famiglie che fanno riferimento a un'entità

### Profilo (`profile.ts`)
- `createScoreProfile(id, name, options)` — crea con tempo, intensità, tavolozza, tonalità/scala
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`
- `matchingPaletteTags(profileA, profileB)` — vocabolario sonoro condiviso
- `mergeProfiles(base, overlay)` — combina i profili

### Famiglia di segnali (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)` — crea con ruolo e scene
- `addSceneToCueFamily` / `removeSceneFromCueFamily`
- `linkMotifToCueFamily(family, motifFamilyId)`
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`
- `collectMotifFamilyIds(family)` — tutti gli ID delle famiglie di motivi

### Risoluzione (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)` — crea una voce della mappa globale
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`
- `entrySceneIds(entry, cueFamilies)` — scene raggiungibili tramite le famiglie di segnali
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`

### Derivazione (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)` — crea un record di derivazione
- `deriveScene(scene, transform)` — applica una trasformazione e ottiene una nuova scena
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`

## Cosa non include

- Riproduzione o rendering audio
- Gestione di scene/tracce/binding (vedere `@motif-studio/schema`)
- Automazione (vedere `@motif-studio/automation`)
- Componenti dell'interfaccia utente

## Dipendenze

- `@motif-studio/schema` — tipi per motivi, profili, scene, famiglie di segnali, derivazioni
