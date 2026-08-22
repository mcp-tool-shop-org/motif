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
  reset?: () => Promise<void> | void;
  free?: () => void;
}

/**
 * One WASM decoder for the whole process, reset between files.
 *
 * Instantiating `FLACDecoder` compiles and starts a WASM module; doing that per
 * file cost five instantiations per take (mix + 4 stems) and ~2.4k across the
 * library, for no benefit — the decoder is reusable by design and exposes
 * `reset()` for exactly this. Held lazily so importing the module never pays
 * for a decoder that is never used.
 */
let decoderPromise: Promise<WasmDecoder> | null = null;

/**
 * Decode calls are serialized onto this chain. A single shared decoder must
 * never be re-entered — two concurrent `decodeFile` calls would interleave on
 * the same WASM heap and silently corrupt both results.
 */
let decodeQueue: Promise<unknown> = Promise.resolve();

async function sharedDecoder(): Promise<WasmDecoder> {
  if (!decoderPromise) {
    decoderPromise = (async () => {
      const mod = (await import("@wasm-audio-decoders/flac")) as {
        FLACDecoder: new () => WasmDecoder;
      };
      const decoder = new mod.FLACDecoder();
      await decoder.ready;
      return decoder;
    })();
  }
  return decoderPromise;
}

/** Release the shared decoder. Tests use it to prove reuse is not load-bearing. */
export async function releaseFlacDecoder(): Promise<void> {
  const pending = decoderPromise;
  decoderPromise = null;
  if (!pending) return;
  const decoder = await pending.catch(() => null);
  decoder?.free?.();
}

/**
 * Default FLAC decoder. Uses `@wasm-audio-decoders/flac` when present.
 * Tests inject a fake decoder; ingest requires a working one to resample.
 */
export async function decodeFlacPcm(bytes: Uint8Array): Promise<FlacPcm> {
  const run = decodeQueue.then(async () => {
    const decoder = await sharedDecoder();
    const decoded = decoder.decodeFile
      ? await decoder.decodeFile(bytes)
      : await decoder.decode(bytes);
    // Clear codec state so the next file starts from a clean header.
    await decoder.reset?.();

    const channelData = decoded.channelData;
    const sampleRate = decoded.sampleRate;
    if (!channelData || channelData.length === 0 || !sampleRate) {
      throw new Error("FLAC decoder returned no PCM");
    }
    const samples = decoded.samplesDecoded ?? channelData[0]!.length;
    return { sampleRate, channels: channelData.length, samples, channelData };
  });
  // Keep the chain alive even when a decode rejects, so one bad file does not
  // wedge every later decode behind a permanently rejected promise.
  decodeQueue = run.catch(() => undefined);
  return run;
}
