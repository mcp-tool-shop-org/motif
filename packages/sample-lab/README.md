<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/sample-lab

Trim, slice, kit, and instrument helpers for the Motif sample workflow.

## What It Owns

- Audio asset trimming and loop point management
- Even and onset-based slicing
- Sample kit construction and slot management
- Sample instrument creation and pitch utilities
- Audio file import helpers (filename → asset inference)

## Key Exports

### Trim (`trim.ts`)
- `resolveTrimRegion(asset)` — effective trim boundaries
- `resolveLoopRegion(asset)` — effective loop boundaries
- `applyTrim(asset, startMs, endMs)` — set trim points
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — set loop points

### Slice (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — divide into equal parts
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — slice at specific times
- `sliceDurationMs(slice)` — slice length

### Kit (`kit.ts`)
- `createKit(id, name)` — empty kit
- `addKitSlot(kit, slot)` / `removeKitSlot(kit, pitch)` / `updateKitSlot(kit, pitch, update)`
- `kitFromSlices(id, name, slices, basePitch)` — auto-map slices to MIDI pitches
- `kitAssetIds(kit)` / `findDuplicateSlotPitches(kit)`

### Instrument (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)`
- `pitchToPlaybackRate(rootNote, targetNote)` — pitch-shift ratio
- `isInRange(instrument, note)` / `rangeSpan(instrument)`

### Import (`import.ts`)
- `inferSourceType(name)` — detect type from filename
- `sourceTypeToKind(sourceType)` — map source type → asset kind
- `filenameToId(filename)` — clean ID from filename
- `buildImportedAsset(filename, durationMs, src)` — create asset from file

## What It Does Not Own

- Audio file decoding or playback (see `@motif-studio/audio-engine`)
- Audio asset persistence or file I/O
- UI components

## Dependencies

- `@motif-studio/schema` — types for assets, slices, kits, instruments
