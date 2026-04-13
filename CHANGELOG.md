# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-03-28

### Added
- Multi-oscillator synth voices with unison/supersaw (2-4 oscillators, up to 8 unison voices)
- LFO modulation system (filter cutoff, amplitude tremolo, pitch vibrato)
- Sample-based instrument support (SampleVoice with piano/strings/guitar templates)
- 4 new effects: chorus, distortion (soft/hard/tube), phaser, limiter
- Per-stem insert effects (4 FX slots per stem)
- MIDI import/export (Standard MIDI File parser and serializer)
- Real-time clip preview and click-to-audition on NoteGrid
- Metronome with AudioContext-scheduled click track
- 10 drum pattern presets (four-on-floor, breakbeat, trap, ambient, etc.)
- 24-bit and 32-bit float WAV export at 44.1/48/96kHz
- Undo/redo system (50-deep stack, 500ms debounce, Ctrl+Z/Ctrl+Shift+Z)
- Project save/load with localStorage autosave and .motif.json files
- Keyboard shortcuts (Space=play, Escape=stop, 1-9=screens, ?=overlay, Ctrl+S=save)
- Global BPM and time signature in transport bar
- React error boundary with dark-themed recovery UI
- 6 new synth presets: Deep Bass, Soft Keys, Supersaw, Ambient Texture + updated Warm Pad, Bright Lead

### Fixed
- 91 health findings across 5 domains (schema, engine, studio, infrastructure, CI)
- Zod schema now includes instruments, clips, cues fields (previously silently stripped)
- Cyrillic character in captureToСue function name
- All 42 pre-existing test failures (SidebarNav icon regex mismatch)
- Entity ID mutation bug across all CRUD operations
- SHA-pinning in GitHub Actions workflows (was cosmetic, now functional)
- AudioContext creation graceful fallback
- Browser audio policy resume error surfacing
- Fetch timeout (30s) and content-type validation for audio assets
- Delay feedback safety limiter (capped at 0.95)
- Crossfade master gain preservation
- setInterval drift replaced with AudioContext lookahead scheduling
- Division-by-zero guards in automation interpolation and envelope evaluation
- Transport error cleanup (stops stale timers/nodes on error)

### Changed
- Default WAV export: 24-bit/48kHz (was 16-bit/44.1kHz)
- Test count: 576 → 1,002
- InstrumentVoice interface accepts BaseAudioContext (was AudioContext)
- PlaybackEventType expanded with cue and transition events

## [1.0.4] - 2026-03-27

### Added
- FL Studio-style Arrangement screen as new default landing page
- Real-time synth clip playback in ScenePlayer via InstrumentRack voices
- AI Enhance panel with algorithmic music suggestions (drums, bass, harmony, arpeggio, variations)
- Grouped sidebar navigation (Create/Pack/Quality/Advanced)
- synthDemoPack seed data with 11 clips across 5 game scenes
- Offline WAV rendering of clip layers in CueRenderer

## [1.0.3] - 2026-03-25

### Added
- 9 workspace health tests (version consistency, scope, license, ESM, CHANGELOG)
- SHA-pinned CI actions for supply-chain safety

### Fixed
- Made `pnpm audit` non-blocking in CI (transitive dep CVEs)

## [1.0.2] - 2026-03-11

### Added

- Example packs: minimal and starter-adventure with per-pack READMEs
- Handbook entry point links in main README (Building a Cue, Custom Samples, World Scoring, Architecture)

### Changed

- Dependabot config: monthly interval, limit 3 PRs (was weekly/10)

## [1.0.1] - 2026-03-11

### Added

- Dependency vulnerability scanning in CI (`pnpm audit` step)
- Scheduled weekly security audit workflow (`.github/workflows/security.yml`)
- Dependabot configuration for npm and GitHub Actions dependencies
- Architecture map handbook chapter (09-architectural-flow.md)
- 26 new handbook chapters completing the full 40-chapter operating manual:
  - Part II: Apps, Core Packages, Musical/Playback Packages, Architectural Flow
  - Part III: SoundtrackPack Overview, Asset Model, Stems/Scenes/Clips, Bindings/Transitions, Clip Composition, Cue Structure, Sample Workflow, World Scoring, Automation/Orchestration, Library/Recall, Runtime Pack Contract
  - Part IV: Project, Assets, Sample Lab, Stems/Scenes, Clips, Score Map, Automation, Library screens
  - Part VI: Testing Strategy, Build/Lint/CI, Evolving the Data Model
- Expanded example pack documentation with workflow descriptions

### Changed

- Bumped pinned pnpm version from 10.28.2 to 10.32.1
- Updated repository overview to include all 16 packages (was missing clip-engine, instrument-rack, music-theory, playback-engine)
- Updated package boundaries table to cover all 16 packages
- Completed SCORECARD.md with actual assessment (42/50 pre-remediation → 47/50 post-remediation)
- Closed SHIP_GATE.md dependency scanning items (previously skipped)
- Closed SHIP_GATE.md translations soft-gate item
- Marked landing page as honestly deferred to post-v1

## [1.0.0] - 2026-03-10

### Added

- Studio app with 13 authoring screens (Overview, Assets, Stems, Scenes, Bindings, Transitions, Clips, Sample Lab, Score Map, Automation, Library, Review, Preview)
- 15 core packages covering schema, audio, composition, scoring, automation, playback, and export
- Documentation site (Astro)
- Comprehensive handbook (40 chapters)
- 299+ unit tests across all packages
- CI pipeline with lint, typecheck, test, and build
- Example packs and test fixtures
