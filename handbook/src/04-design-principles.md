# Design Principles

These principles govern every design decision in Motif. They are not aspirational — they are operational. If a feature violates one of these principles, the feature is wrong.

## Instrument First

Motif is a musical instrument. Every screen, every panel, every interaction should feel like operating an instrument — immediate, responsive, and expressive. If something feels like filling out a form, it needs to be redesigned.

This means:
- Controls should be direct, not wizard-driven
- Feedback should be instant — audio, visual, or both
- Moving between related entities should be fast
- The product should reward exploration, not punish incomplete input

## Sound Before Bureaucracy

The creator should hear results before completing configuration. Preview, audition, and playback are not secondary features — they are the primary interface. If a workflow requires filling out five fields before producing any sound, the workflow is backwards.

## Determinism in Service of Creativity

Everything in Motif that produces output — playback, preview, simulation, render, export — must be deterministic. Given the same inputs, the same output is produced every time.

This is not a technical constraint. It is a creative guarantee:
- Preview captures are trustworthy
- Rendered audio matches what was heard
- Runtime behavior matches what was designed
- Tests are stable and meaningful

Randomness, non-deterministic scheduling, and order-dependent side effects are bugs.

## Reuse Without Generic Sludge

Templates, snapshots, branches, favorites, and collections exist to help creators reuse ideas. But reuse done poorly produces music that all sounds the same — preset soup.

Motif's reuse model encourages divergence:
- **Snapshots** preserve a moment so the original can be changed freely
- **Branches** create independent copies that evolve separately
- **Templates** provide starting points, not finished products
- **Compare** shows exactly how two versions differ

The goal is not "apply preset" — it is "remember where I was, then go somewhere new."

## World Coherence Without Over-Modeling

The world scoring system (motif families, score profiles, cue families, world map entries) gives music a relationship to game geography, factions, and encounters. But Motif is not a game design tool.

The world model is deliberately minimal:
- Enough to define musical identities for regions and encounters
- Not enough to model game logic, quest chains, or NPC behavior
- Context types are simple: region, faction, biome, encounter, safe-zone
- Derivation records track lineage, not game state machines

Music leads. World context follows.

## Focused Scope, Not Small Ambition

Motif excludes many things on purpose: DAW-level editing, AI generation, cloud collaboration, marketplace features, plugin hosting. These exclusions are not limitations — they are focus.

Within its scope — adaptive soundtrack authoring for games — Motif aims to be genuinely excellent. That requires saying no to everything outside the scope, no matter how obvious or requested it seems.
