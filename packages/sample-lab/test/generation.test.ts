import { describe, it, expect } from "vitest";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GeneratedCueRecordSchema } from "@motif-studio/schema";
import type { SoundtrackPack } from "@motif-studio/schema";
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
  RUNTIME_SAMPLE_RATE_HZ,
  sha256Hex,
  type FlacPcm,
} from "../src/index.js";

const FIXTURE_DIR =
  process.env.MOTIF_CLOUD_AUDIO_FIXTURES ??
  "E:\\AI\\readouts\\model-knowledge\\dialogs\\comfy-agent\\outputs";

function fixturesAvailable(): boolean {
  return (
    existsSync(join(FIXTURE_DIR, "run4-sfx.flac")) &&
    existsSync(join(FIXTURE_DIR, "run4-sfx_lufs.txt")) &&
    existsSync(join(FIXTURE_DIR, "run3-track_lufs.txt")) &&
    existsSync(join(FIXTURE_DIR, "run1-stem_bass.flac"))
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

  it("reads run1-track_mix as 48 kHz / 120.000 s", () => {
    const path = join(FIXTURE_DIR, "run1-track_mix.flac");
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
        new Uint8Array(readFileSync(join(FIXTURE_DIR, `run1-stem_${role}.flac`))),
      );
      expect(info.sampleRateHz).toBe(44100);
      return { role, samples: info.totalSamples };
    });
    assertStemSampleCountsEqual(counts);
    expect(counts[0]!.samples).toBe(5_292_000);
  });

  it("mix sha256 starts with the receipt prefix", () => {
    const path = join(FIXTURE_DIR, "run1-track_mix.flac");
    if (!existsSync(path)) return;
    const hex = sha256Hex(new Uint8Array(readFileSync(path))).toUpperCase();
    expect(hex.startsWith("FB655B1E28AEC1CB")).toBe(true);
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
