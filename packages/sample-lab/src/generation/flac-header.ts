import { GenerationError } from "./errors.js";

export interface FlacStreamInfo {
  sampleRateHz: number;
  channels: number;
  bitDepth: number;
  totalSamples: number;
  durationSec: number;
}

/**
 * Parse FLAC STREAMINFO. Duration is samples / sampleRate — never a requested figure.
 *
 * Layout (after "fLaC"): 4-byte METADATA_BLOCK_HEADER + 34-byte STREAMINFO.
 * Packed 64-bit field: 20-bit rate, 3-bit (channels-1), 5-bit (bitDepth-1), 36-bit samples.
 */
export function parseFlacStreamInfo(bytes: Uint8Array): FlacStreamInfo {
  if (bytes.length < 42) {
    throw new GenerationError("FLAC_HEADER", "FLAC buffer shorter than STREAMINFO");
  }
  if (
    bytes[0] !== 0x66 ||
    bytes[1] !== 0x4c ||
    bytes[2] !== 0x61 ||
    bytes[3] !== 0x43
  ) {
    throw new GenerationError("FLAC_HEADER", "Missing fLaC marker");
  }

  const blockType = bytes[4] & 0x7f;
  if (blockType !== 0) {
    throw new GenerationError(
      "FLAC_HEADER",
      `First metadata block is type ${blockType}, expected STREAMINFO (0)`,
    );
  }
  const blockLen = (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
  if (blockLen < 34) {
    throw new GenerationError("FLAC_HEADER", `STREAMINFO length ${blockLen} < 34`);
  }

  // Packed 64-bit field starts at offset 18 (8 byte marker/header + 10 bytes of sizes).
  const packed =
    (BigInt(bytes[18]) << 56n) |
    (BigInt(bytes[19]) << 48n) |
    (BigInt(bytes[20]) << 40n) |
    (BigInt(bytes[21]) << 32n) |
    (BigInt(bytes[22]) << 24n) |
    (BigInt(bytes[23]) << 16n) |
    (BigInt(bytes[24]) << 8n) |
    BigInt(bytes[25]);

  const sampleRateHz = Number(packed >> 44n);
  const channels = Number((packed >> 41n) & 0x7n) + 1;
  const bitDepth = Number((packed >> 36n) & 0x1fn) + 1;
  const totalSamples = Number(packed & 0xfffffffffn);

  if (sampleRateHz <= 0 || totalSamples <= 0) {
    throw new GenerationError(
      "FLAC_HEADER",
      `Invalid STREAMINFO rate=${sampleRateHz} samples=${totalSamples}`,
    );
  }

  return {
    sampleRateHz,
    channels,
    bitDepth,
    totalSamples,
    durationSec: totalSamples / sampleRateHz,
  };
}

export function durationMsFromStreamInfo(info: FlacStreamInfo): number {
  return Math.round(info.durationSec * 1000);
}
