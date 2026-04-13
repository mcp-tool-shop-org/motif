---
title: Getting Started
description: Set up Motif and start composing adaptive game music
sidebar:
  order: 0
---

This section covers everything you need to get Motif running and start creating adaptive soundtracks for games.

## Prerequisites

- **Node.js 22** or later
- **pnpm 10** or later (for monorepo development)
- A modern browser (Chrome, Firefox, or Edge) for the Studio app

## Quick Install (npm packages)

If you want to use Motif packages in your own project, install from npm:

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

All 16 packages are published individually under the `@motif` scope. Pick only what your project needs:

| Package | Use when you need |
|---------|------------------|
| `@motif/schema` | Types, Zod validation, parse/validate |
| `@motif/clip-engine` | Clip composition, transforms, cue scheduling |
| `@motif/music-theory` | Scales, chords, motifs, intensity |
| `@motif/sample-lab` | Audio import, trim, slice, kit/instrument building |
| `@motif/scene-mapper` | Trigger evaluation and scene resolution |
| `@motif/runtime-pack` | Export/import runtime packs for game engines |
| `@motif/automation` | Lanes, macros, envelopes, capture |
| `@motif/library` | Templates, snapshots, branches, favorites, compare |
| `@motif/audio-engine` | Sample playback and voice management |
| `@motif/playback-engine` | Mixing, effects, rendering |
| `@motif/instrument-rack` | Synth and drum voice presets |
| `@motif/score-map` | World scoring, motifs, profiles, cue families |
| `@motif/asset-index` | Pack integrity indexing and auditing |
| `@motif/review` | Summaries and audit helpers |
| `@motif/ui` | Shared UI components |
| `@motif/test-kit` | Fixtures and test utilities |

## Running the Monorepo

Clone and build the full monorepo to develop locally or run the Studio:

```bash
git clone https://github.com/mcp-tool-shop-org/motif.git
cd motif
pnpm install
pnpm build
pnpm test        # 663 tests across all packages
pnpm dev         # Start the Studio dev server
```

The Studio opens in your browser at `http://localhost:3000`. All packages are built with Turborepo for fast incremental builds.

## Verify Your Setup

After building, run the full verification suite:

```bash
pnpm verify      # lint + typecheck + test + build
```

If all steps pass, your environment is ready.

## Next Steps

- **[Beginner's Guide](/motif/handbook/getting-started/beginners/)** -- Walk through Motif from zero: concepts, setup, first project, and common pitfalls
- **[Building a Cue from Scratch](/motif/handbook/workflows/building-a-cue/)** -- End-to-end tutorial from score profile to runtime export
- **[API Reference](/motif/handbook/getting-started/reference/)** -- Package-by-package function reference
