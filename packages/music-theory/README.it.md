<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/music-theory

Elementi fondamentali e utilità per la teoria musicale in Motif: scale, accordi, motivi e trasformazioni di intensità.

## Cosa offre

- Operazioni su altezze e nomi delle note
- Definizioni di scale e generazione di altezze
- Strumenti per la qualità, la disposizione e le progressioni degli accordi
- Trasformazioni dei motivi (trasposizione, inversione, inversione, scala ritmica)
- Generazione di variazioni (ritmiche, melodiche, rarefazione, densificazione, accenti)
- Derivazione dei livelli di intensità (bassa, media, alta, tensione, luminosità)

## Esportazioni principali

### Scale e altezze

```ts
import {
  SCALES, pitchClass, octave, midiNote, noteName,
  scalePitchClasses, isInScale, snapToScale,
  transposeDiatonic,
} from "@motif-studio/music-theory";
```

### Accordi

```ts
import {
  chordPitches, diatonicChord, diatonicChords,
  chordPalette, generatePadVoicing, generateBassLine,
  arpeggiateChord, progressionFromDegrees,
} from "@motif-studio/music-theory";
```

### Trasformazioni dei motivi

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif-studio/music-theory";
```

### Intensità

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif-studio/music-theory";
```

## Dipendenze

Nessuna – pacchetto di base senza dipendenze.
