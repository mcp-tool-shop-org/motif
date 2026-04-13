<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/asset-index

用于Motif音轨包的完整性索引和审计。

## 功能说明

- **`buildPackIndex(pack)`** — 构建基于ID的快速查找映射，并在每个实体集合中检测重复ID。
- **`auditPackIntegrity(pack)`** — 运行所有完整性检查（例如：损坏的引用、重复项、自引用、未使用的实体），并返回分类后的结果（`errors`、`warnings`、`notes`），结果按确定性顺序排序。
- **`findUnusedAssets(pack)`** — 查找未被任何音轨或过渡效果引用的资源。
- **`findUnusedStems(pack)`** — 查找未被任何场景层引用的音轨。
- **`findUnreferencedScenes(pack)`** — 查找未被任何绑定、备用方案或过渡引用的场景。
- **`summarizePackIntegrity(pack)`** — 以一个对象的形式返回实体数量、未使用资源数量和发现结果的数量。

## 完整性代码

| 代码 | 严重程度 | 含义 |
|------|----------|---------|
| `duplicate_asset_id` | error | 两个或多个资源共享相同的ID。 |
| `duplicate_stem_id` | error | 两个或多个音轨共享相同的ID。 |
| `duplicate_scene_id` | error | 两个或多个场景共享相同的ID。 |
| `duplicate_binding_id` | error | 两个或多个绑定共享相同的ID。 |
| `duplicate_transition_id` | error | 两个或多个过渡效果共享相同的ID。 |
| `missing_asset_ref` | error | 音轨引用了不存在的资源。 |
| `missing_stinger_asset_ref` | error | 过渡效果引用了不存在的音轨资源。 |
| `missing_stem_ref` | error | 场景层引用了不存在的音轨。 |
| `missing_fallback_scene_ref` | error | 场景的备用方案引用了不存在的场景。 |
| `missing_binding_scene_ref` | error | 绑定引用了不存在的场景。 |
| `missing_transition_from_scene_ref` | error | 过渡效果的起始场景不存在。 |
| `missing_transition_to_scene_ref` | error | 过渡效果的目标场景不存在。 |
| `scene_self_fallback` | warning | 场景会回退到自身。 |
| `transition_self_reference` | warning | 过渡效果的起始场景和目标场景相同。 |
| `unused_asset` | warning | 资源未被任何音轨或过渡效果引用。 |
| `unused_stem` | warning | 音轨未被任何场景层引用。 |
| `unreferenced_scene` | note | 场景未被任何绑定、备用方案或过渡引用。 |

## 用法

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif-studio/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
