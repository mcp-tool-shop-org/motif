# Asset Model

## AudioAsset

The fundamental unit of sound in Motif.

```typescript
interface AudioAsset {
  id: string
  name: string
  src: string
  kind: 'loop' | 'oneshot' | 'stinger' | 'ambient'
  durationMs: number
  bpm?: number
  key?: string
  tags?: string[]
  loopStartMs?: number
  loopEndMs?: number
  trimStartMs?: number
  trimEndMs?: number
  sourceType?: string
  rootNote?: number
  originalFilename?: string
  imported?: boolean
  notes?: string
}
```

### Required Fields

- `id` — unique identifier
- `name` — human-readable label
- `src` — relative path or URL to the audio file
- `kind` — behavioral category: `loop` (repeating), `oneshot` (fire-and-forget), `stinger` (short transition accent), `ambient` (background texture)
- `durationMs` — total duration in milliseconds (must be > 0)

### Optional Fields

- `bpm` / `key` / `tags` — musical metadata for sorting and matching
- `loopStartMs` / `loopEndMs` — loop region within the asset (validated: end > start)
- `trimStartMs` / `trimEndMs` — non-destructive trim boundaries
- `rootNote` — MIDI root note for pitched playback
- `sourceType` — inferred from filename during import
- `imported` — whether the asset was created via the import workflow
- `originalFilename` — preserved from import

### Sample Extensions

Assets can be sliced, mapped to kits, and wrapped in sample instruments:

- `SampleSlice` — a region within an asset identified by start/end offsets
- `SampleKit` — a collection of slices mapped to MIDI pitches
- `SampleInstrument` — a pitched playback instrument built from an asset with root note and range
