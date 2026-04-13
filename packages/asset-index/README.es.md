<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/asset-index

Indexación y auditoría de la integridad de los paquetes de audio de Motif.

## ¿Qué hace?

- **`buildPackIndex(pack)`** — Crea mapas de búsqueda rápidos basados en identificadores y detecta identificadores duplicados dentro de cada colección de elementos.
- **`auditPackIntegrity(pack)`** — Realiza todas las comprobaciones de integridad (referencias rotas, duplicados, referencias a sí mismo, elementos no utilizados) y devuelve los resultados categorizados (`errores`, `advertencias`, `notas`), ordenados de forma determinista.
- **`findUnusedAssets(pack)`** — Elementos que no están referenciados por ninguna pista de audio o transición.
- **`findUnusedStems(pack)`** — Pistas de audio que no están referenciadas por ninguna capa de escena.
- **`findUnreferencedScenes(pack)`** — Escenas que no están referenciadas por ninguna vinculación, alternativa o transición.
- **`summarizePackIntegrity(pack)`** — Cuenta de elementos, cuenta de elementos no utilizados y cuenta de resultados en un solo objeto.

## Códigos de integridad

| Código | Severidad | Significado |
|------|----------|---------|
| `duplicate_asset_id` | error | Dos o más elementos comparten el mismo identificador. |
| `duplicate_stem_id` | error | Dos o más pistas de audio comparten el mismo identificador. |
| `duplicate_scene_id` | error | Dos o más escenas comparten el mismo identificador. |
| `duplicate_binding_id` | error | Dos o más vinculaciones comparten el mismo identificador. |
| `duplicate_transition_id` | error | Dos o más transiciones comparten el mismo identificador. |
| `missing_asset_ref` | error | Una pista de audio hace referencia a un elemento inexistente. |
| `missing_stinger_asset_ref` | error | Una transición hace referencia a un elemento de transición inexistente. |
| `missing_stem_ref` | error | Una capa de escena hace referencia a una pista de audio inexistente. |
| `missing_fallback_scene_ref` | error | Una alternativa de escena hace referencia a una escena inexistente. |
| `missing_binding_scene_ref` | error | Una vinculación hace referencia a una escena inexistente. |
| `missing_transition_from_scene_ref` | error | La escena de origen de una transición no existe. |
| `missing_transition_to_scene_ref` | error | La escena de destino de una transición no existe. |
| `scene_self_fallback` | advertencia | Una escena se vuelve a referenciar a sí misma. |
| `transition_self_reference` | advertencia | La transición tiene la misma escena de origen y destino. |
| `unused_asset` | advertencia | Un elemento no está referenciado por ninguna pista de audio o transición. |
| `unused_stem` | advertencia | Una pista de audio no está referenciada por ninguna capa de escena. |
| `unreferenced_scene` | nota | Una escena no está referenciada por ninguna vinculación, alternativa o transición. |

## Uso

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
