<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/instrument-rack

用于 Motif 的声音和乐器管理——包括合成器、鼓和预设。

## 主要功能

- 合成器声音的创建和参数管理
- 鼓声音的创建，支持每个音符的配置
- 乐器组的生命周期管理（创建、连接、销毁）
- 包含分类的预设库
- MIDI 到频率的转换，以及音高到鼓的映射

## 主要导出内容

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

- `InstrumentRack`：管理多个声音、路由和销毁。
- `SynthVoice`：基于振荡器的声音，带有包络和滤波器。
- `DrumVoice`：基于采样器的打击乐声音。
- `FACTORY_PRESETS`：内置的预设集合。
- `getPreset(name)` / `getPresetsByCategory(cat)`：预设查找。

## 依赖项

- `@motif/schema`：用于乐器、预设和声音的类型定义。
