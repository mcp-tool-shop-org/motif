import { describe, it, expect } from "vitest";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GeneratedCueRecordSchema } from "@motif-studio/schema";
import type { GeneratedCueRecord, SoundtrackPack } from "@motif-studio/schema";
import {
  parseIntegratedLufs,
  parseFlacStreamInfo,
  resampledSampleCount,
  resampleChannel,
  ingestGainDb,
  applyGain,
  resolveSharedGain,
  dbToLinear,
  isNearSilent,
  rmsOf,
  assertStemSampleCountsEqual,
  assertStemDurationsMatchMix,
  parseKeyscale,
  parseBeatsPerBar,
  scanRunArtifact,
  ingestRunArtifact,
  registerGeneratedCue,
  GenerationError,
  MUSIC_BED_TARGET_LUFS,
  BOOST_CAP_DB,
  RUNTIME_SAMPLE_RATE_HZ,
  sha256Hex,
  generationParamsForTake,
  generationParamsForLibraryTake,
  ingestLibraryPack,
  jobIdForTake,
  loadLibraryCollectionPlan,
  loadLibraryPlans,
  libraryPublicDir,
  libraryPublicSrc,
  libraryTakeArtifactDir,
  libraryTakePlanKey,
  selectPlaybackDefaults,
  RESAMPLER_NAME,
  RESAMPLER_QUALITY,
  LIBRARY_ARTIFACT_ROOTS,
  LIBRARY_COLLECTION_PLAN_FILE,
  LIBRARY_COLLECTION_PLAN_FILES,
  type FlacPcm,
} from "../src/index.js";
import {
  ACE_STEP_WORKFLOW_ID,
  GROUNDED_WAVE2_TAKES,
  GROUNDED_WAVE3_TAKES,
  libraryCatalogCue,
  libraryTakes,
  styleTagsFor,
  type FoldableGenerated,
  type LibraryTake,
} from "@motif-studio/score-map";

const FIXTURE_DIR =
  process.env.MOTIF_CLOUD_AUDIO_FIXTURES ??
  "E:\\AI\\readouts\\model-knowledge\\dialogs\\comfy-agent\\outputs";

function fixturesAvailable(): boolean {
  return (
    existsSync(join(FIXTURE_DIR, "run4-sfx.flac")) &&
    existsSync(join(FIXTURE_DIR, "run4-sfx_lufs.txt")) &&
    existsSync(join(FIXTURE_DIR, "run3-track_lufs.txt")) &&
    existsSync(join(FIXTURE_DIR, "run3-track_mix.flac")) &&
    existsSync(join(FIXTURE_DIR, "run3-stem_bass.flac"))
  );
}

function packStreamInfo(
  rate: number,
  channels: number,
  bitDepth: number,
  samples: number,
): Uint8Array {
  const buf = new Uint8Array(42);
  buf[0] = 0x66;
  buf[1] = 0x4c;
  buf[2] = 0x61;
  buf[3] = 0x43;
  buf[4] = 0x80;
  buf[7] = 34;
  const packed =
    (BigInt(rate) << 44n) |
    (BigInt(channels - 1) << 41n) |
    (BigInt(bitDepth - 1) << 36n) |
    BigInt(samples);
  for (let i = 0; i < 8; i++) {
    buf[18 + i] = Number((packed >> BigInt((7 - i) * 8)) & 0xffn);
  }
  return buf;
}

async function fakeDecode(bytes: Uint8Array): Promise<FlacPcm> {
  const info = parseFlacStreamInfo(bytes);
  const channelData = Array.from({ length: info.channels }, () => {
    const ch = new Float32Array(info.totalSamples);
    for (let i = 0; i < ch.length; i++) ch[i] = 0.01 * Math.sin((2 * Math.PI * i) / 64);
    return ch;
  });
  return {
    sampleRate: info.sampleRateHz,
    channels: info.channels,
    samples: info.totalSamples,
    channelData,
  };
}

describe("parseIntegratedLufs", () => {
  it("parses the music confirmation line (−12.32)", () => {
    expect(parseIntegratedLufs("Integrated Loudness: -12.32 LUFS\n")).toBeCloseTo(-12.32, 5);
  });

  it("parses the SFX confirmation line (−21.94)", () => {
    expect(parseIntegratedLufs("Integrated Loudness: -21.94 LUFS")).toBeCloseTo(-21.94, 5);
  });

  it("throws on garbage", () => {
    expect(() => parseIntegratedLufs("loudness missing")).toThrow(GenerationError);
  });
});

describe("parseFlacStreamInfo", () => {
  it("reads a crafted 44.1 kHz / 131072-sample header as 2.972 s, not 3.0", () => {
    const bytes = packStreamInfo(44100, 2, 16, 131072);
    const info = parseFlacStreamInfo(bytes);
    expect(info.sampleRateHz).toBe(44100);
    expect(info.totalSamples).toBe(131072);
    expect(info.durationSec).toBeCloseTo(2.972, 3);
    expect(info.durationSec).not.toBe(3);
  });

  it("reads a crafted 48 kHz / 5_760_000-sample header as 120.000 s", () => {
    const bytes = packStreamInfo(48000, 2, 16, 5_760_000);
    const info = parseFlacStreamInfo(bytes);
    expect(info.durationSec).toBe(120);
  });
});

describe("resampledSampleCount", () => {
  it("44.1 k → 48 k of a 120 s stem is exactly 5_760_000", () => {
    expect(resampledSampleCount(5_292_000, 44100, 48000)).toBe(5_760_000);
  });

  it("44.1 k → 48 k of the 3 s SA3 pin (131072 samples)", () => {
    expect(resampledSampleCount(131072, 44100, 48000)).toBe(142663);
  });

  it("44.1 k → 48 k of the 10 s SA3 pin (442368 samples)", () => {
    expect(resampledSampleCount(442368, 44100, 48000)).toBe(481489);
  });

  it("is a no-op when rates match", () => {
    expect(resampledSampleCount(48000, 48000, 48000)).toBe(48000);
  });

  it("sinc resampler emits that many samples", () => {
    const input = new Float32Array(147);
    for (let i = 0; i < input.length; i++) input[i] = Math.sin(i / 10);
    const out = resampleChannel(input, 44100, 48000);
    expect(out.length).toBe(resampledSampleCount(147, 44100, 48000));
  });

  it("refuses downsample (no anti-alias cutoff on this kernel)", () => {
    expect(() => resampleChannel(new Float32Array(16), 48000, 44100)).toThrow(
      GenerationError,
    );
  });
});

