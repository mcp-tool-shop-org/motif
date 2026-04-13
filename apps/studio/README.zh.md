<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/studio

Studio 应用是 Motif 软件包的主要创作平台。它提供一个深色主题的控制界面，用于创建、编辑和检查软件包中的所有元素。

## 屏幕

| 屏幕。 | 目的。 |
|--------|---------|
| **Project** | 软件包元数据、统计信息概览、未使用的实体检测。 |
| **Assets** | 对音频资源（包括音乐、音效、环境音、音效片段、语音）进行创建、读取、更新和删除操作。 |
| **Stems** | 对资源分配和角色标签进行增删改查操作。 |
| **Scenes** | 支持对场景进行增删改查操作，并提供内嵌的图层编辑功能（添加、删除、重新排序）。 |
| **Bindings** | 支持增删改查操作，并提供内联条件编辑功能。 |
| **Transitions** | 针对状态转换，提供创建、读取、更新和删除（CRUD）功能，并根据不同的模式提供特定验证的警告信息。 |
| **Review** | 来自 `@motif/review` 的实时验证结果，按严重程度进行分组。 |
| **Preview** | 手动和顺序运行时状态模拟，并与引擎集成。 |

## 预览

预览界面模拟了当前草稿版本在运行时音效的表现。

当前功能：
- 手动预览运行时状态
- 可编辑的序列模拟
- 胜出绑定和场景检查
- 主干结构检查
- 过渡和警告信息的显示。

此预览版本基于模拟，不进行实际的音频播放。

## 发展

```bash
pnpm --filter @motif/studio dev    # Next.js dev server
pnpm --filter @motif/studio build  # Production build
pnpm --filter @motif/studio test   # Run tests
```

## 堆栈

- **框架：** Next.js 15 (App Router)
- **状态管理：** Zustand
- **验证：** `@motif/review` (通过 `useReview` hook 实现)
- **测试：** Vitest + Testing Library + jsdom
- **样式：** CSS 变量，深色主题 (不使用 CSS-in-JS)
