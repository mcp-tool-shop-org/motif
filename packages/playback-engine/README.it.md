<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/playback-engine

Sistema di riproduzione, mixaggio, rendering ed effetti in tempo reale per scene e sequenze Motif.

## Cosa offre

- Controllo della riproduzione (play, pausa, stop, ricerca)
- Caricamento e decodifica degli asset
- Riproduzione delle scene con mixaggio degli stem
- Riproduzione delle transizioni tra le scene
- Riproduzione delle sequenze (catene di scene ordinate)
- Mixer con controllo a livello di singolo stem e di bus
- Elaborazione degli effetti (EQ, delay, riverbero, compressore)
- Rendering delle anteprime e esportazione offline
- Codifica WAV

## Esportazioni principali

```ts
import {
  Transport,
  AssetLoader,
  ScenePlayer,
  TransitionPlayer,
  SequencePlayer,
  Mixer,
  CueRenderer,
  CuePlayer,
  createFxNodes,
  disposeFxNodes,
  dbToGain,
  encodeWav,
} from "@motif-studio/playback-engine";
```

### Classi principali
- `Transport` — stato della riproduzione, temporizzazione e ricerca
- `AssetLoader` — caricamento e decodifica degli asset audio
- `ScenePlayer` — riproduzione delle scene con stem sovrapposti
- `TransitionPlayer` — dissolvenza e transizione tra le scene
- `SequencePlayer` — riproduzione di sequenze di scene ordinate
- `Mixer` — guadagno, pan, mute, solo e routing dei bus per singolo stem
- `CueRenderer` — rendering offline in un buffer audio
- `CuePlayer` — coordinamento della riproduzione a livello di anteprima

### Effetti
- `createFxNodes` / `disposeFxNodes` — ciclo di vita della catena di effetti
- Preset integrati per EQ, delay, riverbero e compressore

## Dipendenze

- `@motif-studio/schema` — tipi per scene, stem e transizioni
- `@motif-studio/audio-engine` — elementi primitivi per la riproduzione di campioni
- `@motif-studio/scene-mapper` — valutazione dei trigger per la risoluzione delle scene
