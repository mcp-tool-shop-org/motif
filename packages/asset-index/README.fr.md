<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/asset-index

Indexation et vérification de l'intégrité des packs de bandes sonores Motif.

## Fonctionnement

- **`buildPackIndex(pack)`** — Crée des tableaux de correspondance basés sur les identifiants pour une recherche rapide et détecte les identifiants en double au sein de chaque collection d'éléments.
- **`auditPackIntegrity(pack)`** — Effectue toutes les vérifications d'intégrité (références corrompues, doublons, références circulaires, éléments inutilisés) et renvoie les résultats classés par catégories (`erreurs`, `avertissements`, `notes`), triés de manière déterministe.
- **`findUnusedAssets(pack)`** — Identifie les éléments qui ne sont référencés par aucun élément source ou transition.
- **`findUnusedStems(pack)`** — Identifie les éléments sources qui ne sont référencés par aucune couche de scène.
- **`findUnreferencedScenes(pack)`** — Identifie les scènes qui ne sont référencées par aucune liaison, solution de secours ou transition.
- **`summarizePackIntegrity(pack)`** — Fournit un objet contenant le nombre d'éléments, le nombre d'éléments inutilisés et le nombre de résultats de vérification.

## Codes d'intégrité

| Code | Gravité | Signification |
|------|----------|---------|
| `duplicate_asset_id` | erreur | Deux éléments ou plus partagent le même identifiant. |
| `duplicate_stem_id` | erreur | Deux éléments sources ou plus partagent le même identifiant. |
| `duplicate_scene_id` | erreur | Deux scènes ou plus partagent le même identifiant. |
| `duplicate_binding_id` | erreur | Deux liaisons ou plus partagent le même identifiant. |
| `duplicate_transition_id` | erreur | Deux transitions ou plus partagent le même identifiant. |
| `missing_asset_ref` | erreur | Un élément source fait référence à un élément inexistant. |
| `missing_stinger_asset_ref` | erreur | Une transition fait référence à un élément de transition inexistant. |
| `missing_stem_ref` | erreur | Une couche de scène fait référence à un élément source inexistant. |
| `missing_fallback_scene_ref` | erreur | Une solution de secours d'une scène fait référence à une scène inexistante. |
| `missing_binding_scene_ref` | erreur | Une liaison fait référence à une scène inexistante. |
| `missing_transition_from_scene_ref` | erreur | La scène de départ d'une transition n'existe pas. |
| `missing_transition_to_scene_ref` | erreur | La scène de destination d'une transition n'existe pas. |
| `scene_self_fallback` | avertissement | Une scène fait référence à elle-même en tant que solution de secours. |
| `transition_self_reference` | avertissement | La scène de départ et la scène de destination d'une transition sont la même scène. |
| `unused_asset` | avertissement | Un élément n'est référencé par aucun élément source ou transition. |
| `unused_stem` | avertissement | Un élément source n'est référencé par aucune couche de scène. |
| `unreferenced_scene` | note | Une scène n'est référencée par aucune liaison, solution de secours ou transition. |

## Utilisation

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
