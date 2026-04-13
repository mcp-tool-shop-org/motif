# Cue Structure Model

Cues are the higher-level organizational unit for composed music in Motif.

## Cue

A cue is a timed arrangement of clips, organized into sections (intro, verse, chorus, bridge, outro, etc.). Each section has a role, a start position, and a duration.

## Section Roles

Sections describe structural function:

- **Entry** — opening material, often sparse
- **Build** — increasing energy and density
- **Sustain** — the main body of the cue
- **Peak** — maximum intensity
- **Exit** — winding down, transitioning out

## Cue Timeline

The cue scheduler resolves which clips are active at any given tick/bar/beat. This drives both live preview and offline rendering.

## Relationship to Scenes

A scene references clips via `clipLayers`. A cue provides the timeline context for when and how those clips play. This separation allows the same clips to appear in different scenes with different timing.
