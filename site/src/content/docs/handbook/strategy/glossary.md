---
title: Glossary
description: Definitions for all core entities and concepts
sidebar:
  order: 2
---

## Core Entities

**Audio Asset** — A file reference with metadata: kind (loop, oneshot, stinger, ambient), duration, BPM, key, tags, and source type.

**Stem** — A playable layer within a scene, bound to an audio asset with a role (base, danger, combat, boss, recovery, mystery, faction, accent).

**Scene** — A named musical state composed of stem layers. Scenes represent the music for a game context.

**Layer (SceneLayerRef)** — A reference to a stem within a scene, with order, gain, mute, section role, and intensity settings.

## Trigger System

**Trigger Binding** — A rule that maps runtime game state to a scene with priority-based resolution.

**Trigger Condition** — A single comparison: field, operator (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `includes`), value.

**Transition Rule** — How music moves between scenes: `immediate`, `crossfade`, `bar-sync`, `cooldown-fade`, or `stinger-then-switch`.

## Clip Composition

**Clip** — A composed musical idea with notes, lanes, variant data, and instrument assignment.

**Variant** — An alternative version of a clip for a specific intensity or context, enabling adaptive layering.

## Cue Structure

**Cue** — A composed piece with a timeline, sections, and captured performances.

**Cue Section Role** — Structural function: intro, body, escalation, climax, outro, transition.

## Sample Workflow

**Sample Slice** — A region within an audio asset defined by start and end times.

**Sample Kit** — A collection of slots mapping MIDI pitches to sample slices.

**Sample Instrument** — A pitched instrument from a single audio source with root note and playable range.

## World Scoring

**Motif Family** — Thematic variants linked to scenes, carrying musical ideas across game contexts.

**Score Profile** — Sonic identity: tempo range, intensity range, key/scale, palette tags.

**Cue Family** — Cues grouped by role with linked scenes and motif families.

**Score Map Entry** — Top-level mapping of musical identity to a game context.

**Derivation Record** — Lineage tracking: "entity B was derived from entity A using transform X." Supported transforms: `intensify`, `resolve`, `darken`, `brighten`, `simplify`, `elaborate`, `reharmonize`.

## Automation

**Automation Lane** — Timed value points for a specific target parameter.

**Macro Mapping** — High-level parameter (intensity, tension, energy) driving multiple targets.

**Section Envelope** — Automation shape tied to a cue section role.

**Automation Capture** — Recording of automation values over time from live performance.

## Library

**Template** — Reusable starting point for creating entities.

**Snapshot** — Frozen state of an entity at a moment in time.

**Branch** — Independent entity created from a snapshot, preserving lineage.

**Favorite** — Lightweight bookmark referencing any entity.

**Collection** — Named group of favorites.

**Compare** — Field-by-field diff between two entity states.

## Export

**Soundtrack Pack** — The complete authoring document (source of truth).

**Runtime Pack** — Stripped-down deployment artifact for game engines.

**Runtime Music State** — Game state shape for trigger binding evaluation.
