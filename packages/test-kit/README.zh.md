<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/test-kit

Motif 软件包的测试用例、示例包和测试工具。

## 包含内容

- 用于测试的 JSON 格式测试用例文件（包含最简示例包、完整性测试示例包和无效示例包）
- 测试用例加载工具
- 测试用例路径解析

## 主要导出内容

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### 测试用例

| 常量 | 测试用例文件 | 用途 |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | 最简单的有效示例包 |
| `STARTER_PACK` | `starter-pack.json` | 更丰富的入门示例包 |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | 模式验证：缺少元数据 |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | 模式验证：无效的转换 |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | 模式验证：层为空 |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | 模式验证：持续时间无效 |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | 完整性：完整示例包 |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | 完整性：资源引用损坏 |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | 完整性：主音引用损坏 |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | 完整性：场景引用损坏 |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | 完整性：ID 重复 |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | 完整性：实体自引用 |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | 完整性：未使用的实体 |

## 不包含的内容

- 应用程序级别的测试（这些测试位于每个软件包的 `test/` 目录中）
- 测试运行器配置（每个软件包都有自己的 `vitest.config.ts` 文件）
