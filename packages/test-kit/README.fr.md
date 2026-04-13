<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/test-kit

Fichiers de configuration, ensembles d'échantillons et utilitaires de test pour les packages Motif.

## Ce que cela inclut

- Fichiers de configuration JSON pour les tests (ensembles minimaux, ensembles de tests d'intégrité, ensembles invalides)
- Utilitaires de chargement de fichiers de configuration
- Résolution des chemins des fichiers de configuration

## Exportations principales

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### Fichiers de configuration

| Constante | Fichier de configuration | Objectif |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | Ensemble valide minimal |
| `STARTER_PACK` | `starter-pack.json` | Ensemble de démarrage plus complet |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | Validation du schéma : métadonnées manquantes |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | Validation du schéma : transition incorrecte |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | Validation du schéma : couches vides |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | Validation du schéma : durée incorrecte |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | Intégrité : ensemble valide |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | Intégrité : référence d'élément corrompue |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | Intégrité : référence de piste corrompue |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | Intégrité : référence de scène corrompue |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | Intégrité : identifiants en double |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | Intégrité : entités faisant référence à elles-mêmes |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | Intégrité : entités inutilisées |

## Ce que cela n'inclut pas

- Tests au niveau de l'application (ils se trouvent dans le répertoire `test/` de chaque package)
- Configuration de l'exécuteur de tests (chaque package a sa propre configuration `vitest.config.ts`)
