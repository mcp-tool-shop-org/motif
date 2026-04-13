<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif/instrument-rack

Voice and instrument management for Motif — synths, drums, and factory presets.

## What It Owns

- Synth voice creation and parameter management
- Drum voice creation with per-piece configuration
- Instrument rack lifecycle (create, connect, dispose)
- Factory preset library with categorized access
- MIDI-to-frequency conversion and pitch-to-drum mapping

## Key Exports

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

- `InstrumentRack` — manages multiple voices, routing, and disposal
- `SynthVoice` — oscillator-based voice with envelope and filter
- `DrumVoice` — sample-based percussion voice
- `FACTORY_PRESETS` — built-in preset collection
- `getPreset(name)` / `getPresetsByCategory(cat)` — preset lookup

## Dependencies

- `@motif/schema` — types for instruments, presets, voices
