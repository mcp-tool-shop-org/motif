# Runtime Pack Contract

The runtime pack is the artifact consumed by game engines.

## Export Process

1. Studio holds the full `SoundtrackPack` with all authoring metadata
2. `@motif-studio/runtime-pack` strips authoring-only fields (names, notes, editor state, internal IDs)
3. The result is a `RuntimeSoundtrackPack` — minimal, validated, and deterministically serialized
4. The pack is re-validated during export to ensure runtime safety

## What Gets Stripped

- Entity names and notes (human labels, not needed at runtime)
- Editor state (selection, scroll position, undo history)
- Library data (templates, snapshots, branches, favorites, collections)
- Score map metadata (profiles, derivation records)

## What Remains

- Assets with kind, duration, src, and loop points
- Stems with role, gain, and asset reference
- Scenes with layers
- Trigger bindings with conditions and priority
- Transition rules with mode and parameters

## Consumer Contract

A game engine consuming a `RuntimeSoundtrackPack` needs to:

1. Parse the JSON (validated by Zod schema)
2. Evaluate trigger bindings against current game state to resolve the active scene
3. Play the scene's layers using its own audio system
4. Apply transition rules when switching between scenes

The deterministic scene resolution logic in `@motif-studio/scene-mapper` serves as the reference implementation.

## Round-Trip Verification

The export pipeline verifies that the exported pack can be re-imported and re-validated, ensuring no data corruption during serialization.
