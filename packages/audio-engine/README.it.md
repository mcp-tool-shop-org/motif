<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/audio-engine

Riproduzione di campioni e gestione delle voci per Motif.

## Funzionalità incluse

- Riproduzione di regioni delimitate
- Riproduzione di sezioni
- Riproduzione di slot di kit
- Riproduzione di note di strumenti a campione (con trasposizione di intonazione)
- Gestione del ciclo di vita delle voci

## Esportazioni principali

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif/audio-engine";
```

- `playTrimmedRegion` — riproduce un buffer audio all'interno dei limiti di una regione.
- `playSlice` — riproduce una sezione specifica di un campione.
- `playKitSlot` — riproduce uno slot di un kit a una determinata intonazione.
- `playSampleInstrumentNote` — riproduce una nota con intonazione su uno strumento a campione.

## Funzionalità non incluse

- Orchestrazione e mixaggio delle scene (gestiti da `@motif/playback-engine`)
- Decodifica dei file audio (gestita dal AudioContext del browser)
- Composizione di clip/cue (gestita da `@motif/clip-engine`)

## Dipendenze

- `@motif/schema` — tipi per risorse, sezioni, kit, strumenti.
