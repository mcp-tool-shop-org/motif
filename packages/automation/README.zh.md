<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/automation

Motif 的自动化功能，包括：轨道、插值、宏、包络线和实时捕捉。

## 主要功能

- 自动化轨道的创建和点位管理
- 基于时间的线性值插值
- 宏状态管理和多参数映射
- 用于提示结构动态的部分包络线
- 实时捕捉的录制、降噪和应用

## 主要导出

### 轨道 (`lanes.ts`)
- `createLane(id, target, points)`：创建带有目标和初始点的轨道。
- `makeTarget(param, entityId)`：创建自动化目标。
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`：添加、删除、更新点位以及清除轨道。
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`：获取特定目标的轨道、特定参数的轨道以及轨道的持续时间。

### 插值 (`interpolate.ts`)
- `evaluateLane(lane, timeMs)`：计算任意时间点的插值值。
- `interpolate(pointA, pointB, timeMs)`：线性插值。
- `sampleLane(lane, startMs, endMs, stepMs)`：定期采样。
- `evaluateLanesAt(lanes, timeMs)`：同时计算多个轨道的数值。

### 宏 (`macros.ts`)
- `defaultMacroState()`：默认的强度/张力/能量值。
- `createMacroMapping(id, macro, param, options)`：将宏映射到参数。
- `evaluateMacros(mappings, macroState)`：计算所有参数的值。
- `applyMacroInfluence(baseValue, macroValue, influence)`：计算单个影响值。
- `mappingsForMacro` / `macrosAffectingParam`：获取特定宏的映射以及影响特定参数的宏。

### 包络线 (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)`：创建具有范围的自动化。
- `evaluateEnvelope(envelope, timeMs)`：计算包络线的插值值。
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`：获取特定目标的包络线，以及入口和出口包络线。

### 捕捉 (`capture.ts`)
- `createCapture(id, name, source)`：启动捕捉会话。
- `recordPoint(capture, timeMs, value)`：记录数值。
- `finalizeCapture(capture)`：标记为完成。
- `applyCaptureToLane` / `mergeCaptureIntoLane`：应用到轨道（合并捕捉到轨道）。
- `thinCapture(capture, tolerance)`：降低点密度。
- `captureDuration(capture)`：总时长。

## 不包含的功能

- 音频 DSP 或效果处理
- 场景编排或播放
- 剪辑合成
- UI 组件

## 依赖

- `@motif/schema`：用于轨道、目标、点位、宏、包络线和捕捉的类型定义。
