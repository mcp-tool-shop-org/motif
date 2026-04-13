<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/playback-engine

Système de lecture, de mixage, de rendu et d'effets en temps réel pour les scènes et les séquences Motif.

## Ce qu'il contient

- Contrôle de la lecture (lecture, pause, arrêt, recherche)
- Chargement et décodage des ressources
- Lecture des scènes avec mixage des pistes
- Lecture des transitions entre les scènes
- Lecture des séquences (chaînes de scènes ordonnées)
- Mélangeur avec contrôle par piste et par bus
- Traitement des effets (égaliseur, délai, réverbération, compresseur)
- Rendu des repères et exportation hors ligne
- Encodage WAV

## Exports principaux

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

### Classes principales
- `Transport` — état de la lecture, synchronisation et recherche
- `AssetLoader` — chargement et décodage des ressources audio
- `ScenePlayer` — lecture des scènes avec pistes superposées
- `TransitionPlayer` — fondu enchaîné et transition entre les scènes
- `SequencePlayer` — lecture de séquences de scènes ordonnées
- `Mixer` — gain, panoramique, mise en sourdine, solo, routage des pistes
- `CueRenderer` — rendu hors ligne vers un tampon audio
- `CuePlayer` — coordination de la lecture au niveau des repères

### Effets
- `createFxNodes` / `disposeFxNodes` — cycle de vie des chaînes d'effets
- Préréglages intégrés pour l'égaliseur, le délai, la réverbération et le compresseur

## Dépendances

- `@motif-studio/schema` — types pour les scènes, les pistes et les transitions
- `@motif-studio/audio-engine` — primitives de lecture d'échantillons
- `@motif-studio/scene-mapper` — évaluation des déclencheurs pour la résolution des scènes
