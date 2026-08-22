---
title: Studio Overview
description: Navigation map, architecture, and screen relationships
sidebar:
  order: 0
---

The Motif Studio is the main authoring application. It is a single-page Next.js application with a sidebar navigation and screen-based layout.

## Navigation Map

Eighteen screens in four sidebar groups:

| Group | Screen | Purpose |
|-------|--------|---------|
| Create | Arrangement | Channel rack, per-scene clip channels, piano rolls, transport |
| Create | Clip Editor | Compose clips with notes, instruments, and variants |
| Create | Scenes | Build scenes from stem layers and clip layers |
| Create | Mixer | Buses, per-stem routing, pan, FX slots |
| Pack | Project | Pack metadata, entity counts, audit summary |
| Pack | Assets | Browse, filter, and manage audio assets |
| Pack | Stems | Create and edit stems bound to assets |
| Pack | Bindings | Map runtime state to scenes |
| Pack | Transitions | Define scene-to-scene transition behavior |
| Quality | Review | Pack summaries and audit findings |
| Quality | Export | Runtime pack export |
| Advanced | Sample Lab | Import, trim, slice, build kits and instruments |
| Advanced | Score Map | Profiles, motif families, cue families, world map, derivation |
| Advanced | Automation | Lanes, macros, envelopes, capture |
| Advanced | Library | Templates, snapshots, branches, favorites, collections, compare |
| Advanced | Preview | Runtime simulation with pack-derived state controls |
| Advanced | Performance | Live performance surface |
| Advanced | Cues | Cue timelines, section playback, performance capture |

The pack selector in the top strip switches between the bundled packs — the demo packs,
Star Freight: Grounded, and any [generated library packs](/motif/handbook/workflows/generated-cues/)
whose audio has been ingested.

## Architecture

The Studio uses Zustand for state management. The entire application state lives in a single store that holds:

- The active `SoundtrackPack` (the authoring document)
- The current navigation section
- Filter/search state for assets
- Macro state for automation

All CRUD operations on the pack are store actions that produce immutable updates. There is no separate backend — the Studio operates on an in-memory pack loaded from JSON.

## Screen Relationships

Screens are not isolated. Entities created in one screen appear in others:

- **Assets** created or imported in the Assets screen are available in Sample Lab for trimming and slicing
- **Slices** created in Sample Lab feed into Sample Kits and Sample Instruments
- **Clips** composed in the Clips screen reference instruments and are used in scene layers
- **Scenes** built in the Scenes screen are referenced by bindings, transitions, cue families, and world map entries
- **Score Profiles** and **Motif Families** defined in Score Map are used by cue families and world map entries
- **Automation Lanes** and **Macros** affect mixer parameters and scene behavior
- **Templates, Snapshots, and Favorites** in Library can reference any entity kind

## Preview and Binding Resolution

The Preview screen simulates runtime state and shows which binding wins, which scene resolves, and which stems play.

Its controls are **derived from the loaded pack's own bindings** rather than from a fixed field list. Alongside the built-in mode / danger / flag controls, Preview reads every binding condition in the pack and renders an input for each field it does not already cover — a picker for `eq` comparisons against strings, a checkbox for booleans, a number for `gt`/`lt` comparisons, text otherwise.

This matters because packs bind on very different things. A demo pack binds on `mode` and `danger`. A game score binds on `location` and `combat_active`. A generated library pack binds on `cue`. A pack binding on fields the simulator cannot set resolves nothing at all — so the controls follow the pack, not the other way round.

A pack whose bindings form a flat menu over one field is seeded to its first value on load, so Preview opens resolved and playable. A multi-axis pack is left unset on purpose — seeding it would mean asserting several unrelated game-state flags simultaneously — and shows "no scene resolved" until you set a field.

## Where to Start

For a new project:
1. Start at **Assets** — import or review your audio sources
2. Move to **Sample Lab** if you need to trim, slice, or build kits/instruments
3. Build **Clips** — compose note patterns with instruments
4. Arrange **Scenes** — layer stems and clips into musical states
5. Set up **Bindings** and **Transitions** — connect scenes to game logic
6. Structure **Cues** in the Score Map — link cue families and motif families
7. **Automate** — add expressive lanes, macros, and envelopes
8. Use **Library** — snapshot, branch, template, and compare as you iterate
