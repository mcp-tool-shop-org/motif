# Repository Overview

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
│   ├── instrument-rack/ # Synth/drum voice management, presets
│   ├── music-theory/  # Scales, chords, motifs, intensity transforms
│   ├── playback-engine/ # Real-time playback, mixing, FX, rendering
│   ├── scene-mapper/  # Trigger mapping and binding evaluation
│   ├── runtime-pack/  # Runtime export/import
│   ├── review/        # Summaries and audit helpers (placeholder)
│   ├── ui/            # Shared UI components (placeholder)
│   ├── test-kit/      # Fixtures and test utilities
│   ├── sample-lab/    # Trim, slice, kit, and instrument helpers
│   ├── score-map/     # World scoring, motifs, profiles, cue families
│   ├── automation/    # Lanes, macros, envelopes, capture
│   └── library/       # Templates, snapshots, branches, favorites, compare
├── site/              # Landing page (Starlight + site-theme)
├── examples/          # Example packs and starter content
├── handbook/          # This handbook
├── eslint.config.js   # Shared ESLint configuration
├── tsconfig.base.json # Shared TypeScript base config
├── turbo.json         # Turborepo pipeline configuration
├── vitest.config.ts   # Root Vitest configuration
└── pnpm-workspace.yaml
```

## Why a Monorepo

Motif uses a monorepo because:

- **Shared types**: The `@motif/schema` package defines all types. Every other package imports from it. A monorepo makes this dependency trivial.
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
| `clip-engine` | Clip sequencing, transforms, cue scheduling | Playback, rendering |
| `instrument-rack` | Synth/drum voices, presets, MIDI mapping | Audio DSP, effects |
| `music-theory` | Scales, chords, motifs, intensity transforms | Playback, UI |
| `playback-engine` | Transport, mixing, FX, cue rendering | Composition, scene mapping |
| `sample-lab` | Trim, slice, kit, instrument logic | Audio file decoding |
| `score-map` | Motifs, profiles, cue families, derivation | Playback, rendering |
| `automation` | Lanes, macros, envelopes, capture | Audio DSP |
| `library` | Templates, snapshots, branches, favorites | UI, persistence |
| `scene-mapper` | Trigger evaluation, binding resolution | Scene composition, playback |
| `runtime-pack` | Export/import, field stripping, validation | Playback SDKs |
| `review` | Pack summaries, audit reports | Schema validation |
| `ui` | Shared UI primitives | State management, routing |
| `test-kit` | Fixtures, loader utilities | Application tests |

## Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| pnpm | 10.x | Package management |
| Turborepo | 2.x | Build orchestration |
| TypeScript | 5.9+ | Type checking and compilation |
| Vitest | 3.2+ | Unit and integration testing |
| ESLint | 9.x | Linting |
| Next.js | 15.x | Studio app framework |
| Zustand | 5.x | Studio state management |
| Zod | 4.x | Schema validation |

## Build Configuration

All packages use project references with `composite: true` in `tsconfig.json`, extending `../../tsconfig.base.json`. The base config targets ES2022 with ESNext modules and bundler module resolution.

Each package has:
- `package.json` with `build`, `lint`, and `test` scripts
- `tsconfig.json` extending the base
- `vitest.config.ts` for test configuration
- `src/` with a barrel `index.ts`
- `test/` with `index.test.ts`
