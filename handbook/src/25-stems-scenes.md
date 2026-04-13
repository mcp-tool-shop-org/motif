# Stems and Scenes

The Stems and Scenes screens manage the core playback structure.

## Stems Screen

- Create and edit stems
- Assign assets to stems
- Set role (base, danger, combat, boss, recovery, mystery, faction)
- Configure gain, loop, mute-by-default, and tags

## Scenes Screen

- Create and edit scenes
- Set category (exploration, tension, combat, boss, victory, aftermath, stealth, safe-zone)
- Add/remove layers with per-layer gain, start mode, and required flags
- Assign clip layers for composed content
- Set fallback scene for graceful degradation

## Layer Model

Scenes use `SceneLayerRef` objects instead of flat stem ID lists. Each layer can:

- Override gain for this scene
- Control start timing (immediate or next-bar)
- Be marked as required (cannot be muted by the mixer)

This gives precise control over how stems combine within each scene.
