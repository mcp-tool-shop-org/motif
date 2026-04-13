# Building a Cue from Scratch

This chapter walks through creating an adaptive cue from nothing — choosing a profile, composing clips, building scenes, layering them, and exporting the result.

## 1. Define the Musical Context

Start in **Score Map → Profiles**. Create a new score profile that defines the sonic identity for this cue:

- **Name**: "Forest Exploration"
- **Tempo range**: 90–110 BPM
- **Intensity range**: 0.2–0.6
- **Palette tags**: orchestral, woodwind, ambient
- **Key/Scale**: D minor

The score profile does not produce sound — it defines the musical constraints that make your cue coherent with the rest of the score.

## 2. Create Motif Material

In **Score Map → Motif Families**, create a motif family:

- **Name**: "Forest Theme"
- **Link scenes** that will carry this motif

Motif families track thematic material that recurs across cues and contexts. Even a single cue benefits from naming its core musical idea.

## 3. Compose Clips

Switch to **Clips**. Create clips for each musical layer:

- **Clip: Forest Melody** — A gentle woodwind phrase in D minor. Use the note editor to place notes, set key and scale, and use the chord palette for harmonic reference.
- **Clip: Forest Rhythm** — A quiet percussion pattern. Use the kit builder if working with custom samples.
- **Clip: Forest Pad** — A sustained ambient layer.

For each clip:
- Choose an instrument (built-in or sample instrument)
- Set key and scale
- Create intensity variants (low, mid, high) for adaptive layering
- Use motif transforms (transpose, invert, octave shift) to generate variations

## 4. Build Scenes

In **Scenes**, create scenes for each game state:

- **Forest Exploration** — Layer the melody, pad, and low-intensity rhythm
- **Forest Tension** — Add the mid-intensity rhythm variant, increase volume on the pad
- **Forest Combat** — Full intensity variants, add combat percussion layer

Each scene is a stack of stem layers. Set:
- Layer order (bottom = foundation, top = foreground)
- Gain per layer
- Mute/solo for debugging
- Section role (intro, loop, fill, outro)
- Intensity value

## 5. Set Up Bindings

In **Bindings**, create trigger bindings:

- **Forest Exploration**: when `region == "forest"` and `inCombat == false` — priority 10
- **Forest Tension**: when `region == "forest"` and `danger > 0.5` — priority 20
- **Forest Combat**: when `region == "forest"` and `inCombat == true` — priority 30

Higher priority wins when multiple bindings match. The deterministic resolver picks the highest-priority match, using pack order as tie-breaker.

## 6. Define Transitions

In **Transitions**, create transition rules:

- Exploration → Tension: crossfade, 2s
- Tension → Combat: bar-sync
- Combat → Exploration: crossfade, 3s
- Combat → Tension: crossfade, 1.5s

## 7. Automate

In **Automation**:
- Create lanes for volume curves, filter sweeps, or intensity parameters
- Set up macro mappings if you want game state to drive multiple parameters at once
- Add section envelopes to shape dynamics across intro/loop/outro

## 8. Capture and Branch

Use **Library** to snapshot the cue before major changes. If you want to try a radically different version, branch from a snapshot — this creates a fully independent copy while preserving lineage.

## 9. Export

The final cue exports as part of the runtime pack — a JSON bundle containing all scenes, bindings, transitions, and references that a game engine can consume. Audio assets are referenced by path; the runtime resolves them.

## Result

You now have an adaptive cue that:
- Responds to game state (exploration → tension → combat)
- Has deterministic transitions between states
- Carries a consistent motif across all states
- Supports intensity-variant layering
- Can be branched, templated, and reused in the Library
