# World Scoring Model

World scoring connects musical decisions to game geography, factions, and encounters.

## Motif Families

A motif family groups related thematic material. Each family has:

- A name and ID
- Variants (different versions of the motif)
- Scene links (which scenes use this motif)

Motif families create thematic continuity: the same musical idea can appear in different scenes, regions, and encounters, binding the score together.

## Score Profiles

A score profile defines the sonic identity of a game context:

- Tempo range (min/max BPM)
- Intensity range (min/max)
- Palette tags (timbral vocabulary: "strings", "woodwinds", "synth-dark")
- Key and scale

Profiles are assigned to score map entries and used to check whether a cue fits a context.

## Cue Families

A cue family groups scenes by narrative role ("forest exploration cues", "boss encounter cues"). Each family can reference motif families, creating the bridge between thematic material and structural organization.

## Score Map Entries

A score map entry links a game context (region, faction, encounter) to:

- A score profile
- One or more cue families
- Motif family associations

This is the top-level organizing structure for world scoring.

## Derivation

Derivation records trace how new scenes are created from existing material:

- Source scene → transform → target scene
- Derivation chains track multi-step evolution
- `derivationGraphIds` reveals the full dependency graph
