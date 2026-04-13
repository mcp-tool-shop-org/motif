# Roadmap

## What v0.x Proved

Through 19 phases of development, Motif evolved from a schema-only data format into a real adaptive soundtrack workstation. What exists now:

- **Composition**: Clips with notes, instruments, scales, chords, motif transforms, intensity variants
- **Arrangement**: Scenes with optimizable layers, stems, section roles, intensity curves
- **Adaptive Logic**: Trigger bindings, transitions, deterministic scene resolution
- **Custom Samples**: Import, trim, slice, kit builder, sample instruments
- **World Scoring**: Motif families, score profiles, cue families, world map entries, derivation
- **Automation**: Lanes, macros, envelopes, live capture
- **Recall and Reuse**: Templates, snapshots, branches, favorites, collections, compare
- **Studio**: Full authoring UI with 11 screens and integrated state management
- **Validation**: Schema validation, integrity auditing, 1,002 tests across 16 packages

## Current Strengths

What Motif does well right now:

- Structured adaptive composition that keeps music coherent across game states
- Deep data model that supports real musical complexity
- Deterministic preview, simulation, and export
- World scoring that connects music to game geography meaningfully
- Expressive automation with live capture
- Strong reuse system with lineage tracking
- Clean monorepo architecture with fast CI

## Current Gaps

What needs to improve:

- **Publishing workflow**: No streamlined path from workstation to game project
- **Visual polish**: UI is functional but not refined
- **Live performance ergonomics**: Launch grid and real-time control need better UX
- **Runtime integration**: No engine-specific adapters or examples
- **Collaboration**: Single-user only
- **Rendering**: ~~Basic WAV rendering, no multi-format export~~ (resolved in v1.1.0: 24/32-bit WAV at 44.1/48/96kHz)

## Near-Term Roadmap

### Phase 20 — Publishing, Packaging, and Runtime Integration

Make it easier to ship Motif output into real game projects.

- Export profiles for target runtimes
- Asset bundle packaging
- Publishable soundtrack packs
- Engine adapter examples
- Stronger import/export round-trips
- Package manifests for downstream loaders

**User win**: Move from workstation to game integration faster.

### Phase 21 — Live Performance and Launch Ergonomics

Improve real-time creative control. Partially addressed in v1.1.0: MIDI import/export, real-time clip preview, click-to-audition, metronome, keyboard shortcuts.

- Better launch matrix
- MIDI controller support (MIDI file I/O shipped; live controller input pending)
- Macro performance pages
- Scene/cue launch gestures
- ~~Clip triggering ergonomics~~ (shipped: click-to-audition, keyboard shortcuts)
- More expressive live capture

**User win**: Perform adaptive score changes like an instrument, not a form.

### Phase 22 — Visual Polish and UX Refinement

Make the workstation feel premium.

- Denser but cleaner layouts
- Stronger visual hierarchy
- Better timelines, meters, and transport feedback
- Refined waveform and piano-roll visuals
- Faster navigation between related entities
- Reduced cognitive load

**User win**: Same power, less friction, more confidence.

### Phase 23 — Runtime Intelligence and Game-State Adapters

Make adaptive scoring more immediately useful in real games.

- Adapters for ai-rpg-engine
- Example consumers for claude-rpg
- State adapter templates
- Trigger mapping presets
- Runtime debugging overlays
- Playback telemetry for in-game transitions

**User win**: Less glue code, more working adaptive score in real games.

## Long-Term Roadmap

### Phase 24 — Deeper Composition Assistance

Careful, user-controlled creative assistance.

- Motif suggestion from existing material
- Progression suggestions based on profile/motif family
- Adaptive variation suggestions
- Percussion fill generation
- Orchestration suggestions for intensity changes

**User win**: More high-quality output, faster, without surrendering authorship.

### Phase 25 — Advanced Sampler and Source Design

Expand the sound-creation side. Partially addressed in v1.1.0: multi-oscillator synth, LFO modulation, sample-based instruments, unison/supersaw.

- ~~Multisample instruments~~ (shipped: SampleVoice with piano/strings/guitar templates)
- ~~Better envelopes and modulation~~ (shipped: LFO modulation for filter/amplitude/pitch)
- Slice-to-pattern workflows
- ~~Layer stacks in instruments~~ (shipped: multi-oscillator with 2-4 oscillators, unison up to 8 voices)
- Round-robin / variation playback
- Texture-builder tools

**User win**: More personal sonic identity.

### Phase 26 — Team and Review Workflow

Only after core instrument quality is excellent.

- Shared packs
- Review comments
- Approval states
- Handoff bundles
- Composer ↔ designer workflow surfaces

**User win**: Easier real production use in teams.

### Phase 27 — Score QA and Gameplay Coverage Analysis

- Cue coverage heatmaps
- Missing-context analysis
- World scoring completeness checks
- Transition gap reports
- Runtime behavior sanity scans

**User win**: Confidence at scale, especially for larger games.

### Phase 28+ — Platform and Ecosystem Expansion

Possible long-term areas (only after the workstation is plainly excellent):

- Desktop wrapper
- Plugin-like extension system
- Marketplace for packs/templates/kits
- Cloud library sync
- Console-friendly asset export targets

## Priority Order

The recommended sequence keeps the product instrument-first while making it more usable in real projects:

1. Publishing / Runtime Integration
2. Live Performance Ergonomics
3. Visual / UX Polish
4. Deeper Composition Assistance
5. Advanced Sampler
6. Team Workflow
7. Score QA at Scale
8. Platform / Ecosystem
