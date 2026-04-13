<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/schema

Motif サウンドトラックパックの標準的な型と検証機能を提供します。

## 内容

- すべての主要なサウンドトラックエンティティに対する TypeScript 型定義
- 解析と検証のための Zod スキーマ
- 構造化されたエラー情報を含む、安全な検証ヘルパー
- スキーマバージョンの強制 (`schemaVersion: "1"`)

## 主要エンティティ

- `SoundtrackPackMeta`: パックの識別情報とバージョン
- `AudioAsset`: オーディオファイルの参照情報（種類、長さ、ループポイントなど）
- `Stem`: アセットに紐付けられた、再生可能なレイヤー（役割情報を含む）
- `Scene`: 複数のレイヤーで構成される音楽の状態
- `SceneLayerRef`: シーン内のレイヤーへの参照
- `TriggerCondition` / `TriggerBinding`: 実行時の状態とシーンのマッピング
- `TransitionRule`: シーン間の音楽の移行方法
- `SoundtrackPack`: パック全体のドキュメント
- `RuntimeMusicState`: トリガー評価のためのゲームの状態

## 主要なエクスポート

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif-studio/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

厳密な解析を行います。無効なデータの場合、エラーを発生させます。

### `safeParseSoundtrackPack(input: unknown)`

`{ success: true, data }` または `{ success: false, errors }` を返します。エラーは発生しません。

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

構造化された `ValidationIssue[]` を持つ `{ ok, data?, issues }` を返します。

各エラーには、デバッグに必要な `path`, `code`, `message` が含まれます。

## 検証ルール

- 必須フィールドのチェック
- 列挙値のチェック（アセットの種類、レイヤーの役割、シーンのカテゴリ、トリガーの演算子、トランジションモード）
- `durationMs > 0`
- `loopStartMs` が存在する場合、`loopStartMs >= 0`
- `loopEndMs` と `loopStartMs` が両方存在する場合、`loopEndMs > loopStartMs`
- `priority` は整数であること
- バインディングには少なくとも1つの条件が必要
- シーンには少なくとも1つのレイヤーが必要
- `crossfade` および `cooldown-fade` トランジションには `durationMs` が必須
- `schemaVersion` は `"1"` でなければならない

## 適用範囲

このパッケージは、構造とフィールドレベルの正確性を検証します。

参照整合性のチェック（例：「シーンが参照するレイヤーが存在しない」）は、より上位のパッケージによって処理されます。
