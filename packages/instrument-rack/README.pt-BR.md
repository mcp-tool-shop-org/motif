<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/instrument-rack

Gerenciamento de vozes e instrumentos para Motif — sintetizadores, baterias e presets padrão.

## O que ele oferece:

- Criação e gerenciamento de parâmetros para vozes de sintetizador.
- Criação de vozes de bateria com configuração individual para cada elemento.
- Ciclo de vida do rack de instrumentos (criar, conectar, descartar).
- Biblioteca de presets padrão com acesso categorizado.
- Conversão de MIDI para frequência e mapeamento de afinação para bateria.

## Principais funcionalidades:

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

- `InstrumentRack` — gerencia múltiplas vozes, roteamento e descarte.
- `SynthVoice` — voz baseada em oscilador com envelope e filtro.
- `DrumVoice` — voz de percussão baseada em samples.
- `FACTORY_PRESETS` — coleção de presets integrada.
- `getPreset(name)` / `getPresetsByCategory(cat)` — busca de presets.

## Dependências:

- `@motif/schema` — tipos para instrumentos, presets e vozes.
