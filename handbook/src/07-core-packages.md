# Core Packages

These packages form the foundation of every Motif operation.

## `@motif/schema`

The single source of truth for all entity types. Every other package imports from here.

- TypeScript interfaces for all entities (AudioAsset, Stem, Scene, TriggerBinding, TransitionRule, SoundtrackPack, and 20+ supporting types)
- Zod schemas with field-level validation, cross-field refinements, and enum enforcement
- `parseSoundtrackPack` (strict) and `safeParseSoundtrackPack` (safe) parse functions
- `validateSoundtrackPack` returning structured `ValidationIssue[]`

## `@motif/asset-index`

Pack integrity indexing and cross-reference auditing.

- `buildPackIndex` — fast ID-based lookup maps with duplicate detection
- `auditPackIntegrity` — broken refs, self-references, unused entities
- `findUnusedAssets`, `findUnusedStems`, `findUnreferencedScenes`
- `summarizePackIntegrity` — entity counts and finding counts

17 integrity codes covering duplicates, missing references, self-references, and unused entities.

## `@motif/test-kit`

Fixtures and test utilities shared across all packages.

- 13+ JSON fixture files covering valid packs, invalid packs, and integrity edge cases
- `loadFixture` and `fixturePath` utilities
- Named constants for every fixture (`MINIMAL_PACK`, `STARTER_PACK`, `INTEGRITY_VALID`, etc.)

## `@motif/review`

Pack summaries and audit reports. Currently a placeholder — richer reporting planned for Phase 26–27.

## `@motif/ui`

Shared UI primitives. Currently a placeholder — extraction from Studio planned for Phase 22.
