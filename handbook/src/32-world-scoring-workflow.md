# World Scoring

World scoring is how Motif connects music to game geography, factions, biomes, and encounters. The goal: a game's music sounds like it belongs to one world, not a playlist of unrelated tracks.

## The Score Map System

The Score Map screen has five panels, each addressing a different dimension of world scoring.

### Score Profiles

A score profile defines the sonic identity of a musical context:

- **Tempo range**: min/max BPM
- **Intensity range**: min/max (0–1)
- **Key/Scale**: tonal center
- **Palette tags**: orchestral, electronic, ethnic, ambient, etc.
- **Default automation targets**: which parameters get automated by default

Score profiles are not prescriptive — they are reference constraints. Two profiles can overlap. The point is declaring intent: "this region sounds like this."

Key operations:
- `createScoreProfile(id, name, options)` — create with tempo, intensity, palette, key/scale
- `isTempoInRange(profile, bpm)` — check if a tempo fits a profile
- `isIntensityInRange(profile, intensity)` — check if an intensity fits
- `matchingPaletteTags(profileA, profileB)` — find shared sonic vocabulary
- `mergeProfiles(base, overlay)` — combine two profiles (overlay wins conflicts)

### Motif Families

A motif family is a collection of thematic variants linked to scenes:

- **Variants**: named musical ideas (e.g., "main theme", "combat variation", "recovery fragment")
- **Linked scenes**: scenes that carry this motif

Motif families are the connective tissue of a score. When the forest exploration scene and the forest combat scene share a motif family, the music feels unified even as it adapts.

Key operations:
- `createMotifFamily(id, name)` — create a motif family
- `addVariant(family, variant)` / `removeVariant(family, variantId)` — manage variants
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)` — bind to scenes
- `familiesReferencingId(families, entityId)` — find which families reference an entity

### Cue Families

A cue family groups related cues by role:

- **Role**: exploration, combat, boss, stealth, recovery, safe-zone (or custom)
- **Linked scenes**: which scenes belong to this family
- **Linked motif families**: which motifs are used in this family
- **Score profile**: the sonic identity governing this family

Cue families answer: "What are all the musical states for combat in this region?"

Key operations:
- `createCueFamily(id, name, role, sceneIds)` — create with role and scene links
- `addSceneToCueFamily(family, sceneId)` / `removeSceneFromCueFamily(family, sceneId)`
- `linkMotifToCueFamily(family, motifFamilyId)` — associate a motif
- `sharedMotifs(familyA, familyB)` — find motifs shared between two cue families
- `sharedScenes(familyA, familyB)` — find scenes shared between two cue families

### World Map Entries

A world map entry maps a musical identity to a specific game context:

- **Context type**: region, faction, biome, encounter, safe-zone
- **Score profile**: the sonic identity for this context
- **Cue family IDs**: which cue families serve this context
- **Motif family IDs**: which motifs appear in this context

World map entries are the top-level scoring primitive. They answer: "What does the Frostlands sound like?"

Key operations:
- `createScoreMapEntry(id, name, contextType)` — create an entry
- `resolveProfile(entry, profiles)` — get the entry's score profile
- `resolveCueFamilies(entry, cueFamilies)` — get the entry's cue families
- `resolveMotifFamilies(entry, motifFamilies)` — get the entry's motif families
- `entriesByContext(entries, contextType)` — filter entries by context type
- `entriesSharingMotif(entries, motifFamilyId)` — find entries that use the same motif

### Derivation

Derivation creates new musical material from existing material:

- **Source ID**: the entity being derived from
- **Target ID**: the new entity created
- **Transform**: intensify, simplify, darken, brighten, rhythmic-variation, tonal-shift, fragment, extend, layer, strip

Derivation records track lineage — "this combat cue was derived from the exploration cue by intensifying the main motif."

Key operations:
- `createDerivation(id, sourceId, targetId, transform)` — create a derivation record
- `derivationsFrom(derivations, sourceId)` — find all derivations from a source
- `derivationsTo(derivations, targetId)` — find all derivations targeting an entity
- `derivationChain(derivations, entityId)` — trace the full derivation lineage
- `derivationGraphIds(derivations)` — get all entity IDs involved in derivation

## Building World Coherence

The power of the world scoring system comes from composition:

1. **Define score profiles** for each region/faction/biome
2. **Create motif families** for core thematic ideas
3. **Group scenes into cue families** by role (exploration, combat, boss, etc.)
4. **Map everything to world map entries** — each entry ties a context to its profiles, cue families, and motifs
5. **Derive new material** from existing material — maintaining lineage and connection

The result: music that adapts to game state while sounding like it belongs to one world. A forest exploration cue and a forest combat cue share motifs, follow the same score profile, and belong to the same cue family. The listener hears a unified score, not unrelated background tracks.
