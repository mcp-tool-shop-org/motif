# Studio Overview

The Motif Studio is the main authoring application. It is a single-page Next.js application with a sidebar navigation and screen-based layout.

## Navigation Map

The Studio sidebar provides access to all screens:

| Section | Screen | Purpose |
|---------|--------|---------|
| Overview | Project | Pack metadata, entity counts, audit summary |
| Assets | Assets | Browse, filter, and manage audio assets |
| Stems | Stems | Create and edit stems bound to assets |
| Scenes | Scenes | Build scenes from stem layers |
| Bindings | Bindings | Map runtime state to scenes |
| Transitions | Transitions | Define scene-to-scene transition behavior |
| Clips | Clips | Compose clips with notes, instruments, and variants |
| Sample Lab | Sample Lab | Import, trim, slice, build kits and instruments |
| Score Map | Score Map | Profiles, motif families, cue families, world map, derivation |
| Automation | Automation | Lanes, macros, envelopes, capture, mixer |
| Library | Library | Templates, snapshots, branches, favorites, collections, compare |

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
