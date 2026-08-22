<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif-studio"><img src="https://img.shields.io/npm/v/@motif-studio/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

インタラクティブなゲーム音楽の作曲、アレンジ、スコアリング、エクスポートのための適応型サウンドトラックスタジオ。

## 概要

Motifは、まず作曲を重視し、適応性を考慮したワークステーションです。クリップ、キュー、シーン、レイヤー、オートメーションなどの構造化された音楽制作と、実行時にゲームの状態に応答する適応型ロジックを組み合わせます。その結果、生成されたものではなく、意図的に作られたように感じられるゲーム音楽が生まれます。

## Motifではないもの

DAW（デジタル・オーディオ・ワークステーション）。おもちゃのようなシーケンサー。AI音楽ジェネレーター。サウンドを付加したワールド構築データベース。Motifは、適応型ゲームスコアの作成のための本格的なクリエイティブツールです。

Motifは音楽を生成しません。ただし、他の場所で生成されたオーディオを取り込み、ミックス、そのステム、ラウドネス測定値をシーン、キューファミリー、レイヤー化された再生に変換します。オーディオのソースは自由ですが、Motifの作業は、録音が完了した時点から始まります。

## できること

- **作曲**：音符、楽器、スケール、コード、モチーフ変換、強度のバリエーションを含むクリップ
- **シンセサイザー**：ユニゾン/スーパーソー（16プリセット）、LFOモジュレーション（フィルター、アンプ、ピッチ）を備えたマルチオシレーターシンセボイス
- **サンプル楽器**：SampleVoice経由のピアノ、ストリングス、ギターテンプレート。インポート、トリミング、スライス、キットビルダー
- **アレンジ**：レイヤー化されたステム、セクションロール、強度のカーブを含むシーン。10個のドラムパターンプリセット
- **ミックスとエフェクト**：8種類の効果タイプ（EQ、ディレイ、リバーブ、コンプレッサー、コーラス、ディストーション、フェイザー、リミッター）。各ステムに4つのインサートFXスロット
- **ワールドのスコアリング**：Motifファミリー、スコアプロファイル、キューファミリー、ワールドマップエントリ、派生
- **生成されたオーディオの取り込み**：クラウドで生成されたミックス+Demucsステム+LUFS測定値を、再生可能でラウドネスが正規化されたパックに変換。コンテンツアドレス指定により、再実行はほぼ瞬時に完了
- **カタログからジャンルパックを構築**：各キューに対して1つのJSONエントリを作成し、完全なパック（シーン、キューファミリー、生成ロック、バインディング、A/Bテイク）を派生
- **オートメーション**：レーン、マクロ、エンベロープ、ライブキャプチャとマージ
- **呼び出しと再利用**：テンプレート、スナップショット、ブランチ、お気に入り、コレクション、比較
- **MIDI**：Standard MIDIファイルのインポート/エクスポート
- **適応型ロジック**：トリガーバインディング、トランジション、決定論的なシーン解決
- **パフォーマンス**：リアルタイムのクリッププレビュー、クリックによる試聴、AudioContextでスケジュールされたクリックを備えたメトロノーム
- **検証**：スキーマ検証、整合性監査、クロスリファレンスチェック
- **エクスポート**：44.1/48/96kHzでの24/32ビットWAV。ゲームエンジンで使用するためのランタイムパック
- **作成**：アンドゥ/リドゥ（50段階、Ctrl+Z）、自動保存機能付きのプロジェクトの保存/読み込み、キーボードショートカット（Space=再生、？=ヘルプ）、グローバルBPMと拍子
- **信頼性**：エラー境界を備えた正常なリカバリ、サンプル精度のタイミングを実現するためのAudioContextによる先読みスケジュール

## 生成されたキューとジャンルライブラリ

Motifは、生成されたオーディオから再生可能な`SoundtrackPack`を構築できます。カタログファイルでパックを記述し、好きな方法でオーディオを生成すると、Motifがそれをシーン、キューファミリー、レイヤー化されたステムに変換し、Studioで試聴できるようになります。

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motifは最後の2つのステップを担当します。各テイクがミックス、そのステム、ラウドネス測定値として到着することだけを気にします。

**組み込みのカタログには、24個のジャンルパック（合計233個のキュー、1つのキューあたり2つのテイク）が記述されています。**ファンタジー、タクティクス、ダンジョン、スチームパンク、海賊、西部劇、スペースオペラ、サイバーパンク、神話、荒野、東洋、北欧、砂漠、森林、凍土、ゴシック、海底、火山、居心地の良い雰囲気、ノワール、感情的なテーマ、アンビエントドローン、緊張感とメニュー。カタログと派生は、このリポジトリに保存されていますが、**オーディオマスターは保存されていません**。これらはサイズが大きく、ユーザーごとに生成されるため、提供してインポートを実行する必要があります。

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

インポートは**コンテンツアドレス指定と増分処理**です。入力ファイルが前の実行で記録されたものと同じハッシュ値を保持する場合、再デコードする代わりに再利用されます。したがって、完了したパックを再実行するには約1秒かかり、中断された実行は停止した場所から再開されます。`--force`は、パイプラインが引き続き同じ出力を再現できることを証明するために、すべてを再デコードします。`--skip-defective`は、形式が正しくないテイクを破棄し、報告してゼロ以外の終了ステータスで終了し、実行全体を停止させません。

