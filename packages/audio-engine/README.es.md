<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/audio-engine

Reproducción de muestras y gestión de voces para Motif.

## Funcionalidades Incluidas

- Reproducción de regiones recortadas
- Reproducción de fragmentos
- Reproducción de ranuras de kits
- Reproducción de notas de instrumentos de muestra (con cambio de tono)
- Gestión del ciclo de vida de las voces

## Exportaciones Principales

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif-studio/audio-engine";
```

- `playTrimmedRegion`: reproduce un búfer de audio dentro de los límites de recorte.
- `playSlice`: reproduce un fragmento específico.
- `playKitSlot`: reproduce una ranura de kit con un tono determinado.
- `playSampleInstrumentNote`: reproduce una nota con tono en un instrumento de muestra.

## Funcionalidades No Incluidas

- Orquestación y mezcla de escenas (gestionado por `@motif-studio/playback-engine`).
- Decodificación de archivos de audio (el AudioContext del navegador se encarga de esto).
- Composición de clips/pistas (gestionado por `@motif-studio/clip-engine`).

## Dependencias

- `@motif-studio/schema`: tipos para activos, fragmentos, kits e instrumentos.
