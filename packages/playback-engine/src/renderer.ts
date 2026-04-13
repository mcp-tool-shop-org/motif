// ────────────────────────────────────────────
// CueRenderer — offline render to AudioBuffer + WAV
// ────────────────────────────────────────────

import type { SoundtrackPack } from "@motif/schema";
import { resolveActiveLayers } from "@motif/audio-engine";
import { InstrumentRack } from "@motif/instrument-rack";
import {
  scheduleNotes,
  clipLengthSeconds,
  resolveClipNotes,
} from "@motif/clip-engine";
import type { RenderOptions, RenderResult, BusId, WavBitDepth } from "./mixer-types.js";
import { Mixer } from "./mixer.js";
import { AssetLoader } from "./loader.js";
import { dbToGain } from "./scene-player.js";

/**
 * Renders a scene to an AudioBuffer using OfflineAudioContext.
 * Recreates the full mix graph (stems → gain → pan → buses → FX → master)
 * in an offline context and renders to a buffer.
 * Also renders clip layers through synth/drum voices.
 */
export class CueRenderer {
  private onlineCtx: AudioContext;
  private loader: AssetLoader;

  constructor(ctx: AudioContext, loader: AssetLoader) {
    this.onlineCtx = ctx;
    this.loader = loader;
  }

  /**
   * Render a scene to an AudioBuffer.
   * Uses OfflineAudioContext to produce a fully mixed audio buffer.
   * Supports both stem layers (audio assets) and clip layers (synth voices).
   */
  async render(
    pack: SoundtrackPack,
    options: RenderOptions,
  ): Promise<RenderResult> {
    const sampleRate = options.sampleRate ?? 48000;
    const channels = options.channels ?? 2;

    // Resolve scene and stems
    const scene = pack.scenes.find((s) => s.id === options.sceneId);
    if (!scene) throw new Error(`Scene not found: ${options.sceneId}`);

    const plan = resolveActiveLayers(pack, options.sceneId);
    const stemsById = new Map(pack.stems.map((s) => [s.id, s]));
    const layersByStEm = new Map(
      scene.layers.map((l) => [l.stemId, l]) ?? [],
    );

    // Resolve clip layers
    const clipLayers = scene.clipLayers ?? [];
    const clipsById = new Map((pack.clips ?? []).map((c) => [c.id, c]));

    // Ensure assets are loaded in the online context
    if (plan.stemIds.length > 0) {
      await this.loader.loadForStems(pack, plan.stemIds);
    }

    // Determine render duration
    let durationSeconds = options.durationSeconds ?? 0;
    if (durationSeconds <= 0) {
      // Auto-detect from longest asset
      for (const stemId of plan.stemIds) {
        const stem = stemsById.get(stemId);
        if (!stem) continue;
        const buffer = this.loader.getBuffer(stem.assetId);
        if (buffer && buffer.duration > durationSeconds) {
          durationSeconds = buffer.duration;
        }
      }
      // Also consider clip durations
      for (const ref of clipLayers) {
        const clip = clipsById.get(ref.clipId);
        if (!clip) continue;
        const clipDur = clipLengthSeconds(clip.bpm, clip.lengthBeats);
        if (clipDur > durationSeconds) durationSeconds = clipDur;
      }
    }
    // For loop-only, default to 30s if nothing useful found
    if (durationSeconds <= 0) durationSeconds = 30;

    // Add a small tail for reverb/delay
    const tailSeconds = 2;
    const totalDuration = durationSeconds + tailSeconds;

    // Create offline context
    const offlineCtx = new OfflineAudioContext(
      channels,
      Math.ceil(totalDuration * sampleRate),
      sampleRate,
    );

    // Create mixer in the offline context
    const mixer = new Mixer(offlineCtx, offlineCtx.destination);

    // Play stems into the offline graph
    for (const stemId of plan.stemIds) {
      const stem = stemsById.get(stemId);
      if (!stem) continue;

      const onlineBuffer = this.loader.getBuffer(stem.assetId);
      if (!onlineBuffer) continue;

      // Re-create the buffer in the offline context
      const offlineBuffer = offlineCtx.createBuffer(
        onlineBuffer.numberOfChannels,
        onlineBuffer.length,
        onlineBuffer.sampleRate,
      );
      for (let ch = 0; ch < onlineBuffer.numberOfChannels; ch++) {
        offlineBuffer.copyToChannel(onlineBuffer.getChannelData(ch), ch);
      }

      const gainNode = offlineCtx.createGain();
      const layerRef = layersByStEm.get(stemId);
      const stemGainDb = layerRef?.gainDb ?? stem.gainDb ?? 0;
      gainNode.gain.value = stem.mutedByDefault ? 0 : dbToGain(stemGainDb);

      // Infer bus assignment from stem role
      const bus: BusId = inferBus(stem.role);
      mixer.connectStem(stemId, gainNode, bus);

      const source = offlineCtx.createBufferSource();
      source.buffer = offlineBuffer;

      // For loop-only preset, enable looping
      if (options.preset === "loop-only") {
        source.loop = true;
      } else {
        source.loop = stem.loop;
      }

      source.connect(gainNode);
      source.start(0);

      // Stop looping sources at the target duration
      if (source.loop) {
        source.stop(durationSeconds);
      }
    }

    // Play clip layers through synth/drum voices into the offline graph
    if (clipLayers.length > 0) {
      const rack = new InstrumentRack();
      if (pack.instruments) rack.registerPresets(pack.instruments);

      for (const ref of clipLayers) {
        if (ref.mutedByDefault) continue;

        const clip = clipsById.get(ref.clipId);
        if (!clip) continue;

        const voice = rack.getVoice(clip.instrumentId);
        if (!voice) continue;

        const gainNode = offlineCtx.createGain();
        const clipGainDb = ref.gainDb ?? clip.gainDb ?? 0;
        gainNode.gain.value = dbToGain(clipGainDb);

        // Route clips through the music bus (drums lane → drums bus)
        const bus: BusId = clip.lane === "drums" ? "drums" : "music";
        mixer.connectStem(`clip-${ref.clipId}`, gainNode, bus);

        const notes = resolveClipNotes(clip, ref.variantId);
        const clipDur = clipLengthSeconds(clip.bpm, clip.lengthBeats);

        if (clip.loop && clipDur > 0) {
          // Schedule looping clip iterations to fill the render duration
          let offset = 0;
          while (offset < durationSeconds) {
            const scheduled = scheduleNotes(notes, clip.bpm, offset);
            for (const n of scheduled) {
              voice.playNote(
                offlineCtx,
                n.pitch,
                n.velocity,
                n.startTime,
                n.duration,
                gainNode,
              );
            }
            offset += clipDur;
          }
        } else {
          // One-shot clip — schedule once
          const scheduled = scheduleNotes(notes, clip.bpm, 0);
          for (const n of scheduled) {
            voice.playNote(
              offlineCtx as unknown as AudioContext,
              n.pitch,
              n.velocity,
              n.startTime,
              n.duration,
              gainNode,
            );
          }
        }
      }

      rack.dispose();
    }

    // Render
    const renderedBuffer = await offlineCtx.startRendering();
    mixer.dispose();

    return {
      buffer: renderedBuffer,
      durationSeconds: renderedBuffer.duration,
      sampleRate,
      channels,
    };
  }
}

