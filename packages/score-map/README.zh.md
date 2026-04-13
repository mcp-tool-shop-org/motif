<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/score-map

Motif 的世界级评分逻辑，包括：主题系列、评分配置文件、提示系列、世界地图条目以及衍生关系。

## 其包含的内容

- 主题系列管理（变体、场景关联）
- 评分配置文件创建和范围检查
- 提示系列构建以及场景/主题关联
- 评分地图条目解析（配置文件、系列、主题）
- 衍生记录和血缘追踪

## 主要导出内容

### 主题 (`motif.ts`)
- `createMotifFamily(id, name)` — 创建一个主题系列
- `addVariant(family, variant)` / `removeVariant(family, variantId)`
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`
- `motifFamilyRefs(family)` — 所有引用的实体 ID
- `familiesReferencingId(families, entityId)` — 查找引用某个实体的系列

### 配置文件 (`profile.ts`)
- `createScoreProfile(id, name, options)` — 创建具有节拍、强度、音色、调式/音阶的评分配置文件
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`
- `matchingPaletteTags(profileA, profileB)` — 共享的音色词汇
- `mergeProfiles(base, overlay)` — 合并配置文件

### 提示系列 (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)` — 创建具有角色和场景的提示系列
- `addSceneToCueFamily` / `removeSceneFromCueFamily`
- `linkMotifToCueFamily(family, motifFamilyId)`
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`
- `collectMotifFamilyIds(family)` — 所有主题系列 ID

### 解析 (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)` — 创建一个世界地图条目
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`
- `entrySceneIds(entry, cueFamilies)` — 通过提示系列可访问的场景
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`

### 衍生 (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)` — 创建一个衍生记录
- `deriveScene(scene, transform)` — 应用转换并获取新的场景
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`

## 其不包含的内容

- 音频播放或渲染
- 场景/音轨/绑定管理（请参见 `@motif-studio/schema`）
- 自动化（请参见 `@motif-studio/automation`）
- UI 组件

## 依赖项

- `@motif-studio/schema` — 主题、配置文件、场景、提示系列、衍生关系的类型定义
