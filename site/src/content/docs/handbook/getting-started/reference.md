---
title: API Reference
description: Package-by-package function reference for all Motif libraries
sidebar:
  order: 50
---

This page documents the public API for each Motif package. All packages are published under the `@motif-studio` scope on npm.

## @motif-studio/schema

Canonical types, Zod 4 schemas, and validation utilities. Every other package imports types from here.

### Key Types

| Type | Description |
|------|-------------|
| `SoundtrackPack` | The complete authoring document containing all entities |
| `AudioAsset` | A file reference with kind (`loop`, `oneshot`, `stinger`, `ambient`), duration, BPM, key, tags |
| `Stem` | A playable layer bound to an asset with a role (`base`, `danger`, `combat`, `boss`, `recovery`, `mystery`, `faction`, `accent`) |
| `Scene` | A named musical state with stem layers and optional clip layers |
| `TriggerBinding` | A rule mapping runtime state to a scene with priority |
| `TriggerCondition` | A comparison: field, operator (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `includes`), value |
| `TransitionRule` | How music moves between scenes: `immediate`, `crossfade`, `bar-sync`, `stinger-then-switch`, `cooldown-fade` |
| `Clip` | A composed musical idea with notes, lane, instrument, BPM, and optional variants |
| `ClipNote` | A single note event: pitch (MIDI 0--127), startTick (480 ticks/beat), durationTicks, velocity |
| `Cue` | A composed piece with ordered sections, tempo, key, and time signature |
| `CueSection` | A structural section with role (`intro`, `body`, `escalation`, `climax`, `outro`, `transition`), duration in bars, and optional scene/clip/intensity overrides |
| `RuntimeMusicState` | Game state shape for trigger evaluation (mode, danger, inCombat, boss, region, faction, etc.) |

### Validation

- `parseSoundtrackPack(data)` -- Parse and validate a full authoring pack
- `parseAudioAsset(data)` -- Parse a single audio asset
- `validatePack(data)` -- Returns `ValidationResult<SoundtrackPack>` with `ok`, `data`, and `issues`

---

## @motif-studio/clip-engine

Clip sequencing, 30+ composition transforms, and cue scheduling.

### Clip Playback

- `ClipPlayer` -- Manages clip playback state and scheduling
- `SceneClipPlayer` -- Plays clips within a scene context
- `resolveClipNotes(clip, variantId?)` -- Resolve the active notes for a clip, using variant if specified
- `filterByIntensity(refs, level)` -- Filter scene clip refs by intensity tier
- `sortByOrder(refs)` -- Sort clip refs by playback order

### Scheduling

- `scheduleNotes(notes, bpm, startTime)` -- Convert clip notes to scheduled audio events
- `clipLengthSeconds(clip)` -- Clip duration in seconds based on BPM and lengthBeats
- `quantizedLaunchTime(time, clip, mode)` -- Snap a launch time to beat/bar grid

### Composition Transforms

All transforms are pure functions that return new clip objects:

| Transform | Description |
|-----------|-------------|
| `clipTranspose(clip, semitones)` | Shift all notes by semitones |
| `clipTransposeInKey(clip, degrees)` | Shift within the clip's scale |
| `clipInvert(clip)` | Mirror intervals around a center |
| `clipReverse(clip)` | Reverse note order |
| `clipOctaveShift(clip, octaves)` | Shift by octaves |
| `clipRhythmScale(clip, factor)` | Scale note durations |
| `clipSnapToScale(clip)` | Quantize pitches to the clip's scale |
| `clipFindOutOfScale(clip)` | Identify notes outside the scale |
| `clipRhythmicVariation(clip)` | Randomized rhythmic displacement |
| `clipMelodicVariation(clip)` | Randomized melodic displacement |
| `clipThinNotes(clip)` | Remove low-velocity notes |
| `clipDensifyNotes(clip)` | Fill gaps with new notes |
| `clipAccentEveryN(clip, n)` | Boost velocity on every Nth note |
| `clipAddGhostHits(clip)` | Add quiet ghost notes |
| `clipRemoveGhostHits(clip)` | Strip ghost notes |
| `clipDeriveIntensity(clip, level)` | Generate intensity variant |
| `clipAddTension(clip)` | Add dissonance |
| `clipBrighten(clip)` | Shift toward upper register |
| `clipPadVoicing(clip)` | Expand into pad-style voicing |
| `clipBassLine(clip)` | Derive a bass pattern |
| `clipArpeggiate(clip)` | Convert chords to arpeggios |
| `createTransformedVariant(clip, transform)` | Create a named variant from a transform |

