import type { AudioAsset, SampleSlice, SampleKitSlot, SampleInstrument } from "@motif/schema";
import type { SampleVoice } from "./sample-types.js";

// ── Trimmed region playback ──

export function playTrimmedRegion(
  ctx: AudioContext,
  buffer: AudioBuffer,
  asset: AudioAsset,
  destination?: AudioNode,
): SampleVoice {
  const rawStart = (asset.trimStartMs ?? 0) / 1000;
  const rawEnd = (asset.trimEndMs ?? asset.durationMs) / 1000;

  // Clamp to valid buffer range when duration is available
  const bufDur = buffer.duration;
  const startSec = bufDur != null && isFinite(bufDur)
    ? Math.max(0, Math.min(rawStart, bufDur))
    : Math.max(0, rawStart);
  const endSec = bufDur != null && isFinite(bufDur)
    ? Math.max(startSec, Math.min(rawEnd, bufDur))
    : Math.max(startSec, rawEnd);
  const duration = endSec - startSec;

  // If duration is zero or negative after clamping, return a no-op voice
  if (duration <= 0) {
    return { stop: () => {} };
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(destination ?? ctx.destination);
  source.start(0, startSec, duration);

  return { stop: () => source.stop() };
}

// ── Slice playback ──

export function playSlice(
  ctx: AudioContext,
  buffer: AudioBuffer,
  slice: SampleSlice,
  destination?: AudioNode,
): SampleVoice {
  const startSec = slice.startMs / 1000;
  const duration = (slice.endMs - slice.startMs) / 1000;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(destination ?? ctx.destination);
  source.start(0, startSec, duration);

  return { stop: () => source.stop() };
}

// ── Kit slot trigger ──

export function playKitSlot(
  ctx: AudioContext,
  buffer: AudioBuffer,
  slot: SampleKitSlot,
  slice: SampleSlice | undefined,
  destination?: AudioNode,
): SampleVoice {
  const startSec = slice ? slice.startMs / 1000 : 0;
  const duration = slice ? (slice.endMs - slice.startMs) / 1000 : undefined;

  const gain = ctx.createGain();
  gain.gain.value = slot.gainDb != null ? Math.pow(10, slot.gainDb / 20) : 1;
  gain.connect(destination ?? ctx.destination);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start(0, startSec, duration);

  return { stop: () => source.stop() };
}

// ── Sample instrument note ──

export function playSampleInstrumentNote(
  ctx: AudioContext,
  buffer: AudioBuffer,
  instrument: SampleInstrument,
  note: number,
  destination?: AudioNode,
): SampleVoice {
  // Clamp MIDI note to valid range [0, 127]
  const clampedNote = Math.max(0, Math.min(127, Math.round(note)));
  const rate = Math.pow(2, (clampedNote - instrument.rootNote) / 12);
  const dest = destination ?? ctx.destination;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;

  // ADSR envelope
  const envelope = ctx.createGain();
  const now = ctx.currentTime;
  const attackSec = (instrument.attackMs ?? 5) / 1000;
  const decaySec = (instrument.decayMs ?? 100) / 1000;
  const sustain = instrument.sustainLevel ?? 0.8;

  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(1, now + attackSec);
  envelope.gain.linearRampToValueAtTime(sustain, now + attackSec + decaySec);

  // Optional lowpass filter
  if (instrument.filterCutoffHz != null) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = instrument.filterCutoffHz;
    if (instrument.filterQ != null) filter.Q.value = instrument.filterQ;
    source.connect(filter);
    filter.connect(envelope);
  } else {
    source.connect(envelope);
  }

  envelope.connect(dest);
  source.start();

  return {
    stop: () => {
      const releaseSec = (instrument.releaseMs ?? 200) / 1000;
      const t = ctx.currentTime;
      envelope.gain.cancelScheduledValues(t);
      envelope.gain.setValueAtTime(envelope.gain.value, t);
      envelope.gain.linearRampToValueAtTime(0, t + releaseSec);
      source.stop(t + releaseSec);
    },
  };
}
