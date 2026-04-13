<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif/audio-engine

Sample playback and voice management for Motif.

## What It Owns

- Trimmed region playback
- Slice playback
- Kit slot playback
- Sample instrument note playback (with pitch shifting)
- Voice lifecycle management

## Key Exports

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif/audio-engine";
```

- `playTrimmedRegion` — play an audio buffer within trim boundaries
- `playSlice` — play a specific sample slice
- `playKitSlot` — play a kit slot at a given pitch
- `playSampleInstrumentNote` — play a pitched note on a sample instrument

## What It Does Not Own

- Scene orchestration and mixing (handled by `@motif/playback-engine`)
- Audio file decoding (browser AudioContext handles this)
- Clip/cue composition (handled by `@motif/clip-engine`)

## Dependencies

- `@motif/schema` — types for assets, slices, kits, instruments
