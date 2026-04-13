---
title: Beginner's Guide to Motif
description: Everything you need to know to start composing adaptive game music with Motif
sidebar:
  order: 99
---

This guide walks you through Motif from zero. By the end you will understand what the tool does, how to set it up, and how to create your first adaptive soundtrack.

## 1. What Motif Does

Motif is an adaptive soundtrack studio for games. It lets you compose music, arrange it into scenes, bind those scenes to game states, and export a runtime pack that a game engine can consume.

Unlike a DAW, Motif models game concepts directly. Scenes represent musical states (exploration, combat, stealth). Trigger bindings map runtime conditions to scenes. Transitions define how music moves between states. The result is a score that adapts to gameplay -- not a static audio file.

Motif runs entirely in the browser. There is no server, no cloud sync, and no telemetry. Your data stays local.

### Key concepts at a glance

| Concept | What it is |
|---------|-----------|
| **Audio Asset** | A file reference (loop, oneshot, stinger, ambient) with metadata |
| **Stem** | A playable layer bound to an asset with a role (base, danger, combat, boss, recovery, mystery, faction, accent) |
| **Scene** | A named musical state built from stem layers |
| **Trigger Binding** | A rule mapping game state to a scene, with priority-based resolution |
| **Transition Rule** | How music moves between scenes (crossfade, bar-sync, immediate, cooldown-fade, stinger-then-switch) |
| **Clip** | A composed musical idea with notes, instrument, scale, and intensity variants |
| **Runtime Pack** | The stripped-down JSON bundle shipped to the game engine |

## 2. Installation and Setup

### Using packages from npm

Install the packages you need from the `@motif` scope:

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

All 16 packages are published individually, so you can pick only what your project requires. Common starting combinations:

- **Game runtime integration**: `@motif/schema` + `@motif/scene-mapper` + `@motif/runtime-pack`
- **Composition tools**: `@motif/schema` + `@motif/clip-engine` + `@motif/music-theory`
- **Sample workflow**: `@motif/schema` + `@motif/sample-lab`
- **Full authoring stack**: All packages

### Running the monorepo locally

Prerequisites: **Node.js >= 22** and **pnpm >= 10**.

```bash
git clone https://github.com/mcp-tool-shop-org/motif.git
cd motif
pnpm install
pnpm build
pnpm test        # 663 tests across all packages
pnpm dev         # Start the Studio dev server
```

The Studio app opens in your browser at `http://localhost:3000`. Everything else (schema, engines, sample-lab, etc.) is available as importable packages.

### Verifying the build

Run the full verification suite to confirm everything works:

```bash
pnpm verify      # lint + typecheck + test + build
```

If any step fails, check that you have the correct Node.js and pnpm versions.

## 3. Core Workflow Overview

Motif follows a composition-first pipeline. You compose real music, then connect it to game logic.

### Step-by-step pipeline

1. **Import assets** -- Bring audio files into the project as AudioAssets. Use `buildImportedAsset(filename, durationMs, src)` from `@motif/sample-lab` to create assets programmatically. The function infers source type from the filename and assigns an appropriate kind.

2. **Prepare samples** (optional) -- In the Sample Lab screen, trim audio with `applyTrim(asset, startMs, endMs)`, set loop points with `applyLoopPoints(asset, loopStartMs, loopEndMs)`, slice regions with `sliceEvenly()` or `sliceAtOnsets()`, and build kits or sample instruments.

3. **Compose clips** -- Create clips with notes, instruments, scales, and chords. Use clip transforms (`clipTranspose`, `clipInvert`, `clipOctaveShift`, `clipArpeggiate`, `clipDeriveIntensity`, and many more from `@motif/clip-engine`) to generate variants for adaptive layering.

4. **Build scenes** -- Arrange stems and clips into scenes. Each scene is a stack of layers with gain, mute/solo, section role, and intensity settings. Scenes represent distinct musical states in your game.

5. **Bind scenes to game state** -- Create trigger bindings that map runtime conditions (region, combat status, danger level) to scenes. Higher priority wins when multiple bindings match. Pack order is the tie-breaker.

6. **Define transitions** -- Set how music moves between scenes: crossfade with a duration, bar-sync for musical timing, immediate for instant cuts, or stinger-then-switch for dramatic moments.

7. **Export** -- Use `exportRuntimePack(pack)` from `@motif/runtime-pack` to produce a stripped-down JSON bundle. The runtime pack contains only scenes, bindings, transitions, and asset references -- no authoring data.

## 4. Architecture at a Glance

Motif is a TypeScript monorepo with two apps and 14 library packages.

### Apps

| App | Stack | Purpose |
|-----|-------|---------|
| `apps/studio` | Next.js 15, Zustand 5 | Main authoring UI with 14+ screens |
| `apps/docs` | Astro + Starlight | Documentation site (this handbook) |

### Key packages

| Package | Responsibility |
|---------|---------------|
| `@motif/schema` | Canonical types, Zod 4 schemas, parse/validate |
| `@motif/clip-engine` | Clip sequencing, 30+ transforms, cue scheduling |
| `@motif/music-theory` | Scales, chords, motifs, intensity transforms |
| `@motif/playback-engine` | Real-time playback, mixing, effects, rendering |
| `@motif/audio-engine` | Sample playback, layers, transitions, voice management |
| `@motif/scene-mapper` | Trigger evaluation, deterministic scene resolution |
| `@motif/runtime-pack` | Export/import with deterministic serialization |
| `@motif/sample-lab` | Trim, slice, kit builder, sample instruments, import |
| `@motif/automation` | Lanes, macros, envelopes, live capture |
| `@motif/library` | Templates, snapshots, branches, favorites, compare |
| `@motif/score-map` | Motif families, score profiles, cue families, derivation |
| `@motif/instrument-rack` | Synth and drum voice management with presets |

