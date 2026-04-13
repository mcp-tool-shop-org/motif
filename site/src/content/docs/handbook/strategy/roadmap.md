---
title: Roadmap
description: Current state, strengths, gaps, and future phases
sidebar:
  order: 1
---

## What v1.0 Delivers

Through 19 phases of development, Motif evolved from a schema-only data format into a real adaptive soundtrack workstation:

- **Composition**: Clips with notes, instruments, scales, chords, motif transforms (30+ transforms in `@motif-studio/clip-engine`), intensity variants, and cue structures with timelines and section roles
- **Arrangement**: Scenes with stem layers, gain control, mute/solo, section roles, intensity settings, and clip layer references
- **Adaptive Logic**: Trigger bindings with condition evaluation (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `includes`), deterministic priority-based scene resolution, and five transition modes
- **Custom Samples**: Import with filename-based source type inference, non-destructive trim, even and onset-based slicing, kit building, and pitched sample instruments
- **World Scoring**: Motif families, score profiles with sonic identity parameters, cue families grouped by role, world map entries by context type, and derivation with seven transform types
- **Automation**: Lanes with four interpolation curves, macros (intensity/tension/brightness/space), section envelopes with six shapes, and live performance capture with thinning
- **Recall and Reuse**: Templates, snapshots, branches with lineage tracking, favorites, collections, and field-by-field entity compare
- **Studio**: Full authoring UI with 11 screens (Next.js 15 + Zustand 5) and integrated state management on a single in-memory pack
- **Validation**: Zod 4 schema validation, integrity auditing via `@motif-studio/asset-index`, 663 tests across 16 packages

## Current Strengths

- **Deep music model**: The data model captures real musical intent -- notes, scales, chords, motifs, intensity variants, cue timelines -- not just audio file references
- **Deterministic runtime**: Scene resolution is fully deterministic with priority-based binding evaluation and pack-order tie-breaking
- **Composition transforms**: 30+ clip transforms enable rapid variant generation for adaptive layering
- **Library system**: Snapshot, branch, compare, and template make creative iteration safe and traceable
- **Zero runtime dependency**: The exported pack is plain JSON with no Motif runtime required

## Known Gaps

- **No real-time audio playback** in the Studio yet (the playback engine and audio engine packages exist but are not wired to the UI)
- **No undo/redo** in the Studio (snapshots serve as manual checkpoints)
- **No collaborative editing** -- single-user, single-file authoring only
- **No plugin/VST support** -- built-in instruments and sample-based playback only

## Near-Term Phases

- **Phase 20** -- Publishing, packaging, and runtime integration guides
- **Phase 21** -- Live performance UI and launch ergonomics in the Studio
- **Phase 22** -- Visual polish, UX refinement, and keyboard shortcuts
- **Phase 23** -- Runtime intelligence: game-state adapters and integration SDKs for popular engines

## Long-Term Phases

- **Phase 24** -- Deeper composition assistance (suggestion, not generation -- AI proposes, the creator decides)
- **Phase 25** -- Advanced sampler: granular synthesis, wavetable, and source design tools
- **Phase 26** -- Team and review workflow: multi-user commenting, approval gates, version management
- **Phase 27** -- Score QA: gameplay coverage analysis, dead scene detection, binding conflict reports
- **Phase 28+** -- Platform and ecosystem expansion
