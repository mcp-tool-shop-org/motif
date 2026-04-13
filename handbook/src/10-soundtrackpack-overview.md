# SoundtrackPack Overview

The `SoundtrackPack` is the root document of every Motif project. It contains all entities needed to describe, compose, and export an adaptive soundtrack.

## Structure

```typescript
interface SoundtrackPack {
  meta: SoundtrackPackMeta
  assets: AudioAsset[]
  stems: Stem[]
  scenes: Scene[]
  bindings: TriggerBinding[]
  transitions: TransitionRule[]
  clips?: Clip[]
  instruments?: Instrument[]
  sampleSlices?: SampleSlice[]
  sampleKits?: SampleKit[]
  sampleInstruments?: SampleInstrument[]
  cues?: Cue[]
  automationLanes?: AutomationLane[]
  macroMappings?: MacroMapping[]
  envelopes?: Envelope[]
  captures?: Capture[]
  motifFamilies?: MotifFamily[]
  scoreProfiles?: ScoreProfile[]
  cueFamilies?: CueFamily[]
  scoreMapEntries?: ScoreMapEntry[]
  derivations?: Derivation[]
  templates?: Template[]
  snapshots?: Snapshot[]
  branches?: Branch[]
  favorites?: Favorite[]
  collections?: Collection[]
}
```

## Meta

Every pack carries `SoundtrackPackMeta`: `id`, `name`, `version`, `description`, `author`, and `schemaVersion` (currently `"1"`).

## Entity Layers

| Layer | Entities | Purpose |
|-------|----------|---------|
| **Assets** | AudioAsset, SampleSlice, SampleKit, SampleInstrument | Raw audio material |
| **Composition** | Clip, Instrument, Stem | Musical building blocks |
| **Structure** | Scene, SceneLayerRef, SceneClipRef, Cue | Playback organization |
| **Adaptation** | TriggerBinding, TransitionRule | Runtime behavior |
| **Scoring** | MotifFamily, ScoreProfile, CueFamily, ScoreMapEntry, Derivation | World coherence |
| **Expression** | AutomationLane, MacroMapping, Envelope, Capture | Dynamic control |
| **Recall** | Template, Snapshot, Branch, Favorite, Collection | Creative workflow |

## Validation

All entity arrays are validated by Zod schemas in `@motif-studio/schema`. Cross-reference integrity is checked by `@motif-studio/asset-index`. Pack-level completeness is assessed by `@motif-studio/review`.
