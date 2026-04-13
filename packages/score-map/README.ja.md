<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/score-map

Motifにおけるワールドスコアリングのロジック。モチーフファミリー、スコアプロファイル、キューファミリー、ワールドマップのエントリ、および派生処理を管理します。

## 機能

- モチーフファミリーの管理（バリエーション、シーンとの関連付け）
- スコアプロファイルの作成と範囲チェック
- キューファミリーの構築とシーン/モチーフとの関連付け
- スコアマップのエントリの解決（プロファイル、ファミリー、モチーフ）
- 派生レコードの作成と系統の追跡

## 主要な機能

### Motif (`motif.ts`)
- `createMotifFamily(id, name)`：モチーフファミリーを作成します。
- `addVariant(family, variant)` / `removeVariant(family, variantId)`：バリエーションを追加/削除します。
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`：シーンとの関連付けを行います。
- `motifFamilyRefs(family)`：参照されているエンティティIDをすべて取得します。
- `familiesReferencingId(families, entityId)`：特定のエンティティを参照しているファミリーを検索します。

### Profile (`profile.ts`)
- `createScoreProfile(id, name, options)`：テンポ、強さ、パレット、キー/スケールを指定してスコアプロファイルを作成します。
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`：テンポ/強さが指定範囲内にあるか確認します。
- `matchingPaletteTags(profileA, profileB)`：共通の音響語彙を特定します。
- `mergeProfiles(base, overlay)`：プロファイルをマージします。

### Cue Family (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)`：役割とシーンを指定してキューファミリーを作成します。
- `addSceneToCueFamily` / `removeSceneFromCueFamily`：キューファミリーにシーンを追加/削除します。
- `linkMotifToCueFamily(family, motifFamilyId)`：モチーフファミリーとの関連付けを行います。
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`：共通のモチーフ/シーンを特定します。
- `collectMotifFamilyIds(family)`：すべてのモチーフファミリーIDを取得します。

### Resolve (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)`：ワールドマップのエントリを作成します。
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`：プロファイル/キューファミリー/モチーフファミリーを解決します。
- `entrySceneIds(entry, cueFamilies)`：キューファミリーを通じて到達可能なシーンを取得します。
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`：コンテキスト/モチーフを共有するエントリを検索します。

### Derivation (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)`：派生レコードを作成します。
- `deriveScene(scene, transform)`：変換を適用して新しいシーンを作成します。
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`：派生関係を追跡します。

## 提供しない機能

- オーディオの再生またはレンダリング
- シーン/ステム/バインディングの管理（`@motif/schema` を参照）
- オートメーション（`@motif/automation` を参照）
- UIコンポーネント

## 依存関係

- `@motif/schema`：モチーフ、プロファイル、シーン、キューファミリー、派生に関する型定義。
