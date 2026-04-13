<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/schema

Motif 音频素材包的规范类型和验证。

## 包含内容：

- 所有核心音频素材实体的 TypeScript 类型。
- 用于解析和验证的 Zod 模式。
- 带有结构化错误信息的安全验证辅助函数。
- 模式版本强制（`schemaVersion: "1"`）。

## 核心实体：

- `SoundtrackPackMeta`：音频素材包的标识和版本信息。
- `AudioAsset`：音频文件引用，包含类型、时长和循环点。
- `Stem`：与音频文件关联的可播放音轨层，具有特定角色。
- `Scene`：由音轨层组成的音乐状态。
- `SceneLayerRef`：场景中的音轨层引用。
- `TriggerCondition` / `TriggerBinding`：运行时状态与场景的映射。
- `TransitionRule`：音乐在不同场景之间的过渡方式。
- `SoundtrackPack`：完整的音频素材包文档。
- `RuntimeMusicState`：用于触发器评估的游戏状态结构。

## 主要导出：

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif-studio/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

严格解析。如果数据无效，则会抛出错误。

### `safeParseSoundtrackPack(input: unknown)`

返回 `{ success: true, data }` 或 `{ success: false, errors }`。 不会抛出错误。

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

返回 `{ ok, data?, issues }`，包含结构化的 `ValidationIssue[]` 数组。

每个错误信息都包含 `path`、`code` 和 `message`，用于调试。

## 验证规则：

- 强制执行必填字段。
- 强制执行枚举值（音频文件类型、音轨角色、场景类别、触发器操作、过渡模式）。
- `durationMs > 0`。
- 如果存在 `loopStartMs`，则 `loopStartMs >= 0`。
- 如果同时存在 `loopStartMs` 和 `loopEndMs`，则 `loopEndMs > loopStartMs`。
- `priority` 必须是整数。
- 触发器必须至少有一个条件。
- 场景必须至少有一个音轨层。
- 对于 `crossfade` 和 `cooldown-fade` 类型的过渡，必须指定 `durationMs`。
- `schemaVersion` 必须是 `"1"`。

## 适用范围：

此包用于验证结构和字段级别的正确性。

交叉引用完整性检查（例如，“场景引用了不存在的音轨”）由更高级别的包处理。
