# Generated Cue Model

A generated cue is audio produced outside Motif — by any model or pipeline — brought into a `SoundtrackPack` as a first-class, reproducible record.

The unit is the **take**: one generation run, yielding a mix, four stems, and a loudness reading.

## Record

`GeneratedCueRecord` stores what a take *is* and what produced it:

- `id` — `<cueId>-s<seed>`
- `mix` / `stems` — master sources, post-gain
- `gainDb` / `actualGainDb` — requested versus applied
- `boostCapped` / `peakLimited` — normalization flags
- `generation` — a `GenerationParams` block: `seed`, `bpm`, `keyscale`, `timesignature`, `lyricsTag`, `prompt`, `requestedDurationSec`, `workflowId`, `jobId`

The `generation` block is a receipt, not a description. It carries the full job id so any take can be traced back to the run that produced it, and the exact prompt string that ran — never a later revision of it.

## Fold

`foldGeneratedIntoPack(pack, items)` attaches takes to a pack:

1. finds the take's cue family and checks it against the family's **generation lock** (bpm / keyscale / time signature) — a mismatch throws rather than attaching
2. appends the record to `generatedCues`
3. appends assets and stems
4. for the `playbackDefault` take only, replaces the target scene's layers with that take's stems, dropping the placeholder layer

Non-default takes are attached to the family but do not touch scene layers. That is what makes A/B curation a data-level switch: flipping `playbackDefault` and re-folding changes which audio a scene plays, with no other edit.

The fold scaled from 23 records to 470 without modification.

## Catalog derivation

A catalog entry describes a pack; `library-packs.ts` derives the pack from it. For each cue: one scene, one cue family with a generation lock, one binding, and A/B takes with the lower seed as default.

The derivation collects packs by scanning every top-level array in the catalog for entries carrying a `cues` array. Tiers are therefore additive data, not code — two entire tiers were added by re-vendoring the catalog with no source change.

Ids are deterministic and namespaced by pack (`sc-<packId>-<cueId>`, `cf-<packId>-<cueId>`), so cue ids may repeat across packs without collision.

## Normalization

Ingest computes a **shared gain** across a take's mix and stems, so relative balance between stems is preserved — stems are not normalized independently.

- Bed target: `MUSIC_BED_TARGET_LUFS = -14`
- Boost ceiling: `BOOST_CAP_DB = 6` (cuts uncapped)
- Exceeding the ceiling sets `boostCapped` and applies +6 dB

The asymmetry is deliberate. A quiet render lifted far enough to hit target brings its noise floor up with it; capping keeps a soft take clean instead of making it loud and dirty.

## Measured behaviour

From 466 takes across the built-in library:

- takes at **bpm ≤ 70 hit the boost cap 24.4%** of the time; above 70 bpm, ~1.4%
- per-pack rates for slow cues ranged **0% to 50%** — the aggregate is a population property, not a per-pack prediction
- **9 of 233 cues (3.9%)** lost both takes and needed a C/D pair

Two hypotheses were tested and one failed:

- **Prose wording** — the theory that quiet cues collapse because their prompts use absence language, and that naming continuously-sounding instruments would fix it. Tested by authoring a 100-cue tier under a validator enforcing the rule and comparing against a tier authored without it. In the targeted population (bpm ≤ 70): 18.8% versus 22.6%, z = +0.52. **No detectable effect.** An earlier 4-sample test that appeared to show +9 dB was regression to the mean — all four cases had been selected for being extreme outliers.
- **Tempo** — 24.4% versus 1.4%, z = +7.0. Real and large, but a risk multiplier rather than a determinant.

The design consequence: slow cues need **more takes**, not different words.

## Append-only prose

A cue's prose is never edited in place once takes have been published against it. Revisions are added alongside, with their own seeds, and the original record keeps the string it ran with.

This exists so a record can never claim a prompt that did not produce its audio — the property that makes the `generation` block a receipt rather than an annotation.

## Determinism boundary

A pinned seed reproduces the music but not the bytes. GPU kernel variation means a fresh run of an identical graph yields an equivalent new artifact; byte-identity only occurs when a cache serves the result. Locally hashed masters are canonical.
