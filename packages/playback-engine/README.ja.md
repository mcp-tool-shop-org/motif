<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/playback-engine

Motifのシーンやシーケンス向けの、リアルタイム再生、ミキシング、レンダリング、およびエフェクトシステム。

## 主な機能

- 再生制御（再生、一時停止、停止、シーク）
- アセットの読み込みとデコード
- ステムミキシングによるシーン再生
- シーン間のトランジション再生
- シーケンス再生（順番に並んだシーンの連鎖）
- 各ステムとバスレベルの制御が可能なミキサー
- エフェクト処理（EQ、ディレイ、リバーブ、コンプレッサー）
- プレビューレンダリングとオフラインエクスポート
- WAVエンコーディング

## 主要な機能

```ts
import {
  Transport,
  AssetLoader,
  ScenePlayer,
  TransitionPlayer,
  SequencePlayer,
  Mixer,
  CueRenderer,
  CuePlayer,
  createFxNodes,
  disposeFxNodes,
  dbToGain,
  encodeWav,
} from "@motif-studio/playback-engine";
```

### コアクラス
- `Transport`: 再生状態、タイミング、シーク
- `AssetLoader`: オーディオアセットの取得とデコード
- `ScenePlayer`: レイヤードされたステムによるシーン再生
- `TransitionPlayer`: シーン間のクロスフェードとトランジション
- `SequencePlayer`: 順番に並んだシーンのシーケンス再生
- `Mixer`: 各ステムのゲイン、パン、ミュート、ソロ、バスルーティング
- `CueRenderer`: オーディオバッファへのオフラインレンダリング
- `CuePlayer`: プレビューレベルの再生制御

### エフェクト
- `createFxNodes` / `disposeFxNodes`: エフェクトチェーンのライフサイクル
- EQ、ディレイ、リバーブ、コンプレッサーのプリセット

## 依存関係

- `@motif-studio/schema`: シーン、ステム、トランジションの型定義
- `@motif-studio/audio-engine`: サンプルの再生に関する基本的な機能
- `@motif-studio/scene-mapper`: シーンの解像度を決定するためのトリガー評価
