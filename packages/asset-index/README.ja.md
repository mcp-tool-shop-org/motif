<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/asset-index

Motifのサウンドトラックパックのデータ整合性チェックと監査機能。

## その機能・役割

- **`buildPackIndex(pack)`**: ビルドの高速なIDベースの参照マップを作成し、各エンティティコレクション内で重複するIDを検出します。
- **`auditPackIntegrity(pack)`**: すべての整合性チェック（参照の破損、重複、自己参照、未使用のエンティティ）を実行し、分類された結果（エラー、警告、注意）を、決定的にソートされた状態で返します。
- **`findUnusedAssets(pack)`**: どのステムやトランジションにも参照されていないアセットを検索します。
- **`findUnusedStems(pack)`**: どのシーンレイヤーにも参照されていないステムを検索します。
- **`findUnreferencedScenes(pack)`**: どのバインディング、フォールバック、またはトランジションにも参照されていないシーンを検索します。
- **`summarizePackIntegrity(pack)`**: エンティティの数、未使用の要素の数、および検出結果の数を、1つのオブジェクトにまとめて返します。

## 倫理規定

| コード | 重症度
深刻度
程度
重大性 | 意味。 |
|------|----------|---------|
| `duplicate_asset_id` | エラー | 2つ以上の資産が同じIDを共有しています。 |
| `duplicate_stem_id` | エラー | 2つ以上のステムが同じIDを共有しています。 |
| `duplicate_scene_id` | エラー | 2つ以上のシーンが同じIDを共有しています。 |
| `duplicate_binding_id` | エラー | 2つ以上のバインディングが同じIDを共有しています。 |
| `duplicate_transition_id` | エラー | 2つ以上のトランジションが同じIDを共有しています。 |
| `missing_asset_ref` | エラー | ステムが、存在しない資産を参照しています。 |
| `missing_stinger_asset_ref` | エラー | トランジションに関する参照情報が見つかりません。また、関連するアセット（画像や動画など）も存在しません。 |
| `missing_stem_ref` | エラー | シーンレイヤーが、存在しないステムを参照しています。 |
| `missing_fallback_scene_ref` | エラー | シーンの代替設定が、存在しないシーンを参照している。 |
| `missing_binding_scene_ref` | エラー | 参照が設定されていないシーンに対するバインディング。 |
| `missing_transition_from_scene_ref` | エラー | シーン間の移行は存在しません。 |
| `missing_transition_to_scene_ref` | エラー | シーンの切り替え機能は存在しません。 |
| `scene_self_fallback` | 警告 | シーンが元の状態に戻る。 |
| `transition_self_reference` | 警告 | 「トランジション（画面切り替え効果）」の開始と終了が同じシーンである場合。 |
| `unused_asset` | 警告 | どの要素（ステムまたはスティンガー）からも参照されていない資産。 |
| `unused_stem` | 警告 | このステムは、どのシーンレイヤーにも関連付けられていません。 |
| `unreferenced_scene` | メモ。 | どの設定、バックアップ、またはトランジションにも関連付けられていないシーン。 |

## 使用方法

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
