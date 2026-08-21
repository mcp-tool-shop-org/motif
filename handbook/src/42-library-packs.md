# Building a Library Pack

A library pack is a `SoundtrackPack` whose audio was generated rather than recorded, derived from a catalog entry rather than hand-authored.

This is the workflow for producing one.

## 1. Author the catalog entry

Add a pack to `packages/score-map/src/library-catalog.json`:

```json
{
  "id": "frozen-north",
  "name": "Frozen North",
  "seedBase": 10000,
  "palette": "Glacial orchestral — high sustained strings, bowed metal, low brass swells...",
  "cues": [
    { "id": "white-waste", "bpm": 70, "keyscale": "C minor",
      "seedA": 10011, "seedB": 10012, "prose": "White Waste: ..." }
  ]
}
```

Rules that matter:

- **`keyscale` must be an enum value** — 17 enharmonic roots × major/minor. Modes (`phrygian`, `dorian`) are rejected at generation; put modal colour in the prose instead.
- **Seeds follow `seedBase + cueIndex*10 + take`**, where take 1 = A, 2 = B, 3 = C, 4 = D. Keep them globally unique; a collision means two takes fight over one folder.
- **Prose is append-only** once takes exist against it. Revise by adding a new entry at new seeds, never by editing in place.

## 2. Generate

Generation happens outside Motif. Each take must produce a mix, four stems, and a loudness manifest.

Budget by tempo. Cues at **≤ 70 bpm hit the boost cap about a quarter of the time**, so plan C/D takes for slow cues from the start rather than treating them as a repair. Fast cues almost never need them (~1.4%).

## 3. Collect

Land masters as:

```
<artifact-root>/<packId>/<cueId>-s<seed>/<cueId>-s<seed>-{track_mix,stem_bass,stem_drums,stem_other,stem_vocals}.flac
<artifact-root>/<packId>/<cueId>-s<seed>/<cueId>-s<seed>-track_lufs.txt
```

Map generated files to cues by **job id**, never by array position. Batch APIs commonly return a compacted result when some items fail, and a positional read then mislabels every take after the first gap — a wrong-but-plausible mapping that is invisible downstream.

## 4. Ingest

```bash
pnpm --filter @motif-studio/sample-lab ingest:library --pack frozen-north
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

`--pack` and `--tier` are both repeatable and combine as a union; with neither, every pack of every tier is ingested. `--root <treeId>=<path>` relocates one artifact tree (`tier1`, `tier2`, `tier3`, `regen-cd`); `--artifact-root <path>` collapses them all onto one directory.

A pack's takes may span several trees — its A/B pair under its own tier, C/D re-rolls under the revisions or regen tree — so every tree's collection plan is merged before the run. A take whose masters are not on disk yet is reported and skipped; a folder that exists but is incomplete still halts the ingest.

Ingest decodes each take, resamples to the runtime rate, applies a shared gain across mix and stems, writes masters into the app's public audio directory, and records a `GeneratedCueRecord` per take. Folding one pack never drops another's records.

**Always filter the run.** Measured throughput is **~1.2 takes/min (~43 s per take)**, and there is currently **no content-hash skip** — an unfiltered run rebuilds every take of every pack byte-for-byte, whether or not anything changed:

| pack | takes | ingest time | disk |
|---|---:|---:|---:|
| 5-cue demo | 10 | ~8 min | ~0.9 GB |
| 10-cue pack | 20 | ~17 min | ~1.7 GB |
| 24-pack library | 484 | **~6.7 hours** | **~42 GB** |

A re-run is therefore idempotent in *result* but not in *cost*. Editing one cue and re-ingesting its pack costs the whole pack; re-ingesting the library costs most of a day. This is a known design limitation, not an intended trade-off — see the throughput finding in the dogfood notes. Until it is addressed, `--pack` and `--tier` are the difference between minutes and hours.

## 5. Verify

A pack appears in Studio only once it has ingested audio, so absence from the pack picker means the fold found nothing.

Check the fold: record count should be twice the cue count plus any C/D re-rolls, with exactly one playback default per cue. Then load the pack in Studio, pick a scene, and play it — the network log should show that take's stems being fetched.

## Curating takes

Every cue carries at least two takes, and a re-rolled cue carries up to four. One is bedded into the scene; the rest are attached to the family as non-default records.

The bed is picked from the **measured** ingest, not from the catalog: the lowest-seed take that cleared the +6 dB boost cap, falling back to the lowest seed when every take of that cue capped. Lowest-seed-wins would make a re-roll inert — the nine cues that lost both A and B to the cap are exactly the ones C/D exist to rescue, and they are the ones a seed-order rule would ignore.

Overriding that choice is still a data-level operation — change `playbackDefault` and re-fold. Studio does not yet expose take switching in the UI, so non-default takes are stored but not auditionable in-app. Treat that as the current boundary of the curation loop.

## Disk

Ingested masters are 24-bit WAV: ~17 MB per stem, ~86 MB per take, ~1.7 GB for a ten-cue pack. Generated FLAC masters are roughly a tenth of that.

The FLACs are the durable artifact. The ingested WAVs are a rebuildable cache and should be gitignored.
