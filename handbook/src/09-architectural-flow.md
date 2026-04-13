# Architectural Flow

This chapter describes how Motif's packages relate, how data flows through the system, and how the authoring-to-runtime path works.

## Package Dependency Graph

Dependencies flow strictly downward. No circular references exist.

```
                    ┌──────────────┐
                    │    schema    │  (zero internal deps)
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────────┐
          │                │                    │
    ┌─────┴──────┐   ┌────┴─────┐   ┌──────────┴──────────┐
    │ music-theory│   │ test-kit │   │     asset-index      │
    │ (zero deps) │   │          │   │                      │
    └─────┬──────┘   └──────────┘   └──────────────────────┘
          │
    ┌─────┴──────────────────────────────────┐
    │                                        │
┌───┴────────────┐               ┌───────────┴──────────┐
│ instrument-rack │               │     scene-mapper     │
└───┬────────────┘               └───────────┬──────────┘
    │                                        │
┌───┴────────────┐               ┌───────────┴──────────┐
│  clip-engine   │               │    audio-engine       │
│  (+ music-     │               └───────────┬──────────┘
│   theory)      │                           │
└───┬────────────┘               ┌───────────┴──────────┐
    │                            │   playback-engine     │
    │                            │   (+ audio-engine,    │
    │                            │    scene-mapper)      │
    │                            └──────────────────────┘
    │
┌───┴────────────┐  ┌────────────┐  ┌────────────────┐
│   sample-lab   │  │ score-map  │  │   automation   │
└────────────────┘  └────────────┘  └────────────────┘

┌────────────────┐  ┌────────────┐  ┌────────────────┐
│    library     │  │   review   │  │  runtime-pack  │
└────────────────┘  └────────────┘  └────────────────┘

                    ┌────────────┐
                    │     ui     │
                    └────────────┘

          ┌─────────────────────────────────┐
          │            studio               │
          │  (consumes nearly everything)   │
          └─────────────────────────────────┘
```

All packages at the bottom row depend only on `@motif-studio/schema`. The middle tier adds inter-package references (`clip-engine` → `instrument-rack` + `music-theory`; `playback-engine` → `audio-engine` + `scene-mapper`). Studio sits at the top and imports from almost every package.

## Data Flow

### Authoring → Pack → Runtime

```
  ┌─────────────────────────────────────────────────┐
  │                  STUDIO (UI)                     │
  │                                                  │
  │  Assets → Stems → Scenes → Bindings → Transitions │
  │    │         │        │         │          │      │
  │  Clips    Instruments  Layers   Triggers  Rules  │
  │    │         │        │                          │
  │  Score Map  Automation  Library                  │
  └──────────────────────┬──────────────────────────┘
                         │
                    ┌────┴─────┐
                    │  schema  │  validates in / out
                    └────┬─────┘
                         │
                  ┌──────┴──────┐
                  │ runtime-pack│  strips authoring-only fields
                  └──────┬──────┘
                         │
                  ┌──────┴──────┐
                  │  Game Engine │  consumes RuntimeSoundtrackPack
                  └─────────────┘
```

1. The creator authors entities in Studio (assets, stems, scenes, bindings, transitions, clips, automation, etc.)
2. All entity data conforms to `@motif-studio/schema` Zod schemas
3. `@motif-studio/runtime-pack` strips authoring-only metadata (names, notes, editor state) and produces a minimal `RuntimeSoundtrackPack`
4. The game engine consumes the pack and uses trigger bindings + transition rules for real-time scene resolution

### Playback Flow (Preview / Render)

```
  Trigger State Change
         │
  ┌──────┴──────┐
  │ scene-mapper │  evaluates bindings → resolves winning scene
  └──────┬──────┘
         │
  ┌──────┴──────┐
  │ audio-engine │  voice management, sample playback
  └──────┬──────┘
         │
  ┌──────┴──────────┐
  │ playback-engine  │  Transport, Mixer, FX, ScenePlayer,
  │                  │  TransitionPlayer, CueRenderer
  └──────┬──────────┘
         │
    Web Audio API
```

1. A game state change (or preview simulation) triggers `scene-mapper` to evaluate all `TriggerBinding` conditions
2. The winning scene's layers are resolved to stems
3. `audio-engine` manages voice allocation and sample playback for each stem
4. `playback-engine` coordinates the Transport, Mixer, effects chain, and scene/transition players
5. `CueRenderer` can offline-render cues to audio buffers for export

### Composition Flow

```
  music-theory  →  clip-engine  →  cue scheduler
  (scales,         (notes,          (sections,
   chords,          transforms,      timing,
   motifs)          variations)      playback)
       │                │
       └──────┬─────────┘
              │
  instrument-rack  →  audio-engine
  (synth voices,       (sample playback,
   drum voices,         pitch shifting)
   presets)
```

1. `music-theory` provides the harmonic vocabulary (scales, chords, motif transforms, intensity derivation)
2. `clip-engine` uses that vocabulary to sequence notes, apply transforms, and generate variations
3. `instrument-rack` provides the voices (synth oscillators, drum samples, factory presets)
4. `audio-engine` plays the actual audio with pitch shifting, ADSR envelopes, and voice lifecycle

### World Scoring Flow

```
  score-map
    │
    ├── Motif Families  (thematic material shared across scenes)
    ├── Score Profiles  (tempo, intensity, palette per region/faction)
    ├── Cue Families    (grouped scenes by narrative role)
    ├── Score Map Entries (region/faction/encounter → profiles + families)
    └── Derivation      (new scenes derived from existing material)
```

World scoring connects musical decisions to game geography. A score map entry links a game context (forest region, bandit faction, boss encounter) to a score profile and cue families, which in turn reference motif families and scenes. Derivation records trace how new material evolves from existing material.

## Validation Layers

Motif validates at three levels:

| Layer | Package | What It Checks |
|-------|---------|---------------|
| **Schema** | `schema` | Field types, enums, value ranges, required fields, cross-field refinements |
| **Integrity** | `asset-index` | Cross-references (broken refs, unused entities, duplicates, self-references) |
| **Completeness** | `review` | Product-level coverage (missing scene categories, orphan triggers, transition gaps) |

## Key Architectural Invariants

1. **Schema is the source of truth.** Every package imports types from `@motif-studio/schema`. No package defines its own entity types.
2. **No circular dependencies.** The dependency graph is a strict DAG.
3. **Deterministic everywhere.** Scene resolution, transition selection, and export serialization produce identical results given identical inputs.
4. **Separation of model and playback.** `audio-engine` and `scene-mapper` define the abstract model. `playback-engine` connects that model to Web Audio.
5. **Authoring-only fields never leak to runtime.** `runtime-pack` strips editor metadata before export.
