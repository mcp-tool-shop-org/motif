# Examples

Example soundtrack packs for Motif. Each directory contains a `pack.json` and a README explaining what it demonstrates.

## Included Packs

### [Minimal Pack](minimal/)

The smallest valid SoundtrackPack — one asset, one stem, one scene, one binding. Start here to understand the base structure.

### [Starter Adventure Pack](starter-adventure/)

A complete RPG exploration-to-combat soundtrack with 8 assets, 5 scenes, 4 transition modes, and priority-ordered bindings. Demonstrates the core adaptive workflow end-to-end.

## Planned Examples

These packs are planned for future releases:

- **Faction Identity** — Two factions with distinct score profiles, palette tags, and cue families
- **Custom Sample Kit** — Full sample-lab pipeline from raw audio to playable composition
- **Cue Capture** — Live performance captured, thinned, and applied to automation lanes
- **Automation/Macros** — Macro-driven parameters with section envelopes and intensity mappings
- **Motif Family World Scoring** — Complete world map with regions, factions, and derived material

## Adding Examples

Place example packs in this directory as subdirectories. Each example should include:

1. A valid `SoundtrackPack` JSON file named `pack.json`
2. A README explaining what the example demonstrates
3. Enough entities to show the workflow end-to-end