describe("loudness gain", () => {
  it("music −12.32 LUFS attenuates toward −14", () => {
    const gain = ingestGainDb("music", -12.32);
    expect(gain).toBeCloseTo(MUSIC_BED_TARGET_LUFS - -12.32, 5);
    expect(gain).toBeLessThan(0);
  });

  it("SFX −21.94 LUFS is not boosted", () => {
    expect(ingestGainDb("sfx", -21.94)).toBe(0);
  });

  it("applyGain scales samples and reports peak limit", () => {
    const ch = [new Float32Array([0.5, -0.5])];
    const result = applyGain(ch, 6);
    expect(result.peakLimited).toBe(false);
    expect(result.channels[0]![0]).toBeGreaterThan(0.5);
  });

  it("honors an explicit music target (not a dead option)", () => {
    expect(ingestGainDb("music", -12.32, -16, -16)).toBeCloseTo(-16 - -12.32, 5);
  });

  it("clamps mix+stems jointly so a hot drum stem cannot take a different gain", () => {
    const mix = [new Float32Array([0.1])];
    const drums = [new Float32Array([0.99])];
    const bass = [new Float32Array([0.2])];
    const shared = resolveSharedGain([mix, bass, drums], 6);
    const mixSolo = applyGain(mix, 6);
    const drumsSolo = applyGain(drums, 6);
    expect(mixSolo.peakLimited).toBe(false);
    expect(drumsSolo.peakLimited).toBe(true);
    expect(shared.peakLimited).toBe(true);
    expect(shared.actualLinear).toBeCloseTo(0.999 / 0.99, 6);
    expect(shared.actualLinear).toBeLessThan(dbToLinear(6));
    expect(shared.actualLinear).toBeCloseTo(drumsSolo.peak / 0.99, 6);
    expect(shared.actualLinear).not.toBeCloseTo(mixSolo.channels[0]![0]! / 0.1, 5);
  });
});

describe("boost cap", () => {
  // Measured rationale: wave-2 normalized contracts-s302 with +13.19 dB and it
  // played ~7-10 dB louder than every neighbor. Boosts clamp at +6; cuts don't.

  it("clamps a +13.19 dB boost to +6 and flags it", () => {
    const quiet = [new Float32Array([0.05, -0.05])];
    const shared = resolveSharedGain([quiet], 13.19);
    expect(shared.boostCapped).toBe(true);
    expect(shared.requestedGainDb).toBeCloseTo(13.19, 5); // uncapped evidence preserved
    expect(shared.actualGainDb).toBeCloseTo(BOOST_CAP_DB, 5);
    expect(shared.actualLinear).toBeCloseTo(dbToLinear(BOOST_CAP_DB), 6);
  });

  it("a boost exactly at +6 is not flagged", () => {
    const quiet = [new Float32Array([0.05])];
    const shared = resolveSharedGain([quiet], BOOST_CAP_DB);
    expect(shared.boostCapped).toBe(false);
    expect(shared.actualGainDb).toBeCloseTo(BOOST_CAP_DB, 5);
  });

  it("cuts are uncapped", () => {
    const hot = [new Float32Array([0.9])];
    const shared = resolveSharedGain([hot], -20);
    expect(shared.boostCapped).toBe(false);
    expect(shared.actualGainDb).toBeCloseTo(-20, 5);
  });

  it("peak limiting still applies after the cap", () => {
    // Peak 0.9 at +6 dB would exceed the 0.999 peak limit → peak limit wins
    const hot = [new Float32Array([0.9])];
    const shared = resolveSharedGain([hot], 13);
    expect(shared.boostCapped).toBe(true);
    expect(shared.peakLimited).toBe(true);
    expect(shared.actualLinear).toBeCloseTo(0.999 / 0.9, 6);
  });

  it("applyGain propagates the flag", () => {
    const quiet = [new Float32Array([0.01])];
    const result = applyGain(quiet, 12);
    expect(result.boostCapped).toBe(true);
    expect(result.channels[0]![0]).toBeCloseTo(0.01 * dbToLinear(BOOST_CAP_DB), 6);
  });
});

describe("near-silent vocals", () => {
  it("detects a near-silent stem", () => {
    const silent = [new Float32Array(1000)];
    expect(isNearSilent(silent)).toBe(true);
  });

  it("detects a loud stem relative to mix", () => {
    const loud = [new Float32Array(1000).fill(0.2)];
    expect(isNearSilent(loud, 0.2)).toBe(false);
  });

  it("flags a stem 40 dB below the mix", () => {
    const quiet = [new Float32Array(1000).fill(0.001)];
    expect(isNearSilent(quiet, 0.2)).toBe(true);
  });
});

describe("stem sample-count alignment", () => {
  it("accepts four equal counts", () => {
    expect(() =>
      assertStemSampleCountsEqual([
        { role: "bass", samples: 5_292_000 },
        { role: "drums", samples: 5_292_000 },
        { role: "other", samples: 5_292_000 },
        { role: "vocals", samples: 5_292_000 },
      ]),
    ).not.toThrow();
  });

  it("rejects a misaligned stem", () => {
    expect(() =>
      assertStemSampleCountsEqual([
        { role: "bass", samples: 5_292_000 },
        { role: "drums", samples: 5_292_001 },
        { role: "other", samples: 5_292_000 },
        { role: "vocals", samples: 5_292_000 },
      ]),
    ).toThrow(GenerationError);
  });

  it("rejects stems whose wall-clock duration drifts from the mix", () => {
    expect(() =>
      assertStemDurationsMatchMix(120, [
        { role: "bass", durationSec: 120 },
        { role: "drums", durationSec: 119.5 },
      ]),
    ).toThrow(GenerationError);
  });
});

describe("keyscale / time signature", () => {
  it("parses E minor", () => {
    expect(parseKeyscale("E minor")).toEqual({ keyRoot: 4, keyScale: "minor" });
  });

  it("parses ACE widget '4' as 4/4", () => {
    expect(parseBeatsPerBar("4")).toBe(4);
    expect(parseBeatsPerBar("4/4")).toBe(4);
  });
});

