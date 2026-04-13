<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif"><img src="https://img.shields.io/npm/v/@motif/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

自适应音效工作室，用于创作、编排、配乐和导出互动游戏音乐。

## 产品介绍

Motif 是一款以创作为先导，并具有自适应功能的综合工作站。它将结构化的音乐创作功能（包括音符片段、提示、场景、音轨和自动化）与能够根据游戏运行时状态进行响应的自适应逻辑相结合。结果是：游戏音乐听起来是经过精心设计的，而不是随机生成的。

## 它不是什么

它不是一个数字音频工作站（DAW）。它不是一个简单的音序器。它不是一个人工智能音乐生成器。它也不是一个带有声音的世界构建数据库。Motif 是一个用于自适应游戏配乐创作的专业创意工具。

## 它可以做什么

- **创作 (Compose)**：包含音符、乐器、音阶、和弦、动机变换、强度变体的片段。
- **合成 (Synthesize)**：具有超导/锯齿波（16种预设）的多振荡器合成器音色，以及LFO调制（滤波器、音量、音高）。
- **采样乐器 (Sample instruments)**：通过SampleVoice提供钢琴、弦乐、吉他模板；导入、裁剪、分割、构建音色包。
- **编排 (Arrange)**：包含分层音轨、段落角色、强度曲线的场景；10种鼓点预设。
- **混音和效果 (Mix and effect)**：8种效果类型（均衡器、延迟、混响、压缩器、合唱、失真、相位器、限压器）；每个音轨有4个插入效果槽。
- **构建世界 (Score a world)**：动机族、配乐配置文件、提示族、世界地图条目、衍生。
- **自动化 (Automate)**：包含音轨、宏、包络线、实时捕捉和合并。
- **回溯和重用 (Recall and reuse)**：包含模板、快照、分支、收藏夹、比较。
- **MIDI**：导入/导出标准MIDI文件。
- **自适应逻辑 (Adaptive logic)**：触发器绑定、过渡、确定性场景解析。
- **演奏 (Perform)**：实时片段预览、点击试听、带音频上下文定时点击的节拍器。
- **验证 (Validate)**：模式验证、完整性审计、交叉引用检查。
- **导出 (Export)**：导出24/32位WAV文件，采样率为44.1/48/96kHz；用于游戏引擎的运行时包。
- **创作 (Author)**：撤销/重做（最多50步，使用Ctrl+Z），项目保存/加载（自动保存），键盘快捷键（空格键=播放，？=帮助），全局节拍和拍号。
- **可靠性 (Reliability)**：包含错误处理机制，以及音频上下文的预处理调度，以实现精确的定时。

## 单仓库结构

### 应用程序

| 应用程序 | 描述 |
|-----|-------------|
| [`apps/studio`](apps/studio) | 主要创作用户界面（使用Next.js和Zustand 5） |

### 核心包

| 包 | 描述 |
|---------|-------------|
| [`@motif/schema`](packages/schema) | 标准类型、Zod模式、解析/验证 |
| [`@motif/asset-index`](packages/asset-index) | 打包完整性索引和审计 |
| [`@motif/audio-engine`](packages/audio-engine) | 采样播放、音色管理、音频上下文调度 |
| [`@motif/test-kit`](packages/test-kit) | 测试工具和辅助程序 |

### 创作和播放

| 包 | 描述 |
|---------|-------------|
| [`@motif/clip-engine`](packages/clip-engine) | 片段序列、变换、提示调度 |
| [`@motif/instrument-rack`](packages/instrument-rack) | 多振荡器合成器、鼓音色、采样音色、LFO调制、16种预设 |
| [`@motif/music-theory`](packages/music-theory) | 音阶、和弦、动机、强度变换 |
| [`@motif/playback-engine`](packages/playback-engine) | 实时播放、混音、8种效果类型、MIDI输入/输出、WAV导出（24/32位） |
| [`@motif/sample-lab`](packages/sample-lab) | 裁剪、分割、音色包、乐器辅助工具 |
| [`@motif/score-map`](packages/score-map) | 动机、配置文件、提示族、衍生 |
| [`@motif/automation`](packages/automation) | 音轨、宏、包络线、捕捉 |
| [`@motif/library`](packages/library) | 模板、快照、分支、收藏夹、比较 |

### 基础设施

| 包 | 描述 |
|---------|-------------|
| [`@motif/scene-mapper`](packages/scene-mapper) | 触发器映射和确定性绑定评估 |
| [`@motif/runtime-pack`](packages/runtime-pack) | 具有确定性序列化的运行时导出/导入 |
| [`@motif/review`](packages/review) | 摘要和审计辅助工具 |
| [`@motif/ui`](packages/ui) | 共享用户界面组件 |

## 安装

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

所有包都发布到npm，作用域为`@motif`。

## 快速开始（单仓库）

```bash
pnpm install
pnpm build
pnpm test       # 1,116 tests across all packages
pnpm dev        # Start Studio dev server
```

**要求：** Node.js >= 22, pnpm >= 10

## 测试

所有16个软件包都包含单元测试，涵盖了模式验证、完整性审计、示例操作、世界评分、自动化、库管理、回放、合成、效果、MIDI以及工作室集成。所有软件包共有1116个测试用例。

运行所有测试：`pnpm test`

## 手册

本[手册](https://mcp-tool-shop-org.github.io/motif/handbook/product/)是全面的操作手册，涵盖产品定义、架构、工作室导航、创意工作流程以及策略。主要入口点：

- [产品：什么是Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [架构：仓库概览](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [工作流程：从头开始构建一个音效](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [工作流程：使用自定义采样](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [工作流程：世界评分](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [策略：术语表](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [示例包](examples/)

## 安全与信任

Motif 完全在浏览器中运行。没有服务器，没有云同步，没有数据收集。

- **涉及的数据：** 用户创建的音效包文件（JSON）、音频资源引用、浏览器本地存储。
- **未涉及的数据：** 没有服务器端存储，超出浏览器沙箱的文件系统访问权限。
- **网络：** 没有网络出站流量——所有创作和回放都在客户端进行。
- **凭证：** 不读取、存储或传输凭证。
- **数据收集：** 不收集或发送任何数据。
- **权限：** 仅使用标准的浏览器API（Web Audio API）。

请参阅 [SECURITY.md](SECURITY.md) 以报告漏洞。

## 许可证

MIT

---

由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建。
