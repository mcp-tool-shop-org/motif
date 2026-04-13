"use client";

import { create } from "zustand";
import {
  Transport,
  type TransportState,
  type StemHandle,
  type SequencePlaybackState,
  type CuePlaybackState,
  type MixerSnapshot,
  type BusId,
  type FxType,
  type FxParams,
  type RenderOptions,
  type RenderResult,
} from "@motif/playback-engine";
import type { SoundtrackPack, RuntimeMusicState, Cue, PerformanceCaptureEvent, PerformanceCapture, Clip } from "@motif/schema";
import { InstrumentRack } from "@motif/instrument-rack";
import { scheduleNotes, clipLengthSeconds } from "@motif/clip-engine";
import type { Voice } from "@motif/instrument-rack";

// ── Clip preview singleton ──

let previewCtx: AudioContext | null = null;
let previewVoices: Voice[] = [];
let previewTimeoutId: ReturnType<typeof setTimeout> | null = null;
const previewRack = new InstrumentRack();

function getPreviewCtx(): AudioContext {
  if (!previewCtx) {
    previewCtx = new AudioContext();
  } else if (previewCtx.state === "closed") {
    // Only create a new context if the previous one is truly closed.
    // Prefer suspending over closing to avoid unlimited context creation.
    console.warn("[Playback] AudioContext was closed unexpectedly — creating a new one.");
    previewCtx = new AudioContext();
  }
  if (previewCtx.state === "suspended") {
    previewCtx.resume().catch((err) => {
      console.warn("[Playback] AudioContext.resume() failed:", err);
    });
  }
  return previewCtx;
}

/** Suspend the shared preview AudioContext when not in use (prefer over closing). */
export function suspendPreviewCtx(): void {
  if (previewCtx && previewCtx.state === "running") {
    previewCtx.suspend().catch((err) => {
      console.warn("[Playback] AudioContext.suspend() failed:", err);
    });
  }
}

function stopPreviewInternal() {
  for (const v of previewVoices) v.stop();
  previewVoices = [];
  if (previewTimeoutId !== null) {
    clearTimeout(previewTimeoutId);
    previewTimeoutId = null;
  }
}

function previewClipInternal(clip: Clip, onFinish: () => void): boolean {
  stopPreviewInternal();

  const ctx = getPreviewCtx();
  const voice = previewRack.getVoice(clip.instrumentId);
  if (!voice) return false;

  const scheduled = scheduleNotes(clip.notes, clip.bpm, ctx.currentTime);
  const dest = ctx.destination;

  for (const note of scheduled) {
    const handle = voice.playNote(ctx, note.pitch, note.velocity, note.startTime, note.duration, dest);
    previewVoices.push(handle);
  }

  const totalSeconds = clipLengthSeconds(clip.bpm, clip.lengthBeats);
  previewTimeoutId = setTimeout(() => {
    previewVoices = [];
    previewTimeoutId = null;
    onFinish();
  }, totalSeconds * 1000 + 100);

  return true;
}

/** Last audition voice handle — stopped before each new audition */
let lastAuditionVoice: Voice | null = null;

/** Audition a single note briefly (for NoteGrid click-to-audition) */
export function auditionNote(instrumentId: string, pitch: number, velocity: number = 100, duration: number = 0.2): void {
  const ctx = getPreviewCtx();
  const voice = previewRack.getVoice(instrumentId);
  if (!voice) return;
  if (lastAuditionVoice) lastAuditionVoice.stop();
  lastAuditionVoice = voice.playNote(ctx, pitch, velocity, ctx.currentTime, duration, ctx.destination);
}

// ── Singleton transport ──

const subscribedTransports = new WeakSet<Transport>();
let transport: Transport | null = null;

function getTransport(): Transport {
  if (!transport) {
    transport = new Transport();
  }
  return transport;
}

// ── Store shape ──

export interface PlaybackState {
  transportState: TransportState;
  currentSceneId: string | null;
  stemStates: Map<string, StemHandle>;
  sequenceState: SequencePlaybackState;
  cueState: CuePlaybackState;
  mixerSnapshot: MixerSnapshot | null;
  renderStatus: "idle" | "rendering" | "done" | "error";
  lastRenderResult: RenderResult | null;
  renderError: string | null;
  errorMessage: string | null;

  // Clip preview state
  previewingClipId: string | null;

