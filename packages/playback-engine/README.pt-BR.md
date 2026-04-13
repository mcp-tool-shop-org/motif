<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/playback-engine

Sistema de reprodução, mixagem, renderização e efeitos em tempo real para cenas e sequências do Motif.

## O que ele oferece

- Controle de reprodução (play, pausa, stop, busca)
- Carregamento e decodificação de recursos
- Reprodução de cenas com mixagem de camadas
- Reprodução de transições entre cenas
- Reprodução de sequências (cadeias de cenas ordenadas)
- Mixer com controle individual de cada camada e de canais
- Processamento de efeitos (equalização, delay, reverb, compressor)
- Renderização de trechos e exportação offline
- Codificação em WAV

## Principais funcionalidades

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
} from "@motif-studio/playback-engine";
```

### Classes principais
- `Transport` — estado de reprodução, temporização e busca
- `AssetLoader` — busca e decodificação de recursos de áudio
- `ScenePlayer` — reprodução de cenas com camadas
- `TransitionPlayer` — transição e fade entre cenas
- `SequencePlayer` — reprodução de sequências de cenas ordenadas
- `Mixer` — ganho, pan, mute, solo e roteamento de canais para cada camada
- `CueRenderer` — renderização offline para buffer de áudio
- `CuePlayer` — coordenação da reprodução em nível de trecho

### Efeitos
- `createFxNodes` / `disposeFxNodes` — ciclo de vida da cadeia de efeitos
- Presets integrados para equalização, delay, reverb e compressor

## Dependências

- `@motif-studio/schema` — tipos para cenas, camadas e transições
- `@motif-studio/audio-engine` — elementos básicos para reprodução de amostras
- `@motif-studio/scene-mapper` — avaliação de gatilhos para resolução de cenas
