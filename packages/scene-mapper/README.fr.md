<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/scene-mapper

Déclenche la logique de mappage pour la résolution des scènes dans Motif.

## Ce que ce module gère :

- Évaluation des conditions de déclenchement.
- Résolution de la priorité des liaisons.
- Sélection de la scène en fonction de l'état d'exécution.

## Statut :

Paquet temporaire. La logique de résolution des scènes se trouve actuellement dans les types `@motif-studio/schema` et dans le magasin Studio. Ce paquet sera étendu lorsque l'interface d'intégration en temps réel sera plus complète (phase 20+).

## Ce que ce module ne gère pas :

- Composition des scènes ou gestion des calques.
- Exécution des transitions.
- Lecture audio.
