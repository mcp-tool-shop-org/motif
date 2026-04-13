<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/runtime-pack

Motif 音频素材包的运行时导出和导入功能。

## 包含内容

- 将创作素材包转换为运行时素材包（去除不必要的内容）
- 运行时素材包的序列化
- 导入/导出功能的双向验证

## 状态

占位符包。运行时导出逻辑将在第二阶段（发布、打包和运行时集成）中进一步完善，包括导出配置文件、资源打包以及引擎适配器清单。

## 不包含的内容

- 创作数据模型（请参考 `@motif-studio/schema`）
- 音频文件打包
- 针对特定引擎的播放 SDK
