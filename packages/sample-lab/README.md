<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

# @motif-studio/sample-lab

Sample-workflow helpers for Motif — trim, slice, kit and instrument tools — plus the **generation lane** that turns generated audio into playable, loudness-normalized soundtrack packs.

## What It Owns

- Audio asset trimming and loop point management
- Even and onset-based slicing
- Sample kit construction and slot management
- Sample instrument creation and pitch utilities
- Audio file import helpers (filename → asset inference)
- The generation lane: submitting and retrieving cloud jobs, ingesting the artifacts, and building catalog-driven library packs

This package does **not** generate audio. It submits jobs to a generation endpoint you configure and ingests artifacts you supply. Its job starts once a take exists as a mix, its stems, and a loudness reading.

## Key Exports

### Trim (`trim.ts`)
- `resolveTrimRegion(asset)` — effective trim boundaries
- `resolveLoopRegion(asset)` — effective loop boundaries
- `applyTrim(asset, startMs, endMs)` — set trim points
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — set loop points

### Slice (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — divide into equal parts
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — slice at specific times
- `sliceDurationMs(slice)` — slice length

### Kit (`kit.ts`)
- `createKit(id, name)` — empty kit
- `addKitSlot(kit, slot)` / `removeKitSlot(kit, pitch)` / `updateKitSlot(kit, pitch, update)`
- `kitFromSlices(id, name, slices, basePitch)` — auto-map slices to MIDI pitches
- `kitAssetIds(kit)` / `findDuplicateSlotPitches(kit)`

### Instrument (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)`
- `pitchToPlaybackRate(rootNote, targetNote)` — pitch-shift ratio
- `isInRange(instrument, note)` / `rangeSpan(instrument)`

### Import (`import.ts`)
- `inferSourceType(name)` — detect type from filename
- `sourceTypeToKind(sourceType)` — map source type → asset kind
- `filenameToId(filename)` — clean ID from filename
- `buildImportedAsset(filename, durationMs, src)` — create asset from file

### Generation ingest (`generation/`)
- `ingestRunArtifact(dir, options)` — consume a cloud run folder (mix + 4 stems + SFX FLACs + LUFS txt), resample to 48 kHz, normalize from the LUFS manifest, emit masters + a `GeneratedCueRecord`
- `deriveIngestResult(record)` — rebuild the assets, stems, scene and cue from a record. They are pure functions of it, and both the fresh and cached ingest paths call this, so the two cannot drift apart
- `registerGeneratedCue(pack, ingested)` — fold the record into a pack for score-map / clip-engine
- `parseIntegratedLufs`, `parseFlacStreamInfo` — duration is always samples/rate, never the requested figure
- Resampler: Kaiser-windowed sinc (β=10, 64 zero-crossings; upsample-only). Default music-bed target **−14 LUFS** (SFX is capped, not boosted). Mix + stems share one peak clamp so layering still sums. `targetLufs` is the gain target written into the cue record.
- Thin cloud client: `submitPrompt` / `pollJob` / `landRunArtifact` (`X-API-Key` → `POST /api/prompt` → poll → `/api/view`). UI-format graphs are rejected (andon — no client-side conversion)

### Ingest is content-addressed

Every input FLAC is hashed into the record ingest persists. A take whose inputs still hash the same — with an unchanged loudness target, generation identity and resampler, and all of its masters still on disk — is reused rather than decoded again. Anything else falls through to a full rebuild, so the cache can only ever be a speed-up, never a source of truth.

| operation | cost |
|---|---|
| first ingest of a 20-take pack | ~14 min |
| re-running that same pack | **~1 second** |
| resuming an interrupted run | only the unfinished takes |

Pass `force: true` to re-decode anyway — it reproduces its own masters byte for byte.

### Library packs (`ingest-library.ts`)
- `ingestLibraryPack(packId, options)` — ingest every take of a catalog pack, choosing each cue's playback bed from the **measured** result: the lowest-seed take that cleared the +6 dB boost cap, falling back to the lowest seed when all of them capped
- `selectPlaybackDefaults(items)` — the bed rule on its own
- `onFailure` narrows a take's andon from "halt the run" to "drop this take and report it" — the defect still never reaches the manifest

A CLI drives it:

```bash
node dist/generation/run-ingest-library.js --pack fantasy-jrpg-core
node dist/generation/run-ingest-library.js --tier 2 --tier 3
```

`--pack` and `--tier` are repeatable and combine as a union; with neither, every pack is ingested. `--force` re-decodes everything; `--skip-defective` drops malformed takes, lists them, and exits non-zero so a run that dropped something cannot read as clean. `--root <treeId>=<path>` and `--artifact-root <path>` relocate the masters.

Budget roughly **86 MB of 24-bit WAV per take** — space, not time, is the binding constraint.

## What It Does Not Own

- Real-time playback (see `@motif-studio/audio-engine`)
- UI components
- Running a saved cloud graph by `workflow_id` over REST (not in the public API; MCP `run_saved_workflow` is the measured path)
- Per-job `gpu_seconds` lookup (billing activity feed, not the job envelope)

## Dependencies

- `@motif-studio/schema` — types for assets, slices, kits, instruments, and generated-cue records
- `@motif-studio/score-map` — the library catalog and the take/pack derivation the ingest lane builds from
- `@wasm-audio-decoders/flac` — FLAC decoding for the ingest lane
