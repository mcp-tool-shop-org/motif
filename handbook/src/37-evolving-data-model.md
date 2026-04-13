# Evolving the Data Model Safely

## Schema Versioning

Every `SoundtrackPack` carries a `schemaVersion` field (currently `"1"`). This enables forward compatibility:

- Parsers reject packs with unsupported schema versions
- Migration logic can transform older packs to newer schemas
- Runtime packs inherit the schema version from the source pack

## Adding New Fields

When adding optional fields to existing types:

1. Add the field to the TypeScript interface in `packages/schema/src/types.ts`
2. Add it as `.optional()` in the Zod schema in `packages/schema/src/schemas.ts`
3. Update any cross-reference checks in `packages/asset-index`
4. Add test fixtures covering the new field
5. Verify: existing packs without the field parse cleanly
6. Do not bump `schemaVersion` for backwards-compatible additions

## Adding New Entity Types

When adding new entity arrays to `SoundtrackPack`:

1. Define the type and Zod schema
2. Add the array as optional in `SoundtrackPackSchema`
3. Add integrity checks if the new type references other entities
4. Add to `runtime-pack` stripping logic if authoring-only
5. Update test fixtures

## Breaking Changes

If a change removes or renames a field, or changes its type:

1. Bump `schemaVersion`
2. Write a migration function: `migrateV1ToV2(pack)`
3. Add the migration to the parse pipeline
4. Keep the old Zod schema available for migration input
5. Update all fixtures and tests

## Invariants

- The Zod schema always matches the TypeScript interface
- `parseSoundtrackPack` always validates against the current schema version
- Test fixtures cover both minimal and full packs for every schema version
- The `@motif/test-kit` always includes at least one invalid fixture per validation rule
