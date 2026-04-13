<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/sample-lab

用于 Motif 音频样本工作流程的裁剪、分割、音色包和乐器辅助工具。

## 包含内容

- 音频资源裁剪和循环点管理
- 基于均匀和起始点的分割
- 音色包构建和音符槽管理
- 音频乐器创建和音高工具
- 音频文件导入辅助功能（文件名 → 资源推断）

## 主要导出

### 裁剪 (`trim.ts`)
- `resolveTrimRegion(asset)` — 有效的裁剪边界
- `resolveLoopRegion(asset)` — 有效的循环边界
- `applyTrim(asset, startMs, endMs)` — 设置裁剪点
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — 设置循环点

### 分割 (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — 分割成相等的部分
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — 在特定时间点分割
- `sliceDurationMs(slice)` — 分割时长

### 音色包 (`kit.ts`)
- `createKit(id, name)` — 创建空的音色包
- `addKitSlot(kit, slot) / removeKitSlot(kit, pitch) / updateKitSlot(kit, pitch, update)`
- `kitFromSlices(id, name, slices, basePitch)` — 自动将分割片段映射到 MIDI 音高
- `kitAssetIds(kit) / findDuplicateSlotPitches(kit)`

### 乐器 (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)`
- `pitchToPlaybackRate(rootNote, targetNote)` — 音高调整比例
- `isInRange(instrument, note) / rangeSpan(instrument)`

### 导入 (`import.ts`)
- `inferSourceType(name)` — 从文件名推断类型
- `sourceTypeToKind(sourceType)` — 映射源类型到资源类型
- `filenameToId(filename)` — 从文件名生成 ID
- `buildImportedAsset(filename, durationMs, src)` — 从文件创建资源

## 不包含的内容

- 音频文件解码或播放（请参见 `@motif/audio-engine`）
- 音频资源持久化或文件 I/O
- UI 组件

## 依赖项

- `@motif/schema` — 资源、分割片段、音色包和乐器的类型定义
