<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif/asset-index

Pack integrity indexing and auditing for Motif soundtrack packs.

## What it does

- **`buildPackIndex(pack)`** — Build fast id-based lookup maps and detect duplicate ids within each entity collection.
- **`auditPackIntegrity(pack)`** — Run all integrity checks (broken refs, duplicates, self-references, unused entities) and return categorized findings (`errors`, `warnings`, `notes`), sorted deterministically.
- **`findUnusedAssets(pack)`** — Assets not referenced by any stem or transition stinger.
- **`findUnusedStems(pack)`** — Stems not referenced by any scene layer.
- **`findUnreferencedScenes(pack)`** — Scenes not referenced by any binding, fallback, or transition.
- **`summarizePackIntegrity(pack)`** — Entity counts, unused counts, and finding counts in one object.

## Integrity codes

| Code | Severity | Meaning |
|------|----------|---------|
| `duplicate_asset_id` | error | Two+ assets share the same id |
| `duplicate_stem_id` | error | Two+ stems share the same id |
| `duplicate_scene_id` | error | Two+ scenes share the same id |
| `duplicate_binding_id` | error | Two+ bindings share the same id |
| `duplicate_transition_id` | error | Two+ transitions share the same id |
| `missing_asset_ref` | error | Stem references nonexistent asset |
| `missing_stinger_asset_ref` | error | Transition references nonexistent stinger asset |
| `missing_stem_ref` | error | Scene layer references nonexistent stem |
| `missing_fallback_scene_ref` | error | Scene fallback references nonexistent scene |
| `missing_binding_scene_ref` | error | Binding references nonexistent scene |
| `missing_transition_from_scene_ref` | error | Transition from-scene does not exist |
| `missing_transition_to_scene_ref` | error | Transition to-scene does not exist |
| `scene_self_fallback` | warning | Scene falls back to itself |
| `transition_self_reference` | warning | Transition from and to are the same scene |
| `unused_asset` | warning | Asset not referenced by any stem or stinger |
| `unused_stem` | warning | Stem not referenced by any scene layer |
| `unreferenced_scene` | note | Scene not referenced by any binding, fallback, or transition |

## Usage

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
