# Rendering and Runtime Export

Motif produces two kinds of output: audio renders for listening and review, and runtime packs for game engine consumption.

## The Authoring Pack vs the Runtime Pack

### Authoring Pack

The `SoundtrackPack` is the full authoring document. It contains everything:

- Audio assets, stems, scenes, layers
- Trigger bindings and transition rules
- Clips, notes, lanes, variants, instruments
- Sample slices, kits, instruments
- Motif families, score profiles, cue families, world map entries, derivations
- Automation lanes, macros, envelopes, captures
- Templates, snapshots, branches, favorites, collections

This is the source of truth. It is designed for authoring — rich, verbose, and complete.

### Runtime Pack

The runtime pack is what ships to the game. It is a stripped-down version of the authoring pack containing only what the game engine needs:

- Scene definitions with layer references
- Trigger bindings and transition rules
- Asset references (paths, durations, loop points)
- Runtime music state contract

The runtime pack **does not contain**:
- Clip composition data (notes, lanes, variants)
- Sample Lab data (slices, kits, instruments)
- Score Map metadata (motif families, profiles, cue families)
- Automation authoring data (raw lanes, captures)
- Library data (templates, snapshots, branches, favorites)

The runtime pack is a deployment artifact, not an authoring document.

## Deterministic Serialization

Both authoring and runtime packs serialize to JSON deterministically. Given the same in-memory state, the same JSON output is produced every time. This means:

- Exported packs can be diffed in version control
- Round-trip (export → import) produces identical results
- Test fixtures are stable

## What a Game Engine Expects

A game engine consuming a Motif runtime pack needs to:

1. **Load the pack JSON** and parse it
2. **Evaluate trigger bindings** against the current game state to determine the active scene
3. **Apply transition rules** when the active scene changes
4. **Load and play audio assets** according to the active scene's layer stack
5. **Handle priority resolution** — when multiple bindings match, highest priority wins, with pack order as tie-breaker

The runtime contract is deliberately simple. Motif does the hard compositional work at authoring time so the runtime can be a straightforward state machine.

## Export Readiness

Before exporting, verify:

- **Schema validation** passes — the pack is structurally valid
- **Integrity audit** passes — no broken references, no duplicate IDs, no self-references
- **All scenes have layers** — empty scenes cause silence at runtime
- **All bindings reference valid scenes** — broken bindings cause fallback behavior
- **Transitions are coherent** — from/to pairs reference existing scenes

The Studio's export flow shows readiness status and flags issues before allowing export.

## Audio Rendering

Motif can render audio for:

- **Full cue render** — a complete cue timeline rendered as a WAV file
- **Loop-only render** — just the looping section of a cue
- **Preview sequence render** — a simulated state change sequence rendered as audio
- **Captured performance render** — a live capture rendered to audio

Rendering uses `OfflineAudioContext` for deterministic offline processing. The rendered output matches what was heard during preview — guaranteed by deterministic scheduling.

## Round-Trip Verification

Export → import should produce a functionally identical pack. The schema validation and integrity checks run on both sides:

1. Export produces a JSON string
2. Import parses and validates the JSON
3. The imported pack should pass the same integrity checks as the original

This is tested in CI and is a hard requirement for any schema changes.

## Downstream Integration

The runtime pack is designed to be consumed by any game engine. Current integration targets:

- Custom JavaScript/TypeScript game engines
- AI RPG engines (e.g., ai-rpg-engine)
- Any engine that can parse JSON and play audio from URLs

The pack JSON is the contract. Motif does not ship an engine-specific SDK — it ships a well-defined data format and lets each engine implement playback.
