<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/music-theory

Elementos básicos y utilidades de teoría musical para Motif: escalas, acordes, motivos y transformaciones de intensidad.

## Funcionalidades

- Operaciones de clase de tono y nombres de notas.
- Definiciones de escalas y generación de clases de tono.
- Herramientas para la calidad, la disposición y la progresión de los acordes.
- Transformaciones de motivos (transposición, inversión, inversión, escala rítmica).
- Generación de variaciones (rítmicas, melódicas, ligeras, densas, acentos).
- Derivación de niveles de intensidad (bajos, medios, altos, tensión, brillo).

## Exportaciones principales

### Escalas y tonos

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

### Transformaciones de motivos

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif/music-theory";
```

### Intensidad

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif/music-theory";
```

## Dependencias

Ninguna: paquete fundamental sin dependencias.
