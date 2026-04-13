<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/scene-mapper

用于Motif场景解析的映射逻辑触发器。

## 其职责范围

- 触发条件评估
- 绑定优先级解析
- 从运行时状态选择场景

## 状态

占位符包。当前的场景解析逻辑位于 `@motif-studio/schema` 类型定义和 Studio 商店中。当运行时集成功能扩展时（20+阶段），此包将进行扩展。

## 其不负责的内容

- 场景组合或图层管理
- 动画执行
- 音频播放
