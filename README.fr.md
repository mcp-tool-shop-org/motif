<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif-studio"><img src="https://img.shields.io/npm/v/@motif-studio/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Studio de création musicale adaptative pour la composition, l’arrangement, la création de partitions et l’exportation de musique interactive pour jeux.

## Qu’est-ce que c’est

Motif est une station de travail axée sur la composition et consciente de l’adaptation. Il combine une création musicale structurée (clips, séquences, scènes, couches, automatisation) avec une logique adaptative qui réagit à l’état du jeu en temps réel. Le résultat : une musique de jeu qui semble intentionnelle, et non générée aléatoirement.

## Ce que ce n’est pas

Un logiciel d’enregistrement multipiste (DAW). Un séquenceur basique. Un générateur de musique par IA. Une base de données pour la création de mondes avec des sons associés. Motif est un outil créatif sérieux pour la création de partitions adaptatives pour jeux.

Motif ne génère pas de musique. Il [ingère](#generated-cues-and-the-genre-library) l’audio que vous avez généré ailleurs, transformant un mixage, ses pistes individuelles et une mesure du volume en scènes, familles de séquences et lectures superposées. L’origine de l’audio est de votre ressort ; le travail de Motif commence lorsque la séquence existe.

## Ce qu’il peut faire

- **Composer** : Clips avec notes, instruments, gammes, accords, transformations de motifs, variantes d’intensité
- **Synthétiser** : Voix synthétiques multi-oscillateurs avec unison/supersaw (16 préréglages), modulation LFO (filtre, amplitude, hauteur)
- **Instruments échantillonnés** : Piano, cordes, guitare via SampleVoice ; importation, découpage, division, création de kits
- **Arranger** : Scènes avec pistes superposées, rôles de section, courbes d’intensité ; 10 préréglages de motifs de batterie
- **Mixer et appliquer des effets** : 8 types d’effets (égaliseur, délai, réverbération, compresseur, chorus, distorsion, phaser, limiteur) ; 4 emplacements d’effets insérés par piste
- **Créer une ambiance sonore pour un monde** : Familles Motif, profils de partition, familles de séquences, entrées de carte du monde, dérivation
- **Ingérer l’audio généré** : Transformer un mixage généré dans le cloud + pistes Demucs + mesure LUFS en un ensemble jouable et normalisé en volume ; contenu adressé afin que les exécutions répétées soient quasi instantanées
- **Créer des ensembles de genres à partir d’un catalogue** : Une entrée JSON par séquence crée un ensemble complet : scène, famille de séquences, verrouillage de génération, liaisons et enregistrements A/B
- **Automatiser** : Pistes, macros, enveloppes, capture en direct et fusion
- **Rappeler et réutiliser** : Modèles, instantanés, branches, favoris, collections, comparaison
- **MIDI** : Importation/exportation de fichiers MIDI standard
- **Logique adaptative** : Déclenchement des liaisons, transitions, résolution déterministe des scènes
- **Jouer** : Prévisualisation en temps réel des clips, lecture à la demande par clic, métronome avec clics programmés via AudioContext
- **Valider** : Validation du schéma, audit d’intégrité, vérifications croisées
- **Exporter** : WAV 24/32 bits à 44,1/48/96 kHz ; ensembles pour l’exécution dans un moteur de jeu
- **Créer** : Annuler/rétablir (profondeur de 50 actions, Ctrl+Z), sauvegarde/chargement du projet avec sauvegarde automatique, raccourcis clavier (Espace=lecture, ?=aide), BPM et mesure globale
- **Fiabilité** : Gestion des erreurs avec récupération en douceur, planification AudioContext pour une synchronisation précise des échantillons

## Séquences générées et bibliothèque de genres

Motif peut créer un ensemble jouable `SoundtrackPack` à partir d’audio généré. Vous décrivez un ensemble dans un fichier catalogue, vous générez l’audio comme vous le souhaitez, et Motif le transforme en scènes, familles de séquences et pistes superposées que vous pouvez écouter dans Studio.

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif prend en charge les deux dernières étapes. Il se soucie uniquement du fait que chaque séquence arrive sous forme de mixage, de ses pistes individuelles et d’une mesure du volume.

**Le catalogue intégré décrit 24 ensembles de genres : 233 séquences, deux enregistrements par séquence.** Fantaisie, tactique, donjon, steampunk, pirate, western, opéra spatial, cyberpunk, mythique, terres désolées, oriental, nordique, désert, forêt, gelé, gothique, sous-marin, volcanique, chaleureux, noir, thèmes émotionnels, ambiances sonores, tension et menus. Le catalogue et la dérivation se trouvent dans ce dépôt ; **les fichiers audio maîtres ne s’y trouvent pas** : ils sont volumineux et générés par utilisateur, vous devez donc les fournir et exécuter l’ingestion.

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

L’ingestion est **adressée au contenu et incrémentale** : une séquence dont les fichiers d’entrée ont toujours le même hachage que lors de l’exécution précédente est réutilisée au lieu d’être redécodée, de sorte que la réexécution d’un ensemble terminé prend environ une seconde au lieu de plusieurs minutes, et qu’une exécution interrompue reprend là où elle s’est arrêtée. `--force` redécode tout pour prouver que le pipeline reproduit toujours sa propre sortie ; `--skip-defective` rejette une séquence malformée, la signale et se termine avec un code de retour différent de zéro au lieu d’arrêter toute l’exécution.

Consultez [Séquences générées et ensembles de bibliothèque](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/) dans le manuel pour obtenir la description complète du flux de travail, y compris les verrouillages de génération et la curation des séquences.

## Structure du monoréférentiel

### Applications

| Application | Description |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interface utilisateur principale (Next.js, Zustand 5) |

### Packages principaux

| Package | Description |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Types canoniques, schémas Zod, analyse/validation |
| [`@motif-studio/asset-index`](packages/asset-index) | Indexation et audit de l’intégrité des ensembles |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Lecture d’échantillons, gestion des voix, planification AudioContext |
| [`@motif-studio/test-kit`](packages/test-kit) | Éléments et utilitaires de test |

### Composition et lecture

| Package | Description |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Séquençage des clips, transformations, planification des séquences |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Synthétiseur multi-oscillateurs, voix de batterie, voix d’échantillon, modulation LFO, 16 préréglages |
| [`@motif-studio/music-theory`](packages/music-theory) | Gammes, accords, motifs, transformations d’intensité |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Lecture en temps réel, mixage, 8 types d’effets, E/S MIDI, exportation WAV (24/32 bits) |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Découpage, division, création de kits, outils pour instruments ; plus la piste de génération : client d’exécution dans le cloud, ingestion des artefacts, normalisation du volume, création d’ensembles de bibliothèque |
| [`@motif-studio/score-map`](packages/score-map) | Motifs, profils, familles de séquences, dérivation, catalogue de bibliothèque |
| [`@motif-studio/automation`](packages/automation) | Pistes, macros, enveloppes, capture |
| [`@motif-studio/library`](packages/library) | Modèles, instantanés, branches, favoris, comparaison |

### Infrastructure

| Package | Description |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Mappage des déclencheurs et évaluation déterministe des liaisons |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Exportation/importation en temps d’exécution avec sérialisation déterministe |
| [`@motif-studio/review`](packages/review) | Résumés et outils d’audit |
| [`@motif-studio/ui`](packages/ui) | Composants d’interface utilisateur partagés |

## Installer

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

Tous les paquets sont publiés sur npm sous le champ d’application `@motif-studio`.

## Démarrage rapide (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**Prérequis :** Node.js >= 22, pnpm >= 10

## Tests

Les 16 paquets sont dotés de tests unitaires couvrant la validation du schéma, l’audit d’intégrité, les opérations d’exemple, le calcul des scores mondiaux, l’automatisation, la gestion de bibliothèque, la lecture, la synthèse, les effets, MIDI, l’ingestion de données pour la génération et l’intégration au studio. 1 709 tests dans tous les paquets.

Exécuter tout : `pnpm test`

## Manuel d’utilisation

Le [manuel](https://mcp-tool-shop-org.github.io/motif/handbook/product/) est le manuel d’utilisation complet couvrant la définition du produit, l’architecture, la navigation dans le studio, les flux de travail créatifs et la stratégie. Points d’entrée principaux :

- [Produit : qu’est-ce que Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Architecture : aperçu du dépôt](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flux de travail : création d’une séquence à partir de zéro](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flux de travail : séquences générées et paquets de bibliothèque](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [Flux de travail : utilisation d’échantillons personnalisés](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flux de travail : calcul des scores mondiaux](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Stratégie : glossaire](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Exemples de paquets](examples/)

## Sécurité et confiance

**Le studio fonctionne entièrement dans le navigateur.** Pas de serveur, pas de synchronisation avec le cloud, pas de télémétrie.

- **Données concernées :** fichiers de paquets de bandes sonores créés par l’utilisateur (JSON), références aux ressources audio, stockage local du navigateur
- **Données NON concernées :** aucun stockage côté serveur, aucun accès au système de fichiers en dehors du bac à sable du navigateur
- **Réseau :** l’application Studio ne génère aucune communication réseau : toute la création et la lecture se font côté client.
- **Secrets :** ne lit, ne stocke ni ne transmet pas d’identifiants.
- **Télémétrie :** aucune donnée n’est collectée ou envoyée.
- **Autorisations :** uniquement les API standard du navigateur (Web Audio API)

**Une seule exception, qui est facultative et se trouve en dehors de l’application :** `@motif-studio/sample-lab` inclut une ligne de commande pour la génération qui communique avec un point de terminaison Comfy Cloud afin de soumettre et de récupérer des tâches de génération. Elle ne s’exécute que lorsque vous l’invoquez à partir d’un terminal, elle n’est jamais importée par l’application Studio et elle lit ses identifiants dans votre propre environnement. Vous pouvez la supprimer complètement et Motif restera entièrement hors ligne.

Consultez [SECURITY.md](SECURITY.md) pour signaler les vulnérabilités.

## Licence

MIT

---

Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
