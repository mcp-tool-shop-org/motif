<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/clip-engine

Audio clip sequencing, composition, and transformation engine for Motif.

## What It Owns

- Clip playback and scene clip assignment
- Note scheduling and quantized launch timing
- Composition transforms (transpose, invert, reverse, octave shift, rhythm scale)
- Variation tools (rhythmic, melodic, thin, densify, accents, ghost hits)
- Intensity derivation (low/mid/high, tension, brighten, pad voicing, bass line, arpeggiate)
- Chord tools (diatonic chords, chord palette, progressions)
- Cue scheduling and section resolution

## Key Exports

```ts
import {
  ClipPlayer,
  SceneClipPlayer,
  scheduleNotes,
  clipTranspose,
  clipInvert,
  clipReverse,
  resolveCuePlan,
  chordPalette,
  diatonicChords,
} from "@motif-studio/clip-engine";
```

### Playback
- `ClipPlayer` — plays individual clips with note scheduling
- `SceneClipPlayer` — assigns and plays clips within scenes

### Transforms
- `clipTranspose`, `clipInvert`, `clipReverse`, `clipOctaveShift`, `clipRhythmScale`
- `clipDuplicateWithVariation`, `clipSnapToScale`, `clipFindOutOfScale`

### Variations
- `clipRhythmicVariation`, `clipMelodicVariation`, `clipThinNotes`, `clipDensifyNotes`
- `clipAccentEveryN`, `clipAddGhostHits`, `clipRemoveGhostHits`

### Intensity
- `clipDeriveIntensity`, `clipAddTension`, `clipBrighten`
- `clipPadVoicing`, `clipBassLine`, `clipArpeggiate`

### Cue Scheduling
- `resolveCuePlan`, `sectionAtTick`, `sectionAtBar`
- `cueSecondsToTick`, tick/bar/beat conversion utilities

## Dependencies

- `@motif-studio/schema` — types for clips, notes, cues
- `@motif-studio/instrument-rack` — voice management for playback
- `@motif-studio/music-theory` — scale/chord/motif primitives