### Chord and Scale Tools

- `chordPalette(root, scale)` -- All diatonic chords in a scale
- `diatonicChords(root, scale, count)` -- Generate chord progression
- `progressionFromDegrees(root, scale, degrees)` -- Chords from Roman numeral degrees

### Cue Scheduling

- `resolveCuePlan(cue, pack)` -- Resolve a cue into a timed playback plan
- `sectionAtTick(plan, tick)` -- Find the active section at a given tick
- `sectionAtBar(plan, bar)` -- Find the active section at a given bar
- `createCaptureEvent(tick, bar, beat, action, opts?)` -- Create a performance capture event
- `ticksPerBar(cue)` -- Ticks per bar for a cue's time signature

### Constants

- `TICKS_PER_BEAT` = 480
- `TICKS_PER_16TH` = 120
- `TICKS_PER_8TH` = 240

---

## @motif-studio/scene-mapper

Trigger evaluation and deterministic scene resolution.

- `evaluateCondition(condition, state)` -- Test a single trigger condition against runtime state
- `evaluateBinding(binding, state)` -- Test all conditions in a binding
- `evaluateBindings(pack, state)` -- Evaluate all bindings in a pack
- `resolveScene(pack, state)` -- Resolve the winning scene: highest priority among matched bindings, pack order as tie-breaker

---

## @motif-studio/runtime-pack

Export and import runtime packs for game engines.

- `exportRuntimePack(pack)` -- Strip an authoring pack to runtime-only data (scenes, bindings, transitions, stems, assets)
- `parseRuntimePack(data)` -- Parse and validate a runtime pack (throws on failure)
- `safeParseRuntimePack(data)` -- Parse with structured error reporting
- `validateRuntimePack(data)` -- Returns validation issues without throwing
- `serializeRuntimePack(pack)` -- Deterministic JSON serialization
- `roundTripRuntimePack(pack)` -- Export, serialize, parse, validate in one call

---

## @motif-studio/sample-lab

Audio import, trimming, slicing, kit building, and sample instrument creation.

### Import

- `buildImportedAsset(filename, durationMs, src)` -- Create an AudioAsset from file metadata (infers source type and kind from filename)
- `inferSourceType(name)` -- Detect source type from filename patterns (drums, tonal, ambience, stinger, texture, fx)
- `sourceTypeToKind(sourceType)` -- Map source type to asset kind
- `filenameToId(filename)` -- Sanitize filename to kebab-case ID

### Trim

- `applyTrim(asset, startMs, endMs)` -- Set non-destructive trim region
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` -- Set loop region within an asset

### Slice

- `sliceEvenly(assetId, startMs, endMs, count)` -- Divide a region into equal slices
- `sliceAtOnsets(assetId, onsets, totalEndMs)` -- Slice at specific time points

### Kit and Instrument

- `kitFromSlices(id, name, slices, basePitch)` -- Build a sample kit from slices, mapping to ascending MIDI pitches
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)` -- Create a pitched instrument from a single audio source

---

## @motif-studio/automation

Automation lanes, macros, envelopes, and live capture.

### Lanes

- `createLane(id, name, param, target)` -- Create a new automation lane
- `addPoint(lane, point)` -- Add a keyframe (sorted by time)
- `removePointAt(lane, timeMs, toleranceMs?)` -- Remove point near a time
- `updatePoint(lane, index, update)` -- Update a point's value or curve
- `clearLane(lane)` -- Remove all points
- `lanesForTarget(lanes, targetId)` -- Filter lanes by target
- `lanesForParam(lanes, param)` -- Filter lanes by parameter

### Interpolation

- `evaluateLane(lane, timeMs)` -- Get interpolated value at any time
- `interpolate(from, to, t, curve)` -- Raw interpolation with curve type (`linear`, `exponential`, `step`, `smooth`)
- `sampleLane(lane, startMs, endMs, stepMs)` -- Sample lane at regular intervals
- `evaluateLanesAt(lanes, targetId, timeMs)` -- Evaluate all lanes for a target, returns Map of param to value

