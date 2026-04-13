<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/sample-lab

Motifのサンプルワークフローで使用する、トリミング、スライス、キット、および各種アシスタント機能。

## 所有するもの

- オーディオ素材のトリミングとループポイント管理
- 一定間隔での分割と、音の開始タイミングに基づいた分割
- サンプルキットの構築とスロット管理
- サンプリング楽器の作成とピッチ調整機能
- オーディオファイルのインポート支援機能（ファイル名から素材を推測）

## 主要な輸出品目

### トリム機能 (`trim.ts`)
- `resolveTrimRegion(asset)`：有効なトリム範囲を決定
- `resolveLoopRegion(asset)`：有効なループ範囲を決定
- `applyTrim(asset, startMs, endMs)`：トリム開始点と終了点を設定
- `applyLoopPoints(asset, loopStartMs, loopEndMs)`：ループ開始点と終了点を設定

### スライス機能 (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)`：均等な区間に分割する。
- `sliceAtOnsets(assetId, onsets, totalEndMs)`：指定されたタイミングで分割する。
- `sliceDurationMs(slice)`：分割区間の長さを取得する。

### キット (kit.ts)
- `createKit(id, name)`：空のキットを作成します。
- `addKitSlot(kit, slot)` / `removeKitSlot(kit, pitch)` / `updateKitSlot(kit, pitch, update)`：キットにスロットを追加/削除/更新します。
- `kitFromSlices(id, name, slices, basePitch)`：指定されたスライスをMIDIのピッチに自動的にマッピングしてキットを作成します。
- `kitAssetIds(kit)`：キットに関連付けられたアセットのIDを取得します。
- `findDuplicateSlotPitches(kit)`：キット内の重複するスロットのピッチを検索します。

### 楽器 (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)`：サンプル楽器を作成する関数（ID、名前、アセットID、基本音、ピッチの最小値、ピッチの最大値を引数とする）。
- `pitchToPlaybackRate(rootNote, targetNote)`：ピッチを再生速度に変換する関数（基本音と目標音を引数とし、ピッチシフトの比率を返す）。
- `isInRange(instrument, note)` / `rangeSpan(instrument)`：楽器の音域に関する関数（`isInRange`は、指定された音域内に特定の音があるかどうかを判定し、`rangeSpan`は楽器の音域の広がりを返す）。

### インポート（`import.ts`）
- `inferSourceType(name)`: ファイル名からファイルの種類を推測します。
- `sourceTypeToKind(sourceType)`: ファイルの種類をアセットの種類に変換します。
- `filenameToId(filename)`: ファイル名からIDを生成します。
- `buildImportedAsset(filename, durationMs, src)`: ファイルからアセットを作成します。

## 所有していないもの

- オーディオファイルのデコードまたは再生 (詳細は `@motif/audio-engine` を参照)
- オーディオデータの永続化またはファイル入出力
- ユーザーインターフェースのコンポーネント

## 依存関係

- `@motif/schema`: アセット、スライス、キット、楽器などのデータ構造を定義する型。
