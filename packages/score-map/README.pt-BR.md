<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/score-map

Lógica de pontuação global para Motif — famílias de motivos, perfis de pontuação, famílias de comandos, entradas no mapa global e derivação.

## O que ele gerencia

- Gerenciamento de famílias de motivos (variantes, links de cena)
- Criação e verificação de intervalo de perfis de pontuação
- Construção de famílias de comandos e associação de cenas/motivos
- Resolução de entradas no mapa de pontuação (perfil, famílias, motivos)
- Registros de derivação e rastreamento de linhagem

## Principais exportações

### Motivo (`motif.ts`)
- `createMotifFamily(id, name)` — cria uma família de motivos
- `addVariant(family, variant)` / `removeVariant(family, variantId)`
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`
- `motifFamilyRefs(family)` — todos os IDs de entidades referenciadas
- `familiesReferencingId(families, entityId)` — encontra famílias que referenciam uma entidade

### Perfil (`profile.ts`)
- `createScoreProfile(id, name, options)` — cria com tempo, intensidade, paleta, tonalidade/escala
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`
- `matchingPaletteTags(profileA, profileB)` — vocabulário sonoro compartilhado
- `mergeProfiles(base, overlay)` — combina perfis

### Família de comandos (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)` — cria com função e cenas
- `addSceneToCueFamily` / `removeSceneFromCueFamily`
- `linkMotifToCueFamily(family, motifFamilyId)`
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`
- `collectMotifFamilyIds(family)` — todos os IDs de famílias de motivos

### Resolução (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)` — cria uma entrada no mapa global
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`
- `entrySceneIds(entry, cueFamilies)` — cenas acessíveis através de famílias de comandos
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`

### Derivação (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)` — cria um registro de derivação
- `deriveScene(scene, transform)` — aplica uma transformação e obtém uma nova cena
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`

## O que ele não gerencia

- Reprodução ou renderização de áudio
- Gerenciamento de cenas/stem/vinculações (veja `@motif-studio/schema`)
- Automação (veja `@motif-studio/automation`)
- Componentes de interface do usuário

## Dependências

- `@motif-studio/schema` — tipos para motivos, perfis, cenas, famílias de comandos, derivações
