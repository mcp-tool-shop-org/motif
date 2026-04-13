<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/audio-engine

Lecture d'échantillons et gestion des voix pour Motif.

## Fonctionnalités principales

- Lecture de régions délimitées
- Lecture de séquences
- Lecture de plages d'échantillons
- Lecture de notes d'instruments d'échantillons (avec modification de la hauteur)
- Gestion du cycle de vie des voix

## Exportations principales

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif-studio/audio-engine";
```

- `playTrimmedRegion` : lecture d'un tampon audio dans les limites d'une région.
- `playSlice` : lecture d'une séquence spécifique.
- `playKitSlot` : lecture d'une plage d'échantillons à une hauteur donnée.
- `playSampleInstrumentNote` : lecture d'une note avec hauteur sur un instrument d'échantillon.

## Fonctionnalités non incluses

- Orchestration et mixage des scènes (gérés par `@motif-studio/playback-engine`)
- Décodage des fichiers audio (géré par l'AudioContext du navigateur)
- Composition de clips/cues (gérés par `@motif-studio/clip-engine`)

## Dépendances

- `@motif-studio/schema` : types pour les ressources, les séquences, les kits et les instruments.
