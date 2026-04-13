<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/asset-index

Indicizzazione e controllo dell'integrità dei pacchetti audio di Motif.

## Funzionalità

- **`buildPackIndex(pack)`** — Crea mappe di ricerca rapide basate sull'ID e rileva ID duplicati all'interno di ogni collezione di elementi.
- **`auditPackIntegrity(pack)`** — Esegue tutti i controlli di integrità (riferimenti interrotti, duplicati, riferimenti ricorsivi, elementi non utilizzati) e restituisce i risultati categorizzati (`errori`, `avvisi`, `note`), ordinati in modo deterministico.
- **`findUnusedAssets(pack)`** — Elementi non referenziati da alcun elemento audio o transizione.
- **`findUnusedStems(pack)`** — Elementi audio non referenziati da alcun livello di scena.
- **`findUnreferencedScenes(pack)`** — Scene non referenziate da alcun collegamento, fallback o transizione.
- **`summarizePackIntegrity(pack)`** — Conteggio degli elementi, conteggio degli elementi non utilizzati e conteggio dei risultati in un unico oggetto.

## Codici di integrità

| Codice | Gravità | Significato |
|------|----------|---------|
| `duplicate_asset_id` | error | Due o più elementi condividono lo stesso ID. |
| `duplicate_stem_id` | error | Due o più elementi audio condividono lo stesso ID. |
| `duplicate_scene_id` | error | Due o più scene condividono lo stesso ID. |
| `duplicate_binding_id` | error | Due o più collegamenti condividono lo stesso ID. |
| `duplicate_transition_id` | error | Due o più transizioni condividono lo stesso ID. |
| `missing_asset_ref` | error | Un elemento audio fa riferimento a un elemento inesistente. |
| `missing_stinger_asset_ref` | error | Una transizione fa riferimento a un elemento di transizione inesistente. |
| `missing_stem_ref` | error | Un livello di scena fa riferimento a un elemento audio inesistente. |
| `missing_fallback_scene_ref` | error | Un fallback di scena fa riferimento a una scena inesistente. |
| `missing_binding_scene_ref` | error | Un collegamento fa riferimento a una scena inesistente. |
| `missing_transition_from_scene_ref` | error | La scena di partenza di una transizione non esiste. |
| `missing_transition_to_scene_ref` | error | La scena di destinazione di una transizione non esiste. |
| `scene_self_fallback` | warning | Una scena fa fallback su se stessa. |
| `transition_self_reference` | warning | La scena di partenza e di destinazione di una transizione sono la stessa. |
| `unused_asset` | warning | Un elemento non è referenziato da alcun elemento audio o transizione. |
| `unused_stem` | warning | Un elemento audio non è referenziato da alcun livello di scena. |
| `unreferenced_scene` | note | Una scena non è referenziata da alcun collegamento, fallback o transizione. |

## Utilizzo

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif-studio/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
