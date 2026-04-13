# Apps

Motif ships two applications, both in the `apps/` directory.

## Studio (`apps/studio`)

The main authoring UI. Built with Next.js 15 and Zustand 5.

### Architecture

- **App Router** — single-page layout with screen switching via Zustand store
- **Triple store** — `useStudioStore` (pack CRUD), `usePlaybackStore` (audio engine), `usePreviewStore` (simulation)
- **13 screens** — Overview, Assets, Stems, Scenes, Bindings, Transitions, Clips, Sample Lab, Score Map, Automation, Library, Review, Preview

### Key Patterns

- All entity editing is immutable (spread + replace in store)
- Playback state syncs with a singleton `Transport` from `@motif/playback-engine`
- Preview simulation drives `scene-mapper` with manual or sequenced trigger states
- Export delegates to `@motif/runtime-pack` for field stripping and validation

## Docs (`apps/docs`)

Documentation site built with Astro. Covers:

- Getting started
- Core concepts
- Authoring workflows
- Example packs

Deployed alongside the handbook as the public-facing reference.
