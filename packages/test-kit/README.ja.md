<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/test-kit

Motif パッケージ向けのテスト用データ、サンプル、およびユーティリティ。

## 含まれるもの

- テスト用の JSON データファイル（最小限のサンプル、整合性テスト用サンプル、無効なサンプル）
- データファイルの読み込みユーティリティ
- データファイルのパス解決機能

## 主要な機能

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif-studio/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### データ

| 定数 | データファイル | 目的 |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | 最小限の有効なサンプル |
| `STARTER_PACK` | `starter-pack.json` | より詳細なサンプル |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | スキーマ検証：メタ情報が不足 |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | スキーマ検証：不正なトランジション |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | スキーマ検証：レイヤーが空 |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | スキーマ検証：不正な期間 |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | 整合性：正常なサンプル |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | 整合性：アセット参照が壊れている |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | 整合性：ステム参照が壊れている |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | 整合性：シーン参照が壊れている |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | 整合性：IDの重複 |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | 整合性：自己参照エンティティ |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | 整合性：未使用のエンティティ |

## 含まれないもの

- アプリケーションレベルのテスト（各パッケージの `test/` ディレクトリにあります）
- テストランナーの設定（各パッケージに独自の `vitest.config.ts` があります）
