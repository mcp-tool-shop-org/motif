# Bindings and Transitions

## TriggerBinding

Maps runtime game state to a scene.

```typescript
interface TriggerBinding {
  id: string
  name?: string
  sceneId: string
  conditions: TriggerCondition[]
  priority: number
  stopProcessing?: boolean
}

interface TriggerCondition {
  field: string
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'includes'
  value: string | number | boolean
}
```

### Resolution Rules

1. All conditions in a binding must match for the binding to be considered
2. Among matching bindings, the highest `priority` wins
3. `stopProcessing: true` prevents lower-priority bindings from being evaluated
4. Ties are broken deterministically by binding order

### Example

```json
{
  "id": "bind-combat",
  "sceneId": "scene-combat",
  "conditions": [
    { "field": "mode", "op": "eq", "value": "combat" },
    { "field": "danger", "op": "gte", "value": 7 }
  ],
  "priority": 10
}
```

## TransitionRule

Defines how music moves between scenes.

```typescript
interface TransitionRule {
  id: string
  name?: string
  fromSceneId: string
  toSceneId: string
  mode: 'immediate' | 'crossfade' | 'bar-sync' | 'stinger-then-switch' | 'cooldown-fade'
  durationMs?: number        // required for crossfade and cooldown-fade
  stingerAssetId?: string    // required for stinger-then-switch
  notes?: string
}
```

### Transition Modes

| Mode | Behavior |
|------|----------|
| `immediate` | Hard cut to the new scene |
| `crossfade` | Gradual fade between scenes over `durationMs` |
| `bar-sync` | Wait for the current bar to end, then switch |
| `stinger-then-switch` | Play a stinger asset, then switch when it finishes |
| `cooldown-fade` | Gradual fade-out of the current scene over `durationMs`, then start the new scene |

### Validation

- `durationMs` is required when mode is `crossfade` or `cooldown-fade`
- `stingerAssetId` must reference a valid asset when mode is `stinger-then-switch`
- Self-referential transitions (from = to) are flagged as warnings
