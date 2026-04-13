---
title: World Scoring
description: Connecting music to game geography, factions, and encounters
sidebar:
  order: 2
---

World scoring is how Motif connects music to game geography, factions, biomes, and encounters. The goal: a game's music sounds like it belongs to one world, not a playlist of unrelated tracks.

## The Score Map System

The Score Map screen has five panels, each addressing a different dimension of world scoring.

### Score Profiles

A score profile defines the sonic identity of a musical context: tempo range, intensity range, key/scale, palette tags, and default automation targets. Profiles are reference constraints — they declare intent.

### Motif Families

A motif family is a collection of thematic variants linked to scenes. Motif families are the connective tissue of a score. When the forest exploration scene and the forest combat scene share a motif family, the music feels unified even as it adapts.

### Cue Families

A cue family groups related cues by role (exploration, combat, boss, stealth, recovery, safe-zone). They answer: "What are all the musical states for combat in this region?"

### World Map Entries

A world map entry maps a musical identity to a specific game context (region, faction, biome, encounter, safe-zone) with linked score profiles, cue families, and motif families. They answer: "What does the Frostlands sound like?"

### Derivation

Derivation creates new musical material from existing material with a tracked transform. The supported transforms are: `intensify`, `resolve`, `darken`, `brighten`, `simplify`, `elaborate`, and `reharmonize`. Each derivation record tracks the source entity, target entity, and the transform applied, preserving full lineage.

Use `createDerivation(id, sourceId, targetId, transform)` to record a derivation, and `deriveScene(source, newId, transform)` to produce a new scene from an existing one with an appropriate name suffix. Use `derivationChain(records, startId)` to walk the full lineage graph from any starting point.

## Building World Coherence

1. **Define score profiles** for each region/faction/biome
2. **Create motif families** for core thematic ideas
3. **Group scenes into cue families** by role
4. **Map everything to world map entries** — each entry ties a context to its profiles, cue families, and motifs
5. **Derive new material** from existing material — maintaining lineage and connection

The result: music that adapts to game state while sounding like it belongs to one world.
