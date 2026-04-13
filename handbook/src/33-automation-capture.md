# Automation and Performance Capture

Motif's automation system lets creators add expressive, time-varying control to their adaptive scores — and capture live performances of those controls.

## Automation Lanes

An automation lane is a list of timed value points for a specific target parameter.

### Creating Lanes

`createLane(id, target, points)` creates a lane with a target and initial points:

```ts
const lane = createLane("lane-1", makeTarget("volume", "stem-1"), [
  { timeMs: 0, value: 0.5 },
  { timeMs: 2000, value: 1.0 },
  { timeMs: 4000, value: 0.3 },
]);
```

### Targets

`makeTarget(param, entityId)` creates an `AutomationTarget`:
- **param**: the parameter name (volume, pan, filter, intensity, tempo, brightness, etc.)
- **entityId**: the stem, scene, or bus being controlled

### Point Operations

- `addPoint(lane, point)` — insert a point (maintains time order)
- `removePointAt(lane, timeMs)` — remove the point at a specific time
- `updatePoint(lane, timeMs, update)` — change a point's value or curve
- `clearLane(lane)` — remove all points

### Lane Queries

- `lanesForTarget(lanes, target)` — find all lanes controlling a specific target
- `lanesForParam(lanes, param)` — find all lanes for a parameter name
- `laneTimeSpan(lane)` — the time range covered by the lane

## Interpolation

Automation values between points are interpolated:

- `evaluateLane(lane, timeMs)` — get the interpolated value at any time
- `interpolate(pointA, pointB, timeMs)` — interpolate between two specific points (linear)
- `sampleLane(lane, startMs, endMs, stepMs)` — sample a lane at regular intervals (useful for visualization)
- `evaluateLanesAt(lanes, timeMs)` — evaluate multiple lanes at once, returning a map of target → value

## Macros

Macros are high-level parameters that drive multiple automation targets at once.

### Macro State

`defaultMacroState()` returns the default macro values:
- **intensity**: 0.5
- **tension**: 0.5
- **energy**: 0.5

Game state or performer input changes macro values, which then cascade to mapped parameters.

### Macro Mappings

`createMacroMapping(id, macro, param, options)` creates a mapping:
- **macro**: which macro drives this (intensity, tension, energy, or custom)
- **param**: which parameter is affected
- **influence**: how strongly the macro affects the parameter (0–1)
- **entityId**: optional target entity

### Evaluation

- `evaluateMacros(mappings, macroState)` — compute all parameter values from current macro state
- `applyMacroInfluence(baseValue, macroValue, influence)` — apply a single macro's influence to a base value
- `mappingsForMacro(mappings, macro)` — find all mappings driven by a specific macro
- `macrosAffectingParam(mappings, param)` — find all macros that affect a specific parameter

## Section Envelopes

Envelopes shape dynamics across structural sections of a cue:

`createEnvelope(id, target, sectionRole, points)`:
- **sectionRole**: intro, loop, fill, outro, breakdown, build, drop
- **points**: time-value pairs within that section

### Types

- `entryEnvelopes(envelopes)` — get envelopes for intro/build sections
- `exitEnvelopes(envelopes)` — get envelopes for outro/breakdown sections
- `envelopesForTarget(envelopes, target)` — find envelopes for a specific target
- `evaluateEnvelope(envelope, timeMs)` — get the interpolated value at a point in time

## Capture

Live capture records automation values in real time.

### Workflow

1. **Create a capture**: `createCapture(id, name, source)` — source names the parameter being recorded
2. **Record points**: `recordPoint(capture, timeMs, value)` — append a value at a time
3. **Finalize**: `finalizeCapture(capture)` — mark the capture as complete
4. **Apply**: `applyCaptureToLane(capture, lane)` — replace a lane's points with the captured data
5. **Merge**: `mergeCaptureIntoLane(capture, lane)` — blend captured data with existing lane data

### Optimization

`thinCapture(capture, tolerance)` reduces point density by removing points that fall within `tolerance` of a linear interpolation between their neighbors. This keeps captures clean without losing musical shape.

### Utilities

- `captureDuration(capture)` — total duration of the captured data

## The Performance-to-Cue Pipeline

The full expressive workflow:

1. Set up automation lanes for key parameters
2. Configure macros for high-level game-state control
3. Perform live — adjust macros, trigger scenes, capture the result
4. Apply captures to lanes — the performance becomes editable automation
5. Add section envelopes — shape intro/outro dynamics
6. Snapshot in Library — preserve this version before further editing
7. Branch if needed — try a different approach without losing the original

This pipeline transforms live musical gestures into structured, deterministic automation data that exports cleanly to the runtime pack.