All packages import types from `@motif/schema`. The schema is the single source of truth for the entire data model.

### Toolchain

pnpm 10 for package management, Turborepo for build orchestration, TypeScript 5.8+, Vitest 3.2+ for testing, ESLint 9, Prettier for formatting.

## 5. Navigating the Studio

The Studio is a single-page app with sidebar navigation. Each section maps to a screen:

| Section | What you do there |
|---------|------------------|
| **Project** | View pack metadata, entity counts, audit summary |
| **Assets** | Browse, filter, import, and manage audio assets |
| **Stems** | Create stems bound to assets with roles |
| **Scenes** | Build scenes from stem layers |
| **Clips** | Compose clips with notes, instruments, and variants |
| **Bindings** | Map game state conditions to scenes |
| **Transitions** | Define scene-to-scene transition behavior |
| **Sample Lab** | Import, trim, slice, build kits and instruments |
| **Score Map** | Profiles, motif families, cue families, world map, derivation |
| **Automation** | Lanes, macros, envelopes, capture, mixer |
| **Library** | Templates, snapshots, branches, favorites, collections, compare |

Screens are interconnected. Assets created in the Assets screen appear in Sample Lab. Clips composed in Clips feed into scenes. Scenes referenced in Bindings drive runtime behavior.

### State management

The Studio uses a single Zustand store holding the entire `SoundtrackPack` (the authoring document), the current navigation section, filter state, and macro state. All mutations are immutable updates -- there is no separate backend. The pack lives in memory and is loaded from / saved to JSON.

## 6. Common Beginner Mistakes

### Skipping scene structure and going straight to bindings

Bindings reference scenes. If you create bindings before building scenes, you will have dangling references. Always compose scenes first, then bind them.

### Ignoring priority when multiple bindings match

Motif uses deterministic priority resolution. When multiple trigger bindings match the current game state, the binding with the highest priority number wins. If priorities are equal, pack order (the order bindings appear in the array) is the tie-breaker. Forgetting to set distinct priorities leads to unpredictable scene selection.

### Confusing the authoring pack with the runtime pack

The `SoundtrackPack` is the full authoring document -- it contains everything: clips, notes, automation data, library snapshots, score map entries. The runtime pack (`exportRuntimePack()`) strips all of that away, keeping only scenes, bindings, transitions, assets, and stems. Do not try to load an authoring pack directly into a game engine.

### Not using intensity variants

Clips support intensity variants for adaptive layering. A single clip with low/mid/high variants lets scenes respond to game intensity without requiring entirely separate compositions. Skipping variants means your adaptive score has fewer levers to pull.

### Over-modeling the world scoring layer

The Score Map (motif families, score profiles, cue families, world map entries) exists to give music coherent relationships to game regions and encounters. It is not a game design tool. Keep context types simple (`region`, `faction`, `biome`, `encounter`, `safe-zone`) and let the music lead. A score profile that says "Frostlands: slow tempo, D minor, orchestral" is enough -- you do not need to model every NPC or quest.

### Forgetting to snapshot before destructive edits

The Library system exists for this reason. Before reworking a scene, snapshot it with `takeSnapshot()`. Before branching in a new direction, snapshot. Snapshots are cheap (they store a serialized copy of the entity data) and let you revert with `restoreSnapshot()` or compare with `compareEntities()` at any time.

### Mixing up the `includes` operator with `in` or `contains`

The trigger condition system uses only one array/string membership operator: `includes`. It works on both arrays (does the array contain this value?) and strings (does the string contain this substring?). There is no separate `in` or `contains` operator.

## 7. Where to Go Next

Once you are comfortable with the basics, explore these handbook sections in order:

1. **[Building a Cue from Scratch](/motif/handbook/workflows/building-a-cue/)** -- A complete end-to-end walkthrough from score profile to runtime export. This is the single best tutorial for understanding the full pipeline.

2. **[Working with Custom Samples](/motif/handbook/workflows/custom-samples/)** -- Learn the Sample Lab workflow: import, trim, slice, build kits and instruments from raw audio.

3. **[World Scoring](/motif/handbook/workflows/world-scoring/)** -- Connect your music to game geography, factions, and encounters using motif families, score profiles, and cue families.

4. **[Automation and Capture](/motif/handbook/workflows/automation-capture/)** -- Add expressive time-varying control with automation lanes, macros, section envelopes, and live performance capture.

5. **[Library, Branching, and Reuse](/motif/handbook/workflows/library-branching/)** -- Master templates, snapshots, branches, favorites, and compare for efficient creative iteration.

6. **[Rendering and Export](/motif/handbook/strategy/rendering-export/)** -- Understand the difference between authoring packs and runtime packs, deterministic serialization, and what game engines expect.

7. **[Glossary](/motif/handbook/strategy/glossary/)** -- Reference definitions for every core entity and concept in Motif.

For the full architecture and design philosophy, start with the [Product](/motif/handbook/product/) and [Architecture](/motif/handbook/architecture/) sections.
