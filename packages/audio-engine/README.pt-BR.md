<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/audio-engine

Reprodução de amostras e gerenciamento de vozes para Motif.

## Funcionalidades

- Reprodução de regiões recortadas
- Reprodução de fatias
- Reprodução de slots de kits
- Reprodução de notas de instrumentos de amostra (com ajuste de afinação)
- Gerenciamento do ciclo de vida das vozes

## Principais Exportações

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif-studio/audio-engine";
```

- `playTrimmedRegion` — reproduz um buffer de áudio dentro dos limites de recorte.
- `playSlice` — reproduz uma fatia específica de amostra.
- `playKitSlot` — reproduz um slot de kit em uma determinada afinação.
- `playSampleInstrumentNote` — reproduz uma nota afinada em um instrumento de amostra.

## Funcionalidades Não Incluídas

- Orquestração e mixagem de cenas (gerenciado por `@motif-studio/playback-engine`)
- Decodificação de arquivos de áudio (o AudioContext do navegador cuida disso)
- Composição de clipes/pontos de referência (gerenciado por `@motif-studio/clip-engine`)

## Dependências

- `@motif-studio/schema` — tipos para ativos, fatias, kits, instrumentos.
