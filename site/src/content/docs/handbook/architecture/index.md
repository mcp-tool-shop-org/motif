---
title: Repository Overview
description: Monorepo structure, package boundaries, and toolchain
sidebar:
  order: 0
---

Motif is a TypeScript monorepo managed with pnpm workspaces and Turborepo.

## Root Structure

```
motif/
├── apps/              # Deployable applications
│   ├── studio/        # Main authoring UI (Next.js 15)
│   └── docs/          # Documentation site (Astro)
├── packages/          # Shared libraries
│   ├── schema/        # Canonical types and Zod validation
│   ├── asset-index/   # Pack integrity indexing and auditing
│   ├── audio-engine/  # Sample playback and voice management
│   ├── clip-engine/   # Clip sequencing, transforms, cue scheduling
│   ├── instrument-rack/ # Synth/drum voice management with presets
│   ├── music-theory/  # Scales, chords, motifs, intensity
│   ├── playback-engine/ # Real-time playback, mixing, effects
│   ├── scene-mapper/  # Trigger mapping and scene resolution
│   ├── runtime-pack/  # Runtime export/import
│   ├── review/        # Summaries and audit helpers
│   ├── ui/            # Shared UI components
│   ├── sample-lab/    # Trim, slice, kit, instrument helpers
│   ├── score-map/     # World scoring, motifs, profiles, cue families
│   ├── automation/    # Lanes, macros, envelopes, capture
│   ├── library/       # Templates, snapshots, branches, favorites, compare
│   └── test-kit/      # Fixtures and test utilities
├── examples/          # Example packs and starter content
├── handbook/          # Operating manual
├── eslint.config.js   # Shared ESLint configuration
├── tsconfig.base.json # Shared TypeScript base config
├── turbo.json         # Turborepo pipeline configuration
├── vitest.config.ts   # Root Vitest configuration
└── pnpm-workspace.yaml
```

## Why a Monorepo

- **Shared types**: The `@motif/schema` package defines all types. Every other package imports from it.
- **Atomic changes**: A schema change, a logic change, and a UI change can ship in one commit.
- **Consistent tooling**: One ESLint config, one TypeScript base config, one test runner, one CI pipeline.
- **Fast feedback**: `pnpm build && pnpm lint && pnpm test` validates everything.

## Package Boundaries

Each package has a single, clear responsibility:

| Package | Owns | Does Not Own |
|---------|------|--------------|
| `schema` | Types, Zod schemas, parse/validate | Business logic, rendering |
| `asset-index` | Integrity checks, duplicate detection | Asset file I/O |
| `audio-engine` | Sample playback, voice management | Scene orchestration, mixing |
| `clip-engine` | Clip sequencing, transforms, cues | Audio rendering |
| `instrument-rack` | Synth/drum voices, presets | Audio DSP |
| `music-theory` | Scales, chords, motifs, intensity | Playback |
| `playback-engine` | Mixing, effects, rendering | Composition |
| `sample-lab` | Trim, slice, kit, instrument logic | Audio file decoding |
| `score-map` | Motifs, profiles, cue families, derivation | Playback, rendering |
| `automation` | Lanes, macros, envelopes, capture | Audio DSP |
| `library` | Templates, snapshots, branches, favorites | UI, persistence |
| `test-kit` | Fixtures, loader utilities | Application tests |

## Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| pnpm | 10.x | Package management |
| Turborepo | 2.x | Build orchestration |
| TypeScript | 5.8+ | Type checking and compilation |
| Vitest | 3.2+ | Unit and integration testing |
| ESLint | 9.x | Linting |
| Next.js | 15.x | Studio app framework |
| Zustand | 5.x | Studio state management |
| Zod | 4.x | Schema validation |
