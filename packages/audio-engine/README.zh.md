<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/audio-engine

Motif 的音频引擎，用于音频播放和音源管理。

## 包含的功能

- 播放裁剪区域
- 播放音频片段
- 播放音色包中的音源
- 播放带音高偏移的采样乐器音符
- 管理音源的生命周期

## 主要导出功能

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif/audio-engine";
```

- `playTrimmedRegion`：在裁剪区域内播放音频缓冲区。
- `playSlice`：播放特定的音频片段。
- `playKitSlot`：以指定的音高播放音色包中的音源。
- `playSampleInstrumentNote`：在采样乐器上播放带音高的音符。

## 不包含的功能

- 场景编排和混音（由 `@motif/playback-engine` 处理）
- 音频文件解码（浏览器 AudioContext 处理此功能）
- 音频片段/提示的组合（由 `@motif/clip-engine` 处理）

## 依赖项

- `@motif/schema`：用于资产、片段、音色包和乐器的类型定义。
