<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/playback-engine

Motif场景和序列的实时播放、混合、渲染和效果系统。

## 主要功能

- 传输控制（播放、暂停、停止、跳转）
- 资源加载和解码
- 带有音轨混合的场景播放
- 场景之间的过渡播放
- 序列播放（有序的场景链）
- 具有每个音轨和总线级控制的混音器
- 效果处理（均衡器、延迟、混响、压缩器）
- 预览渲染和离线导出
- WAV编码

## 主要导出内容

```ts
import {
  Transport,
  AssetLoader,
  ScenePlayer,
  TransitionPlayer,
  SequencePlayer,
  Mixer,
  CueRenderer,
  CuePlayer,
  createFxNodes,
  disposeFxNodes,
  dbToGain,
  encodeWav,
} from "@motif/playback-engine";
```

### 核心类
- `Transport`：播放状态、定时和跳转
- `AssetLoader`：获取和解码音频资源
- `ScenePlayer`：播放带有分层音轨的场景
- `TransitionPlayer`：场景之间的淡入淡出和过渡
- `SequencePlayer`：播放有序的场景序列
- `Mixer`：每个音轨的增益、声相、静音、独奏、总线路由
- `CueRenderer`：离线渲染到音频缓冲区
- `CuePlayer`：协调预览级别的播放

### 效果
- `createFxNodes` / `disposeFxNodes`：效果链的生命周期
- 内置的均衡器、延迟、混响和压缩器预设

## 依赖项

- `@motif/schema`：场景、音轨和过渡的类型定义
- `@motif/audio-engine`：音频播放的基本功能
- `@motif/scene-mapper`：用于场景解析的触发器评估
