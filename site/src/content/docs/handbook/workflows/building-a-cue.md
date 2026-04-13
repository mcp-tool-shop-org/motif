---
title: Building a Cue from Scratch
description: End-to-end walkthrough from profile to export
sidebar:
  order: 0
---

This chapter walks through creating an adaptive cue from nothing — choosing a profile, composing clips, building scenes, layering them, and exporting the result.

## 1. Define the Musical Context

Start in **Score Map > Profiles**. Create a new score profile that defines the sonic identity for this cue:

- **Name**: "Forest Exploration"
- **Tempo range**: 90–110 BPM
- **Intensity range**: 0.2–0.6
- **Palette tags**: orchestral, woodwind, ambient
- **Key/Scale**: D minor

The score profile does not produce sound — it defines the musical constraints that make your cue coherent with the rest of the score.

## 2. Create Motif Material

In **Score Map > Motif Families**, create a motif family:

- **Name**: "Forest Theme"
- **Link scenes** that will carry this motif

Motif families track thematic material that recurs across cues and contexts. Even a single cue benefits from naming its core musical idea.

## 3. Compose Clips

Switch to **Clips**. Create clips for each musical layer:

- **Clip: Forest Melody** — A gentle woodwind phrase in D minor
- **Clip: Forest Rhythm** — A quiet percussion pattern
- **Clip: Forest Pad** — A sustained ambient layer

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

Each scene is a stack of stem layers. Set layer order, gain, mute/solo, section role, and intensity value.

## 5. Set Up Bindings

In **Bindings**, create trigger bindings:

- **Forest Exploration**: when `region == "forest"` and `inCombat == false` — priority 10
- **Forest Tension**: when `region == "forest"` and `danger > 0.5` — priority 20
- **Forest Combat**: when `region == "forest"` and `inCombat == true` — priority 30

Higher priority wins when multiple bindings match.

## 6. Define Transitions

In **Transitions**, create transition rules:

- Exploration to Tension: crossfade, 2s
- Tension to Combat: bar-sync
- Combat to Exploration: crossfade, 3s
- Combat to Tension: crossfade, 1.5s

## 7. Automate

In **Automation**, create lanes for volume curves, filter sweeps, or intensity parameters. Set up macro mappings. Add section envelopes to shape dynamics across intro/loop/outro.

## 8. Capture and Branch

Use **Library** to snapshot the cue before major changes. Branch from a snapshot to try a radically different version while preserving lineage.

## 9. Export

The final cue exports as part of the runtime pack — a JSON bundle containing all scenes, bindings, transitions, and references that a game engine can consume.