  // Playback actions
  playScene: (pack: SoundtrackPack, sceneId: string) => Promise<void>;
  switchScene: (
    pack: SoundtrackPack,
    sceneId: string,
    options?: { immediate?: boolean },
  ) => Promise<void>;
  playSequence: (
    pack: SoundtrackPack,
    states: RuntimeMusicState[],
    stepDurationMs?: number,
  ) => Promise<void>;
  stop: () => void;
  setMuted: (stemId: string, muted: boolean) => void;
  setSolo: (stemId: string, solo: boolean) => void;
  setGain: (stemId: string, gainDb: number) => void;

  // Cue playback actions
  playCue: (pack: SoundtrackPack, cue: Cue, startSection?: number) => Promise<void>;
  jumpToSection: (pack: SoundtrackPack, cue: Cue, sectionIndex: number) => Promise<void>;
  setLoopSection: (sectionIndex: number | null) => void;
  startCapture: () => void;
  recordCaptureEvent: (event: PerformanceCaptureEvent) => void;
  stopCapture: (name: string) => PerformanceCapture | null;

  // Mixer actions
  setPan: (stemId: string, pan: number) => void;
  setStemBus: (stemId: string, bus: BusId) => void;
  setMasterGain: (gainDb: number) => void;
  setBusGain: (busId: BusId, gainDb: number) => void;
  setBusMuted: (busId: BusId, muted: boolean) => void;
  addFxSlot: (busId: BusId, type: FxType) => void;
  removeFxSlot: (busId: BusId, slotIndex: number) => void;
  updateFxSlot: (busId: BusId, slotIndex: number, params: FxParams) => void;
  setFxBypassed: (busId: BusId, slotIndex: number, bypassed: boolean) => void;

  // Render actions
  renderScene: (pack: SoundtrackPack, options: RenderOptions) => Promise<void>;

  // Clip preview actions
  previewClip: (clip: Clip) => void;
  stopPreview: () => void;

