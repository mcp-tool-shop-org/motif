<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/clip-engine

Motifのための、オーディオクリップのシーケンス、作曲、および変換エンジン。

## 機能

- クリップの再生と、シーンへのクリップの割り当て
- ノートのタイミング設定と、量子化された再生タイミング
- 楽曲構成の変換（移調、反転、逆再生、オクターブシフト、リズムスケール）
- バリエーションツール（リズム、メロディ、音の薄さ/濃さ、アクセント、ゴーストノート）
- 強調の付与（低音/中音/高音、緊張感、明るさ、パッドの音色、ベースライン、アルペジオ）
- コードツール（ダイアトニックコード、コードパレット、コード進行）
- キューのタイミング設定と、セクションの解決

## 主要な機能

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
} from "@motif/clip-engine";
```

### 再生
- `ClipPlayer`: ノートのタイミング設定とともに、個々のクリップを再生します。
- `SceneClipPlayer`: シーン内でクリップを割り当て、再生します。

### 変換
- `clipTranspose`, `clipInvert`, `clipReverse`, `clipOctaveShift`, `clipRhythmScale`: クリップの移調、反転、逆再生、オクターブシフト、リズムスケールを行います。
- `clipDuplicateWithVariation`, `clipSnapToScale`, `clipFindOutOfScale`: バリエーションを付与したクリップの複製、スケールへのスナップ、スケール外の音の検出を行います。

### バリエーション
- `clipRhythmicVariation`, `clipMelodicVariation`, `clipThinNotes`, `clipDensifyNotes`: リズム、メロディ、音の薄さ/濃さのバリエーションを付与します。
- `clipAccentEveryN`, `clipAddGhostHits`, `clipRemoveGhostHits`: N個ごとにアクセントを付与、ゴーストノートの追加/削除を行います。

### 強調
- `clipDeriveIntensity`, `clipAddTension`, `clipBrighten`: 強調の付与、緊張感の追加、明るさの調整を行います。
- `clipPadVoicing`, `clipBassLine`, `clipArpeggiate`: パッドの音色、ベースライン、アルペジオを作成します。

### キューのタイミング設定
- `resolveCuePlan`, `sectionAtTick`, `sectionAtBar`: キュープランの解決、ティック/バー/拍に基づいたセクションの取得を行います。
- `cueSecondsToTick`: 秒をティックに変換するユーティリティ。ティック/バー/拍の変換ユーティリティを提供します。

## 依存関係

- `@motif/schema`: クリップ、ノート、キューの型定義。
- `@motif/instrument-rack`: 再生のためのボイス管理。
- `@motif/music-theory`: スケール/コード/モチーフの基本要素。
