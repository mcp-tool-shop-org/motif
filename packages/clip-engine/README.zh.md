<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/clip-engine

Motif 的音频片段编排、合成和转换引擎。

## 主要功能

- 音频片段播放和场景片段分配
- 音符调度和量化启动时机
- 合成变换（移调、反转、倒放、八度音阶变换、节奏缩放）
- 变奏工具（节奏、旋律、稀疏化、密集化、重音、弱音）
- 强度衍生（低/中/高、张力、明亮化、和声、贝斯线条、琶音）
- 和弦工具（自然和弦、和弦调色板、和弦进行）
- 提示调度和节段解析

## 主要导出功能

```ts
import {
  ClipPlayer,
  SceneClipPlayer,
  scheduleNotes,
  clipTranspose,
  clipInvert,
  clipReverse,
  resolveCuePlan,
  chordPalette,
  diatonicChords,
} from "@motif-studio/clip-engine";
```

### 播放
- `ClipPlayer`：播放单个音频片段，并进行音符调度。
- `SceneClipPlayer`：分配并播放场景中的音频片段。

### 变换
- `clipTranspose`、`clipInvert`、`clipReverse`、`clipOctaveShift`、`clipRhythmScale`
- `clipDuplicateWithVariation`、`clipSnapToScale`、`clipFindOutOfScale`

### 变奏
- `clipRhythmicVariation`、`clipMelodicVariation`、`clipThinNotes`、`clipDensifyNotes`
- `clipAccentEveryN`、`clipAddGhostHits`、`clipRemoveGhostHits`

### 强度
- `clipDeriveIntensity`、`clipAddTension`、`clipBrighten`
- `clipPadVoicing`、`clipBassLine`、`clipArpeggiate`

### 提示调度
- `resolveCuePlan`、`sectionAtTick`、`sectionAtBar`
- `cueSecondsToTick`，以及时钟/小节/拍转换工具。

## 依赖项

- `@motif-studio/schema`：用于音频片段、音符和提示的类型定义。
- `@motif-studio/instrument-rack`：用于播放时的声音管理。
- `@motif-studio/music-theory`：用于音阶/和弦/主题的基本功能。
