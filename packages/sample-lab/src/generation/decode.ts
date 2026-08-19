export interface FlacPcm {
  sampleRate: number;
  channels: number;
  samples: number;
  channelData: Float32Array[];
}

export type FlacDecoderFn = (bytes: Uint8Array) => Promise<FlacPcm>;

interface WasmDecodeResult {
  channelData?: Float32Array[];
  samplesDecoded?: number;
  sampleRate?: number;
}

interface WasmDecoder {
  ready: Promise<unknown>;
  decode: (data: Uint8Array) => Promise<WasmDecodeResult>;
  decodeFile?: (data: Uint8Array) => Promise<WasmDecodeResult>;
  reset?: () => void;
  free?: () => void;
}

/**
 * Default FLAC decoder. Uses `@wasm-audio-decoders/flac` when present.
 * Tests inject a fake decoder; ingest requires a working one to resample.
 */
export async function decodeFlacPcm(bytes: Uint8Array): Promise<FlacPcm> {
  const mod = (await import("@wasm-audio-decoders/flac")) as {
    FLACDecoder: new () => WasmDecoder;
  };
  const decoder = new mod.FLACDecoder();
  await decoder.ready;
  const decoded = decoder.decodeFile
    ? await decoder.decodeFile(bytes)
    : await decoder.decode(bytes);
  decoder.free?.();

  const channelData = decoded.channelData;
  const sampleRate = decoded.sampleRate;
  if (!channelData || channelData.length === 0 || !sampleRate) {
    throw new Error("FLAC decoder returned no PCM");
  }
  const samples = decoded.samplesDecoded ?? channelData[0]!.length;
  return {
    sampleRate,
    channels: channelData.length,
    samples,
    channelData,
  };
}
