<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/instrument-rack

Gestion des voix et des instruments pour Motif : synthétiseurs, batteries et préréglages d'usine.

## Ce que cela inclut

- Création et gestion des paramètres des voix de synthétiseur.
- Création de voix de batterie avec configuration individuelle pour chaque élément.
- Cycle de vie du rack d'instruments (création, connexion, suppression).
- Bibliothèque de préréglages d'usine avec accès par catégories.
- Conversion MIDI-fréquence et mappage hauteur-batterie.

## Principales fonctionnalités

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

- `InstrumentRack` — gère plusieurs voix, le routage et la suppression.
- `SynthVoice` — voix basée sur un oscillateur avec enveloppe et filtre.
- `DrumVoice` — voix de percussion basée sur des échantillons.
- `FACTORY_PRESETS` — collection de préréglages intégrée.
- `getPreset(name)` / `getPresetsByCategory(cat)` — recherche de préréglages.

## Dépendances

- `@motif/schema` — types pour les instruments, les préréglages et les voix.
