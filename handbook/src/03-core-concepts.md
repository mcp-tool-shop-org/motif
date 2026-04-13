# Core Product Thesis

## High-Quality Original Music for Games

Motif exists to produce music that is genuinely good — not placeholder, not algorithmically adequate, but composed and performed with real musical intent. Every feature in the product serves this goal. If a feature makes it easier to ship mediocre music, it does not belong.

## Adaptive Scoring as a First-Class Authoring Model

Adaptive music is not a bolt-on. In Motif, adaptation is part of the authoring model from the start:

- **Scenes** are musical states that respond to game context
- **Trigger bindings** map runtime state to scenes with deterministic priority resolution
- **Transitions** define exactly how music moves between states
- **Cue families** group related musical ideas across game contexts
- **Score profiles** define the sonic identity of regions, factions, and encounters
- **Motif families** carry thematic material across the entire score

Every one of these is authored — not inferred, not generated, not random.

## Why Composition, Playback, and Runtime Logic All Matter

A soundtrack pack that only describes playback rules is incomplete. A pack that only contains audio is inflexible. Motif's data model includes:

- **Composition data** — clips, notes, lanes, variants, instruments, scales, chords
- **Playback structure** — scenes, layers, stems, cue timelines, section roles
- **Runtime logic** — trigger bindings, transitions, state conditions, priority resolution
- **Creative metadata** — templates, snapshots, branches, favorites, collections

All four layers are first-class. This is what makes Motif a workstation rather than a file organizer.

## Creative Power as the Measure

Each major phase of Motif's development is measured by how much creative power it gives the user. Not by feature count, not by API surface, not by buzzword compliance. The question is always: can the creator do something musically meaningful that they could not do before?

## Design Principles

**Instrument first.** Every feature should feel like part of a musical instrument, not an enterprise form.

**Sound before bureaucracy.** The creator should hear results before filling out metadata. Audio playback, preview, and audition come before configuration.

**Determinism in service of creativity.** Playback, preview, simulation, and export must be deterministic. Repeatable results mean the creator can trust what they hear.

**Reuse without generic sludge.** Templates, snapshots, and branches enable reuse. But reuse should produce distinct results, not homogeneous presets. Every branch should diverge.

**World coherence without over-modeling.** The world scoring layer helps music feel unified across a game. But Motif is not a game design tool. The world model is minimal — just enough to give musical decisions context.

**Focused scope, not small ambition.** Motif deliberately excludes DAW features, AI generation, and social platforms. But within its scope — adaptive soundtrack authoring — it aims to be the best tool that exists.
