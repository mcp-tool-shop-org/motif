# Glossary

## Core Entities

**Audio Asset** — A file reference with metadata: kind (loop, oneshot, stinger, ambient), duration, BPM, key, tags, and source type. The atomic unit of sound.

**Stem** — A playable layer within a scene, bound to an audio asset with a role (base, danger, combat, boss, recovery, mystery, faction). Stems are how assets become part of a scene's mix.

**Scene** — A named musical state composed of stem layers. Scenes represent the music for a game context (exploration, combat, boss, etc.). Each scene has a category, layers, and optional fallback behavior.

**Layer (SceneLayerRef)** — A reference to a stem within a scene, with order, gain, mute, section role, and intensity settings. Layers determine how stems mix within a scene.

## Trigger System

**Trigger Binding** — A rule that maps runtime game state to a scene. Each binding has one or more conditions and a priority. When game state changes, bindings are evaluated and the highest-priority match wins.

**Trigger Condition** — A single comparison: field, operator, value. Operators include `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`. Conditions evaluate against `RuntimeMusicState`.

**Transition Rule** — Defines how music moves between scenes: `immediate` (hard cut), `crossfade` (smooth blend), `bar-sync` (wait for bar boundary), `cooldown-fade` (delayed fade), or `stinger-then-switch` (play a stinger, then switch).

## Clip Composition

**Clip** — A composed musical idea with notes, lanes, variant data, and instrument assignment. Clips are the composition layer — where music is actually written.

**Clip Lane** — A named track within a clip containing notes. Multiple lanes allow polyphonic or multi-part composition.

**Clip Note** — A single note event: pitch (MIDI), start time, duration, velocity. Notes live in clip lanes.

**Variant** — An alternative version of a clip designed for a specific intensity or context. Variants enable adaptive layering — the same clip can sound different at different intensity levels.

## Cue Structure

**Cue** — A composed musical piece with a timeline, sections, and captured performances. Cues are the mid-level structure between clips and scenes — they represent a complete musical thought.

**Cue Section** — A time range within a cue with a section role. Sections give cues structural shape: intro → loop → fill → outro.

**Cue Section Role** — The structural function of a cue section: intro, loop, fill, outro, breakdown, build, drop, transition.

## Sample Workflow

**Sample Slice** — A region within an audio asset defined by start and end times. Slicing divides a long audio file into playable segments.

**Sample Kit** — A collection of slots mapping MIDI pitches to sample slices. Kits are how sliced audio becomes a playable instrument (e.g., a drum kit).

**Sample Kit Slot** — A single entry in a sample kit: pitch → slice mapping with optional gain and pan.

**Sample Instrument** — A pitched instrument built from a single audio source with a root note and playable MIDI range. The engine pitch-shifts the sample for notes other than the root.

## World Scoring

**Motif Family** — A collection of thematic variants linked to scenes. Motif families carry musical ideas across different game contexts, creating world coherence.

**Score Profile** — The sonic identity of a musical context: tempo range, intensity range, key/scale, palette tags. Score profiles define what a region or faction "sounds like."

**Cue Family** — A group of cues organized by role (exploration, combat, boss, etc.) with linked scenes and motif families. Cue families answer: "what are all the musical states for this context?"

**Score Map Entry** — A top-level mapping of musical identity to a game context (region, faction, biome, encounter, safe-zone) with linked score profiles, cue families, and motif families.

**Derivation Record** — A record that "entity B was derived from entity A using transform X." Derivation preserves lineage and tracks how musical material evolves.

**Derivation Transform** — The type of transformation used in a derivation: intensify, simplify, darken, brighten, rhythmic-variation, tonal-shift, fragment, extend, layer, strip.

## Automation

**Automation Lane** — A list of timed value points for a specific target parameter. Lanes are the core automation primitive — they define how a parameter changes over time.

**Automation Target** — What a lane controls: a parameter name + an entity ID. Example: volume on stem-1, filter on bus-2.

**Automation Point** — A single point in a lane: time, value, and optional curve type.

**Macro Mapping** — A rule that connects a high-level macro (intensity, tension, energy) to a specific parameter with an influence amount. Macros let game state drive multiple parameters at once.

**Section Envelope** — An automation shape tied to a cue section role (intro, loop, outro, etc.). Envelopes add structural dynamics to cue sections.

**Automation Capture** — A recording of automation values over time. Captures preserve live performance data that can be applied to lanes.

## Library

**Library Template** — A reusable starting point for creating entities. Templates capture the shape and data of an entity (scene, clip, kit, etc.) for future instantiation.

**Snapshot** — A frozen state of an entity at a moment in time. Snapshots are read-only records used for recall, comparison, and branching.

**Branch** — A new, independent entity created from a snapshot. Branches diverge from the original while preserving lineage.

**Favorite** — A lightweight bookmark referencing any entity. Favorites surface important entities in the Library screen.

**Collection** — A named group of favorites. Collections organize favorites into meaningful sets (e.g., "Combat sounds", "Ready to ship").

**Compare** — A field-by-field diff between two entity states, showing identical fields, changed fields (with both values), and fields only present in one version.

## Export

**Soundtrack Pack (SoundtrackPack)** — The complete authoring document containing all entities, metadata, and relationships. This is the source of truth for everything in Motif.

**Runtime Pack** — A stripped-down version of the authoring pack containing only what a game engine needs: scenes, bindings, transitions, and asset references. The deployment artifact.

**Runtime Music State** — The game state shape that trigger bindings evaluate against. A passthrough object with optional fields: mode, danger, inCombat, boss, safeZone, victory, region, faction, encounterType.