describe.skipIf(!fixturesAvailable())("confirmation-run fixtures", () => {
  it("reads run4-sfx duration as 2.972 s, not 3.0", () => {
    const bytes = new Uint8Array(readFileSync(join(FIXTURE_DIR, "run4-sfx.flac")));
    const info = parseFlacStreamInfo(bytes);
    expect(info.sampleRateHz).toBe(44100);
    expect(info.totalSamples).toBe(131072);
    expect(info.durationSec).toBeCloseTo(2.972, 3);
    expect(info.durationSec).not.toBe(3);
  });

  it("reads run2-sfx duration as 10.031 s", () => {
    const path = join(FIXTURE_DIR, "run2-sfx.flac");
    if (!existsSync(path)) return;
    const info = parseFlacStreamInfo(new Uint8Array(readFileSync(path)));
    expect(info.sampleRateHz).toBe(44100);
    expect(info.totalSamples).toBe(442368);
    expect(info.durationSec).toBeCloseTo(10.031, 3);
  });

  it("reads run3-track_mix as 48 kHz / 120.000 s", () => {
    const path = join(FIXTURE_DIR, "run3-track_mix.flac");
    if (!existsSync(path)) return;
    const info = parseFlacStreamInfo(new Uint8Array(readFileSync(path)));
    expect(info.sampleRateHz).toBe(48000);
    expect(info.totalSamples).toBe(5_760_000);
    expect(info.durationSec).toBe(120);
  });

  it("parses confirmation LUFS files", () => {
    expect(parseIntegratedLufs(readFileSync(join(FIXTURE_DIR, "run3-track_lufs.txt"), "utf-8"))).toBe(
      -12.32,
    );
    expect(parseIntegratedLufs(readFileSync(join(FIXTURE_DIR, "run4-sfx_lufs.txt"), "utf-8"))).toBe(
      -21.94,
    );
  });

  it("aligns the four Demucs stems at 5_292_000 samples", () => {
    const counts = (["bass", "drums", "other", "vocals"] as const).map((role) => {
      const info = parseFlacStreamInfo(
        new Uint8Array(readFileSync(join(FIXTURE_DIR, `run3-stem_${role}.flac`))),
      );
      expect(info.sampleRateHz).toBe(44100);
      return { role, samples: info.totalSamples };
    });
    assertStemSampleCountsEqual(counts);
    expect(counts[0]!.samples).toBe(5_292_000);
  });

  it("mix sha256 starts with the receipt prefix", () => {
    const path = join(FIXTURE_DIR, "run3-track_mix.flac");
    if (!existsSync(path)) return;
    const hex = sha256Hex(new Uint8Array(readFileSync(path))).toUpperCase();
    expect(hex.startsWith("E8860678")).toBe(true);
  });

  it("ingests the 2.972 s SFX pin to a 48 kHz master", async () => {
    const artifact = mkdtempSync(join(tmpdir(), "motif-sfx-art-"));
    copyFileSync(join(FIXTURE_DIR, "run4-sfx.flac"), join(artifact, "run4-sfx.flac"));
    copyFileSync(join(FIXTURE_DIR, "run4-sfx_lufs.txt"), join(artifact, "run4-sfx_lufs.txt"));
    const dest = mkdtempSync(join(tmpdir(), "motif-ingest-sfx-"));
    const result = await ingestRunArtifact(artifact, {
      id: "run4-door",
      destDir: dest,
      decodeFlac: fakeDecode,
      generation: {
        seed: 1038503484137406,
        workflowId: "2c46c9ed-a0ac-43a7-a594-9616c384f4ca",
        jobId: "7b966963-ba9f-4733-9ddf-5e8541423c27",
        requestedDurationSec: 3,
      },
    });
    expect(result.record.kind).toBe("sfx");
    expect(result.record.sfx?.facts.durationSec).toBeCloseTo(2.972, 3);
    expect(result.record.sfx?.facts.sampleRateHz).toBe(44100);
    expect(result.record.runtimeSampleRateHz).toBe(RUNTIME_SAMPLE_RATE_HZ);
    expect(result.record.gainDb).toBe(0);
    expect(GeneratedCueRecordSchema.safeParse(result.record).success).toBe(true);
    expect(result.assets[0]!.durationMs).toBe(2972);
    expect(existsSync(join(dest, "masters", "run4-door.wav"))).toBe(true);
  });
});

