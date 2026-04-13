<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/automation

Motifの表現力を高めるための自動化機能：レーン、補間、マクロ、エンベロープ、そしてリアルタイムでのキャプチャ機能。

## 所有するもの

- 自動化機能のトラック作成とポイント管理
- 時間に基づいた値の補間（線形）
- マクロ状態の管理と、複数のパラメータのマッピング
- キュー構造のダイナミクスを制御するためのセクションエンベロープ
- ライブキャプチャの録画、トリミング、および適用

## 主要な輸出品目

### レーン（`lanes.ts`）
- `createLane(id, target, points)`：指定されたターゲットと初期ポイントを持つレーンを作成します。
- `makeTarget(param, entityId)`：自動化のターゲットを作成します。
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`：それぞれ、ポイントの追加、特定の位置にあるポイントの削除、ポイントの更新、レーンのクリアを行います。
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`：それぞれ、特定のターゲットに関連するレーン、特定のパラメータに関連するレーン、レーンの時間範囲を取得します。

### 補間処理 (`interpolate.ts`)
- `evaluateLane(lane, timeMs)`: 指定された時間 `timeMs` における、補間された値を取得します。
- `interpolate(pointA, pointB, timeMs)`: 線形補間を行います。
- `sampleLane(lane, startMs, endMs, stepMs)`: 指定されたレーン `lane` を、`startMs` から `endMs` までの範囲で、`stepMs` ごとにサンプリングします。
- `evaluateLanesAt(lanes, timeMs)`: 複数のレーン `lanes` を同時に、指定された時間 `timeMs` で評価します。

### マクロ (macros.ts)
- `defaultMacroState()`：デフォルトの強度/張力/エネルギー値
- `createMacroMapping(id, macro, param, options)`：マクロをパラメータにマッピングする
- `evaluateMacros(mappings, macroState)`：すべてのパラメータ値を計算する
- `applyMacroInfluence(baseValue, macroValue, influence)`：単一のインフルエンスを計算する
- `mappingsForMacro` / `macrosAffectingParam`：マクロに関連するマッピング / パラメータに影響を与えるマクロ

### 封筒 (envelopes.ts)
- `createEnvelope(id, target, sectionRole, points)`：セクション範囲内の自動化機能を作成します。
- `evaluateEnvelope(envelope, timeMs)`：補間されたエンベロープ値を算出します。
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`：ターゲット、エントリー、およびエグジットに関連するエンベロープデータ。

### キャプチャ機能（`capture.ts`ファイル）
- `createCapture(id, name, source)`：キャプチャセッションを開始します。
- `recordPoint(capture, timeMs, value)`：値を記録します。
- `finalizeCapture(capture)`：完了としてマークします。
- `applyCaptureToLane` / `mergeCaptureIntoLane`：レーンに適用します。
- `thinCapture(capture, tolerance)`：データの密度を下げます。
- `captureDuration(capture)`：合計時間。

## 所有していないもの

- オーディオのデジタル信号処理（DSP）またはエフェクト処理
- シーンの構成または再生
- クリップの編集
- ユーザーインターフェース（UI）のコンポーネント

## 依存関係

- `@motif/schema`：レーン、ターゲット、ポイント、マクロ、エンベロープ、キャプチャに関するデータ型。
