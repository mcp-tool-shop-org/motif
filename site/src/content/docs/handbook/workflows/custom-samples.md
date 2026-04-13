---
title: Working with Custom Samples
description: Import, trim, slice, build kits and instruments from raw audio
sidebar:
  order: 1
---

Motif's Sample Lab turns raw audio files into playable musical sources — trimmed loops, sliced hits, drum kits, and pitched instruments.

## Import Flow

Use `buildImportedAsset(filename, durationMs, src)` to create an `AudioAsset` from a file:

- **Filename inference**: `inferSourceType(name)` detects source type from the filename
- **Kind mapping**: `sourceTypeToKind(sourceType)` maps source types to asset kinds
- **ID generation**: `filenameToId(filename)` creates a clean, URL-safe ID

Imported assets get `imported: true` in their metadata.

## Trim and Loop Editing

`applyTrim(asset, startMs, endMs)` sets the playback region non-destructively. `applyLoopPoints(asset, loopStartMs, loopEndMs)` defines the loop region within an asset — useful for sustain loops in melodic samples.

## Slicing

- **Even slicing**: `sliceEvenly(assetId, startMs, endMs, count)` divides a region into equal parts
- **Onset-based**: `sliceAtOnsets(assetId, onsets, totalEndMs)` slices at specific time points

## Building Kits

`kitFromSlices(id, name, slices, basePitch)` builds a kit by mapping slices to ascending MIDI pitches. Each kit slot maps a MIDI pitch to a sample slice.

## Building Sample Instruments

`createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)` creates a pitched instrument from a single audio source. The engine pitch-shifts the sample for each note.

## Common Workflows

### Drum Kit from a Loop
1. Import a drum loop as an audio asset
2. Open in Sample Lab, slice evenly or at onsets
3. Build a kit from slices with `kitFromSlices`
4. Use the kit in clips — each slot is a playable MIDI note

### Melodic Instrument from a Single Sample
1. Import a tonal sample, trim to the clean sustain region
2. Set loop points if needed
3. Create a sample instrument with the correct root note
4. Use in clips — the engine pitch-shifts for each note

### Texture from Field Recordings
1. Import a long ambient recording, slice into interesting sections
2. Build a kit — each slice becomes a triggerable texture
3. Use in a scene as an ambient layer triggered by game state