describe("music ingest (synthetic stems)", () => {
  it("aligns resampled stems, records near-silent vocals on [inst], and registers a cue", async () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-music-art-"));
    const mix = packStreamInfo(48000, 2, 16, 480);
    const stem = (tag: number) => {
      const buf = packStreamInfo(44100, 2, 16, 441);
      buf[26] = tag;
      return buf;
    };
    writeFileSync(join(dir, "track_mix.flac"), mix);
    writeFileSync(join(dir, "stem_bass.flac"), stem(1));
    writeFileSync(join(dir, "stem_drums.flac"), stem(2));
    writeFileSync(join(dir, "stem_other.flac"), stem(3));
    writeFileSync(join(dir, "stem_vocals.flac"), stem(9));
    writeFileSync(join(dir, "track_lufs.txt"), "Integrated Loudness: -12.32 LUFS\n");

    const decode: typeof fakeDecode = async (bytes) => {
      const pcm = await fakeDecode(bytes);
      if (bytes[26] === 9) {
        return {
          ...pcm,
          channelData: pcm.channelData.map((ch) => new Float32Array(ch.length)),
        };
      }
      return pcm;
    };

    const dest = mkdtempSync(join(tmpdir(), "motif-music-dest-"));
    const ingested = await ingestRunArtifact(dir, {
      id: "bed-1",
      destDir: dest,
      decodeFlac: decode,
      generation: {
        seed: 0,
        workflowId: "78a76ecd-7ae2-452a-afea-ad55a8d290f8",
        jobId: "b81c6dbf-76de-463b-97e0-0ba5dcf99a60",
        bpm: 72,
        keyscale: "E minor",
        timesignature: "4",
        lyricsTag: "[inst]",
        requestedDurationSec: 120,
      },
    });

    expect(ingested.record.kind).toBe("music");
    expect(ingested.stems).toHaveLength(4);
    expect(ingested.record.stems?.every((s) => s.resampledSampleCount === 480)).toBe(true);
    expect(ingested.record.stems?.find((s) => s.role === "vocals")?.nearSilent).toBe(true);
    expect(ingested.cue?.bpm).toBe(72);
    expect(ingested.cue?.keyRoot).toBe(4);
    expect(ingested.scene?.layers).toHaveLength(4);
    expect(GeneratedCueRecordSchema.safeParse(ingested.record).success).toBe(true);

    const empty: SoundtrackPack = {
      meta: { id: "p", name: "p", version: "1", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [],
      bindings: [],
      transitions: [],
    };
    const pack = registerGeneratedCue(empty, ingested);
    expect(pack.cues).toHaveLength(1);
    expect(pack.generatedCues?.[0]?.id).toBe("bed-1");
  });

  it("writes the same targetLufs it used for gain (no provenance lie)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-target-"));
    writeFileSync(join(dir, "track_mix.flac"), packStreamInfo(48000, 2, 16, 480));
    for (const role of ["bass", "drums", "other"] as const) {
      writeFileSync(join(dir, `stem_${role}.flac`), packStreamInfo(44100, 2, 16, 441));
    }
    const vocals = packStreamInfo(44100, 2, 16, 441);
    vocals[26] = 9;
    writeFileSync(join(dir, "stem_vocals.flac"), vocals);
    writeFileSync(join(dir, "track_lufs.txt"), "Integrated Loudness: -12.32 LUFS\n");
    const dest = mkdtempSync(join(tmpdir(), "motif-target-dest-"));
    const ingested = await ingestRunArtifact(dir, {
      id: "target-16",
      destDir: dest,
      targetLufs: -16,
      decodeFlac: async (bytes) => {
        const pcm = await fakeDecode(bytes);
        if (bytes[26] === 9) {
          return { ...pcm, channelData: pcm.channelData.map((ch) => new Float32Array(ch.length)) };
        }
        return pcm;
      },
      generation: {
        seed: 0,
        workflowId: "wf",
        jobId: "job",
        bpm: 72,
        lyricsTag: "[inst]",
      },
    });
    expect(ingested.record.targetLufs).toBe(-16);
    expect(ingested.record.gainDb).toBeCloseTo(-16 - -12.32, 5);
    expect(ingested.record.gainDb).not.toBeCloseTo(MUSIC_BED_TARGET_LUFS - -12.32, 5);
  });

  it("requires authored bpm for music", async () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-nobpm-"));
    writeFileSync(join(dir, "track_mix.flac"), packStreamInfo(48000, 2, 16, 480));
    for (const role of ["bass", "drums", "other", "vocals"] as const) {
      writeFileSync(join(dir, `stem_${role}.flac`), packStreamInfo(44100, 2, 16, 441));
    }
    writeFileSync(join(dir, "track_lufs.txt"), "Integrated Loudness: -12.32 LUFS\n");
    await expect(
      ingestRunArtifact(dir, {
        id: "nobpm",
        destDir: mkdtempSync(join(tmpdir(), "motif-nobpm-dest-")),
        decodeFlac: fakeDecode,
        generation: { seed: 0, workflowId: "wf", jobId: "job" },
      }),
    ).rejects.toMatchObject({ code: "GENERATION_BPM" });
  });

  it("applies one joint clamp when a hot stem would otherwise limit alone", async () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-hot-"));
    writeFileSync(join(dir, "track_mix.flac"), packStreamInfo(48000, 2, 16, 480));
    writeFileSync(join(dir, "stem_bass.flac"), packStreamInfo(48000, 2, 16, 480));
    const drums = packStreamInfo(48000, 2, 16, 480);
    drums[26] = 2;
    writeFileSync(join(dir, "stem_drums.flac"), drums);
    writeFileSync(join(dir, "stem_other.flac"), packStreamInfo(48000, 2, 16, 480));
    const vocals = packStreamInfo(48000, 2, 16, 480);
    vocals[26] = 9;
    writeFileSync(join(dir, "stem_vocals.flac"), vocals);
    writeFileSync(join(dir, "track_lufs.txt"), "Integrated Loudness: -20.00 LUFS\n");

    const decode: typeof fakeDecode = async (bytes) => {
      const info = parseFlacStreamInfo(bytes);
      const peak = bytes[26] === 2 ? 0.99 : bytes[26] === 9 ? 0 : 0.1;
      const channelData = Array.from({ length: info.channels }, () => {
        const ch = new Float32Array(info.totalSamples);
        ch.fill(peak);
        return ch;
      });
      return {
        sampleRate: info.sampleRateHz,
        channels: info.channels,
        samples: info.totalSamples,
        channelData,
      };
    };

    const dest = mkdtempSync(join(tmpdir(), "motif-hot-dest-"));
    const ingested = await ingestRunArtifact(dir, {
      id: "hot-drums",
      destDir: dest,
      decodeFlac: decode,
      generation: {
        seed: 0,
        workflowId: "wf",
        jobId: "job",
        bpm: 72,
        lyricsTag: "[inst]",
      },
    });

    const requested = MUSIC_BED_TARGET_LUFS - -20;
    expect(ingested.record.gainDb).toBeCloseTo(requested, 5);
    expect(ingested.record.peakLimited).toBe(true);
    expect(ingested.record.actualGainDb).toBeLessThan(ingested.record.gainDb);
    const expectedLinear = 0.999 / 0.99;
    expect(dbToLinear(ingested.record.actualGainDb)).toBeCloseTo(expectedLinear, 6);
  });
});

describe("scan + register", () => {
  // Kaiser-sinc resample of the 2^17-sample fixture is CPU-heavy; coverage-instrumented
  // CI runners breach the 5 s default budget.
  it("classifies a synthetic SFX folder and registers the cue", { timeout: 30_000 }, async () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-artifact-"));
    writeFileSync(join(dir, "pin-sfx.flac"), packStreamInfo(44100, 2, 16, 131072));
    writeFileSync(join(dir, "pin-sfx_lufs.txt"), "Integrated Loudness: -21.94 LUFS\n");
    const scanned = scanRunArtifact(dir);
    expect(scanned.kind).toBe("sfx");

    const dest = mkdtempSync(join(tmpdir(), "motif-dest-"));
    const ingested = await ingestRunArtifact(dir, {
      id: "pin",
      destDir: dest,
      decodeFlac: fakeDecode,
      generation: {
        seed: 1,
        workflowId: "wf",
        jobId: "job",
        requestedDurationSec: 3,
      },
    });
    const empty: SoundtrackPack = {
      meta: { id: "p", name: "p", version: "1", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [],
      bindings: [],
      transitions: [],
    };
    const pack = registerGeneratedCue(empty, ingested);
    expect(pack.generatedCues).toHaveLength(1);
    expect(pack.assets).toHaveLength(1);
    expect(pack.cues).toBeUndefined();
  });
});

