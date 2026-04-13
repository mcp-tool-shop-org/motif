---
title: Rendering and Runtime Export
description: Audio renders and runtime pack export for game engines
sidebar:
  order: 0
---

Motif produces two kinds of output: audio renders for listening and review, and runtime packs for game engine consumption.

## Authoring Pack vs Runtime Pack

The **authoring pack** (`SoundtrackPack`) is the full source of truth -- all entities, metadata, composition data, library data, and automation. It contains everything: clips with notes, sample lab data, score map metadata, automation lanes, macros, section envelopes, captures, templates, snapshots, branches, favorites, and collections.

The **runtime pack** is what ships to the game. It is produced by `exportRuntimePack(pack)` from `@motif-studio/runtime-pack` and contains only:

- Scenes with their layer references
- Trigger bindings with conditions and priorities
- Transition rules between scenes
- Audio asset references (file paths, metadata)
- Stems with roles and gain settings

The runtime pack deliberately excludes clip composition data, sample lab slicing data, score map metadata, automation authoring data, library snapshots, and all other creative tooling state. It is a deployment artifact, not an authoring document.

## Deterministic Serialization

Both packs serialize to JSON deterministically. Given the same in-memory state, the same JSON output is produced every time. This guarantee means:

- Exported packs can be diffed in version control -- identical inputs produce identical outputs
- Round-trips produce identical results (`serializeRuntimePack` then `parseRuntimePack` is stable)
- Test fixtures are stable across CI runs
- Teams can review pack changes in pull requests

Use `serializeRuntimePack(pack)` for deterministic JSON output and `roundTripRuntimePack(pack)` to verify round-trip integrity.

## What a Game Engine Expects

A game engine consuming a runtime pack needs to implement five things:

1. **Load the pack** -- Parse the JSON and hydrate the data structures
2. **Evaluate trigger bindings** -- Compare each binding's conditions against the current game state. Conditions use operators `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, and `includes`
3. **Resolve the winning scene** -- Highest priority wins among matched bindings; pack order (array index) is the tie-breaker when priorities are equal
4. **Apply transition rules** -- When the active scene changes, find the matching transition rule and apply its mode (`immediate`, `crossfade`, `bar-sync`, `stinger-then-switch`, or `cooldown-fade`)
5. **Play audio** -- Load and play audio assets according to the active scene's layer stack, respecting gain, mute, and start mode settings

The runtime contract is deliberately simple. Motif does the hard compositional work at authoring time so the runtime can be a straightforward state machine.

## Validation

Use `validateRuntimePack(data)` from `@motif-studio/runtime-pack` to check a pack against the runtime schema. Use `safeParseRuntimePack(data)` for a parse-or-fail approach that returns structured validation issues. Schema validation and integrity checks run on both authoring and runtime packs. This is tested in CI.

## Audio Rendering

Motif can render full cue timelines, loop-only sections, preview sequences, and captured performances as WAV files. Rendering uses `OfflineAudioContext` for deterministic offline processing, ensuring the same inputs always produce the same audio output.

## Round-Trip Verification

Export then import should produce a functionally identical pack. The `roundTripRuntimePack(pack)` helper does exactly this -- it exports, serializes, parses, and validates in one call. Use it in tests to confirm that your pack survives the export pipeline intact.
