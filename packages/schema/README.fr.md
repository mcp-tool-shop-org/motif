<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/schema

Types canoniques et validation pour les packs de bandes sonores Motif.

## Composants inclus :

- Types TypeScript pour toutes les entités principales de la bande sonore.
- Schémas Zod pour l'analyse et la validation.
- Fonctions d'aide de validation sécurisées avec gestion structurée des erreurs.
- Application de la version du schéma (`schemaVersion: "1"`).

## Entités principales :

- `SoundtrackPackMeta` — identité et version du pack.
- `AudioAsset` — référence à un fichier audio avec son type, sa durée et ses points de boucle.
- `Stem` — couche audible associée à un fichier audio et ayant un rôle.
- `Scene` — état musical composé de couches audibles.
- `SceneLayerRef` — référence à une couche audible au sein d'une scène.
- `TriggerCondition` / `TriggerBinding` — mappage entre l'état d'exécution et les scènes.
- `TransitionRule` — règles de transition entre les scènes.
- `SoundtrackPack` — le document complet du pack.
- `RuntimeMusicState` — structure de données représentant l'état du jeu pour l'évaluation des déclencheurs.

## Exports principaux :

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif-studio/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

Analyse stricte. Lève une exception en cas de données invalides.

### `safeParseSoundtrackPack(input: unknown)`

Retourne `{ success: true, data }` ou `{ success: false, errors }`. Ne lève jamais d'exception.

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

Retourne `{ ok, data?, issues }` avec une liste structurée de `ValidationIssue[]`.

Chaque erreur inclut `path`, `code` et `message` pour le débogage.

## Règles de validation :

- Les champs obligatoires sont vérifiés.
- Les valeurs des énumérations sont vérifiées (type de fichier audio, rôle de la couche audible, catégorie de la scène, opérateur du déclencheur, mode de transition).
- `durationMs > 0`.
- `loopStartMs >= 0` si présent.
- `loopEndMs > loopStartMs` si les deux sont présents.
- `priority` doit être un entier.
- Les déclencheurs doivent avoir au moins une condition.
- Les scènes doivent avoir au moins une couche.
- `durationMs` est requis pour les transitions `crossfade` et `cooldown-fade`.
- `schemaVersion` doit être égal à `"1"`.

## Portée :

Ce paquet valide la structure et la correction des champs.

Les vérifications d'intégrité des références croisées (par exemple, "une scène fait référence à une couche audible inexistante") sont gérées par des paquets de niveau supérieur.