describe("rms helper", () => {
  it("is zero for silence", () => {
    expect(rmsOf([new Float32Array(8)])).toBe(0);
  });
});

describe("grounded take params (prose/params association)", () => {
  it("wave-2 takes echo the v1 prose they actually ran with", () => {
    const s101 = GROUNDED_WAVE2_TAKES.find((t) => t.seed === 101)!;
    const params = generationParamsForTake(s101);
    expect(params.prompt).toBe(styleTagsFor("cf-military", 1));
    expect(params.prompt!.startsWith("Military March: A tense, disciplined orchestral march.")).toBe(true);
    expect(params.jobId).toBe("e83f8c6a-3c26-463a-9ab9-804b0933fa0c");
    expect(params.seed).toBe(101);
    expect(params.bpm).toBe(100);
    expect(params.keyscale).toBe("G minor");
    const s302 = GROUNDED_WAVE2_TAKES.find((t) => t.seed === 302)!;
    expect(generationParamsForTake(s302).prompt).toBe(styleTagsFor("cf-frontier", 1));
  });

  it("wave-3 takes echo the v2 prose", () => {
    const s111 = GROUNDED_WAVE3_TAKES.find((t) => t.seed === 111)!;
    const params = generationParamsForTake(s111);
    expect(params.prompt).toBe(styleTagsFor("cf-military", 2));
    expect(params.prompt!.startsWith("Military March: A quiet, disciplined orchestral underscore.")).toBe(true);
    expect(params.jobId).toBe("d1432095-2636-47a2-8b5f-6e692930e94a");
    const s311 = GROUNDED_WAVE3_TAKES.find((t) => t.seed === 311)!;
    expect(generationParamsForTake(s311).prompt).toBe(styleTagsFor("cf-frontier", 2));
    // Same family lock either wave — only the prose version differs.
    expect(generationParamsForTake(s111).bpm).toBe(100);
    expect(generationParamsForTake(s311).keyscale).toBe("D minor");
  });
});

describe("library take params (catalog / artifact association)", () => {
  const FLAGSHIP = "fantasy-jrpg-core";
  const takes = libraryTakes(FLAGSHIP);
  const townA = takes.find((t) => t.seed === 2011)!;
  const townB = takes.find((t) => t.seed === 2012)!;
  const JOB_A = "6e2f7c63-b506-4c96-976e-4e7b6fc88679";
  const plan = new Map([[`${FLAGSHIP}/${townA.folder}`, JOB_A]]);

  it("echoes the catalog cue a take actually ran with", () => {
    const cue = libraryCatalogCue(FLAGSHIP, "town")!;
    const params = generationParamsForLibraryTake(townA, JOB_A);
    expect(params.bpm).toBe(cue.bpm);
    expect(params.keyscale).toBe(cue.keyscale);
    expect(params.timesignature).toBe("4");
    expect(params.lyricsTag).toBe("[inst]");
    expect(params.seed).toBe(2011);
    expect(params.jobId).toBe(JOB_A);
    expect(params.workflowId).toBe(ACE_STEP_WORKFLOW_ID);
    expect(params.requestedDurationSec).toBe(60);
    expect(params.prompt).toBe(cue.prose);
  });

  it("gives both takes of a cue the same prose — only the seed differs", () => {
    const a = generationParamsForLibraryTake(townA, JOB_A);
    const b = generationParamsForLibraryTake(townB, JOB_A);
    expect(b.prompt).toBe(a.prompt);
    expect(b.seed).toBe(2012);
  });

  it("resolves the full job UUID from the collection plan", () => {
    expect(jobIdForTake(townA, plan)).toBe(JOB_A);
  });

  it("halts on a missing plan entry rather than ingesting an unidentified take", () => {
    expect(() => jobIdForTake(townB, plan)).toThrow(GenerationError);
    expect(() => jobIdForTake(townB, plan)).toThrow(/town-s2012/);
  });

  it("halts on a truncated job id (receipts law: full UUIDs only)", () => {
    const truncated = new Map([[`${FLAGSHIP}/${townA.folder}`, JOB_A.slice(0, 8)]]);
    expect(() => jobIdForTake(townA, truncated)).toThrow(/not a full UUID/);
  });

  it("keys the loaded plan by <packId>/<folder>", () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-library-plan-"));
    writeFileSync(
      join(dir, LIBRARY_COLLECTION_PLAN_FILE),
      JSON.stringify({
        [FLAGSHIP]: {
          batch_id: "batch_x",
          items: [
            { job_id: JOB_A, cueId: "town", seed: 2011, folder: "town-s2011", label: "town-s2011" },
          ],
        },
      }),
    );
    const loaded = loadLibraryCollectionPlan(dir);
    expect(loaded.get(`${FLAGSHIP}/town-s2011`)).toBe(JOB_A);
    expect(loaded.size).toBe(1);
  });

  it("lands masters under a pack-scoped public dir", () => {
    expect(libraryPublicDir(FLAGSHIP)).toBe("library-packs/fantasy-jrpg-core");
    expect(libraryPublicSrc(FLAGSHIP, townA.folder, "town-s2011-mix.wav")).toBe(
      "/audio/library-packs/fantasy-jrpg-core/town-s2011/masters/town-s2011-mix.wav",
    );
  });
});

// ── Extra takes: the C/D re-rolls live in their own artifact trees ──

const REVISION_TAKE: LibraryTake = {
  packId: "fantasy-jrpg-core",
  cueId: "defeat",
  seed: 2123,
  take: "C",
  familyId: "cf-fantasy-jrpg-core-defeat",
  sceneId: "sc-fantasy-jrpg-core-defeat",
  folder: "defeat-s2123",
  playbackDefault: false,
  promptVersion: 2,
  prose: "Defeat (v2): a timpani heartbeat holds under a falling piano line.",
  artifact: { root: "tier2", dir: "tier1-revisions" },
};

const REGEN_TAKE: LibraryTake = {
  packId: "cozy-hamlet",
  cueId: "fireflies",
  seed: 12103,
  take: "C",
  familyId: "cf-cozy-hamlet-fireflies",
  sceneId: "sc-cozy-hamlet-fireflies",
  folder: "fireflies-s12103",
  playbackDefault: false,
  promptVersion: 1,
  prose: "Fireflies: unchanged prose — seed is the only lever.",
  artifact: { root: "regen-cd", dir: "cozy-hamlet" },
};

