<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/audio-engine

Motifのためのサンプル再生とボイス管理機能。

## 機能概要

- トリミングされた領域の再生
- スライスの再生
- キットスロットの再生
- サンプリング楽器の音符再生（ピッチシフト付き）
- ボイスのライフサイクル管理

## 主要な機能

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif-studio/audio-engine";
```

- `playTrimmedRegion`: トリミング範囲内のオーディオバッファを再生します。
- `playSlice`: 特定のサンプルを再生します。
- `playKitSlot`: 指定されたピッチでキットスロットを再生します。
- `playSampleInstrumentNote`: サンプリング楽器でピッチ調整された音符を再生します。

## 提供しない機能

- シーンのオーケストレーションとミキシング（`@motif-studio/playback-engine`によって処理されます）
- オーディオファイルのデコード（ブラウザのAudioContextが処理します）
- クリップ/キューの構成（`@motif-studio/clip-engine`によって処理されます）

## 依存関係

- `@motif-studio/schema`: アセット、スライス、キット、楽器の型定義。
