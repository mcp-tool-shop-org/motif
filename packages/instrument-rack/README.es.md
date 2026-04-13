<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/instrument-rack

Gestión de voces e instrumentos para Motif: sintetizadores, baterías y ajustes predefinidos.

## Funcionalidades principales

- Creación y gestión de parámetros para voces de sintetizador.
- Creación de voces de batería con configuración individual para cada elemento.
- Ciclo de vida del rack de instrumentos (creación, conexión, eliminación).
- Biblioteca de ajustes predefinidos con acceso categorizado.
- Conversión de MIDI a frecuencia y mapeo de tono a batería.

## Exportaciones principales

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
} from "@motif-studio/instrument-rack";
```

- `InstrumentRack`: gestiona múltiples voces, enrutamiento y eliminación.
- `SynthVoice`: voz basada en oscilador con envolvente y filtro.
- `DrumVoice`: voz de percusión basada en muestras.
- `FACTORY_PRESETS`: colección de ajustes predefinidos integrada.
- `getPreset(name)` / `getPresetsByCategory(cat)`: búsqueda de ajustes predefinidos.

## Dependencias

- `@motif-studio/schema`: tipos para instrumentos, ajustes predefinidos y voces.
