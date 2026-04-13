<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/playback-engine

Sistema de reproducción, mezcla, renderizado y efectos en tiempo real para escenas y secuencias de Motif.

## Componentes principales

- Control de reproducción (reproducir, pausar, detener, buscar)
- Carga y decodificación de recursos
- Reproducción de escenas con mezcla de pistas
- Reproducción de transiciones entre escenas
- Reproducción de secuencias (cadenas de escenas ordenadas)
- Mezclador con control individual de pistas y de buses
- Procesamiento de efectos (ecualizador, retardo, reverberación, compresor)
- Renderizado de previsualizaciones y exportación offline
- Codificación WAV

## Exportaciones principales

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

### Clases principales
- `Transport` — estado de reproducción, temporización y búsqueda.
- `AssetLoader` — carga y decodifica recursos de audio.
- `ScenePlayer` — reproduce escenas con pistas superpuestas.
- `TransitionPlayer` — realiza transiciones y fundidos entre escenas.
- `SequencePlayer` — reproduce secuencias de escenas ordenadas.
- `Mixer` — control de ganancia, panorámica, silencio, solo y enrutamiento de buses para cada pista.
- `CueRenderer` — renderizado offline a un búfer de audio.
- `CuePlayer` — coordinación de la reproducción a nivel de previsualización.

### Efectos
- `createFxNodes` / `disposeFxNodes` — ciclo de vida de la cadena de efectos.
- Presets integrados para ecualizador, retardo, reverberación y compresor.

## Dependencias

- `@motif/schema` — tipos para escenas, pistas y transiciones.
- `@motif/audio-engine` — funciones básicas para la reproducción de muestras.
- `@motif/scene-mapper` — evaluación de disparadores para la resolución de escenas.