/** Infer bus assignment from stem role */
function inferBus(role: string): BusId {
  if (role === "accent") return "drums";
  return "music";
}

/**
 * Encode an AudioBuffer as a WAV Blob.
 * Supports 16-bit PCM, 24-bit PCM, and 32-bit IEEE float.
 * @param buffer The AudioBuffer to encode
 * @param bitDepth 16, 24, or 32 (float). Default: 24
 * @returns A Blob of type audio/wav
 */
export function encodeWav(buffer: AudioBuffer, bitDepth: WavBitDepth = 24): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bitsPerSample = bitDepth;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const isFloat = bitDepth === 32;
  // For float format, fmt chunk is 18 bytes (extra 2 bytes for cbSize)
  const fmtChunkSize = isFloat ? 18 : 16;
  const headerSize = 12 + (8 + fmtChunkSize) + 8; // RIFF(12) + fmt(8+chunk) + data(8)
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  let pos = 0;

  // RIFF header
  writeString(view, pos, "RIFF"); pos += 4;
  view.setUint32(pos, totalSize - 8, true); pos += 4;
  writeString(view, pos, "WAVE"); pos += 4;

  // fmt chunk
  writeString(view, pos, "fmt "); pos += 4;
  view.setUint32(pos, fmtChunkSize, true); pos += 4;
  // Format tag: 1 = PCM, 3 = IEEE_FLOAT
  view.setUint16(pos, isFloat ? 3 : 1, true); pos += 2;
  view.setUint16(pos, numChannels, true); pos += 2;
  view.setUint32(pos, sampleRate, true); pos += 4;
  view.setUint32(pos, sampleRate * blockAlign, true); pos += 4;
  view.setUint16(pos, blockAlign, true); pos += 2;
  view.setUint16(pos, bitsPerSample, true); pos += 2;
  if (isFloat) {
    // cbSize = 0 (no extra data for IEEE float, but field is required)
    view.setUint16(pos, 0, true); pos += 2;
  }

  // data chunk
  writeString(view, pos, "data"); pos += 4;
  view.setUint32(pos, dataSize, true); pos += 4;

  // Interleave channel data
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = pos;
  if (bitDepth === 16) {
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
  } else if (bitDepth === 24) {
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        // Scale to 24-bit range: -8388608 to 8388607
        const intSample = Math.round(
          sample < 0 ? sample * 0x800000 : sample * 0x7fffff,
        );
        // Write 3 bytes little-endian
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      }
    }
  } else {
    // 32-bit IEEE float
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        view.setFloat32(offset, channels[ch][i], true);
        offset += 4;
      }
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
