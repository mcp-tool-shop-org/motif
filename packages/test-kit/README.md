<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/test-kit

Fixtures, sample packs, and test utilities for Motif packages.

## What It Owns

- JSON fixture files for testing (minimal packs, integrity test packs, invalid packs)
- Fixture loading utilities
- Fixture path resolution

## Key Exports

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif-studio/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### Fixtures

| Constant | Fixture File | Purpose |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | Bare minimum valid pack |
| `STARTER_PACK` | `starter-pack.json` | Richer starter pack |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | Schema validation: missing meta |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | Schema validation: bad transition |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | Schema validation: empty layers |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | Schema validation: bad duration |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | Integrity: clean pack |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | Integrity: broken asset ref |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | Integrity: broken stem ref |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | Integrity: broken scene ref |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | Integrity: duplicate IDs |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | Integrity: self-referencing entities |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | Integrity: unused entities |

## What It Does Not Own

- Application-level tests (those live in each package's `test/` directory)
- Test runner configuration (each package has its own `vitest.config.ts`)
