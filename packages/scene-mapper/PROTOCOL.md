# Game State Bridge Protocol v1

## Overview

This document defines the wire format for game engines to push state to Motif's scene resolver. The protocol is engine-agnostic — it defines the data contract, not the transport (WebSocket, IPC, or direct function call).

## State Model

Game state is a flat key-value map:

```typescript
type GameStateValue = string | number | boolean;
type GameState = Record<string, GameStateValue>;
```

Engines push state as either a **snapshot** (replaces all state) or a **delta** (merges into existing state):

```typescript
interface StateUpdate {
  type: "snapshot" | "delta";
  state: GameState;
  timestampMs?: number;
}
```

## Resolution

When state changes, the `GameStateManager` evaluates all trigger bindings in the pack against the current accumulated state. The winning scene is determined by:

1. All binding conditions must match (AND logic)
2. Highest priority binding wins
3. Pack order breaks ties
4. `stopProcessing` truncates the candidate list after priority sort

## Reserved Keys

These keys have well-known semantics. Engines should use them for common game concepts:

| Key | Type | Description |
|-----|------|-------------|
| `location` | string | Current location/area identifier |
| `combat_active` | boolean | Whether combat is active |
| `combat_intensity` | number (0-1) | Combat threat level |
| `investigation_active` | boolean | Investigation/discovery sequence active |
| `alert_level` | number (0-1) | Enemy awareness level |
| `emotion` | string | Current emotional context label |
| `safe_zone` | boolean | Player is in a safe area |
| `faction` | string | Current faction context |
| `boss_active` | boolean | Boss encounter is active |
| `victory` | boolean | Objective completed |

Engines can use any additional custom keys. Reserved keys are not enforced — they're conventions.

## Usage

```typescript
import { GameStateManager } from "@motif-studio/scene-mapper";

const mgr = new GameStateManager({ maxHistorySize: 100 });

// Full state snapshot
const r1 = mgr.resolveFromState(pack, {
  location: "freeport",
  combat_active: false,
});
console.log(r1.sceneId); // "sc-freeport-exploration"

// Delta update (only changes combat_active, location preserved)
const r2 = mgr.pushDelta(pack, { combat_active: true });
console.log(r2.sceneId); // "sc-freeport-combat"

// Check if scene changed
console.log(mgr.didSceneChange()); // true

// Inspect history
console.log(mgr.getHistory().length); // 2
```

## Engine Integration

### UE5

The UE5 plugin calls `resolveFromState()` or `pushDelta()` whenever game state changes (entering an area, starting combat, triggering an event). The returned `SceneResolution.sceneId` tells the audio system which scene to transition to.

### Godot

Same pattern — GDScript pushes state updates via a Motif autoload singleton. The singleton holds a `GameStateManager` instance (ported to GDScript or called via JavaScript bridge).

## History

The manager maintains a ring buffer of state + resolution pairs for debugging. Use `getHistory()` to inspect how the score responded to game events over time.
