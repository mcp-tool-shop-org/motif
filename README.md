<p align="center">
  <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif-studio"><img src="https://img.shields.io/npm/v/@motif-studio/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Adaptive soundtrack studio for composing, arranging, scoring, and exporting interactive game music.

## What It Is

Motif is a composition-first, adaptation-aware workstation. It combines structured music authoring — clips, cues, scenes, layers, automation — with adaptive logic that responds to game state at runtime. The result: game music that feels intentional, not generated.

## What It Is Not

A DAW. A toy sequencer. An AI music generator. A world-building database with sound attached. Motif is a serious creative instrument for adaptive game score authoring.

Motif does not generate music. It does [ingest](#generated-cues-and-the-genre-library) audio you generated elsewhere, turning a mix, its stems and a loudness reading into scenes, cue families and layered playback. Where the audio came from is your business; Motif's job starts once the take exists.

## What It Can Do

- **Compose** — Clips with notes, instruments, scales, chords, motif transforms, intensity variants
- **Synthesize** — Multi-oscillator synth voices with unison/supersaw (16 presets), LFO modulation (filter, amplitude, pitch)
- **Sample instruments** — Piano, strings, guitar templates via SampleVoice; import, trim, slice, kit builder
- **Arrange** — Scenes with layered stems, section roles, intensity curves; 10 drum pattern presets
- **Mix and effect** — 8 effect types (EQ, delay, reverb, compressor, chorus, distortion, phaser, limiter); 4 insert FX slots per stem
- **Score a world** — Motif families, score profiles, cue families, world map entries, derivation
- **Ingest generated audio** — Turn a cloud-generated mix + Demucs stems + LUFS reading into a playable, loudness-normalized pack; content-addressed so re-runs are near-instant
- **Build genre packs from a catalog** — One JSON entry per cue derives a whole pack: scene, cue family, generation lock, bindings, and A/B takes
- **Automate** — Lanes, macros, envelopes, live capture and merge
- **Recall and reuse** — Templates, snapshots, branches, favorites, collections, compare
- **MIDI** — Import/export Standard MIDI Files
- **Adaptive logic** — Trigger bindings, transitions, deterministic scene resolution
- **Perform** — Real-time clip preview, click-to-audition, metronome with AudioContext-scheduled clicks
- **Validate** — Schema validation, integrity auditing, cross-reference checks
- **Export** — 24/32-bit WAV at 44.1/48/96kHz; runtime packs for game engine consumption
- **Author** — Undo/redo (50-deep, Ctrl+Z), project save/load with autosave, keyboard shortcuts (Space=play, ?=help), global BPM and time signature
- **Reliability** — Error boundary with graceful recovery, AudioContext lookahead scheduling for sample-accurate timing

## Generated Cues and the Genre Library

Motif can build a playable `SoundtrackPack` out of generated audio. You describe a pack in a catalog file, generate the audio however you like, and Motif turns it into scenes, cue families and layered stems you can audition in Studio.

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif owns the last two steps. It cares only that each take arrives as a mix, its stems, and a loudness reading.

**The built-in catalog describes 24 genre packs — 233 cues, two takes per cue.** Fantasy, tactics, dungeon, steampunk, pirate, western, space opera, cyberpunk, mythic, wasteland, eastern, norse, desert, forest, frozen, gothic, undersea, volcanic, cozy, noir, emotional themes, ambient drones, tension and menus. The catalog and the derivation live in this repo; **the audio masters do not** — they are large and generated per-user, so you supply them and run the ingest.

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

Ingest is **content-addressed and incremental**: a take whose input files still hash to what the previous run recorded is reused instead of re-decoded, so re-running a finished pack takes about a second rather than minutes, and an interrupted run resumes where it stopped. `--force` re-decodes everything to prove the pipeline still reproduces its own output; `--skip-defective` drops a malformed take, reports it, and exits non-zero rather than halting the whole run.

See [Generated Cues and Library Packs](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/) in the handbook for the full workflow, including generation locks and take curation.

## Monorepo Structure

### Apps

| App | Description |
|-----|-------------|
| [`apps/studio`](apps/studio) | Main authoring UI (Next.js, Zustand 5) |

### Core Packages

| Package | Description |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Canonical types, Zod schemas, parse/validate |
| [`@motif-studio/asset-index`](packages/asset-index) | Pack integrity indexing and auditing |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Sample playback, voice management, AudioContext scheduling |
| [`@motif-studio/test-kit`](packages/test-kit) | Fixtures and test utilities |

### Composition and Playback

| Package | Description |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Clip sequencing, transforms, cue scheduling |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Multi-oscillator synth, drum voice, sample voice, LFO modulation, 16 presets |
| [`@motif-studio/music-theory`](packages/music-theory) | Scales, chords, motifs, intensity transforms |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Real-time playback, mixing, 8 effect types, MIDI I/O, WAV export (24/32-bit) |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Trim, slice, kit, instrument helpers — plus the generation lane: cloud run client, artifact ingest, loudness normalization, library pack build |
| [`@motif-studio/score-map`](packages/score-map) | Motifs, profiles, cue families, derivation, library catalog |
| [`@motif-studio/automation`](packages/automation) | Lanes, macros, envelopes, capture |
| [`@motif-studio/library`](packages/library) | Templates, snapshots, branches, favorites, compare |

### Infrastructure

| Package | Description |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Trigger mapping and deterministic binding evaluation |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Runtime export/import with deterministic serialization |
| [`@motif-studio/review`](packages/review) | Summaries and audit helpers |
| [`@motif-studio/ui`](packages/ui) | Shared UI components |

## Install

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

All packages are published to npm under the `@motif-studio` scope.

## Quick Start (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requirements:** Node.js >= 22, pnpm >= 10

## Testing

All 16 packages have unit tests covering schema validation, integrity auditing, sample operations, world scoring, automation, library management, playback, synthesis, effects, MIDI, generation ingest, and studio integration. 1,709 tests across all packages.

Run everything: `pnpm test`

## Handbook

The [handbook](https://mcp-tool-shop-org.github.io/motif/handbook/product/) is the comprehensive operating manual covering product definition, architecture, studio navigation, creative workflows, and strategy. Key entry points:

- [Product: What Motif Is](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Architecture: Repository Overview](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Workflow: Building a Cue from Scratch](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Workflow: Generated Cues and Library Packs](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [Workflow: Working with Custom Samples](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Workflow: World Scoring](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Strategy: Glossary](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Example Packs](examples/)

## Security and Trust

**Studio runs entirely in the browser.** No server, no cloud sync, no telemetry.

- **Data touched:** User-created soundtrack pack files (JSON), audio asset references, browser local storage
- **Data NOT touched:** No server-side storage, no file system access beyond browser sandbox
- **Network:** The Studio app makes zero network egress — all authoring and playback is client-side
- **Secrets:** Does not read, store, or transmit credentials
- **Telemetry:** None collected or sent
- **Permissions:** Standard browser APIs only (Web Audio API)

**One exception, and it is opt-in and outside the app:** `@motif-studio/sample-lab` ships a command-line generation lane that talks to a Comfy Cloud endpoint to submit and retrieve generation jobs. It runs only when you invoke it from a terminal, it is never imported by the Studio app, and it reads its credentials from your own environment. Skip it entirely and Motif remains fully offline.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

MIT

---

Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
