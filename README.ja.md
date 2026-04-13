<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif"><img src="https://img.shields.io/npm/v/@motif/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

インタラクティブなゲーム音楽の作曲、編曲、採譜、およびエクスポートを行うための、アダプティブなサウンドトラックスタジオです。

## 概要

Motifは、作曲を重視し、適応機能に特化したワークステーションです。構造化された音楽制作機能（クリップ、キュー、シーン、レイヤー、オートメーション）と、ゲームの状態に応じてリアルタイムで応答するアダプティブなロジックを組み合わせることで、意図的に作られたかのようなゲーム音楽を実現します。

## Motifではないもの

DAW（デジタルオーディオワークステーション）。シンプルなシーケンサー。AIによる音楽生成ツール。サウンド付きの世界構築データベース。Motifは、アダプティブなゲーム音楽の制作に特化した、本格的なクリエイティブツールです。

## できること

- **作曲:** クリップ（ノート、楽器、スケール、コード、モチーフ変換、インテンシティバリエーション）
- **シンセサイザー:** マルチオシレーター・シンセ・ボイス（ユニゾン/スーパーソー、16種類のプリセット）、LFOモジュレーション（フィルター、アンプリチュード、ピッチ）
- **サンプル楽器:** ピアノ、ストリングス、ギターのテンプレート（SampleVoice）、インポート、トリミング、スライス、キット作成
- **編曲:** シーン（レイヤーされたステム、セクションロール、インテンシティカーブ）、10種類のドラムパターンプリセット
- **ミキシングとエフェクト:** 8種類のイフェクト（EQ、ディレイ、リバーブ、コンプレッサー、コーラス、ディストーション、フェイザー、リミッター）、ステムごとに4つのインサートFXスロット
- **世界観の構築:** モチーフファミリー、スコアプロファイル、キューファミリー、ワールドマップエントリー、派生
- **オートメーション:** レーン、マクロ、エンベロープ、ライブキャプチャとマージ
- **呼び出しと再利用:** テンプレート、スナップショット、ブランチ、お気に入り、コレクション、比較
- **MIDI:** 標準MIDIファイルのインポート/エクスポート
- **アダプティブロジック:** トリガーバインディング、トランジション、決定論的なシーン解決
- **演奏:** リアルタイムクリッププレビュー、クリックプレビュー、AudioContextでスケジュールされたクリック付きのメトロノーム
- **検証:** スキーマ検証、整合性監査、クロスリファレンスチェック
- **エクスポート:** 24/32ビットWAV（44.1/48/96kHz）、ゲームエンジンで使用するためのランタイムパック
- **編集:** 編集の取り消し/やり直し（最大50段階、Ctrl+Z）、プロジェクトの保存/読み込み（自動保存）、キーボードショートカット（Space=再生、?=ヘルプ）、グローバルBPMと拍子
- **信頼性:** エラーハンドリング、AudioContextの先読みによる正確なタイミング

## モノレポ構造

### アプリケーション

| アプリケーション | 説明 |
|-----|-------------|
| [`apps/studio`](apps/studio) | メインの編集UI（Next.js、Zustand 5） |

### コアパッケージ

| パッケージ | 説明 |
|---------|-------------|
| [`@motif/schema`](packages/schema) | 標準的な型、Zodスキーマ、解析/検証 |
| [`@motif/asset-index`](packages/asset-index) | パックの整合性インデックス作成と監査 |
| [`@motif/audio-engine`](packages/audio-engine) | サンプル再生、ボイス管理、AudioContextのスケジュール |
| [`@motif/test-kit`](packages/test-kit) | テスト用ファイルとユーティリティ |

### 作曲と再生

| パッケージ | 説明 |
|---------|-------------|
| [`@motif/clip-engine`](packages/clip-engine) | クリップシーケンス、変換、キューのスケジュール |
| [`@motif/instrument-rack`](packages/instrument-rack) | マルチオシレーター・シンセ、ドラムボイス、サンプルボイス、LFOモジュレーション、16種類のプリセット |
| [`@motif/music-theory`](packages/music-theory) | スケール、コード、モチーフ、インテンシティ変換 |
| [`@motif/playback-engine`](packages/playback-engine) | リアルタイム再生、ミキシング、8種類のイフェクト、MIDI入出力、WAVエクスポート（24/32ビット） |
| [`@motif/sample-lab`](packages/sample-lab) | トリミング、スライス、キット、楽器ヘルパー |
| [`@motif/score-map`](packages/score-map) | モチーフ、プロファイル、キューファミリー、派生 |
| [`@motif/automation`](packages/automation) | レーン、マクロ、エンベロープ、キャプチャ |
| [`@motif/library`](packages/library) | テンプレート、スナップショット、ブランチ、お気に入り、比較 |

### インフラストラクチャ

| パッケージ | 説明 |
|---------|-------------|
| [`@motif/scene-mapper`](packages/scene-mapper) | トリガーマッピングと決定論的なバインディング評価 |
| [`@motif/runtime-pack`](packages/runtime-pack) | 決定論的なシリアル化によるランタイムエクスポート/インポート |
| [`@motif/review`](packages/review) | サマリーと監査ヘルパー |
| [`@motif/ui`](packages/ui) | 共有UIコンポーネント |

## インストール

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

すべてのパッケージは、npm上で`@motif`スコープで公開されています。

## クイックスタート（モノレポ）

```bash
pnpm install
pnpm build
pnpm test       # 1,116 tests across all packages
pnpm dev        # Start Studio dev server
```

**要件:** Node.js >= 22, pnpm >= 10

## テスト

すべての16のパッケージには、スキーマ検証、整合性監査、サンプル操作、ワールドスコアリング、自動化、ライブラリ管理、再生、シンセシス、エフェクト、MIDI、およびスタジオ統合に関するユニットテストが含まれています。すべてのパッケージに合計1,116個のテストがあります。

すべてを実行するには: `pnpm test`

## ハンドブック

[ハンドブック](https://mcp-tool-shop-org.github.io/motif/handbook/product/)は、製品定義、アーキテクチャ、スタジオの操作方法、クリエイティブなワークフロー、および戦略を網羅した包括的な取扱説明書です。主な参照先：

- [製品：Motifとは](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [アーキテクチャ：リポジトリの概要](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [ワークフロー：ゼロからキューを作成する](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [ワークフロー：カスタムサンプルを使用する](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [ワークフロー：ワールドスコアリング](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [戦略：用語集](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [サンプルパック](examples/)

## セキュリティと信頼性

Motifは**完全にブラウザ上で動作**します。サーバー、クラウド同期、テレメトリーは一切ありません。

- **アクセスされるデータ:** ユーザーが作成したサウンドトラックパックファイル（JSON）、オーディオアセット参照、ブラウザのローカルストレージ
- **アクセスされないデータ:** サーバー側のストレージは一切なし、ブラウザのサンドボックスを超えるファイルシステムへのアクセスはなし
- **ネットワーク:** ネットワークからのデータ送信は一切なし。すべての編集および再生はクライアント側で行われます。
- **認証情報:** 認証情報を読み取ったり、保存したり、送信したりしません。
- **テレメトリー:** 収集も送信も行いません。
- **権限:** 標準的なブラウザAPIのみを使用します（Web Audio API）。

脆弱性に関する報告は、[SECURITY.md](SECURITY.md) を参照してください。

## ライセンス

MIT

---

<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> が開発しました。
