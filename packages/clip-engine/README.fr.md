<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/clip-engine

Moteur de séquençage, de composition et de transformation de clips audio pour Motif.

## Fonctionnalités

- Lecture des clips et assignation des clips aux scènes
- Planification des notes et synchronisation du lancement
- Transformations de composition (transposition, inversion, inversion, décalage d'octave, mise à l'échelle du rythme)
- Outils de variation (rythmique, mélodique, allègement, densification, accents, notes fantômes)
- Dérivation de l'intensité (grave/médium/aigu, tension, brillance, sonorité de pad, ligne de basse, arpèges)
- Outils d'accords (accords diatoniques, palette d'accords, progressions)
- Planification des repères et résolution des sections

## Principales exportations

```ts
import {
  ClipPlayer,
  SceneClipPlayer,
  scheduleNotes,
  clipTranspose,
  clipInvert,
  clipReverse,
  resolveCuePlan,
  chordPalette,
  diatonicChords,
} from "@motif/clip-engine";
```

### Lecture
- `ClipPlayer` — lit des clips individuels avec planification des notes
- `SceneClipPlayer` — assigne et lit des clips dans les scènes

### Transformations
- `clipTranspose`, `clipInvert`, `clipReverse`, `clipOctaveShift`, `clipRhythmScale`
- `clipDuplicateWithVariation`, `clipSnapToScale`, `clipFindOutOfScale`

### Variations
- `clipRhythmicVariation`, `clipMelodicVariation`, `clipThinNotes`, `clipDensifyNotes`
- `clipAccentEveryN`, `clipAddGhostHits`, `clipRemoveGhostHits`

### Intensité
- `clipDeriveIntensity`, `clipAddTension`, `clipBrighten`
- `clipPadVoicing`, `clipBassLine`, `clipArpeggiate`

### Planification des repères
- `resolveCuePlan`, `sectionAtTick`, `sectionAtBar`
- `cueSecondsToTick`, utilitaires de conversion tick/barre/temps

## Dépendances

- `@motif/schema` — types pour les clips, les notes, les repères
- `@motif/instrument-rack` — gestion des voix pour la lecture
- `@motif/music-theory` — primitives de gamme/accord/motif