describe("library artifact trees", () => {
  const JOB = "5bd5d95f-7a5a-45ba-9133-b6f3a3235e0f";

  it("keys a take's plan entry by its artifact dir, not by its owning pack", () => {
    expect(libraryTakePlanKey(REVISION_TAKE)).toBe("tier1-revisions/defeat-s2123");
    expect(libraryTakePlanKey(REGEN_TAKE)).toBe("cozy-hamlet/fireflies-s12103");
  });

  it("resolves revision masters under the tier-2 tree and regen masters under the regen tree", () => {
    expect(libraryTakeArtifactDir(REVISION_TAKE, { tier2: "/roots/t2" })).toBe(
      join("/roots/t2", "tier1-revisions", "defeat-s2123"),
    );
    expect(libraryTakeArtifactDir(REGEN_TAKE, { "regen-cd": "/roots/rc" })).toBe(
      join("/roots/rc", "cozy-hamlet", "fireflies-s12103"),
    );
    expect(libraryTakeArtifactDir(REVISION_TAKE)).toBe(
      join(LIBRARY_ARTIFACT_ROOTS.tier2, "tier1-revisions", "defeat-s2123"),
    );
  });

  it("halts when a take names an artifact tree with no configured root", () => {
    expect(() => libraryTakeArtifactDir(REGEN_TAKE, { tier1: "/roots/t1" })).toThrow(
      GenerationError,
    );
    expect(() => libraryTakeArtifactDir(REGEN_TAKE, { tier1: "/roots/t1" })).toThrow(
      /regen-cd/,
    );
  });

  it("echoes the take's own prose, so a v2 revision never records the cue's v1 string", () => {
    const params = generationParamsForLibraryTake(REVISION_TAKE, JOB);
    const cue = libraryCatalogCue("fantasy-jrpg-core", "defeat")!;
    expect(params.prompt).toBe(REVISION_TAKE.prose);
    expect(params.prompt).not.toBe(cue.prose);
    // bpm / keyscale were held identical across the re-roll — prose was the only lever
    expect(params.bpm).toBe(cue.bpm);
    expect(params.keyscale).toBe(cue.keyscale);
    expect(params.seed).toBe(2123);
  });

  it("merges every tree's plan into one map and skips trees with no plan file", () => {
    const t2 = mkdtempSync(join(tmpdir(), "motif-plan-t2-"));
    const rc = mkdtempSync(join(tmpdir(), "motif-plan-rc-"));
    const empty = mkdtempSync(join(tmpdir(), "motif-plan-none-"));
    writeFileSync(
      join(t2, LIBRARY_COLLECTION_PLAN_FILES.tier2),
      JSON.stringify({
        "tier1-revisions": { items: [{ job_id: JOB, folder: "defeat-s2123" }] },
      }),
    );
    writeFileSync(
      join(rc, LIBRARY_COLLECTION_PLAN_FILES["regen-cd"]),
      JSON.stringify({
        "cozy-hamlet": {
          items: [
            { job_id: "480e4f79-0d4e-4786-9205-34a7a37de4ed", folder: "fireflies-s12103" },
          ],
        },
      }),
    );
    const plan = loadLibraryPlans({ tier1: empty, tier2: t2, "regen-cd": rc });
    expect(plan.size).toBe(2);
    expect(jobIdForTake(REVISION_TAKE, plan)).toBe(JOB);
    expect(jobIdForTake(REGEN_TAKE, plan)).toBe("480e4f79-0d4e-4786-9205-34a7a37de4ed");
  });

  it("halts when two collection runs disagree on the same take", () => {
    const a = mkdtempSync(join(tmpdir(), "motif-plan-a-"));
    const b = mkdtempSync(join(tmpdir(), "motif-plan-b-"));
    const entry = (jobId: string) => ({
      "cozy-hamlet": { items: [{ job_id: jobId, folder: "fireflies-s12103" }] },
    });
    writeFileSync(
      join(a, LIBRARY_COLLECTION_PLAN_FILES.tier2),
      JSON.stringify(entry("480e4f79-0d4e-4786-9205-34a7a37de4ed")),
    );
    writeFileSync(
      join(b, LIBRARY_COLLECTION_PLAN_FILES["regen-cd"]),
      JSON.stringify(entry(JOB)),
    );
    expect(() => loadLibraryPlans({ tier2: a, "regen-cd": b })).toThrow(/disagree/);
  });

  it("skips a take whose masters are not collected yet instead of andoning", async () => {
    const roots = { "regen-cd": mkdtempSync(join(tmpdir(), "motif-regen-empty-")) };
    const publicAudioRoot = mkdtempSync(join(tmpdir(), "motif-public-"));
    const skipped: string[] = [];
    const items = await ingestLibraryPack("cozy-hamlet", {
      publicAudioRoot,
      roots,
      plan: new Map(),
      takes: [REGEN_TAKE],
      onSkip: (take, dir) => skipped.push(`${take.folder} ${dir}`),
    });
    expect(items).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0]).toContain(join(roots["regen-cd"], "cozy-hamlet", "fireflies-s12103"));
    expect(existsSync(join(publicAudioRoot, "library-packs"))).toBe(false);
  });

  /**
   * A present-but-malformed artifact is a defect either way. The question is
   * blast radius: by default it halts the run, and with `onFailure` it costs
   * only its own take. Neither path may ever fold the bad take.
   */
  function writeDefectiveTake(): { roots: Record<string, string>; plan: Map<string, string> } {
    const root = mkdtempSync(join(tmpdir(), "motif-defective-"));
    const dir = join(root, "cozy-hamlet", "fireflies-s12103");
    mkdirSync(dir, { recursive: true });
    // Mix + stems present so the layout check passes, but the mix header is
    // garbage — the failure lands inside the take, not in the scan.
    writeFileSync(join(dir, "fireflies-s12103-track_mix.flac"), Buffer.alloc(64));
    for (const role of ["bass", "drums", "other", "vocals"] as const) {
      writeFileSync(join(dir, `fireflies-s12103-stem_${role}.flac`), packStreamInfo(48000, 2, 16, 480));
    }
    writeFileSync(
      join(dir, "fireflies-s12103-track_lufs.txt"),
      "Integrated Loudness: -12.32 LUFS\n",
    );
    return {
      roots: { "regen-cd": root },
      plan: new Map([["cozy-hamlet/fireflies-s12103", "5bd5d95f-7a5a-45ba-9133-b6f3a3235e0f"]]),
    };
  }

  it("halts the run on a malformed artifact when no onFailure is given", async () => {
    const { roots, plan } = writeDefectiveTake();
    await expect(
      ingestLibraryPack("cozy-hamlet", {
        publicAudioRoot: mkdtempSync(join(tmpdir(), "motif-public-")),
        roots,
        plan,
        takes: [REGEN_TAKE],
      }),
    ).rejects.toThrow();
  });

  it("drops only the malformed take when onFailure is given", async () => {
    const { roots, plan } = writeDefectiveTake();
    const failed: string[] = [];
    const items = await ingestLibraryPack("cozy-hamlet", {
      publicAudioRoot: mkdtempSync(join(tmpdir(), "motif-public-")),
      roots,
      plan,
      takes: [REGEN_TAKE],
      onFailure: (take, error) => {
        failed.push(`${take.folder}: ${error instanceof Error ? error.message : String(error)}`);
      },
    });
    expect(failed).toHaveLength(1);
    expect(failed[0]).toContain("fireflies-s12103");
    expect(items).toEqual([]); // the defect never reaches the manifest
  });
});

