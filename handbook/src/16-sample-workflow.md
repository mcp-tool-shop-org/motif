# Sample Workflow Model

The sample workflow covers the path from raw audio file to playable instrument.

## Pipeline

```
Import → Trim → Slice → Kit / Instrument → Play
```

1. **Import** — `inferSourceType` detects the audio type from the filename, `buildImportedAsset` creates an `AudioAsset`
2. **Trim** — `resolveTrimRegion` and `applyTrim` set non-destructive boundaries
3. **Slice** — `sliceEvenly` divides into equal parts; `sliceAtOnsets` divides at specific times
4. **Kit** — `createKit` builds a drum-style kit, `kitFromSlices` auto-maps slices to MIDI pitches
5. **Instrument** — `createSampleInstrument` wraps an asset with root note and pitch range
6. **Play** — `playKitSlot` and `playSampleInstrumentNote` handle pitched playback

## Loop Points

Assets can define `loopStartMs` and `loopEndMs` for seamless looping. The `resolveLoopRegion` function computes the effective boundaries, defaulting to the full asset duration.

## Integration

Sample-lab entities (slices, kits, instruments) are stored in the `SoundtrackPack` and referenced by clips and scenes. The `audio-engine` handles the actual Web Audio playback.
