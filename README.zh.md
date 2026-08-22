<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif-studio"><img src="https://img.shields.io/npm/v/@motif-studio/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

用于创作、编排、配乐和导出交互式游戏音乐的自适应音轨工作室。

## 它是什么

Motif 是一款以作曲为核心、具有自适应功能的创作工作站。它将结构化的音乐创作（片段、提示、场景、图层、自动化）与能够响应游戏运行时状态的自适应逻辑相结合。结果：游戏音乐听起来像是经过精心设计的，而不是生成的。

## 它不是什么

一个 DAW（数字音频工作站）。一个玩具音序器。一个人工智能音乐生成器。一个带有声音附件的世界构建数据库。Motif 是一款用于自适应游戏配乐创作的严肃的创意工具。

Motif 不会生成音乐。它会[接收](#generated-cues-and-the-genre-library)你在其他地方生成的音频，将混音、其各个音轨和一个响度读数转换为场景、提示组和分层播放。音频的来源由你决定；Motif 的工作从录制完成后开始。

## 它可以做什么

- **作曲**——带有音符、乐器、音阶、和弦、主题变形、强度变体的片段
- **合成**——具有齐奏/超锯波（16 预设）、LFO 调制（滤波器、振幅、音高）的多振荡器合成声音
- **采样乐器**——通过 SampleVoice 使用钢琴、弦乐、吉他模板；导入、修剪、切片、构建乐器组
- **编排**——带有分层音轨、部分角色、强度曲线的场景；10 个鼓模式预设
- **混音和效果**——8 种效果类型（均衡器、延迟、混响、压缩器、合唱、失真、相位器、限制器）；每个音轨有 4 个插入效果插槽
- **为世界配乐**——Motif 系列、配乐配置文件、提示组、世界地图条目、推导
- **接收生成的音频**——将云端生成的混音 + Demucs 音轨 + LUFS 读数转换为可播放的、响度归一化的包；内容寻址，因此重新运行几乎是即时的
- **从目录中构建流派包**——每个 JSON 条目对应一个提示，从而生成整个包：场景、提示组、生成锁定、绑定和 A/B 版本
- **自动化**——通道、宏、信封、实时捕获和合并
- **调用和重用**——模板、快照、分支、收藏夹、集合、比较
- **MIDI**——导入/导出标准 MIDI 文件
- **自适应逻辑**——触发绑定、过渡、确定性场景解析
- **表演**——实时片段预览、点击试听、带有 AudioContext 计划的节拍器
- **验证**——模式验证、完整性审计、交叉引用检查
- **导出**——24/32 位 WAV，采样率为 44.1/48/96kHz；用于游戏引擎消耗的运行时包
- **创作**——撤销/重做（50 层深，Ctrl+Z）、项目保存/加载，带有自动保存、键盘快捷键（空格=播放，？=帮助）、全局 BPM 和节拍
- **可靠性**——具有优雅恢复的错误边界、用于实现精确采样的 AudioContext 预先调度

## 生成的提示和流派库

Motif 可以从生成的音频中构建一个可播放的 `SoundtrackPack`。你可以在目录文件中描述一个包，以你喜欢的方式生成音频，然后 Motif 会将其转换为场景、提示组和分层音轨，你可以在 Studio 中试听它们。

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif 负责最后两个步骤。它只关心每个录制是否作为混音、其各个音轨和一个响度读数到达。

**内置目录描述了 24 个流派包——233 个提示，每个提示有两个版本。** 包括：奇幻、战术、地牢、蒸汽朋克、海盗、西部、太空歌剧、赛博朋克、神话、荒原、东方、北欧、沙漠、森林、冰冻、哥特式、海底、火山、舒适、黑色电影、情感主题、环境音效、紧张和菜单。目录和推导都位于此仓库中；**音频母版不在其中**——它们体积庞大且按用户生成，因此你需要提供它们并运行接收过程。

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

接收是**基于内容的并且是增量的**：如果输入文件的哈希值与先前运行的录制内容相同，则会重用该录制，而不是重新解码，因此重新运行完成的包大约需要一秒钟，而不是几分钟，并且中断的运行将从停止的位置恢复。 `--force` 会重新解码所有内容，以证明流水线仍然可以再现其自身的输出；`--skip-defective` 会放弃格式错误的录制，报告它并以非零状态退出，而不是停止整个运行。

有关完整工作流程的信息，包括生成锁定和录制策划，请参阅手册中的[生成的提示和库包](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)。

## 单仓库结构

### 应用程序

| 应用 | 描述 |
|-----|-------------|
| [`apps/studio`](apps/studio) | 主要的创作 UI（Next.js，Zustand 5） |

### 核心包

| 包 | 描述 |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | 规范类型、Zod 模式、解析/验证 |
| [`@motif-studio/asset-index`](packages/asset-index) | 包完整性索引和审计 |
| [`@motif-studio/audio-engine`](packages/audio-engine) | 采样播放、声音管理、AudioContext 调度 |
| [`@motif-studio/test-kit`](packages/test-kit) | 固定装置和测试实用程序 |

### 作曲和播放

| 包 | 描述 |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | 片段序列、变形、提示调度 |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | 多振荡器合成器、鼓声音、采样声音、LFO 调制、16 个预设 |
| [`@motif-studio/music-theory`](packages/music-theory) | 音阶、和弦、主题、强度变换 |
| [`@motif-studio/playback-engine`](packages/playback-engine) | 实时播放、混音、8 种效果类型、MIDI I/O、WAV 导出（24/32 位） |
| [`@motif-studio/sample-lab`](packages/sample-lab) | 修剪、切片、乐器组、乐器助手——以及生成通道：云端运行客户端、工件接收、响度归一化、库包构建 |
| [`@motif-studio/score-map`](packages/score-map) | 主题、配置文件、提示组、推导、库目录 |
| [`@motif-studio/automation`](packages/automation) | 通道、宏、信封、捕获 |
| [`@motif-studio/library`](packages/library) | 模板、快照、分支、收藏夹、比较 |

### 基础设施

| 包 | 描述 |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | 触发映射和确定性绑定评估 |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | 运行时导出/导入，具有确定性序列化 |
| [`@motif-studio/review`](packages/review) | 摘要和审计助手 |
| [`@motif-studio/ui`](packages/ui) | 共享 UI 组件 |

## 安装

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

所有软件包都发布到 npm，其作用域为 `@motif-studio`。

## 快速入门（单仓库）

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**要求：** Node.js >= 22，pnpm >= 10

## 测试

所有 16 个软件包都包含单元测试，涵盖模式验证、完整性审计、示例操作、世界评分、自动化、库管理、播放、合成、效果、MIDI、生成内容导入和工作室集成。 所有软件包共包含 1,709 个测试。

运行所有内容：`pnpm test`

## 手册

[手册](https://mcp-tool-shop-org.github.io/motif/handbook/product/) 是全面的操作手册，涵盖产品定义、架构、工作室导航、创意工作流程和策略。 关键入口点：

- [产品：Motif 是什么](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [架构：仓库概览](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [工作流程：从头开始构建一个 Cue](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [工作流程：生成的 Cue 和库包](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [工作流程：使用自定义样本](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [工作流程：世界评分](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [策略：术语表](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [示例包](examples/)

## 安全与信任

**工作室完全在浏览器中运行。** 没有服务器，没有云同步，也没有遥测数据。

- **涉及的数据：** 用户创建的音轨包文件（JSON）、音频资源引用、浏览器本地存储
- **不涉及的数据：** 无服务器端存储，无超出浏览器沙盒的文件系统访问
- **网络：** Studio 应用程序不会进行任何网络传输——所有创作和播放都在客户端完成
- **密钥：** 不读取、存储或传输凭据
- **遥测数据：** 不收集或发送任何数据
- **权限：** 仅使用标准浏览器 API（Web Audio API）

**有一个例外，并且它是可选的，且在应用程序之外：** `@motif-studio/sample-lab` 提供了一个命令行生成工具，该工具与 Comfy Cloud 端点通信，以提交和检索生成作业。 它仅在你从终端调用它时运行，绝不会被 Studio 应用程序导入，并且它会从你自己的环境中读取其凭据。 完全跳过它，Motif 将完全离线运行。

有关漏洞报告，请参阅 [SECURITY.md](SECURITY.md)。

## 许可证

MIT

---

由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建
