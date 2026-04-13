<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/clip-engine

Motore per la sequenza, la composizione e la trasformazione di clip audio per Motif.

## Funzionalità principali

- Riproduzione di clip e assegnazione di clip alle scene
- Pianificazione delle note e sincronizzazione del timing di avvio
- Trasformazioni di composizione (trasposizione, inversione, inversione, spostamento di ottava, scala ritmica)
- Strumenti di variazione (ritmico, melodico, rarefazione, densificazione, accenti, note fantasma)
- Derivazione dell'intensità (basso/medio/alto, tensione, luminosità, voicing del pad, linea di basso, arpeggio)
- Strumenti per gli accordi (accordi diatonic, tavolozza di accordi, progressioni)
- Pianificazione dei segnali e risoluzione delle sezioni

## Funzionalità principali esportate

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
} from "@motif-studio/clip-engine";
```

### Riproduzione
- `ClipPlayer` — riproduce singoli clip con pianificazione delle note
- `SceneClipPlayer` — assegna e riproduce clip all'interno delle scene

### Trasformazioni
- `clipTranspose`, `clipInvert`, `clipReverse`, `clipOctaveShift`, `clipRhythmScale`
- `clipDuplicateWithVariation`, `clipSnapToScale`, `clipFindOutOfScale`

### Variazioni
- `clipRhythmicVariation`, `clipMelodicVariation`, `clipThinNotes`, `clipDensifyNotes`
- `clipAccentEveryN`, `clipAddGhostHits`, `clipRemoveGhostHits`

### Intensità
- `clipDeriveIntensity`, `clipAddTension`, `clipBrighten`
- `clipPadVoicing`, `clipBassLine`, `clipArpeggiate`

### Pianificazione dei segnali
- `resolveCuePlan`, `sectionAtTick`, `sectionAtBar`
- `cueSecondsToTick`, utilità di conversione tick/barra/battito

## Dipendenze

- `@motif-studio/schema` — tipi per clip, note, segnali
- `@motif-studio/instrument-rack` — gestione delle voci per la riproduzione
- `@motif-studio/music-theory` — primitive per scale, accordi e motivi