  dispose: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => {
  // Subscribe to transport events to keep store in sync
  const syncFromTransport = () => {
    const t = getTransport();
    const snap = t.getSnapshot();
    const seqState = t.getSequenceState();
    const cueState = t.getCueState();
    const mixSnap = t.getMixerSnapshot();
    set({
      transportState: snap.transport,
      currentSceneId: snap.currentSceneId,
      stemStates: new Map(snap.stemHandles),
      sequenceState: seqState,
      cueState,
      mixerSnapshot: mixSnap,
      errorMessage: snap.errorMessage,
    });
  };

  // Attach listener on first use (guarded against HMR double-subscribe)
  const t = getTransport();
  if (!subscribedTransports.has(t)) {
    t.on(() => syncFromTransport());
    subscribedTransports.add(t);
  }

  return {
    transportState: "stopped",
    currentSceneId: null,
    stemStates: new Map(),
    sequenceState: { playing: false, currentStepIndex: -1, totalSteps: 0 },
    cueState: {
      playing: false,
      currentSectionIndex: -1,
      totalSections: 0,
      currentBar: 0,
      totalBars: 0,
      elapsedSeconds: 0,
      totalSeconds: 0,
      loopingSectionIndex: null,
      recording: false,
    },
    mixerSnapshot: null,
    renderStatus: "idle",
    lastRenderResult: null,
    renderError: null,
    errorMessage: null,
    previewingClipId: null,

    playScene: async (pack, sceneId) => {
      set({ errorMessage: null });
      try {
        const t = getTransport();
        await t.playScene(pack, sceneId);
        syncFromTransport();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to play scene";
        console.error("[Playback] playScene error:", err);
        set({ errorMessage: `Could not play scene "${sceneId}": ${msg}` });
      }
    },

    switchScene: async (pack, sceneId, options) => {
      set({ errorMessage: null });
      try {
        const t = getTransport();
        await t.switchScene(pack, sceneId, options);
        syncFromTransport();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to switch scene";
        console.error("[Playback] switchScene error:", err);
        set({ errorMessage: `Could not switch to scene "${sceneId}": ${msg}` });
      }
    },

    playSequence: async (pack, states, stepDurationMs) => {
      set({ errorMessage: null });
      try {
        const t = getTransport();
        await t.playSequence(pack, states, stepDurationMs);
        syncFromTransport();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to play sequence";
        console.error("[Playback] playSequence error:", err);
        set({ errorMessage: `Sequence playback failed: ${msg}` });
      }
    },

    stop: () => {
      const t = getTransport();
      t.stop();
      syncFromTransport();
    },

    setMuted: (stemId, muted) => {
      const t = getTransport();
      t.setMuted(stemId, muted);
      syncFromTransport();
    },

    setSolo: (stemId, solo) => {
      const t = getTransport();
      t.setSolo(stemId, solo);
      syncFromTransport();
    },

    setGain: (stemId, gainDb) => {
      const t = getTransport();
      t.setGain(stemId, gainDb);
      syncFromTransport();
    },

    // Mixer actions
    setPan: (stemId, pan) => {
      const t = getTransport();
      t.setPan(stemId, pan);
      syncFromTransport();
    },

    setStemBus: (stemId, bus) => {
      const t = getTransport();
      t.setStemBus(stemId, bus);
      syncFromTransport();
    },

    setMasterGain: (gainDb) => {
      const t = getTransport();
      t.setMasterGain(gainDb);
      syncFromTransport();
    },

    setBusGain: (busId, gainDb) => {
      const t = getTransport();
      t.setBusGain(busId, gainDb);
      syncFromTransport();
    },

    setBusMuted: (busId, muted) => {
      const t = getTransport();
      t.setBusMuted(busId, muted);
      syncFromTransport();
    },

    addFxSlot: (busId, type) => {
      const t = getTransport();
      t.addFxSlot(busId, type);
      syncFromTransport();
    },

    removeFxSlot: (busId, slotIndex) => {
      const t = getTransport();
      t.removeFxSlot(busId, slotIndex);
      syncFromTransport();
    },

    updateFxSlot: (busId, slotIndex, params) => {
      const t = getTransport();
      t.updateFxSlot(busId, slotIndex, params);
      syncFromTransport();
    },

    setFxBypassed: (busId, slotIndex, bypassed) => {
      const t = getTransport();
      t.setFxBypassed(busId, slotIndex, bypassed);
      syncFromTransport();
    },

    // Render actions
    renderScene: async (pack, options) => {
      const t = getTransport();
      set({ renderStatus: "rendering", lastRenderResult: null, renderError: null });
      try {
        const result = await t.renderScene(pack, options);
        set({ renderStatus: "done", lastRenderResult: result });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown render failure";
        console.error("[Playback] renderScene error:", err);
        set({ renderStatus: "error", lastRenderResult: null, renderError: msg });
      }
    },

    // Cue playback actions
    playCue: async (pack, cue, startSection) => {
      set({ errorMessage: null });
      try {
        const t = getTransport();
        await t.playCue(pack, cue, startSection);
        syncFromTransport();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to play cue";
        console.error("[Playback] playCue error:", err);
        set({ errorMessage: `Could not play cue "${cue.name}": ${msg}` });
      }
    },

    jumpToSection: async (pack, cue, sectionIndex) => {
      set({ errorMessage: null });
      try {
        const t = getTransport();
        await t.jumpToSection(pack, cue, sectionIndex);
        syncFromTransport();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to jump to section";
        console.error("[Playback] jumpToSection error:", err);
        set({ errorMessage: `Could not jump to section ${sectionIndex + 1}: ${msg}` });
      }
    },

    setLoopSection: (sectionIndex) => {
      const t = getTransport();
      t.setLoopSection(sectionIndex);
      syncFromTransport();
    },

    startCapture: () => {
      const t = getTransport();
      t.startCapture();
      syncFromTransport();
    },

    recordCaptureEvent: (event) => {
      const t = getTransport();
      t.recordCaptureEvent(event);
    },

    stopCapture: (name) => {
      const t = getTransport();
      const capture = t.stopCapture(name);
      syncFromTransport();
      return capture;
    },

    // Clip preview actions
    previewClip: (clip: Clip) => {
      const state = usePlaybackStore.getState();
      if (state.previewingClipId === clip.id) {
        // Toggle off
        stopPreviewInternal();
        set({ previewingClipId: null });
        return;
      }
      const ok = previewClipInternal(clip, () => {
        set({ previewingClipId: null });
      });
      if (ok) {
        set({ previewingClipId: clip.id });
      }
    },

    stopPreview: () => {
      stopPreviewInternal();
      set({ previewingClipId: null });
    },

    dispose: () => {
      stopPreviewInternal();
      const t = getTransport();
      t.dispose();
      transport = null;
      set({
        transportState: "stopped",
        currentSceneId: null,
        stemStates: new Map(),
        sequenceState: { playing: false, currentStepIndex: -1, totalSteps: 0 },
        cueState: {
          playing: false,
          currentSectionIndex: -1,
          totalSections: 0,
          currentBar: 0,
          totalBars: 0,
          elapsedSeconds: 0,
          totalSeconds: 0,
          loopingSectionIndex: null,
          recording: false,
        },
        mixerSnapshot: null,
        renderStatus: "idle",
        lastRenderResult: null,
        renderError: null,
        errorMessage: null,
        previewingClipId: null,
      });
    },
  };
});
