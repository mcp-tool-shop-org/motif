<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/music-theory

Motif 音乐理论的基础模块和实用工具，包括音阶、和弦、乐句和强度变换。

## 主要功能

- 音高和音符名称的操作
- 音阶定义和音高生成
- 和弦质量、和弦结构和和弦进行辅助功能
- 乐句变换（移调、倒置、反转、节奏缩放）
- 变奏生成（节奏、旋律、稀疏化、密集化、重音）
- 强度等级推导（低、中、高、张力、明亮）

## 主要导出内容

### 音阶和音高

```ts
import {
  SCALES, pitchClass, octave, midiNote, noteName,
  scalePitchClasses, isInScale, snapToScale,
  transposeDiatonic,
} from "@motif-studio/music-theory";
```

### 和弦

```ts
import {
  chordPitches, diatonicChord, diatonicChords,
  chordPalette, generatePadVoicing, generateBassLine,
  arpeggiateChord, progressionFromDegrees,
} from "@motif-studio/music-theory";
```

### 乐句变换

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif-studio/music-theory";
```

### 强度

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif-studio/music-theory";
```

## 依赖项

无 — 这是一个不依赖任何其他包的基础模块。
