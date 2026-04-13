<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/playback-engine

Real-time playback, mixing, rendering, and effects system for Motif scenes and sequences.

## What It Owns

- Transport control (play, pause, stop, seek)
- Asset loading and decoding
- Scene playback with stem mixing
- Transition playback between scenes
- Sequence playback (ordered scene chains)
- Mixer with per-stem and bus-level control
- Effects processing (EQ, delay, reverb, compressor)
- Cue rendering and offline export
- WAV encoding

## Key Exports

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

### Core Classes
- `Transport` — playback state, timing, and seek
- `AssetLoader` — fetch and decode audio assets
- `ScenePlayer` — play scenes with layered stems
- `TransitionPlayer` — crossfade and transition between scenes
- `SequencePlayer` — play ordered scene sequences
- `Mixer` — per-stem gain, pan, mute, solo, bus routing
- `CueRenderer` — offline rendering to audio buffer
- `CuePlayer` — cue-level playback coordination

### Effects
- `createFxNodes` / `disposeFxNodes` — effect chain lifecycle
- Built-in presets for EQ, delay, reverb, compressor

## Dependencies

- `@motif-studio/schema` — types for scenes, stems, transitions
- `@motif-studio/audio-engine` — sample playback primitives
- `@motif-studio/scene-mapper` — trigger evaluation for scene resolution
