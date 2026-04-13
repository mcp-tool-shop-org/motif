<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/score-map

Logique de scoring globale pour Motif : familles de motifs, profils de scoring, familles de signaux, entrées de la carte du monde et dérivation.

## Ce que cela inclut

- Gestion des familles de motifs (variantes, liens vers les scènes)
- Création et vérification des plages des profils de scoring
- Construction des familles de signaux et association avec les scènes/motifs
- Résolution des entrées de la carte de scoring (profil, familles, motifs)
- Enregistrements de dérivation et traçage de la lignée

## Principales exportations

### Motif (`motif.ts`)
- `createMotifFamily(id, name)` — crée une famille de motifs
- `addVariant(family, variant)` / `removeVariant(family, variantId)`
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`
- `motifFamilyRefs(family)` — tous les identifiants d'entités référencées
- `familiesReferencingId(families, entityId)` — trouve les familles qui référencent une entité

### Profil (`profile.ts`)
- `createScoreProfile(id, name, options)` — crée avec tempo, intensité, palette, tonalité/gamme
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`
- `matchingPaletteTags(profileA, profileB)` — vocabulaire sonore partagé
- `mergeProfiles(base, overlay)` — combine les profils

### Famille de signaux (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)` — crée avec un rôle et des scènes
- `addSceneToCueFamily` / `removeSceneFromCueFamily`
- `linkMotifToCueFamily(family, motifFamilyId)`
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`
- `collectMotifFamilyIds(family)` — tous les identifiants de familles de motifs

### Résolution (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)` — crée une entrée de la carte du monde
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`
- `entrySceneIds(entry, cueFamilies)` — scènes accessibles via les familles de signaux
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`

### Dérivation (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)` — crée un enregistrement de dérivation
- `deriveScene(scene, transform)` — applique une transformation et obtient une nouvelle scène
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`

## Ce que cela n'inclut pas

- Lecture ou rendu audio
- Gestion des scènes/pistes/liaisons (voir `@motif-studio/schema`)
- Automatisation (voir `@motif-studio/automation`)
- Composants d'interface utilisateur

## Dépendances

- `@motif-studio/schema` — types pour les motifs, les profils, les scènes, les familles de signaux, les dérivations.
