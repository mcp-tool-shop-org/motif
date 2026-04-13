# Testing Strategy

## Philosophy

Every package has its own test suite. Tests validate behavior, not implementation details. Fixtures live in `@motif-studio/test-kit` and are shared across packages.

## Test Structure

```
packages/
  <package>/
    test/
      <package>.test.ts   # or index.test.ts
```

Each package has a `vitest.config.ts` extending the root configuration.

## What Gets Tested

| Layer | What's Tested | Package |
|-------|--------------|---------|
| Schema validation | Field types, enums, cross-field refinements, parse/safe-parse | `schema` |
| Integrity | Broken refs, duplicates, unused entities, self-references | `asset-index` |
| Scene resolution | Condition evaluation, priority, tie-breaking, fallbacks | `scene-mapper` |
| Composition | Transforms, variations, intensity derivation, chord tools | `clip-engine` |
| Music theory | Scales, chords, motifs, pitch operations | `music-theory` |
| Playback | Transport, mixer, FX, scene/transition/sequence players | `playback-engine` |
| Audio | Trimmed regions, slices, kits, pitched instruments | `audio-engine` |
| Sample workflow | Trim, slice, kit, instrument, import | `sample-lab` |
| World scoring | Motifs, profiles, cue families, resolution, derivation | `score-map` |
| Automation | Lanes, interpolation, macros, envelopes, capture | `automation` |
| Library | Templates, snapshots, branches, favorites, collections, compare | `library` |
| Instruments | Factory presets, voice creation, MIDI mapping | `instrument-rack` |
| Studio | Store CRUD, playback integration, preview, export, navigation | `studio` |

## Web Audio Mocking

Packages that interact with the Web Audio API (`audio-engine`, `playback-engine`, `clip-engine`) use mock AudioContext and node objects. Mocks are module-scoped and provide enough fidelity to test timing, routing, and state management without actual audio output.

## Running Tests

```bash
pnpm test           # All packages via Turborepo
pnpm vitest run     # Direct Vitest execution
pnpm vitest --ui    # Interactive test UI
```

Coverage is collected via `@vitest/coverage-v8` and uploaded to Codecov on main branch pushes.
