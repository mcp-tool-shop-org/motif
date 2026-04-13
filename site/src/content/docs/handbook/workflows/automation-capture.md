---
title: Automation and Performance Capture
description: Expressive time-varying control and live performance recording
sidebar:
  order: 3
---

Motif's automation system lets creators add expressive, time-varying control to their adaptive scores — and capture live performances of those controls.

## Automation Lanes

An automation lane is a list of timed value points for a specific target parameter. Create lanes with `createLane(id, name, param, target)` where `param` is the automatable parameter (`volume`, `pan`, `filterCutoff`, `reverbSend`, `delaySend`, `intensity`) and `target` identifies what the lane is attached to (a clip layer, scene layer, or cue section). Use `addPoint(lane, point)` to add keyframes and the interpolation engine to get values at any time.

Each point has a `timeMs` offset, a normalized `value` (0--1), and an optional `curve` type (`linear`, `exponential`, `step`, `smooth`) controlling interpolation to the next point.

## Macros

Macros are high-level parameters (`intensity`, `tension`, `brightness`, `space`) that drive multiple automation targets at once. Game state or performer input changes macro values, which cascade to mapped parameters via `evaluateMacros(state, mappings, targetId?)`. Create mappings with `createMacroMapping(id, macro, param, weight, opts?)` where `weight` (0--1) controls how much a macro movement affects the target parameter. Mappings can be inverted so that macro-up drives param-down.

## Section Envelopes

Envelopes shape dynamics at the entry or exit of a cue section. Six shapes are available: `fade-in`, `fade-out`, `swell` (quadratic curve), `duck` (dip and recover), `filter-rise` (smooth opening), and `filter-fall` (smooth closing). Each envelope has a duration, a depth (0--1), and a position (`entry` or `exit`). Create them with `createEnvelope(id, targetId, shape, durationMs, position, depth?)` and evaluate with `evaluateEnvelope(envelope, offsetMs)`. They add structural dynamics without manually placing automation points.

## Capture

Live capture records automation values in real time:

1. **Create a capture**: `createCapture(id, name, source)`
2. **Record points**: `recordPoint(capture, timeMs, value)`
3. **Finalize**: `finalizeCapture(capture, laneId?)` — sorts points by time and optionally links to a lane
4. **Apply**: `applyCaptureToLane` or `mergeCaptureIntoLane`
5. **Optimize**: `thinCapture(capture, tolerance)` reduces point density

## The Performance-to-Cue Pipeline

1. Set up automation lanes for key parameters
2. Configure macros for high-level game-state control
3. Perform live — adjust macros, trigger scenes, capture the result
4. Apply captures to lanes — the performance becomes editable automation
5. Add section envelopes — shape intro/outro dynamics
6. Snapshot in Library — preserve this version before further editing
7. Branch if needed — try a different approach without losing the original

This pipeline transforms live musical gestures into structured, deterministic automation data that exports cleanly to the runtime pack.
