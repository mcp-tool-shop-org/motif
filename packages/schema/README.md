<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif/schema

Canonical types and validation for Motif soundtrack packs.

## Includes

- TypeScript types for all core soundtrack entities
- Zod schemas for parsing and validation
- Safe validation helpers with structured issues
- Schema version enforcement (`schemaVersion: "1"`)

## Core entities

- `SoundtrackPackMeta` — pack identity and version
- `AudioAsset` — audio file reference with kind, duration, loop points
- `Stem` — playable layer bound to an asset with a role
- `Scene` — musical state composed of stem layers
- `SceneLayerRef` — stem reference within a scene
- `TriggerCondition` / `TriggerBinding` — runtime state → scene mapping
- `TransitionRule` — how music moves between scenes
- `SoundtrackPack` — the full pack document
- `RuntimeMusicState` — game state shape for trigger evaluation

## Main exports

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

Strict parse. Throws on invalid data.

### `safeParseSoundtrackPack(input: unknown)`

Returns `{ success: true, data }` or `{ success: false, errors }`. Never throws.

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

Returns `{ ok, data?, issues }` with structured `ValidationIssue[]`.

Each issue includes `path`, `code`, and `message` for debugging.

## Validation rules

- Required fields enforced
- Enum values enforced (asset kind, stem role, scene category, trigger op, transition mode)
- `durationMs > 0`
- `loopStartMs >= 0` if present
- `loopEndMs > loopStartMs` if both present
- `priority` must be an integer
- Bindings must have at least one condition
- Scenes must have at least one layer
- `durationMs` required for `crossfade` and `cooldown-fade` transitions
- `schemaVersion` must be `"1"`

## Scope

This package validates structure and field-level correctness.

Cross-reference integrity checks (e.g. "scene refers to a missing stem") are handled by higher-level packages.
