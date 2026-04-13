# Working with Custom Samples

Motif's Sample Lab turns raw audio files into playable musical sources — trimmed loops, sliced hits, drum kits, and pitched instruments.

## Import Flow

### From Audio Files

Use `buildImportedAsset(filename, durationMs, src)` to create an `AudioAsset` from a file:

- **Filename inference**: `inferSourceType(name)` detects source type from the filename (e.g., "kick_808.wav" → drums)
- **Kind mapping**: `sourceTypeToKind(sourceType)` maps source types to asset kinds (drums → oneshot, tonal → loop, etc.)
- **ID generation**: `filenameToId(filename)` creates a clean, URL-safe ID from the filename

Imported assets get `imported: true` in their metadata, distinguishing them from built-in sources.

### In the Studio

The Assets screen provides browsing, filtering by tags and source type, and an import badge for imported assets. From any asset, you can jump to Sample Lab for detailed editing.

## Trim and Loop Editing

### Trimming

`applyTrim(asset, startMs, endMs)` sets the playback region of an asset. This is non-destructive — the original file is unchanged, and the trim boundaries are stored in metadata.

`resolveTrimRegion(asset)` returns the effective trim region, falling back to `0 → durationMs` if no trim is set.

### Loop Points

`applyLoopPoints(asset, loopStartMs, loopEndMs)` defines the loop region within an asset. The loop region can be a subset of the trim region — useful for sustain loops in melodic samples.

`resolveLoopRegion(asset)` returns the effective loop region.

## Slicing

### Even Slicing

`sliceEvenly(assetId, startMs, endMs, count)` divides a region into equal parts. Useful for chopping drum loops into individual hits.

### Onset-Based Slicing

`sliceAtOnsets(assetId, onsets, totalEndMs)` slices at specific time points — useful when you know where the transients are.

Each slice is a `SampleSlice` with `assetId`, `startMs`, `endMs`, and a `name`.

## Building Kits

### Creating a Kit

`createKit(id, name)` creates an empty `SampleKit`. Add slots with `addKitSlot(kit, slot)`:

```ts
const kit = createKit("kit-1", "My Drum Kit");
const withKick = addKitSlot(kit, { pitch: 36, sliceId: "kick-slice-1" });
const withSnare = addKitSlot(withKick, { pitch: 38, sliceId: "snare-slice-1" });
```

### From Slices

`kitFromSlices(id, name, slices, basePitch)` builds a kit by mapping an array of slices to ascending MIDI pitches starting from `basePitch` (default: 36, MIDI C1).

### Kit Utilities

- `removeKitSlot(kit, pitch)` — remove a slot by pitch
- `updateKitSlot(kit, pitch, update)` — update slot properties
- `kitAssetIds(kit)` — list all asset IDs referenced by the kit
- `findDuplicateSlotPitches(kit)` — detect MIDI pitch collisions

## Building Sample Instruments

### Creating an Instrument

`createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)` creates a pitched instrument from a single audio source:

- **rootNote**: The MIDI note at which the sample plays at original pitch
- **pitchMin / pitchMax**: The playable MIDI range (default: 0–127)

### Playback Rate

`pitchToPlaybackRate(rootNote, targetNote)` calculates the playback speed ratio for pitch shifting. A sample with `rootNote: 60` played at note 72 produces `playbackRate: 2.0` (one octave up).

### Range Utilities

- `isInRange(instrument, note)` — check if a note is within the instrument's range
- `rangeSpan(instrument)` — total number of playable notes

## Common Workflows

### Drum Kit from a Loop

1. Import a drum loop as an audio asset
2. Open in Sample Lab
3. Slice evenly (or at onsets)
4. Build a kit from slices with `kitFromSlices`
5. Use the kit in clips — each kit slot is a playable MIDI note

### Melodic Instrument from a Single Sample

1. Import a tonal sample (e.g., a synth note, a guitar pluck)
2. Open in Sample Lab
3. Trim to the clean sustain region
4. Set loop points if needed
5. Create a sample instrument with the correct root note
6. Use in clips — the engine pitch-shifts the sample for each note

### Texture from Field Recordings

1. Import a long ambient recording
2. Slice into interesting sections
3. Build a kit — each slice becomes a triggerable texture
4. Use in a scene as an ambient layer triggered by game state
