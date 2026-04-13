# Clip Composition Model

Clips are the note-level building blocks of Motif's composition system.

## Clip Structure

A clip contains a sequence of notes, each with pitch, timing, velocity, and duration. Clips can be assigned to scenes via `SceneClipRef` and played through the `ClipPlayer`.

## Transforms

The `@motif-studio/clip-engine` provides deterministic transforms on clips:

- **Transpose** — shift all pitches by a semitone interval
- **Invert** — mirror pitches around a pivot note
- **Reverse** — reverse note order while preserving rhythm
- **Octave shift** — move all notes up or down by octaves
- **Rhythm scale** — stretch or compress timing
- **Snap to scale** — quantize pitches to a given scale

## Variations

Generate new clips from existing ones:

- **Rhythmic variation** — randomize timing within constraints
- **Melodic variation** — randomize pitches within scale
- **Thin notes** — remove notes to reduce density
- **Densify** — add passing tones between existing notes
- **Accents** — emphasize every Nth note
- **Ghost hits** — add quiet notes between existing notes

## Intensity Derivation

Derive intensity variants from a clip:

- **Low / Mid / High** — reduce or increase note density, velocity, and range
- **Tension** — add dissonance and rhythmic urgency
- **Brighten** — shift notes to higher octaves
- **Pad voicing** — spread notes into sustained chords
- **Bass line** — extract or generate bass movement
- **Arpeggiate** — convert chords to arpeggiated patterns

## Cue Scheduling

Clips are organized into cues with section structure:

- `resolveCuePlan` — determine which clips play at which times
- `sectionAtTick` / `sectionAtBar` — find the active section at a given position
- Tick/bar/beat conversion utilities for precise timing
