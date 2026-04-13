<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/studio

Studioアプリは、Motifパックの主要な編集環境です。このアプリは、パック内のすべての要素（コンテンツ、設定など）の作成、編集、および確認を行うための、ダークテーマの操作インターフェースを提供します。

## 画面

| 画面 | 目的。 |
|--------|---------|
| **Project** | パッケージのメタデータ、統計情報の概要、未使用エンティティの検出。 |
| **Assets** | 音声アセット（音楽、効果音、環境音、ジングル、音声）に対する作成、読み取り、更新、削除（CRUD）機能。 |
| **Stems** | アセットの割り当てとロールのタグ付け機能を持つ、ステムオブジェクトの作成、読み取り、更新、削除（CRUD）機能。 |
| **Scenes** | シーンに対するCRUD操作（作成、読み込み、更新、削除）を、レイヤーの編集機能（追加、削除、並べ替え）と組み合わせて実現します。 |
| **Bindings** | バインディングに対するCRUD操作（作成、読み取り、更新、削除）を、インラインでの条件編集機能付きで実現します。 |
| **Transitions** | トランジションに対するCRUD操作において、モードごとに異なる検証警告を表示します。 |
| **Review** | `@motif/review`によって検出された、重要度別に分類されたリアルタイムの検証結果。 |
| **Preview** | エンジン統合による、手動操作とシーケンス実行時の状態シミュレーション。 |

## プレビュー

プレビュー画面では、現在のドラフトパッケージに基づいて、プログラム実行時のサウンドトラックの動作をシミュレーションします。

現在の機能：
- 手動での実行時状態のプレビュー
- 編集可能なシーケンスシミュレーション
- 結合部分とシーンの検査
- アクティブなステムの検査
- トランジションと警告の表示機能

このプレビューはシミュレーションに基づいたものであり、実際の音声再生は行いません。

## 開発

```bash
pnpm --filter @motif/studio dev    # Next.js dev server
pnpm --filter @motif/studio build  # Production build
pnpm --filter @motif/studio test   # Run tests
```

## スタック

- **フレームワーク:** Next.js 15 (App Router)
- **状態管理:** Zustand
- **検証:** `@motif/review` ( `useReview` フックを使用)
- **テスト:** Vitest + Testing Library + jsdom
- **スタイル:** CSS変数、ダークテーマ (CSS-in-JSは使用しない)
