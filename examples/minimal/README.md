# Minimal Pack

The smallest valid SoundtrackPack. Use this to understand the base structure before adding complexity.

## What's Inside

- 1 audio asset (looping base layer)
- 1 stem
- 1 scene (exploration)
- 1 binding (mode-based trigger)

## What It Demonstrates

- Required pack fields (`id`, `version`, `name`, `assets`, `stems`, `scenes`, `bindings`)
- Single-asset-to-stem-to-scene flow
- Condition-based binding (`mode = "exploration"`)

## Try It In Studio

1. Open the **Project** screen — you'll see the pack metadata
2. Open **Assets** — one looping audio file
3. Open **Stems & Scenes** — one stem feeding one scene
4. Open **Score Map** — empty, because this pack has no world scoring

This is the "hello world" of Motif packs.
