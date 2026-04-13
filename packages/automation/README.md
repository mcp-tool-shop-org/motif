<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/automation

Expressive automation for Motif — lanes, interpolation, macros, envelopes, and live capture.

## What It Owns

- Automation lane creation and point management
- Time-based value interpolation (linear)
- Macro state management and multi-parameter mappings
- Section envelopes for cue structure dynamics
- Live capture recording, thinning, and application

## Key Exports

### Lanes (`lanes.ts`)
- `createLane(id, target, points)` — create a lane with target and initial points
- `makeTarget(param, entityId)` — create an automation target
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`

### Interpolation (`interpolate.ts`)
- `evaluateLane(lane, timeMs)` — interpolated value at any time
- `interpolate(pointA, pointB, timeMs)` — linear interpolation
- `sampleLane(lane, startMs, endMs, stepMs)` — regular-interval sampling
- `evaluateLanesAt(lanes, timeMs)` — evaluate multiple lanes at once

### Macros (`macros.ts`)
- `defaultMacroState()` — default intensity/tension/energy values
- `createMacroMapping(id, macro, param, options)` — map macro → parameter
- `evaluateMacros(mappings, macroState)` — compute all parameter values
- `applyMacroInfluence(baseValue, macroValue, influence)` — single influence calc
- `mappingsForMacro` / `macrosAffectingParam`

### Envelopes (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)` — section-scoped automation
- `evaluateEnvelope(envelope, timeMs)` — interpolated envelope value
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`

### Capture (`capture.ts`)
- `createCapture(id, name, source)` — start a capture session
- `recordPoint(capture, timeMs, value)` — record a value
- `finalizeCapture(capture)` — mark complete
- `applyCaptureToLane` / `mergeCaptureIntoLane` — apply to lanes
- `thinCapture(capture, tolerance)` — reduce point density
- `captureDuration(capture)` — total duration

## What It Does Not Own

- Audio DSP or effects processing
- Scene orchestration or playback
- Clip composition
- UI components

## Dependencies

- `@motif-studio/schema` — types for lanes, targets, points, macros, envelopes, captures
