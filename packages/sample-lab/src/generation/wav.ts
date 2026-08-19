import { RUNTIME_SAMPLE_RATE_HZ, WAV_BIT_DEPTH } from "./constants.js";

function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

/**
 * Encode planar float PCM as a 48 kHz 24-bit WAV (Motif runtime export default).
 */
export function encodeWav24(
  channels: Float32Array[],
  sampleRate: number = RUNTIME_SAMPLE_RATE_HZ,
): Uint8Array {
  const numChannels = channels.length;
  const length = channels[0]?.length ?? 0;
  const bitsPerSample = WAV_BIT_DEPTH;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const fmtChunkSize = 16;
  const headerSize = 12 + 8 + fmtChunkSize + 8;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  let pos = 0;

  writeString(view, pos, "RIFF");
  pos += 4;
  view.setUint32(pos, totalSize - 8, true);
  pos += 4;
  writeString(view, pos, "WAVE");
  pos += 4;

  writeString(view, pos, "fmt ");
  pos += 4;
  view.setUint32(pos, fmtChunkSize, true);
  pos += 4;
  view.setUint16(pos, 1, true);
  pos += 2;
  view.setUint16(pos, numChannels, true);
  pos += 2;
  view.setUint32(pos, sampleRate, true);
  pos += 4;
  view.setUint32(pos, sampleRate * blockAlign, true);
  pos += 4;
  view.setUint16(pos, blockAlign, true);
  pos += 2;
  view.setUint16(pos, bitsPerSample, true);
  pos += 2;

  writeString(view, pos, "data");
  pos += 4;
  view.setUint32(pos, dataSize, true);
  pos += 4;

  const scale = 0x7fffff;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = channels[ch]![i] ?? 0;
      const clipped = Math.max(-1, Math.min(1, sample));
      let intVal = Math.round(clipped * scale);
      if (intVal < 0) intVal += 0x1000000;
      view.setUint8(pos, intVal & 0xff);
      view.setUint8(pos + 1, (intVal >> 8) & 0xff);
      view.setUint8(pos + 2, (intVal >> 16) & 0xff);
      pos += 3;
    }
  }

  return new Uint8Array(buffer);
}
