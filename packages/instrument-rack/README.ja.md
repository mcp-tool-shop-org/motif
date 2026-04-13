<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/instrument-rack

Motifの音源と楽器の管理機能：シンセサイザー、ドラム、およびプリセット音色。

## 所有するもの

- シンセサウンドの作成とパラメータ管理
- 個々の要素を設定可能なドラムサウンドの作成
- 楽器ラックのライフサイクル（作成、接続、削除）
- カテゴリ分けされたアクセスが可能な、プリセットライブラリ
- MIDI信号を周波数に変換し、音程をドラムにマッピングする機能

## 主要な輸出品目

```ts
import {
  InstrumentRack,
  SynthVoice,
  DrumVoice,
  FACTORY_PRESETS,
  getPreset,
  getPresetsByCategory,
  midiToFreq,
  pitchToDrum,
} from "@motif/instrument-rack";
```

- `InstrumentRack`: 複数の音源を管理し、ルーティングと音の処理を行います。
- `SynthVoice`: オシレーターをベースにした音源で、エンベロープとフィルターを搭載しています。
- `DrumVoice`: サンプル音源をベースにした打楽器音源です。
- `FACTORY_PRESETS`: プリセットのコレクション（工場出荷時の設定）。
- `getPreset(name)` / `getPresetsByCategory(cat)`: プリセットの検索機能。名前またはカテゴリでプリセットを取得します。

## 依存関係

- `@motif/schema`: 楽器、プリセット、音色のデータ型定義。
