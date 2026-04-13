<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/music-theory

Elementos básicos e utilitários de teoria musical para Motif — escalas, acordes, motivos e transformações de intensidade.

## O que ele oferece

- Operações de classe de altura e nomes de notas
- Definições de escalas e geração de classes de altura
- Funções auxiliares para qualidade, voicing e progressões de acordes
- Transformações de motivos (transposição, inversão, inversão, escala rítmica)
- Geração de variações (rítmica, melódica, esparsa, densa, ênfases)
- Derivação de níveis de intensidade (baixo, médio, alto, tensão, brilho)

## Principais funcionalidades

### Escalas e alturas

```ts
import {
  SCALES, pitchClass, octave, midiNote, noteName,
  scalePitchClasses, isInScale, snapToScale,
  transposeDiatonic,
} from "@motif/music-theory";
```

### Acordes

```ts
import {
  chordPitches, diatonicChord, diatonicChords,
  chordPalette, generatePadVoicing, generateBassLine,
  arpeggiateChord, progressionFromDegrees,
} from "@motif/music-theory";
```

### Transformações de motivos

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif/music-theory";
```

### Intensidade

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif/music-theory";
```

## Dependências

Nenhuma — pacote fundamental sem dependências.
