<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/instrument-rack

Gestione di voci e strumenti per Motif: sintetizzatori, batterie e preset predefiniti.

## Funzionalità principali

- Creazione e gestione dei parametri delle voci dei sintetizzatori.
- Creazione di voci per batteria con configurazione personalizzabile per ogni elemento.
- Ciclo di vita del rack di strumenti (creazione, connessione, eliminazione).
- Libreria di preset predefiniti con accesso categorizzato.
- Conversione da MIDI a frequenza e mappatura da altezza del suono a batteria.

## Esportazioni principali

```ts
import {
  InstrumentRack,
  SynthVoice,
  DrumVoice,
  FACTORY_PRESETS,
  getPreset,
  getPresetsByCategory,
  midiToFreq,
  pitchToDrum,
} from "@motif/instrument-rack";
```

- `InstrumentRack` — gestisce più voci, routing e eliminazione.
- `SynthVoice` — voce basata su oscillatore con inviluppo e filtro.
- `DrumVoice` — voce percussiva basata su campioni.
- `FACTORY_PRESETS` — collezione di preset predefiniti.
- `getPreset(name)` / `getPresetsByCategory(cat)` — ricerca di preset.

## Dipendenze

- `@motif/schema` — tipi per strumenti, preset e voci.