完全なワークフロー（生成ロックとテイクのキュレーションを含む）については、ハンドブックの[Generated Cues and Library Packs](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)を参照してください。

## モノリポジトリ構造

### アプリ

| アプリ | 説明 |
|-----|-------------|
| [`apps/studio`](apps/studio) | メインのオーサリングUI（Next.js、Zustand 5） |

### コアパッケージ

| パッケージ | 説明 |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | 標準的な型、Zodスキーマ、解析/検証 |
| [`@motif-studio/asset-index`](packages/asset-index) | パックの整合性インデックス作成と監査 |
| [`@motif-studio/audio-engine`](packages/audio-engine) | サンプル再生、ボイス管理、AudioContextによるスケジュール |
| [`@motif-studio/test-kit`](packages/test-kit) | フィクスチャとテストユーティリティ |

### 作曲と再生

| パッケージ | 説明 |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | クリップシーケンス、変換、キューのスケジュール |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | マルチオシレーターシンセ、ドラムボイス、サンプルボイス、LFOモジュレーション、16個のプリセット |
| [`@motif-studio/music-theory`](packages/music-theory) | スケール、コード、モチーフ、強度の変換 |
| [`@motif-studio/playback-engine`](packages/playback-engine) | リアルタイム再生、ミキシング、8種類の効果タイプ、MIDI入出力、WAVエクスポート（24/32ビット） |
| [`@motif-studio/sample-lab`](packages/sample-lab) | トリミング、スライス、キット、楽器ヘルパー。さらに、クラウドでの実行クライアント、成果物のインポート、ラウドネス正規化、ライブラリパックの構築を行う生成レーン |
| [`@motif-studio/score-map`](packages/score-map) | モチーフ、プロファイル、キューファミリー、派生、ライブラリカタログ |
| [`@motif-studio/automation`](packages/automation) | レーン、マクロ、エンベロープ、キャプチャ |
| [`@motif-studio/library`](packages/library) | テンプレート、スナップショット、ブランチ、お気に入り、比較 |

### インフラストラクチャ

| パッケージ | 説明 |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | トリガーマッピングと決定論的なバインディング評価 |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | ランタイムエクスポート/インポートと決定論的シリアライゼーション |
| [`@motif-studio/review`](packages/review) | 概要と監査ヘルパー |
| [`@motif-studio/ui`](packages/ui) | 共有UIコンポーネント |

## インストール

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

すべてのパッケージは、`@motif-studio`のスコープの下でnpmに公開されます。

## クイックスタート（モノリポジトリ）

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**要件:** Node.js >= 22、pnpm >= 10

## テスト

すべての16個のパッケージには、スキーマ検証、整合性監査、サンプル操作、ワールドスコアリング、自動化、ライブラリ管理、再生、合成、エフェクト、MIDI、生成インジェスト、およびスタジオ統合を網羅するユニットテストが含まれています。 すべてのパッケージで1,709個のテストが実行されます。

すべてを実行: `pnpm test`

## ハンドブック

[ハンドブック](https://mcp-tool-shop-org.github.io/motif/handbook/product/)は、製品定義、アーキテクチャ、スタジオナビゲーション、クリエイティブワークフロー、および戦略を網羅した包括的な操作マニュアルです。 主要なエントリーポイント：

- [製品: Motifとは](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [アーキテクチャ: リポジトリの概要](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [ワークフロー: ゼロからキューを作成する](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [ワークフロー: 生成されたキューとライブラリパック](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [ワークフロー: カスタムサンプルを使用する](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [ワークフロー: ワールドスコアリング](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [戦略: 用語集](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [サンプルパック](examples/)

## セキュリティと信頼性

**スタジオは完全にブラウザ内で実行されます。** サーバー、クラウド同期、テレメトリはありません。

- **アクセスされるデータ:** ユーザーが作成したサウンドトラックパックファイル（JSON）、オーディオアセットのリファレンス、ブラウザのローカルストレージ
- **アクセスされないデータ:** サーバー側のストレージ、ブラウザサンドボックス外へのファイルシステムアクセスはありません
- **ネットワーク:** スタジオアプリはネットワーク経由でのデータの送受信を行いません。すべての作成と再生はクライアント側で行われます。
- **機密情報:** 認証情報を読み取ったり、保存したり、送信したりしません。
- **テレメトリ:** 収集または送信されません。
- **権限:** 標準のブラウザAPIのみ（Web Audio API）

**例外が1つあり、これはオプションであり、アプリ外で行われます:** `@motif-studio/sample-lab`には、Comfy Cloudエンドポイントに接続して生成ジョブを送信および取得するコマンドライン生成機能が含まれています。 これはターミナルから呼び出した場合にのみ実行され、スタジオアプリによってインポートされることはなく、独自の環境から認証情報を読み取ります。 これを完全にスキップすると、Motifは完全にオフラインのままになります。

脆弱性に関する報告については、[SECURITY.md](SECURITY.md)を参照してください。

## ライセンス

MIT

---

<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>によって作成されました
