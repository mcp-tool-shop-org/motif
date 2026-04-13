<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/ライブラリ

Motifのためのテンプレート、スナップショット、ブランチ、お気に入り、コレクション、およびエンティティ比較機能。

## 提供機能

- テンプレートの作成、インスタンス化、フィルタリング、および検索
- スナップショットの作成、復元、およびクエリ
- ブランチの作成、インスタンス化、および履歴追跡
- お気に入り管理およびエンティティのブックマーク
- コレクションのCRUD操作と解決
- エンティティの比較と差分

## 主要な機能

### テンプレート (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)`：再利用可能なテンプレートを作成します。
- `instantiateTemplate(template, newId)`：テンプレートから新しいエンティティデータを生成します。
- `templatesOfKind` / `searchTemplates` / `templatesByTag`：特定の種類のテンプレートを取得したり、テンプレートを検索したり、タグでフィルタリングしたりします。

### スナップショット (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)`：エンティティの状態を固定します。
- `restoreSnapshot(snapshot)`：エンティティデータを復元します。
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`：エンティティまたは種類のスナップショットを取得したり、最新のスナップショットを取得したり、スナップショットの数を取得したりします。

### ブランチ (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)`：スナップショットからブランチを作成します。
- `instantiateBranch(snapshot, branch)`：ブランチから新しいエンティティデータを生成します。
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`：スナップショットまたは種類のブランチを取得したり、ブランチの履歴を追跡したり、子ブランチを取得したりします。

### お気に入り (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)`：エンティティをブックマークします。
- `isFavorited(favorites, entityId)`：ブックマークされているかどうかを確認します。
- `favoritesOfKind`：エンティティの種類でフィルタリングします。
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`：コレクションの作成、追加、削除、解決、および検索を行います。

### 比較 (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)`：フィールドごとの差分を計算します。
- `areEqual(a, b)`：構造的な等価性をチェックします。
- `diffCount(a, b)`：異なるフィールドの数を取得します。
- `promoteVersion(a, b, choice)`：勝者を選択します。

## 提供しない機能

- エンティティの永続化またはストレージ
- UIコンポーネント
- 再生またはレンダリング

## 依存関係

- `@motif/schema`：テンプレート、スナップショット、ブランチ、お気に入り、コレクションの型定義。
