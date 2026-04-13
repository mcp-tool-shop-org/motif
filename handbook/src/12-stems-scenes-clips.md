# Stems, Scenes, and Clip Layers

## Stem

A playable layer bound to an audio asset with a role label.

```typescript
interface Stem {
  id: string
  name: string
  assetId: string       // references an AudioAsset
  role: 'base' | 'danger' | 'combat' | 'boss' | 'recovery' | 'mystery' | 'faction'
  gainDb?: number       // default gain offset
  loop: boolean         // whether the stem loops
  mutedByDefault?: boolean
  tags?: string[]
}
```

Roles describe the musical function, not the game state. A `base` stem is the foundation, `danger` adds tension, `combat` adds aggression, etc.

## Scene

A musical state composed of stem layers and optional clip layers.

```typescript
interface Scene {
  id: string
  name: string
  category: 'exploration' | 'tension' | 'combat' | 'boss' | 'victory' | 'aftermath' | 'stealth' | 'safe-zone'
  layers: SceneLayerRef[]
  clipLayers?: SceneClipRef[]
  fallbackSceneId?: string
  tags?: string[]
  notes?: string
}
```

### SceneLayerRef

Each layer references a stem with per-scene overrides:

```typescript
interface SceneLayerRef {
  stemId: string
  required?: boolean     // must play; cannot be muted by mixer
  startMode?: 'immediate' | 'next-bar'
  gainDb?: number        // per-layer gain override
}
```

This replaced the original `stemIds: string[]` design. The richer layer model allows per-stem gain, launch timing, and required flags within each scene.

### SceneClipRef

Scenes can also activate clips:

```typescript
interface SceneClipRef {
  clipId: string
  startTick?: number
  loop?: boolean
}
```

## Fallback Scenes

Every scene can declare a `fallbackSceneId`. If no trigger binding matches the current game state, the scene mapper falls back through this chain. Self-referential fallbacks are flagged as warnings by `asset-index`.
