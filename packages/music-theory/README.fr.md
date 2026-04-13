<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/music-theory

Éléments de base et utilitaires de théorie musicale pour Motif : gammes, accords, motifs et transformations d'intensité.

## Ce que cela comprend

- Opérations sur les hauteurs et les noms de notes
- Définitions de gammes et génération de hauteurs
- Utilitaires pour la qualité, la disposition et les progressions d'accords
- Transformations de motifs (transposition, inversion, inversion, échelle rythmique)
- Génération de variations (rythmiques, mélodiques, légères, densification, accents)
- Dérivation des niveaux d'intensité (faible, moyen, élevé, tension, luminosité)

## Principales exportations

### Gammes et hauteurs

```ts
import {
  SCALES, pitchClass, octave, midiNote, noteName,
  scalePitchClasses, isInScale, snapToScale,
  transposeDiatonic,
} from "@motif/music-theory";
```

### Accords

```ts
import {
  chordPitches, diatonicChord, diatonicChords,
  chordPalette, generatePadVoicing, generateBassLine,
  arpeggiateChord, progressionFromDegrees,
} from "@motif/music-theory";
```

### Transformations de motifs

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif/music-theory";
```

### Intensité

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif/music-theory";
```

## Dépendances

Aucune — paquet de base sans dépendances.
