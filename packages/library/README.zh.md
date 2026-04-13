<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/库

Motif 的模板、快照、分支、收藏夹、集合以及实体比较功能。

## 其功能范围

- 模板的创建、实例化、过滤和搜索
- 快照的创建、恢复和查询
- 分支的创建、实例化以及溯源
- 收藏夹的管理和实体书签
- 集合的增删改查和解析
- 实体比较和差异分析

## 主要导出内容

### 模板 (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — 创建可重用的模板
- `instantiateTemplate(template, newId)` — 从模板生成新的实体数据
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### 快照 (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — 冻结实体状态
- `restoreSnapshot(snapshot)` — 恢复实体数据
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### 分支 (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — 从快照创建分支
- `instantiateBranch(snapshot, branch)` — 从分支生成新的实体数据
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### 收藏夹 (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — 标记一个实体
- `isFavorited(favorites, entityId)` — 检查是否已标记
- `favoritesOfKind` — 按实体类型过滤
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### 比较 (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — 逐字段比较
- `areEqual(a, b)` — 结构相等性检查
- `diffCount(a, b)` — 不同字段的数量
- `promoteVersion(a, b, choice)` — 选择一个版本

## 不包含的功能

- 实体持久化或存储
- 用户界面组件
- 播放或渲染

## 依赖项

- `@motif/schema` — 模板、快照、分支、收藏夹、集合的类型定义