// ── Playback default: measured, not catalog-ordered ──

const JOB_UUID = "6e2f7c63-b506-4c96-976e-4e7b6fc88679";

describe("selectPlaybackDefaults", () => {
  function take(familyId: string, seed: number, boostCapped: boolean): FoldableGenerated {
    const record: GeneratedCueRecord = {
      id: `${familyId}-s${seed}`,
      name: `Take ${seed}`,
      kind: "music",
      generation: { seed, workflowId: ACE_STEP_WORKFLOW_ID, jobId: JOB_UUID },
      targetLufs: MUSIC_BED_TARGET_LUFS,
      gainDb: 12,
      actualGainDb: boostCapped ? BOOST_CAP_DB : 12,
      peakLimited: false,
      ...(boostCapped ? { boostCapped: true } : {}),
      resampler: { name: RESAMPLER_NAME, quality: RESAMPLER_QUALITY },
      runtimeSampleRateHz: RUNTIME_SAMPLE_RATE_HZ,
      createdAt: "2026-08-21T00:00:00.000Z",
    };
    return {
      record,
      assets: [],
      stems: [],
      familyId,
      sceneId: `sc-${familyId}`,
      playbackDefault: false,
    };
  }

  const defaultSeed = (items: FoldableGenerated[], familyId: string): number | undefined =>
    items.find((i) => i.playbackDefault && i.familyId === familyId)?.record.generation.seed;

  it("beds the lowest seed when it cleared the boost cap", () => {
    const picked = selectPlaybackDefaults([
      take("cf-a", 1011, false),
      take("cf-a", 1012, false),
    ]);
    expect(defaultSeed(picked, "cf-a")).toBe(1011);
    expect(picked.filter((i) => i.playbackDefault)).toHaveLength(1);
  });

  it("skips capped takes so a C/D rescue actually reaches playback", () => {
    // the shape that motivated the rule: A and B both floored, C is usable
    const picked = selectPlaybackDefaults([
      take("cf-a", 1011, true),
      take("cf-a", 1012, true),
      take("cf-a", 1013, false),
      take("cf-a", 1014, false),
    ]);
    expect(defaultSeed(picked, "cf-a")).toBe(1013);
  });

  it("prefers the lowest UNCAPPED seed, not merely the first uncapped in input order", () => {
    const picked = selectPlaybackDefaults([
      take("cf-a", 1014, false),
      take("cf-a", 1011, true),
      take("cf-a", 1012, false),
    ]);
    expect(defaultSeed(picked, "cf-a")).toBe(1012);
  });

  it("falls back to the lowest seed when every take of a cue capped", () => {
    const picked = selectPlaybackDefaults([
      take("cf-a", 1012, true),
      take("cf-a", 1011, true),
    ]);
    expect(defaultSeed(picked, "cf-a")).toBe(1011);
    expect(picked.filter((i) => i.playbackDefault)).toHaveLength(1);
  });

  it("decides each cue family independently, one default each", () => {
    const picked = selectPlaybackDefaults([
      take("cf-a", 1011, true),
      take("cf-a", 1012, false),
      take("cf-b", 2011, false),
      take("cf-b", 2012, false),
      take("cf-c", 3011, true),
      take("cf-c", 3012, true),
    ]);
    expect(defaultSeed(picked, "cf-a")).toBe(1012);
    expect(defaultSeed(picked, "cf-b")).toBe(2011);
    expect(defaultSeed(picked, "cf-c")).toBe(3011);
    expect(picked.filter((i) => i.playbackDefault)).toHaveLength(3);
  });

  it("clears a stale default carried in from the catalog prior", () => {
    const stale = { ...take("cf-a", 1011, true), playbackDefault: true };
    const picked = selectPlaybackDefaults([stale, take("cf-a", 1012, false)]);
    expect(picked.find((i) => i.record.generation.seed === 1011)!.playbackDefault).toBe(false);
    expect(defaultSeed(picked, "cf-a")).toBe(1012);
    // input is not mutated — the caller keeps its own array
    expect(stale.playbackDefault).toBe(true);
  });

  it("returns nothing to bed when a pack ingested no takes at all", () => {
    expect(selectPlaybackDefaults([])).toEqual([]);
  });
});

