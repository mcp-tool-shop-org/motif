---
title: Generated Cues and Library Packs
description: Turning AI-generated audio into playable, curated soundtrack packs
sidebar:
  order: 5
---

Motif can build a playable `SoundtrackPack` out of AI-generated audio. You describe a pack in a catalog file, generate the audio, and Motif turns it into scenes, cue families, and layered stems you can audition in Studio.

This is how the built-in genre library is made, and the same path works for your own packs.

## The shape of it

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif owns the last two steps. Where the audio comes from is your business — Motif cares that each take arrives as a mix plus stems plus a loudness reading.

## The catalog is the spec

One JSON file describes every pack. A cue looks like this:

```json
{
  "id": "town",
  "bpm": 90,
  "keyscale": "C major",
  "seedA": 2011,
  "seedB": 2012,
  "prose": "Fantasy Town: A warm, bustling village theme. Cheerful woodwind melody
            dances over pizzicato strings and light tambourine..."
}
```

That entry is enough for Motif to derive a whole pack:

- **one scene per cue**, named deterministically from the cue id
- **one cue family per cue**, locked to that cue's `bpm` / `keyscale` / time signature
- **one binding per cue**, so the cue can be addressed by name
- **two takes per cue** — seed A and seed B

Adding a pack to the catalog costs no code. The derivation scans the catalog for any entry carrying a `cues` array, so new tiers or your own packs are picked up on load.

### Generation locks

A cue family carries a **generation lock** — the bpm, keyscale and time signature its audio was made at. When a take is folded into a pack, the lock is checked. A take generated at a different tempo than its family claims is rejected rather than quietly attached, so a pack can't drift out of sync with the audio it describes.

## Takes and curation

Every cue is generated **twice**, at two seeds. Generative models vary a lot between seeds — in measured runs, two takes of the same cue with identical settings have differed by more than 9 dB in loudness and considerably more in character.

- The **lower seed (A)** becomes the scene's playing bed by default.
- The **higher seed (B)** is attached to the cue family as a non-default record.

Both live in the pack. `playbackDefault` decides which one plays.

:::caution[Known gap]
Studio does not yet expose take switching in the UI. Both takes are in the pack and the runtime honours `playbackDefault`, but changing which take is the default currently means re-running the ingest rather than clicking in Studio. Until that lands, B-takes are stored but not auditionable in-app.
:::

## Loudness and the boost cap

Every take is measured for integrated loudness (LUFS) at generation time, and normalized toward a **−14 LUFS** bed target on ingest.

Boosts are capped at **+6 dB**; cuts are uncapped. A take needing more than +6 dB is boosted as far as the cap allows and flagged `boostCapped` on its record.

The cap exists because the alternative is worse: lifting a very quiet render by 15 dB raises its noise floor with it. A capped take plays quieter than its neighbours but stays clean.

The cap works. A take measured at −24.6 LUFS raw plays at −19.3 dBFS in Studio against a −17.6 dBFS neighbour — noticeably softer, but present and usable rather than silent.

### Plan for quiet cues

Measured across 466 takes in the built-in library:

| cue tempo | takes that hit the boost cap |
|---|---|
| **≤ 70 bpm** | **24.4%** |
| > 70 bpm | ~1.4% |

Slow cues collapse into near-silence far more often than fast ones — but *which* slow cues is not currently predictable. Per-pack rates across seventeen packs ranged from **0% to 50%**, and content seems to matter as much as tempo: a "machine room" drone at 70 bpm held up on both seeds while a "cave" drone at 62 bpm floored on both.

Two practical consequences:

1. **Budget extra takes for slow cues.** C/D takes should be the default for anything under ~70 bpm, not an exception. Extra seeds are cheap; a cue with no usable bed is not.
2. **Don't try to write around it.** Rewording prose to sound "less quiet" was tested against a 410-take control and produced **no measurable effect**. Seed variance rescues these cues; adjectives do not.

## Running an ingest

Ingest one pack:

```bash
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
```

Or a whole tier at a time:

```bash
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

`--pack` and `--tier` are both repeatable and combine as a union; with neither, every pack of every tier is ingested. `--root <treeId>=<path>` points one artifact tree (`tier1`, `tier2`, `tier3`, `regen-cd`) at a different masters directory, and `--artifact-root <path>` points all of them at one.

A cue's C/D re-rolls live in a different tree from its A/B pair, so every tree's collection plan is merged before the run and takes that have not been collected yet are reported and skipped rather than halting.

Ingest is **incremental** — folding one pack never drops another's records — and **idempotent**, so a re-run rebuilds from the masters rather than duplicating.

For each take, ingest decodes the mix and stems, resamples to the runtime rate, applies the shared gain, writes masters into the app's public audio directory, and records a `GeneratedCueRecord` carrying the full generation parameters: seed, bpm, keyscale, prompt, duration, workflow id, and the job id that produced it.

A pack only appears in Studio once it has ingested audio, so a half-built library never shows a broken or silent entry.

:::caution[Ingest is slow, and a re-run is not cheap]
Ingest decodes, resamples and re-encodes every take, writing 24-bit WAV at roughly **86 MB per
take**. Measured throughput is **~1.2 takes/min (~43 s each)**.

That scales badly, and you should plan around it:

| pack | takes | ingest time | disk |
|---|---:|---:|---:|
| 5-cue demo | 10 | ~8 min | ~0.9 GB |
| 10-cue pack | 20 | ~17 min | ~1.7 GB |
| 24-pack library | 484 | **~6.7 hours** | **~42 GB** |

Three things follow from that, and none of them are obvious from the command:

- **Always pass `--pack` or `--tier`.** An unfiltered run re-ingests everything, including
  packs that are already built and unchanged — there is currently no content-hash skip, so
  identical output is rebuilt byte-for-byte at full cost.
- **Treat re-ingest as expensive, not routine.** Editing one cue's catalog entry and re-running
  that pack costs the whole pack.
- **Treat the ingested WAVs as a local cache, not a deliverable.** The FLAC masters are the
  durable artifact at roughly a tenth of the size.

This is a known design limitation rather than an intended trade-off. Fixing any one of the
three causes — skipping unchanged takes by hash, serving FLAC directly instead of transcoding,
or parallelising the per-take work — would remove most of the cost. Until then, filter your
runs.
:::

## Reproducibility

Each record echoes the exact parameters its audio ran with, including the prompt string. Prose is treated as **append-only**: if you revise a cue's wording, published takes keep the text they were actually generated from, and the revision runs at new seeds. That way a record never claims a prompt that didn't produce it.

Re-running a pinned seed reproduces the music but not the bytes — GPU kernel variation means a fresh run is an equivalent new artifact, not a byte-identical one. Treat locally hashed masters as canonical.
