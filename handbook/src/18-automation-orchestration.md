# Automation and Orchestration Model

Automation gives Motif compositions dynamic, time-varying expression.

## Automation Lanes

A lane targets a specific parameter on a specific entity and stores a sequence of time/value points. Linear interpolation produces smooth curves between points.

- `evaluateLane(lane, timeMs)` — value at any point in time
- `sampleLane(lane, startMs, endMs, stepMs)` — regular-interval sampling
- `evaluateLanesAt(lanes, timeMs)` — evaluate multiple lanes simultaneously

## Macros

Macros provide high-level creative control:

- **Intensity** — overall energy level
- **Tension** — harmonic and rhythmic urgency
- **Energy** — density and velocity

Macro mappings connect these high-level values to specific parameters with influence curves. `evaluateMacros` computes all downstream parameter values from the current macro state.

## Section Envelopes

Envelopes are section-scoped automation (entry, sustain, exit). They define how a parameter evolves within a cue section, separate from lane-level automation.

## Live Capture

Capture records real-time parameter changes during preview:

1. `createCapture` — start a recording session
2. `recordPoint` — record time/value pairs as they happen
3. `finalizeCapture` — mark the session complete
4. `thinCapture` — reduce point density within a tolerance
5. `applyCaptureToLane` / `mergeCaptureIntoLane` — write captured data to lanes

This allows "performance capture" — the creator plays with parameters in real time, and the results become reusable automation data.