describe("ingest cache (unchanged inputs are not re-decoded)", () => {
  /** A complete synthetic music artifact: mix + 4 stems + LUFS. */
  function writeMusicArtifact(): string {
    const dir = mkdtempSync(join(tmpdir(), "motif-cache-art-"));
    writeFileSync(join(dir, "track_mix.flac"), packStreamInfo(48000, 2, 16, 480));
    for (const [i, role] of (["bass", "drums", "other", "vocals"] as const).entries()) {
      const buf = packStreamInfo(48000, 2, 16, 480);
      buf[26] = i + 1;
      writeFileSync(join(dir, `stem_${role}.flac`), buf);
    }
    writeFileSync(join(dir, "track_lufs.txt"), "Integrated Loudness: -12.32 LUFS\n");
    return dir;
  }

  const generation = {
    seed: 7,
    workflowId: ACE_STEP_WORKFLOW_ID,
    jobId: "b81c6dbf-76de-463b-97e0-0ba5dcf99a60",
    bpm: 90,
    keyscale: "E minor",
    timesignature: "4",
    lyricsTag: "[inst]",
    requestedDurationSec: 60,
  };

  /** Counts decoder calls so "did it redo the work" is observed, not inferred. */
  function countingDecode(): { decode: typeof fakeDecode; calls: () => number } {
    let calls = 0;
    return {
      decode: async (bytes) => {
        calls++;
        return fakeDecode(bytes);
      },
      calls: () => calls,
    };
  }

  async function ingestOnce(
    dir: string,
    dest: string,
    extra: Record<string, unknown> = {},
  ): Promise<{ result: Awaited<ReturnType<typeof ingestRunArtifact>>; decodes: number; hits: number }> {
    const { decode, calls } = countingDecode();
    let hits = 0;
    const result = await ingestRunArtifact(dir, {
      id: "cached-bed",
      destDir: dest,
      decodeFlac: decode,
      failOnVocalBleed: false,
      onCacheHit: () => {
        hits++;
      },
      generation,
      ...extra,
    });
    return { result, decodes: calls(), hits };
  }

  it("decodes on the first ingest and reuses an identical record on the second", async () => {
    const dir = writeMusicArtifact();
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-dest-"));

    const first = await ingestOnce(dir, dest);
    expect(first.decodes).toBe(5); // mix + 4 stems
    expect(first.hits).toBe(0);

    const second = await ingestOnce(dir, dest);
    expect(second.decodes).toBe(0); // nothing re-decoded
    expect(second.hits).toBe(1);

    // The cached path must reproduce the fresh one exactly, `createdAt` aside —
    // it is the same record, not a lookalike rebuilt from different rules.
    const strip = (r: GeneratedCueRecord) => ({ ...r, createdAt: "" });
    expect(strip(second.result.record)).toEqual(strip(first.result.record));
    expect(second.result.assets).toEqual(first.result.assets);
    expect(second.result.stems).toEqual(first.result.stems);
    expect(second.result.scene).toEqual(first.result.scene);
    expect(second.result.cue).toEqual(first.result.cue);
    expect(GeneratedCueRecordSchema.safeParse(second.result.record).success).toBe(true);
  });

  it("re-decodes under --force even when the cache would have hit", async () => {
    const dir = writeMusicArtifact();
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-force-"));
    await ingestOnce(dir, dest);
    const forced = await ingestOnce(dir, dest, { force: true });
    expect(forced.decodes).toBe(5);
    expect(forced.hits).toBe(0);
  });

  it("re-decodes when a master was deleted", async () => {
    const dir = writeMusicArtifact();
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-gone-"));
    const first = await ingestOnce(dir, dest);
    const master = first.result.record.stems!.find((s) => s.role === "drums")!.masterSrc;
    expect(existsSync(master)).toBe(true);
    rmSync(master);

    const second = await ingestOnce(dir, dest);
    expect(second.decodes).toBe(5);
    expect(second.hits).toBe(0);
    expect(existsSync(master)).toBe(true); // rebuilt
  });

  it("re-decodes when an input FLAC changed underneath", async () => {
    const dir = writeMusicArtifact();
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-dirty-"));
    await ingestOnce(dir, dest);

    // Same shape, different bytes — only the content hash can catch this.
    const swapped = packStreamInfo(48000, 2, 16, 480);
    swapped[27] = 42;
    writeFileSync(join(dir, "stem_other.flac"), swapped);

    const second = await ingestOnce(dir, dest);
    expect(second.decodes).toBe(5);
    expect(second.hits).toBe(0);
  });

  it("re-decodes when the take was re-pointed at a different job", async () => {
    const dir = writeMusicArtifact();
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-job-"));
    await ingestOnce(dir, dest);
    const second = await ingestOnce(dir, dest, {
      generation: { ...generation, jobId: "0f2b1c44-5d6e-4a7b-8c9d-0e1f2a3b4c5d" },
    });
    expect(second.decodes).toBe(5);
    expect(second.hits).toBe(0);
  });

  it("re-decodes when the loudness target changed", async () => {
    const dir = writeMusicArtifact();
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-target-"));
    await ingestOnce(dir, dest);
    const second = await ingestOnce(dir, dest, { targetLufs: MUSIC_BED_TARGET_LUFS + 2 });
    expect(second.decodes).toBe(5);
    expect(second.hits).toBe(0);
  });
});

describe("ingest cache identity", () => {
  it("does not reuse a record written under a different id or name", async () => {
    const dir = mkdtempSync(join(tmpdir(), "motif-cache-id-art-"));
    writeFileSync(join(dir, "track_mix.flac"), packStreamInfo(48000, 2, 16, 480));
    for (const [i, role] of (["bass", "drums", "other", "vocals"] as const).entries()) {
      const buf = packStreamInfo(48000, 2, 16, 480);
      buf[26] = i + 1;
      writeFileSync(join(dir, `stem_${role}.flac`), buf);
    }
    writeFileSync(join(dir, "track_lufs.txt"), "Integrated Loudness: -12.32 LUFS\n");
    const dest = mkdtempSync(join(tmpdir(), "motif-cache-id-dest-"));

    const generation = {
      seed: 11,
      workflowId: ACE_STEP_WORKFLOW_ID,
      jobId: "b81c6dbf-76de-463b-97e0-0ba5dcf99a60",
      bpm: 90,
      keyscale: "E minor",
      timesignature: "4",
      lyricsTag: "[inst]",
      requestedDurationSec: 60,
    };
    const run = async (id: string, name: string) => {
      let decodes = 0;
      const result = await ingestRunArtifact(dir, {
        id,
        name,
        destDir: dest,
        failOnVocalBleed: false,
        generation,
        decodeFlac: async (bytes) => {
          decodes++;
          return fakeDecode(bytes);
        },
      });
      return { result, decodes };
    };

    await run("take-a", "Take A");
    const renamed = await run("take-a", "Take A Renamed");
    expect(renamed.decodes).toBe(5); // name is baked into every asset — no reuse
    const reId = await run("take-b", "Take A Renamed");
    expect(reId.decodes).toBe(5); // id is baked into every asset id — no reuse
    expect(reId.result.assets[0]!.id).toBe("take-b-mix");
  });
});