### Macros

- `defaultMacroState()` -- Default state with all macros at 0.5
- `createMacroMapping(id, macro, param, weight, opts?)` -- Create a mapping from macro to parameter
- `evaluateMacros(state, mappings, targetId?)` -- Get parameter influences from macro state
- `applyMacroInfluence(baseValue, influence)` -- Apply influence, clamped to 0--1

### Envelopes

- `createEnvelope(id, targetId, shape, durationMs, position, depth?)` -- Create a section envelope
- `evaluateEnvelope(envelope, offsetMs)` -- Get gain value at a time offset
- Shapes: `fade-in`, `fade-out`, `swell`, `duck`, `filter-rise`, `filter-fall`
- Positions: `entry` or `exit`

### Capture

- `createCapture(id, name, source)` -- Start a capture session (source is a `MacroParam` or `AutomationParam`)
- `recordPoint(capture, timeMs, value)` -- Record a single point
- `finalizeCapture(capture, laneId?)` -- Sort points and optionally link to a lane
- `applyCaptureToLane(capture, lane)` -- Replace lane points with captured data
- `mergeCaptureIntoLane(capture, lane)` -- Merge captured points into existing lane
- `thinCapture(capture, toleranceMs)` -- Reduce point density

---

## @motif-studio/library

Templates, snapshots, branches, favorites, and entity comparison.

### Templates

- `createTemplate(id, name, kind, data, opts?)` -- Create a reusable template from entity data
- `instantiateTemplate(template, newId)` -- Produce new entity data with a fresh ID
- `templatesOfKind(templates, kind)` -- Filter by entity kind
- `searchTemplates(templates, query)` -- Search by name or tag

### Snapshots

- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` -- Freeze entity state
- `restoreSnapshot(snapshot)` -- Get a copy of the frozen data
- `snapshotsForEntity(snapshots, entityId)` -- All snapshots for an entity
- `latestSnapshot(snapshots, entityId)` -- Most recent snapshot

### Branches

- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` -- Fork from a snapshot
- `instantiateBranch(snapshot, branch)` -- Produce entity data for the branch
- `traceLineage(entityId, branches, snapshots)` -- Walk the full chain to the root
- `descendantBranches(entityId, branches, snapshots)` -- All branches derived from an entity

### Compare

- `compareEntities(a, b, entityKind, labelA, labelB)` -- Field-by-field diff returning `same`, `changed`, `onlyA`, `onlyB`
- `areEqual(a, b)` -- Quick structural equality check
- `diffCount(a, b)` -- Count of differing fields

---

## @motif-studio/score-map

World scoring: motif families, score profiles, cue families, and derivation.

### Derivation

- `createDerivation(id, sourceId, targetId, transform)` -- Record a derivation
- `deriveScene(source, newId, transform)` -- Produce a new scene with a name suffix
- `derivationChain(records, startId)` -- Walk the full derivation graph
- `derivationsFrom(records, sourceId)` -- Find all derivations from a source
- `derivationsTo(records, targetId)` -- Find all derivations targeting an entity
- Transforms: `intensify`, `resolve`, `darken`, `brighten`, `simplify`, `elaborate`, `reharmonize`

---

## @motif-studio/music-theory

Scales, chords, motifs, and intensity transforms used by the clip engine.

---

## @motif-studio/audio-engine

Sample playback and voice management using the Web Audio API. Handles loading audio buffers, managing playback voices, and applying gain/pan per voice.

---

## @motif-studio/playback-engine

Real-time mixing, effects (EQ, delay, reverb, compressor), stem bus routing, master gain, and WAV rendering via `OfflineAudioContext`.

---

## @motif-studio/instrument-rack

Synth and drum voice management with presets. Categories: `drums`, `bass`, `pad`, `lead`, `pulse`.

---

## @motif-studio/asset-index

Pack integrity indexing and auditing. Detects orphaned references, duplicate assets, and missing dependencies.

---

## @motif-studio/review

Summaries and audit helpers for pack inspection.

---

## @motif-studio/test-kit

Fixtures and test utilities for writing tests against Motif packages.
