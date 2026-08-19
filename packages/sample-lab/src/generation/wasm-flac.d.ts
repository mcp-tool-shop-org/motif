declare module "@wasm-audio-decoders/flac" {
  export class FLACDecoder {
    ready: Promise<unknown>;
    decode(data: Uint8Array): Promise<{
      channelData?: Float32Array[];
      samplesDecoded?: number;
      sampleRate?: number;
    }>;
    decodeFile?(data: Uint8Array): Promise<{
      channelData?: Float32Array[];
      samplesDecoded?: number;
      sampleRate?: number;
    }>;
    reset?(): void;
    free?(): void;
  }
}
