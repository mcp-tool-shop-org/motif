# Starter Adventure Pack

A complete RPG exploration-to-combat soundtrack demonstrating Motif's core adaptive workflow.

## What's Inside

- 8 audio assets (loops, oneshots, stingers, ambient)
- 7 stems with roles (base, accent, danger, combat, recovery)
- 5 scenes (exploration, tension, combat, victory, safe-zone)
- 5 bindings with priority-ordered game state conditions
- 4 transitions (crossfade, stinger-then-switch, immediate, cooldown-fade)

## What It Demonstrates

- **Asset variety** — loops with BPM/key metadata, oneshots, stingers, ambient layers
- **Stem layering** — multiple stems per scene with gain and mute defaults
- **Scene fallbacks** — scenes chain to fallback scenes when conditions change
- **Trigger bindings** — game state conditions (`mode`, `danger`, `health`) with priority ordering
- **Transition modes** — crossfade, stinger-triggered, immediate cut, and cooldown-fade
- **Adaptive flow** — exploration → tension → combat → victory → exploration cycle

## Try It In Studio

1. **Project** — pack metadata, tags, author
2. **Assets** — browse 8 assets with audio metadata (BPM, key, loop points)
3. **Stems & Scenes** — see how stems layer within scenes, inspect mute/gain defaults
4. **Bindings** — open each binding to see condition rules and priorities
5. **Score Map** — empty here, but see the [world scoring example](../README.md) for that workflow

## Adaptive Behavior Walkthrough

The pack models a classic RPG audio state machine:

```
exploration (calm loop + accent)
    ↓ crossfade (danger detected)
tension (tension base layer)
    ↓ stinger-then-switch (combat triggered)
combat (combat base + danger layer)
    ↓ immediate (enemy defeated)
victory (fanfare oneshot)
    ↓ cooldown-fade (return to exploration)
exploration
```

Each transition uses a different mode to show the range of adaptive switching available.
