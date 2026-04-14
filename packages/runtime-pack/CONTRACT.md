# Motif Runtime Pack Contract v1

## Overview

This document defines the JSON format that game engines consume to play adaptive Motif soundtracks. The runtime pack is a stripped, validated, engine-ready version of the authoring pack.

## Schema Version

All runtime packs use `schemaVersion: "1"`. Engines should reject packs with unrecognized schema versions.

## Pack Structure

```jsonc
{
  "meta": {
    "id": "my-game-soundtrack",
    "name": "My Game Soundtrack",
    "version": "1.0.0",
    "schemaVersion": "1",
    "contentHash": "fnv1a-XXXXXXXXXX",
    "exportedAt": "2026-04-13T12:00:00.000Z"
  },
  "assets": [/* RuntimeAudioAsset[] */],
  "stems": [/* RuntimeStem[] */],
  "scenes": [/* RuntimeScene[] */],
  "bindings": [/* RuntimeTriggerBinding[] */],
  "transitions": [/* RuntimeTransitionRule[] */],
  "stingers": [/* RuntimeStinger[] — optional */]
}
```

## Entity Reference Chain

```
Asset (audio file)
  ↑ referenced by
Stem (role-tagged audio layer)
  ↑ referenced by
Scene Layer (stem + gain + start mode)
  ↑ contained in
Scene (named music state)
  ↑ referenced by
Binding (conditions → scene)
  ↑ evaluated against
Game State (flat key-value map)
```

## Validation

Before loading a pack, engines should run referential integrity checks:

1. All stem.assetId values resolve to existing assets
2. All scene layer stemId values resolve to existing stems
3. All binding.sceneId values resolve to existing scenes
4. All transition scene refs resolve to existing scenes
5. No duplicate IDs within entity types

Use `auditRuntimePack()` from `@motif-studio/runtime-pack` for automated validation.

## Game State Protocol

Engines push state updates as flat key-value maps. See `packages/scene-mapper/PROTOCOL.md` for the full protocol specification including reserved keys.

## Scene Resolution

1. Evaluate all binding conditions against current state
2. Collect matched bindings
3. Sort by priority (highest wins, pack order breaks ties)
4. First binding in sorted order = winning scene

## Stingers

Stingers are optional one-shot audio events that layer on top of scenes. They evaluate independently and fire when their conditions match. See `Stinger` type for duck/fade/cooldown parameters.

## Transitions

When the winning scene changes, the engine looks up a transition rule matching `(fromSceneId, toSceneId)`. If found, applies the transition mode:

| Mode | Behavior |
|------|----------|
| `immediate` | Hard cut to new scene |
| `crossfade` | Fade old scene out while fading new scene in over `durationMs` |
| `bar-sync` | Wait for current bar to end, then switch |
| `stinger-then-switch` | Play stinger asset, switch when stinger ends |
| `cooldown-fade` | Fade current scene to silence over `durationMs`, then start new scene |

## Loop Regions

Scenes and clips may include `loopRegion` with `loopStartMs`, `loopEndMs`, `crossfadeDurationMs`, and `count`. When present, the engine should loop the specified region with optional crossfade.

## Emotion Metadata

Scenes may include `emotion` tags with `valence` (-1 to 1) and `arousal` (-1 to 1). Engines can use this for dynamic mixing hints (e.g., adjust reverb send based on emotional intensity).

## Per-Stem Export

For adaptive in-engine mixing, stems can be exported as individual WAV files. The stem manifest describes file paths, roles, and default gains. See `StemExportManifest` type.

## Versioning

- Schema version `"1"` is the current and only version
- Breaking changes to the pack format increment the schema version
- Non-breaking additions (new optional fields) don't require a version bump
- Engines should reject packs with schema versions they don't support
