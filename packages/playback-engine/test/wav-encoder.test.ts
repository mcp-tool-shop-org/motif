import { describe, it, expect, vi } from "vitest";
import { encodeWav } from "../src/renderer";

/**
 * Create a mock AudioBuffer with known sample data.
 * Fills with a simple pattern: channel data = sampleIndex / length (0 to ~1).
 */
function createTestBuffer(
  length: number,
  numChannels: number,
  sampleRate: number,
): AudioBuffer {
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    const data = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      // Generate a simple ramp from -1 to +1
      data[i] = (2 * i) / (length - 1) - 1;
    }
    channelData.push(data);
  }

  return {
    length,
    numberOfChannels: numChannels,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: (ch: number) => channelData[ch],
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  } as unknown as AudioBuffer;
}

/** Read a WAV blob into a DataView for inspection */
async function blobToDataView(blob: Blob): Promise<DataView> {
  const arrayBuffer = await blob.arrayBuffer();
  return new DataView(arrayBuffer);
}

function readString(view: DataView, offset: number, length: number): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}

describe("encodeWav — 16-bit PCM", () => {
  it("produces valid RIFF/WAVE header", async () => {
    const buffer = createTestBuffer(100, 2, 44100);
    const blob = encodeWav(buffer, 16);
    const view = await blobToDataView(blob);

    expect(readString(view, 0, 4)).toBe("RIFF");
    expect(readString(view, 8, 4)).toBe("WAVE");
    expect(readString(view, 12, 4)).toBe("fmt ");
    // fmt chunk size = 16 for PCM
    expect(view.getUint32(16, true)).toBe(16);
    // Format tag = 1 (PCM)
    expect(view.getUint16(20, true)).toBe(1);
    // Channels
    expect(view.getUint16(22, true)).toBe(2);
    // Sample rate
    expect(view.getUint32(24, true)).toBe(44100);
    // Bits per sample
    expect(view.getUint16(34, true)).toBe(16);
  });

  it("has correct data size", async () => {
    const length = 100;
    const channels = 2;
    const buffer = createTestBuffer(length, channels, 44100);
    const blob = encodeWav(buffer, 16);
    const view = await blobToDataView(blob);

    // data chunk starts at offset 36
    expect(readString(view, 36, 4)).toBe("data");
    const dataSize = view.getUint32(40, true);
    expect(dataSize).toBe(length * channels * 2); // 2 bytes per sample
  });

  it("total blob size = header + data", async () => {
    const buffer = createTestBuffer(50, 1, 44100);
    const blob = encodeWav(buffer, 16);
    // Header = 44 bytes for 16-bit PCM, data = 50 * 1 * 2 = 100
    expect(blob.size).toBe(44 + 100);
  });
});

describe("encodeWav — 24-bit PCM", () => {
  it("produces valid header with 24-bit", async () => {
    const buffer = createTestBuffer(100, 2, 48000);
    const blob = encodeWav(buffer, 24);
    const view = await blobToDataView(blob);

    expect(readString(view, 0, 4)).toBe("RIFF");
    // Format tag = 1 (PCM)
    expect(view.getUint16(20, true)).toBe(1);
    // Bits per sample = 24
    expect(view.getUint16(34, true)).toBe(24);
    // Block align = 2 channels * 3 bytes = 6
    expect(view.getUint16(32, true)).toBe(6);
  });

  it("has correct data size for 24-bit", async () => {
    const length = 100;
    const channels = 2;
    const buffer = createTestBuffer(length, channels, 48000);
    const blob = encodeWav(buffer, 24);
    const view = await blobToDataView(blob);

    expect(readString(view, 36, 4)).toBe("data");
    const dataSize = view.getUint32(40, true);
    expect(dataSize).toBe(length * channels * 3); // 3 bytes per sample
  });

  it("default bit depth is 24", async () => {
    const buffer = createTestBuffer(10, 1, 44100);
    const blob = encodeWav(buffer);
    const view = await blobToDataView(blob);
    expect(view.getUint16(34, true)).toBe(24);
  });
});

describe("encodeWav — 32-bit float", () => {
  it("produces IEEE_FLOAT format tag", async () => {
    const buffer = createTestBuffer(100, 2, 96000);
    const blob = encodeWav(buffer, 32);
    const view = await blobToDataView(blob);

    expect(readString(view, 0, 4)).toBe("RIFF");
    // Format tag = 3 (IEEE_FLOAT)
    expect(view.getUint16(20, true)).toBe(3);
    // Bits per sample = 32
    expect(view.getUint16(34, true)).toBe(32);
    // fmt chunk size = 18 (includes cbSize)
    expect(view.getUint32(16, true)).toBe(18);
  });

  it("has correct data size for 32-bit float", async () => {
    const length = 100;
    const channels = 2;
    const buffer = createTestBuffer(length, channels, 96000);
    const blob = encodeWav(buffer, 32);
    const view = await blobToDataView(blob);

    // data chunk is after fmt (12 + 8+18 + 8 = 46 for header)
    // Find data chunk
    const fmtEnd = 12 + 8 + 18; // 38
    expect(readString(view, fmtEnd, 4)).toBe("data");
    const dataSize = view.getUint32(fmtEnd + 4, true);
    expect(dataSize).toBe(length * channels * 4); // 4 bytes per sample
  });

  it("preserves float sample values", async () => {
    // Create a buffer with a known sample value
    const buffer = {
      length: 1,
      numberOfChannels: 1,
      sampleRate: 44100,
      duration: 1 / 44100,
      getChannelData: () => new Float32Array([0.5]),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    } as unknown as AudioBuffer;

    const blob = encodeWav(buffer, 32);
    const view = await blobToDataView(blob);

    // Data starts after header (12 + 8 + 18 + 8 = 46)
    const dataOffset = 46;
    const sample = view.getFloat32(dataOffset, true);
    expect(sample).toBeCloseTo(0.5, 5);
  });
});

describe("encodeWav — sample rate independence", () => {
  it("encodes 44100 Hz correctly", async () => {
    const buffer = createTestBuffer(10, 1, 44100);
    const blob = encodeWav(buffer, 16);
    const view = await blobToDataView(blob);
    expect(view.getUint32(24, true)).toBe(44100);
  });

  it("encodes 48000 Hz correctly", async () => {
    const buffer = createTestBuffer(10, 1, 48000);
    const blob = encodeWav(buffer, 16);
    const view = await blobToDataView(blob);
    expect(view.getUint32(24, true)).toBe(48000);
  });

  it("encodes 96000 Hz correctly", async () => {
    const buffer = createTestBuffer(10, 1, 96000);
    const blob = encodeWav(buffer, 16);
    const view = await blobToDataView(blob);
    expect(view.getUint32(24, true)).toBe(96000);
  });
});
