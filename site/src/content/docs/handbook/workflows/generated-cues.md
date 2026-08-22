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

The bed is chosen from the **measured** result, not from seed order: the lowest-seed take that cleared the boost cap wins, falling back to the lowest seed when every take of that cue capped. Remaining takes are attached to the cue family as non-default records.

That distinction matters. Nine cues in the built-in library lost *both* their A and B takes to the cap, and their C/D re-rolls exist purely to rescue them. Under a plain lowest-seed-wins rule the rescue would be inert — the pack would keep bedding a near-silent take with a good one sitting beside it in the same family. `boostCapped` is only known after normalization, which is why the choice is made from ingest results rather than from the catalog.

Both takes live in the pack. `playbackDefault` decides which one plays.

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

For each take, ingest decodes the mix and stems, resamples to the runtime rate, applies the shared gain, writes masters into the app's public audio directory, and records a `GeneratedCueRecord` carrying the full generation parameters: seed, bpm, keyscale, prompt, duration, workflow id, and the job id that produced it.

A pack only appears in Studio once it has ingested audio, so a half-built library never shows a broken or silent entry.

### Ingest is incremental twice over

**Across packs:** folding one pack never drops another's records, so building the library a tier at a time is safe.

**Within a pack:** every input file is content-addressed. A take whose FLACs still hash to what the previous ingest recorded — with the same loudness target, the same generation identity, and all of its masters still on disk — is reused rather than decoded again. Anything else falls through to a full rebuild.

In practice that means:

| operation | cost |
|---|---|
| first ingest of a 20-take pack | ~14 min |
| re-running that same pack | **~1 second** |
| resuming an interrupted run | only the takes that had not finished |

So re-ingest is routine, not expensive. Editing one cue's catalog entry and re-running its pack rebuilds that cue and reuses the rest.

Two flags exist for the cases where you do *not* want the cache:

- `--force` re-decodes and rewrites everything even when the cache would hit. Use it to prove the pipeline still reproduces its own output — it does, byte for byte.
- `--skip-defective` narrows the failure boundary from the run to the take. By default a malformed artifact halts the whole ingest, which is right when you can fix it in place, but punishing when one bad file appears 400 takes into a batch. With the flag, the bad take is still refused and never folded, the remaining packs finish, every failure is listed at the end, and the process exits non-zero so a run that dropped something cannot be mistaken for a clean one.

:::note[Budget the disk, not the time]
Ingest writes 24-bit WAV at roughly **86 MB per take** — the full 24-pack library is about
**39 GB** on disk, from roughly 4 GB of FLAC masters. Time is no longer the binding
constraint, but space still is.

Treat the ingested WAVs as a local cache and the FLAC masters as the durable artifact. Serving
FLAC directly instead of transcoding would cut the footprint several-fold and is not yet done.
:::

## Reproducibility

Each record echoes the exact parameters its audio ran with, including the prompt string. Prose is treated as **append-only**: if you revise a cue's wording, published takes keep the text they were actually generated from, and the revision runs at new seeds. That way a record never claims a prompt that didn't produce it.

Re-running a pinned seed reproduces the music but not the bytes — GPU kernel variation means a fresh run is an equivalent new artifact, not a byte-identical one. Treat locally hashed masters as canonical.
