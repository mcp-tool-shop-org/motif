<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/review

Motifのサウンドトラックパックに関する概要、監査、およびプレビュー機能を提供します。

## 機能

- パックの概要生成
- 監査結果の整形
- プレビュー機能のユーティリティ

## 状態

現状はプレースホルダーのパッケージです。概要と監査のロジックは現在、`@motif/asset-index`（データの完全性監査）とStudioの画面（概要）に存在します。このパッケージは、より詳細なレポート機能、キューの網羅性分析、およびレビューのアノテーション機能（第26～27段階）を追加する予定です。

## 提供しない機能

- パックのデータの完全性インデックス作成（`@motif/asset-index`を参照）
- スキーマの検証（`@motif/schema`を参照）
- UIのレンダリング
