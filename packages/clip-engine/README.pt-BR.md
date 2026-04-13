<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/clip-engine

Motor de sequenciamento, composição e transformação de trechos de áudio para o Motif.

## O que ele oferece:

- Reprodução de trechos e atribuição de trechos a cenas.
- Agendamento de notas e sincronização precisa do início da reprodução.
- Transformações de composição (transposição, inversão, inversão, deslocamento de oitava, escala rítmica).
- Ferramentas de variação (rítmica, melódica, simplificação, densificação, ênfases, notas fantasma).
- Derivação de intensidade (grave/médio/agudo, tensão, brilho, timbre de fundo, linha de baixo, arpejo).
- Ferramentas de acordes (acordes diatônicos, paleta de acordes, progressões).
- Agendamento de pontos de referência e resolução de seções.

## Principais funcionalidades:

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

### Reprodução
- `ClipPlayer` — reproduz trechos individuais com agendamento de notas.
- `SceneClipPlayer` — atribui e reproduz trechos dentro de cenas.

### Transformações
- `clipTranspose`, `clipInvert`, `clipReverse`, `clipOctaveShift`, `clipRhythmScale`.
- `clipDuplicateWithVariation`, `clipSnapToScale`, `clipFindOutOfScale`.

### Variações
- `clipRhythmicVariation`, `clipMelodicVariation`, `clipThinNotes`, `clipDensifyNotes`.
- `clipAccentEveryN`, `clipAddGhostHits`, `clipRemoveGhostHits`.

### Intensidade
- `clipDeriveIntensity`, `clipAddTension`, `clipBrighten`.
- `clipPadVoicing`, `clipBassLine`, `clipArpeggiate`.

### Agendamento de Pontos de Referência
- `resolveCuePlan`, `sectionAtTick`, `sectionAtBar`.
- `cueSecondsToTick`, utilitários de conversão de segundos/tiques/compassos.

## Dependências

- `@motif-studio/schema` — tipos para trechos, notas, pontos de referência.
- `@motif-studio/instrument-rack` — gerenciamento de vozes para reprodução.
- `@motif-studio/music-theory` — primitivas de escala/acorde/motivo.
