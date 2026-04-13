<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/music-theory

Motifで使用するための音楽理論の基本要素とユーティリティ。音階、コード、モチーフ、および音量変換機能が含まれます。

## 機能概要

- 音階と音名に関する操作
- 音階の定義と音階の生成
- コードの品質、ボイシング、およびコード進行に関する補助機能
- モチーフの変換（移調、反転、反転、リズムスケール）
- バリエーションの生成（リズム、メロディ、簡素化、密度化、アクセント）
- 音量の階層の算出（低、中、高、緊張感、明るさ）

## 主要な機能

### 音階と音

```ts
import {
  SCALES, pitchClass, octave, midiNote, noteName,
  scalePitchClasses, isInScale, snapToScale,
  transposeDiatonic,
} from "@motif-studio/music-theory";
```

### コード

```ts
import {
  chordPitches, diatonicChord, diatonicChords,
  chordPalette, generatePadVoicing, generateBassLine,
  arpeggiateChord, progressionFromDegrees,
} from "@motif-studio/music-theory";
```

### モチーフの変換

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif-studio/music-theory";
```

### 音量

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif-studio/music-theory";
```

## 依存関係

なし。依存関係のない基本パッケージです。
