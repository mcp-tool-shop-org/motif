<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif/studio

The Studio app is the primary authoring surface for Motif packs. It provides a dark-themed control surface for creating, editing, and inspecting every entity in a pack.

## Screens

| Screen | Purpose |
|--------|---------|
| **Project** | Pack metadata, stats overview, unused entity detection |
| **Assets** | CRUD for audio assets (music, sfx, ambience, stinger, voice) |
| **Stems** | CRUD for stems with asset assignment and role tagging |
| **Scenes** | CRUD for scenes with inline layer editing (add/remove/reorder) |
| **Bindings** | CRUD for bindings with inline condition editing |
| **Transitions** | CRUD for transitions with mode-specific validation warnings |
| **Review** | Live validation findings from `@motif/review`, grouped by severity |
| **Preview** | Manual and sequence runtime state simulation with engine integration |

## Preview

The Preview screen simulates runtime soundtrack behavior against the current draft pack.

Current capabilities:
- manual runtime state preview
- editable sequence simulation
- winning binding and scene inspection
- active stem inspection
- transition and warning visibility

This preview is simulation-based and does not perform real audio playback.

## Development

```bash
pnpm --filter @motif/studio dev    # Next.js dev server
pnpm --filter @motif/studio build  # Production build
pnpm --filter @motif/studio test   # Run tests
```

## Stack

- **Framework:** Next.js 15 (App Router)
- **State:** Zustand
- **Validation:** `@motif/review` (derived via `useReview` hook)
- **Testing:** Vitest + Testing Library + jsdom
- **Styling:** CSS variables, dark theme (no CSS-in-JS)
