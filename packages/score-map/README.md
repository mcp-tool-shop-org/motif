<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/score-map

World scoring logic for Motif — motif families, score profiles, cue families, world map entries, and derivation.

## What It Owns

- Motif family management (variants, scene links)
- Score profile creation and range checking
- Cue family construction and scene/motif association
- Score map entry resolution (profile, families, motifs)
- Derivation records and lineage tracing

## Key Exports

### Motif (`motif.ts`)
- `createMotifFamily(id, name)` — create a motif family
- `addVariant(family, variant)` / `removeVariant(family, variantId)`
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`
- `motifFamilyRefs(family)` — all referenced entity IDs
- `familiesReferencingId(families, entityId)` — find families that reference an entity

### Profile (`profile.ts`)
- `createScoreProfile(id, name, options)` — create with tempo, intensity, palette, key/scale
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`
- `matchingPaletteTags(profileA, profileB)` — shared sonic vocabulary
- `mergeProfiles(base, overlay)` — combine profiles

### Cue Family (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)` — create with role and scenes
- `addSceneToCueFamily` / `removeSceneFromCueFamily`
- `linkMotifToCueFamily(family, motifFamilyId)`
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`
- `collectMotifFamilyIds(family)` — all motif family IDs

### Resolve (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)` — create a world map entry
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`
- `entrySceneIds(entry, cueFamilies)` — scenes reachable through cue families
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`

### Derivation (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)` — create a derivation record
- `deriveScene(scene, transform)` — apply a transform and get a new scene
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`

## What It Does Not Own

- Audio playback or rendering
- Scene/stem/binding management (see `@motif-studio/schema`)
- Automation (see `@motif-studio/automation`)
- UI components

## Dependencies

- `@motif-studio/schema` — types for motifs, profiles, scenes, cue families, derivations
