<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/asset-index

Indexação e auditoria da integridade de pacotes de trilhas sonoras para Motif.

## O que ele faz

- **`buildPackIndex(pack)`** — Cria mapas de pesquisa rápidos baseados em ID e detecta IDs duplicados dentro de cada coleção de entidades.
- **`auditPackIntegrity(pack)`** — Executa todas as verificações de integridade (referências corrompidas, duplicatas, referências recursivas, entidades não utilizadas) e retorna os resultados categorizados (`erros`, `avisos`, `observações`), ordenados de forma determinística.
- **`findUnusedAssets(pack)`** — Identifica os recursos que não são referenciados por nenhum "stem" (trecho de áudio) ou "transition stinger" (efeito sonoro de transição).
- **`findUnusedStems(pack)`** — Identifica os "stems" que não são referenciados por nenhuma camada de cena.
- **`findUnreferencedScenes(pack)`** — Identifica as cenas que não são referenciadas por nenhuma ligação, alternativa ou transição.
- **`summarizePackIntegrity(pack)`** — Retorna um objeto contendo a contagem de entidades, a contagem de recursos não utilizados e a contagem de resultados.

## Códigos de integridade

| Código | Severidade | Significado |
|------|----------|---------|
| `duplicate_asset_id` | erro | Dois ou mais recursos compartilham o mesmo ID. |
| `duplicate_stem_id` | erro | Dois ou mais "stems" compartilham o mesmo ID. |
| `duplicate_scene_id` | erro | Dois ou mais cenas compartilham o mesmo ID. |
| `duplicate_binding_id` | erro | Dois ou mais "bindings" (ligações) compartilham o mesmo ID. |
| `duplicate_transition_id` | erro | Dois ou mais transições compartilham o mesmo ID. |
| `missing_asset_ref` | erro | Um "stem" referencia um recurso inexistente. |
| `missing_stinger_asset_ref` | erro | Uma transição referencia um recurso de "stinger" inexistente. |
| `missing_stem_ref` | erro | Uma camada de cena referencia um "stem" inexistente. |
| `missing_fallback_scene_ref` | erro | Uma alternativa de cena referencia uma cena inexistente. |
| `missing_binding_scene_ref` | erro | Uma ligação referencia uma cena inexistente. |
| `missing_transition_from_scene_ref` | erro | A cena de origem de uma transição não existe. |
| `missing_transition_to_scene_ref` | erro | A cena de destino de uma transição não existe. |
| `scene_self_fallback` | aviso | Uma cena faz referência a si mesma como alternativa. |
| `transition_self_reference` | aviso | A transição tem a mesma cena de origem e destino. |
| `unused_asset` | aviso | Um recurso não é referenciado por nenhum "stem" ou "stinger". |
| `unused_stem` | aviso | Um "stem" não é referenciado por nenhuma camada de cena. |
| `unreferenced_scene` | observação | Uma cena não é referenciada por nenhuma ligação, alternativa ou transição. |

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
