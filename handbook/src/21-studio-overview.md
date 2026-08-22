# Studio Overview

The Motif Studio is the main authoring application. It is a single-page Next.js application with a sidebar navigation and screen-based layout.

## Navigation Map

The Studio sidebar provides access to all screens:

| Group | Screen | Purpose |
|-------|--------|---------|
| Create | Arrangement | Scene playback, channel rack, per-scene layer editing |
| Create | Clip Editor | Compose clips with notes, instruments, and variants |
| Create | Scenes | Build scenes from stem layers |
| Create | Mixer | Channel levels and routing |
| Pack | Project | Pack metadata, entity counts, audit summary |
| Pack | Assets | Browse, filter, and manage audio assets |
| Pack | Stems | Create and edit stems bound to assets |
| Pack | Bindings | Map runtime state to scenes |
| Pack | Transitions | Define scene-to-scene transition behavior |
| Quality | Review | Validation issues and pack health |
| Quality | Export | Runtime pack export |
| Advanced | Sample Lab | Import, trim, slice, build kits and instruments |
| Advanced | Score Map | Profiles, motif families, cue families, world map, derivation |
| Advanced | Automation | Lanes, macros, envelopes, capture, mixer |
| Advanced | Library | Templates, snapshots, branches, favorites, collections, compare |
| Advanced | Preview | Simulate runtime state and inspect binding resolution |
| Advanced | Performance | Playback timing and diagnostics |
| Advanced | Cues | Cue sections, intensity, and transition modes |

## Preview and binding resolution

The Preview screen simulates runtime state and shows which binding wins, which scene resolves, and which stems are active.

Its controls are **derived from the loaded pack's own bindings**, not from a fixed field list. Alongside the built-in mode / danger / flag controls, Preview inspects every binding condition in the pack and renders an input for each field it does not already cover, choosing the control from how the field is compared:

| condition shape | control |
|---|---|
| `eq` against string values | picker of exactly those values |
| all-boolean | checkbox |
| any `gt` / `gte` / `lt` / `lte` | number |
| anything else | text |

This matters because packs bind on very different fields. A demo pack binds on `mode` and `danger`; a game score binds on `location`, `combat_active`, `alert_level`; a generated library pack binds on `cue`. A fixed control set silently becomes an assumption about which packs may exist — and a pack binding on fields the simulator cannot set will resolve nothing at all.

**Seeding is asymmetric by design.** A pack whose bindings form a flat `eq` menu over a single field — the shape a library pack has — is seeded to its first value on load, so Preview opens resolved and playable. A multi-axis pack is left unset deliberately: seeding it would mean asserting several independent game-state flags at once, which is not a state worth presenting as a default. Such a pack opens unresolved until you set a field, and says so.

A test asserts that no example pack binds on a field Preview cannot set.

## Architecture

The Studio uses Zustand for state management. The entire application state lives in a single store that holds:

- The active `SoundtrackPack` (the authoring document)
- The current navigation section
- Filter/search state for assets
- Macro state for automation

All CRUD operations on the pack are store actions that produce immutable updates. There is no separate backend — the Studio operates on an in-memory pack loaded from JSON.

## Screen Relationships

Screens are not isolated. Entities created in one screen appear in others:

- **Assets** created or imported in the Assets screen are available in Sample Lab for trimming and slicing
- **Slices** created in Sample Lab feed into Sample Kits and Sample Instruments
- **Clips** composed in the Clips screen reference instruments and are used in scene layers
- **Scenes** built in the Scenes screen are referenced by bindings, transitions, cue families, and world map entries
- **Score Profiles** and **Motif Families** defined in Score Map are used by cue families and world map entries
- **Automation Lanes** and **Macros** affect mixer parameters and scene behavior
- **Templates, Snapshots, and Favorites** in Library can reference any entity kind — clips, scenes, profiles, cue families, etc.

## Where to Start

For a new project:
1. Start at **Assets** — import or review your audio sources
2. Move to **Sample Lab** if you need to trim, slice, or build kits/instruments
3. Build **Clips** — compose note patterns with instruments
4. Arrange **Scenes** — layer stems and clips into musical states
5. Set up **Bindings** and **Transitions** — connect scenes to game logic
6. Structure **Cues** in the Score Map — link cue families and motif families
7. **Automate** — add expressive lanes, macros, and envelopes
8. Use **Library** — snapshot, branch, template, and compare as you iterate

## Dark Theme and Layout Philosophy

The Studio uses a dark color scheme with a narrow sidebar, full-width content panels, and tabbed sub-panels. The layout prioritizes:

- Maximum content area for editors and lists
- Inline editing (no modal dialogs)
- Direct manipulation (sliders, toggles, inline inputs)
- Consistent list/detail pattern across all entity screens
