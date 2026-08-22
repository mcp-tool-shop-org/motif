---
title: Roadmap
description: Current state, strengths, gaps, and future phases
sidebar:
  order: 1
---

## Where Motif Is Today

Motif has grown from a schema-only data format into an adaptive soundtrack workstation
that **plays real audio end to end** — authored MIDI synthesis and generated beds, layered,
transitioning, and audible in the Studio:

- **Composition**: Clips with notes, instruments, scales, chords, motif transforms (30+
  transforms in `@motif-studio/clip-engine`), intensity variants, and cue structures with
  timelines and section roles
- **Arrangement**: Scenes with stem layers, gain control, mute/solo, section roles,
  intensity settings, and clip layer references
- **Adaptive Logic**: Trigger bindings with condition evaluation (`eq`, `neq`, `gt`, `gte`,
  `lt`, `lte`, `includes`), deterministic priority-based scene resolution, and five
  transition modes — honoured both between scenes and inside cue playback, and fully
  cancellable (Stop always stops, even mid-transition)
- **Real-Time Playback**: The playback engine is wired to the Studio — scene stems, synth
  clip layers, generated beds, stingers, crossfades, bar-sync and cooldown transitions all
  sound from the transport, with a mixer (buses, sends, per-stem FX inserts) underneath
- **Generated Cues & Library Packs**: A catalog-driven pipeline turns AI-generated audio
  into playable packs — one scene, cue family (with a generation lock), and binding per
  cue, A/B takes with loudness normalization under a +6 dB boost cap, and full generation
  provenance on every record. See
  [Generated Cues and Library Packs](/motif/handbook/workflows/generated-cues/)
- **Custom Samples**: Import with filename-based source type inference, non-destructive
  trim, even and onset-based slicing, kit building, and pitched sample instruments
- **World Scoring**: Motif families, score profiles with sonic identity parameters, cue
  families grouped by role, world map entries by context type, and derivation with seven
  transform types
- **Automation**: Lanes with four interpolation curves, macros
  (intensity/tension/brightness/space), section envelopes with six shapes, and live
  performance capture with thinning
- **Recall and Reuse**: Templates, snapshots, branches with lineage tracking, favorites,
  collections, and field-by-field entity compare
- **Studio**: Full authoring UI with 18 screens (Next.js 15 + Zustand 5) on a single
  in-memory pack, including a runtime Preview whose state controls are derived from the
  loaded pack's own bindings
- **Validation**: Zod 4 schema validation, integrity auditing via
  `@motif-studio/asset-index`, and 1,709 tests spanning all 16 packages plus the Studio

## Current Strengths

- **Deep music model**: The data model captures real musical intent — notes, scales,
  chords, motifs, intensity variants, cue timelines — not just audio file references
- **Deterministic runtime**: Scene resolution is fully deterministic with priority-based
  binding evaluation and pack-order tie-breaking
- **Provenance-first generation**: Every generated take records the exact prompt, seed,
  tempo, key, and job that produced it; prompt text is append-only, so a record never
  claims a prompt that didn't produce it
- **Composition transforms**: 30+ clip transforms enable rapid variant generation for
  adaptive layering
- **Library system**: Snapshot, branch, compare, and template make creative iteration safe
  and traceable
- **Zero runtime dependency**: The exported pack is plain JSON with no Motif runtime
  required

## Known Gaps

- **No take switching in the Studio UI** — A/B takes both live in the pack and the runtime
  honours `playbackDefault`, but changing the default currently means re-running ingest
- **Ingest does not scale, and this is the biggest one** — measured at ~1.2 takes/min
  (~43 s per take), so a 24-pack library is a **~6.7 hour build** writing **~42 GB** of
  24-bit WAV. Three separate causes, each worth roughly an order of magnitude: there is
  **no content-hash skip**, so an unfiltered re-run rebuilds unchanged takes byte-for-byte;
  every take is **transcoded** to WAV when browsers decode FLAC natively; and the loop is
  **fully serial with synchronous writes**. Fixing any one makes library-scale practical.
  Until then, always pass `--pack` or `--tier` — see
  [Generated Cues](/motif/handbook/workflows/generated-cues/)
- **No loop/seam construction yet** — generated beds play as fixed-length loops without
  crafted seam points
- **No collaborative editing** — single-user, single-file authoring only
- **No plugin/VST support** — built-in instruments, sample playback, and generated beds only

## Near-Term Phases

- **Library breadth** — ingest and audition the remaining catalog tiers; per-cue re-rolls
  where a take underperforms (extra seeds are cheap; quiet slow cues especially benefit)
- **Faster ingest** — content-hash skip first (turns a re-run from hours into seconds),
  then serve FLAC instead of transcoding, then parallelise per-take work
- **Take curation UI** — switch A/B/C takes per cue from the Studio instead of re-ingesting
- **Intensity-variant takes** — calm/intense conditioned generations per cue family,
  complementing stem-mute intensity tiers
- **Runtime integration** — packaging and game-state adapter guides for engines consuming
  exported packs, including generated beds

## Long-Term Phases

- **Deeper composition assistance** — suggestion, not generation: AI proposes, the creator
  decides
- **Advanced sampler** — granular synthesis, wavetable, and source design tools
- **Team and review workflow** — multi-user commenting, approval gates, version management
- **Score QA** — gameplay coverage analysis, dead scene detection, binding conflict reports
- **Platform and ecosystem expansion**
