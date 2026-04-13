<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/score-map

Lógica de puntuación global para Motif: familias de motivos, perfiles de puntuación, familias de indicaciones, entradas del mapa global y derivación.

## Funcionalidades

- Gestión de familias de motivos (variantes, enlaces a escenas)
- Creación y validación de rangos de perfiles de puntuación
- Construcción de familias de indicaciones y asociación con escenas/motivos
- Resolución de entradas del mapa de puntuación (perfil, familias, motivos)
- Registros de derivación y trazado de linaje

## Exportaciones Principales

### Motivo (`motif.ts`)
- `createMotifFamily(id, name)`: crea una familia de motivos.
- `addVariant(family, variant) / removeVariant(family, variantId)`: añade o elimina una variante.
- `linkScene(family, sceneId) / unlinkScene(family, sceneId)`: enlaza o desvincula una escena.
- `motifFamilyRefs(family)`: devuelve todos los ID de las entidades referenciadas.
- `familiesReferencingId(families, entityId)`: encuentra las familias que hacen referencia a una entidad.

### Perfil (`profile.ts`)
- `createScoreProfile(id, name, options)`: crea un perfil con tempo, intensidad, paleta y clave/escala.
- `isTempoInRange(profile, bpm) / isIntensityInRange(profile, intensity)`: verifica si el tempo o la intensidad están dentro del rango.
- `matchingPaletteTags(profileA, profileB)`: devuelve las etiquetas de paleta compartidas.
- `mergeProfiles(base, overlay)`: combina perfiles.

### Familia de Indicaciones (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)`: crea una familia de indicaciones con un rol y escenas.
- `addSceneToCueFamily / removeSceneFromCueFamily`: añade o elimina una escena.
- `linkMotifToCueFamily(family, motifFamilyId)`: enlaza un motivo a una familia de indicaciones.
- `sharedMotifs(familyA, familyB) / sharedScenes(familyA, familyB)`: devuelve los motivos o escenas compartidas.
- `collectMotifFamilyIds(family)`: devuelve todos los ID de las familias de motivos.

### Resolución (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)`: crea una entrada del mapa global.
- `resolveProfile / resolveCueFamilies / resolveMotifFamilies`: resuelve perfiles, familias de indicaciones o familias de motivos.
- `entrySceneIds(entry, cueFamilies)`: devuelve las escenas accesibles a través de las familias de indicaciones.
- `entriesByContext / entriesSharingMotif / resolveEntryContext`: devuelve entradas por contexto, entradas que comparten un motivo o resuelve el contexto de una entrada.

### Derivación (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)`: crea un registro de derivación.
- `deriveScene(scene, transform)`: aplica una transformación y obtiene una nueva escena.
- `derivationsFrom / derivationsTo / derivationChain / derivationGraphIds`: devuelve las derivaciones de, hacia, la cadena de derivación o los ID del grafo de derivación.

## Funcionalidades No Incluidas

- Reproducción o renderizado de audio.
- Gestión de escenas/pistas/enlaces (ver `@motif-studio/schema`).
- Automatización (ver `@motif-studio/automation`).
- Componentes de interfaz de usuario.

## Dependencias

- `@motif-studio/schema`: tipos para motivos, perfiles, escenas, familias de indicaciones y derivaciones.
