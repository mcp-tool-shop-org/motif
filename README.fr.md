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

Studio de création de bandes sonores adaptatives pour composer, arranger, orchestrer et exporter de la musique interactive pour les jeux vidéo.

## Qu'est-ce que c'est ?

Motif est une station de travail axée sur la composition, conçue pour l'adaptation. Elle combine la création musicale structurée (clips, amorces, scènes, couches, automatisation) avec une logique adaptative qui réagit à l'état du jeu en temps réel. Le résultat : une musique de jeu qui semble intentionnelle, et non générée aléatoirement.

## Ce que ce n'est pas

Un DAW (Digital Audio Workstation). Un séquenceur basique. Un générateur de musique par IA. Une base de données de création de monde avec des sons intégrés. Motif est un instrument de création sérieux pour l'orchestration adaptative de jeux vidéo.

## Ce que cela peut faire

- **Composer** : Clips avec notes, instruments, gammes, accords, transformations de motifs, variations d'intensité.
- **Synthétiser** : Voix de synthétiseur multi-oscillateurs avec unison/supersaw (16 préréglages), modulation LFO (filtre, amplitude, hauteur).
- **Échantillonner des instruments** : Modèles de piano, de cordes, de guitare via SampleVoice ; importer, découper, diviser, création de kits.
- **Arranger** : Scènes avec couches, rôles de section, courbes d'intensité ; 10 préréglages de motifs de batterie.
- **Mixer et appliquer des effets** : 8 types d'effets (EQ, délai, réverbération, compresseur, chorus, distorsion, phaser, limiteur) ; 4 emplacements d'effets insérables par couche.
- **Créer un univers sonore** : Familles de motifs, profils d'orchestration, familles d'amorces, entrées de carte du monde, dérivation.
- **Automatiser** : Pistes, macros, enveloppes, capture en direct et fusion.
- **Récupérer et réutiliser** : Modèles, instantanés, branches, favoris, collections, comparaison.
- **MIDI** : Importer/exporter des fichiers MIDI standard.
- **Logique adaptative** : Liaisons de déclencheurs, transitions, résolution de scène déterministe.
- **Jouer** : Prévisualisation de clips en temps réel, audition par clic, métronome avec clics programmés via AudioContext.
- **Valider** : Validation de schéma, audit d'intégrité, vérifications de références croisées.
- **Exporter** : Fichiers WAV 24/32 bits à 44,1/48/96 kHz ; packs d'exécution pour les moteurs de jeu.
- **Créer** : Annuler/refaire (jusqu'à 50 niveaux, Ctrl+Z), enregistrer/charger le projet avec sauvegarde automatique, raccourcis clavier (Espace = lecture, ? = aide), tempo et signature temporelle globaux.
- **Fiabilité** : Gestion des erreurs avec reprise en douceur, planification AudioContext pour une synchronisation précise.

## Structure du dépôt unique (monorepo)

### Applications

| Application | Description |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interface utilisateur principale de création (Next.js, Zustand 5). |

### Paquets principaux

| Paquet | Description |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Types canoniques, schémas Zod, analyse/validation. |
| [`@motif-studio/asset-index`](packages/asset-index) | Indexation et audit de l'intégrité des paquets. |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Lecture d'échantillons, gestion des voix, planification AudioContext. |
| [`@motif-studio/test-kit`](packages/test-kit) | Outils de test et de simulation. |

### Composition et lecture

| Paquet | Description |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Séquençage de clips, transformations, planification d'amorces. |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Synthétiseur multi-oscillateurs, voix de batterie, voix d'échantillon, modulation LFO, 16 préréglages. |
| [`@motif-studio/music-theory`](packages/music-theory) | Gammes, accords, motifs, transformations d'intensité. |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Lecture en temps réel, mixage, 8 types d'effets, E/S MIDI, exportation WAV (24/32 bits). |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Découpage, division, kit, assistants d'instruments. |
| [`@motif-studio/score-map`](packages/score-map) | Motifs, profils, familles d'amorces, dérivation. |
| [`@motif-studio/automation`](packages/automation) | Pistes, macros, enveloppes, capture. |
| [`@motif-studio/library`](packages/library) | Modèles, instantanés, branches, favoris, comparaison. |

### Infrastructure

| Paquet | Description |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Mappage des déclencheurs et évaluation déterministe des liaisons. |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Exportation/importation en temps réel avec sérialisation déterministe. |
| [`@motif-studio/review`](packages/review) | Résumés et outils d'audit. |
| [`@motif-studio/ui`](packages/ui) | Composants d'interface utilisateur partagés. |

## Installation

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

Tous les paquets sont publiés sur npm sous le préfixe `@motif-studio`.

## Démarrage rapide (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,116 tests across all packages
pnpm dev        # Start Studio dev server
```

**Prérequis :** Node.js >= 22, pnpm >= 10

## Tests

Les 16 paquets contiennent des tests unitaires couvrant la validation du schéma, l'audit de l'intégrité, les opérations d'exemple, le scoring mondial, l'automatisation, la gestion de bibliothèque, la lecture, la synthèse, les effets, le MIDI et l'intégration au studio. 1 116 tests au total, répartis sur tous les paquets.

Pour exécuter tous les tests : `pnpm test`

## Manuel d'utilisation

Le [manuel d'utilisation](https://mcp-tool-shop-org.github.io/motif/handbook/product/) est le guide complet qui couvre la définition du produit, l'architecture, la navigation dans le studio, les flux de travail créatifs et la stratégie. Voici les points d'entrée principaux :

- [Produit : Qu'est-ce que Motif ?](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Architecture : Aperçu du dépôt](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flux de travail : Création d'un élément à partir de zéro](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flux de travail : Utilisation d'échantillons personnalisés](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flux de travail : Scoring mondial](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Stratégie : Glossaire](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Paquets d'exemples](examples/)

## Sécurité et confidentialité

Motif fonctionne **entièrement dans le navigateur**. Pas de serveur, pas de synchronisation cloud, pas de télémétrie.

- **Données concernées :** Fichiers de paquets audio créés par l'utilisateur (JSON), références aux ressources audio, stockage local du navigateur.
- **Données NON concernées :** Pas de stockage côté serveur, pas d'accès au système de fichiers en dehors du bac à sable du navigateur.
- **Réseau :** Zéro trafic réseau sortant — toute la création et la lecture se font côté client.
- **Informations sensibles :** Ne lit, ne stocke ni ne transmet d'identifiants.
- **Télémétrie :** Aucune donnée n'est collectée ou envoyée.
- **Autorisations :** Utilisation uniquement des API standard du navigateur (Web Audio API).

Consultez [SECURITY.md](SECURITY.md) pour signaler les vulnérabilités.

## Licence

MIT

---

Développé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
