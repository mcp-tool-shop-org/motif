// ────────────────────────────────────────────
// Scene player — play layered stems + synth clips for a scene
// ────────────────────────────────────────────

import type { SoundtrackPack } from "@motif/schema";
import { resolveActiveLayers } from "@motif/audio-engine";
import { InstrumentRack } from "@motif/instrument-rack";
import { scheduleNotes, clipLengthSeconds } from "@motif/clip-engine";
import { resolveClipNotes } from "@motif/clip-engine";
import type { StemHandle, PlaybackListener, PlaybackEventType } from "./types.js";
import type { AssetLoader } from "./loader.js";
import type { Mixer } from "./mixer.js";
import type { BusId } from "./mixer-types.js";

export class ScenePlayer {
  private ctx: AudioContext;
  private loader: AssetLoader;
  private masterGain: GainNode;
  private handles = new Map<string, StemHandle>();
  private currentSceneId: string | null = null;
  private soloActive = false;
  private listener: PlaybackListener | null = null;
  private mixer: Mixer | null = null;

  // Clip playback state
  private clipRack: InstrumentRack | null = null;
  private clipGains = new Map<string, GainNode>();
  private clipLoopTimers: ReturnType<typeof setInterval>[] = [];
  private clipStartTime = 0;

  // Lookahead scheduler state: tracks which loop iteration was last scheduled per clip
  private clipNextIteration = new Map<string, number>();
  /** How far ahead (seconds) the scheduler pre-schedules notes */
  static readonly LOOKAHEAD_S = 0.2;
  /** How often (ms) the scheduler checks for work */
  static readonly SCHEDULE_INTERVAL_MS = 100;

  constructor(ctx: AudioContext, loader: AssetLoader) {
    this.ctx = ctx;
    this.loader = loader;
    this.masterGain = ctx.createGain();
    this.masterGain.connect(ctx.destination);
  }

  /** Attach a mixer for bus routing and pan. Pass null to remove the mixer. */
  setMixer(mixer: Mixer | null): void {
    this.mixer = mixer;
    if (mixer) {
      // Rewire masterGain through mixer
      this.masterGain.disconnect();
      // The mixer's getMasterGain already connects to ctx.destination,
      // so we don't need the scene-player's masterGain when mixer is active.
      // Instead, the mixer handles the final routing.
    } else {
      // Mixer removed — reconnect masterGain directly to destination
      try { this.masterGain.disconnect(); } catch { /* already disconnected */ }
      this.masterGain.connect(this.ctx.destination);
    }
  }

  /** Remove the mixer and reconnect masterGain to destination. */
  clearMixer(): void {
    this.setMixer(null);
  }

  setListener(listener: PlaybackListener): void {
    this.listener = listener;
  }

  get sceneId(): string | null {
    return this.currentSceneId;
  }

  get stemHandles(): ReadonlyMap<string, StemHandle> {
    return this.handles;
  }

  getMasterGain(): GainNode {
    return this.masterGain;
  }

  /**
   * Play all stems for a scene. Loads assets if needed.
   * Returns the stem IDs that are playing.
   */
  async playScene(
    pack: SoundtrackPack,
    sceneId: string,
  ): Promise<string[]> {
    // Stop current scene
    this.stopAll();

    this.currentSceneId = sceneId;
    const plan = resolveActiveLayers(pack, sceneId);

    if (plan.warnings.length > 0) {
      console.warn('[Motif] Scene resolution warnings:', ...plan.warnings);
    }

    // Load required assets
    await this.loader.loadForStems(pack, plan.stemIds);

    const stemsById = new Map(pack.stems.map((s) => [s.id, s]));
    const scene = pack.scenes.find((s) => s.id === sceneId);
    const layersByStem = new Map(
      scene?.layers.map((l) => [l.stemId, l]) ?? [],
    );

    const playingStemIds: string[] = [];

    for (const stemId of plan.stemIds) {
      const stem = stemsById.get(stemId);
      if (!stem) continue;

      const buffer = this.loader.getBuffer(stem.assetId);
      if (!buffer) continue;

      const gainNode = this.ctx.createGain();
      const layerRef = layersByStem.get(stemId);
      const stemGainDb = layerRef?.gainDb ?? stem.gainDb ?? 0;

      gainNode.gain.value = stem.mutedByDefault ? 0 : dbToGain(stemGainDb);

      // Route through mixer if available, otherwise direct to masterGain
      if (this.mixer) {
        const bus: BusId = stem.role === "accent" ? "drums" : "music";
        this.mixer.connectStem(stemId, gainNode, bus);
      } else {
        gainNode.connect(this.masterGain);
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = stem.loop;
      source.connect(gainNode);
      source.start(0);

      const handle: StemHandle = {
        stemId,
        assetId: stem.assetId,
        source,
        gainNode,
        muted: stem.mutedByDefault ?? false,
        solo: false,
        userGainDb: stemGainDb,
        playing: true,
      };

      source.onended = () => {
        if (handle.playing) {
          handle.playing = false;
          handle.source = null;
          this.emit("stem-change");
        }
      };

      this.handles.set(stemId, handle);
      playingStemIds.push(stemId);
    }

    this.soloActive = false;

    // ── Play clip layers through synth/drum voices ──
    this.playClipLayers(pack, sceneId);

    this.emit("scene-change", { sceneId });
    this.emit("stem-change");

    return playingStemIds;
  }

  /**
   * Schedule clip layers for real-time playback through the instrument rack.
   * Handles looping by re-scheduling notes at each loop boundary.
   */
  private playClipLayers(pack: SoundtrackPack, sceneId: string): void {
    const scene = pack.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const clipLayers = scene.clipLayers ?? [];
    if (clipLayers.length === 0) return;

    const clipsById = new Map((pack.clips ?? []).map((c) => [c.id, c]));

    // Create a fresh rack
    this.clipRack = new InstrumentRack();
    if (pack.instruments) this.clipRack.registerPresets(pack.instruments);

    this.clipStartTime = this.ctx.currentTime;

    for (const ref of clipLayers) {
      if (ref.mutedByDefault) continue;
      const clip = clipsById.get(ref.clipId);
      if (!clip) continue;
      const voice = this.clipRack.getVoice(clip.instrumentId);
      if (!voice) continue;

      // Create a gain node for this clip channel
      const gainNode = this.ctx.createGain();
      const clipGainDb = ref.gainDb ?? clip.gainDb ?? 0;
      gainNode.gain.value = dbToGain(clipGainDb);

      if (this.mixer) {
        const bus: BusId = clip.lane === "drums" ? "drums" : "music";
        this.mixer.connectStem(`clip-${ref.clipId}`, gainNode, bus);
      } else {
        gainNode.connect(this.masterGain);
      }
      this.clipGains.set(ref.clipId, gainNode);

      const notes = resolveClipNotes(clip, ref.variantId);
      if (notes.length === 0) continue;

      const clipDur = clipLengthSeconds(clip.bpm, clip.lengthBeats);

      // Schedule the first iteration immediately
      this.scheduleClipIteration(voice, notes, clip.bpm, gainNode, 0);

      // If looping, use a lookahead scheduler locked to AudioContext.currentTime
      // instead of setInterval-timed loops (which drift from the audio clock).
      if (clip.loop && clipDur > 0) {
        const clipId = ref.clipId;
        this.clipNextIteration.set(clipId, 1);
        let lastTickTime = performance.now();

        const timer = setInterval(() => {
          const now = performance.now();
          const elapsedMs = now - lastTickTime;
          lastTickTime = now;

          let iter = this.clipNextIteration.get(clipId) ?? 1;

          // Recovery: if the tab was backgrounded and the interval was throttled
          // (elapsed > 2x the expected interval), extend the lookahead window
          // to catch up on missed iterations instead of dropping them.
          const wasThrottled = elapsedMs > ScenePlayer.SCHEDULE_INTERVAL_MS * 2;
          const horizon = wasThrottled
            ? this.ctx.currentTime + (elapsedMs / 1000) + ScenePlayer.LOOKAHEAD_S
            : this.ctx.currentTime + ScenePlayer.LOOKAHEAD_S;

          // Pre-schedule all iterations whose start falls within the lookahead window
          while (this.clipStartTime + iter * clipDur <= horizon) {
            this.scheduleClipIteration(voice, notes, clip.bpm, gainNode, iter * clipDur);
            iter++;
          }
          this.clipNextIteration.set(clipId, iter);
        }, ScenePlayer.SCHEDULE_INTERVAL_MS);
        this.clipLoopTimers.push(timer);
      }
    }
  }

  private scheduleClipIteration(
    voice: { playNote: (ctx: BaseAudioContext, pitch: number, velocity: number, startTime: number, duration: number, output: AudioNode) => unknown },
    notes: readonly { pitch: number; velocity: number; startTick: number; durationTicks: number }[],
    bpm: number,
    output: GainNode,
    offsetSeconds: number,
  ): void {
    const scheduled = scheduleNotes(notes, bpm, this.clipStartTime + offsetSeconds);
    for (const n of scheduled) {
      // Only schedule notes that are in the future (or very near future)
      if (n.startTime + n.duration > this.ctx.currentTime - 0.01) {
        voice.playNote(this.ctx, n.pitch, n.velocity, n.startTime, n.duration, output);
      }
    }
  }

  /** Stop all playing stems and clips */
  stopAll(): void {
    for (const handle of this.handles.values()) {
      handle.playing = false;
      try {
        handle.source?.stop();
      } catch {
        // May already be stopped
      }
      handle.gainNode.disconnect();
    }

    // Stop clip loop timers
    for (const timer of this.clipLoopTimers) {
      clearInterval(timer);
    }
    this.clipLoopTimers = [];

    // Disconnect clip gain nodes
    for (const gain of this.clipGains.values()) {
      gain.disconnect();
    }
    this.clipGains.clear();
    this.clipNextIteration.clear();

    // Dispose clip rack
    if (this.clipRack) {
      this.clipRack.dispose();
      this.clipRack = null;
    }

    // Disconnect mixer stem routes
    if (this.mixer) {
      this.mixer.disconnectAllStems();
    }
    this.handles.clear();
    this.currentSceneId = null;
    this.soloActive = false;
  }

  /** Set mute for a stem */
  setMuted(stemId: string, muted: boolean): void {
    const h = this.handles.get(stemId);
    if (!h) return;
    h.muted = muted;
    this.updateEffectiveGains();
    this.emit("stem-change");
  }

  /** Toggle solo for a stem */
  setSolo(stemId: string, solo: boolean): void {
    const h = this.handles.get(stemId);
    if (!h) return;
    h.solo = solo;
    this.soloActive = [...this.handles.values()].some((s) => s.solo);
    this.updateEffectiveGains();
    this.emit("stem-change");
  }

  /** Set user gain in dB for a stem */
  setGain(stemId: string, gainDb: number): void {
    const h = this.handles.get(stemId);
    if (!h) return;
    h.userGainDb = gainDb;
    this.updateEffectiveGains();
    this.emit("stem-change");
  }

  /**
   * Compute seconds until the next bar boundary, relative to the clip scheduler's
   * start time. Useful for bar-sync transitions that delay switching until a
   * musically meaningful moment.
   *
   * Returns 0 when no clips are playing (clipStartTime === 0).
   */
  getTimeToNextBar(bpm: number, beatsPerBar: number): number {
    if (this.clipStartTime === 0) {
      // No clip scheduling active — estimate from context start
      const barDuration = (60 / bpm) * beatsPerBar;
      const elapsed = this.ctx.currentTime;
      const positionInBar = elapsed % barDuration;
      if (positionInBar < 0.001) return barDuration; // already on a boundary
      return barDuration - positionInBar;
    }

    const barDuration = (60 / bpm) * beatsPerBar;
    const elapsed = this.ctx.currentTime - this.clipStartTime;
    const positionInBar = elapsed % barDuration;
    if (positionInBar < 0.001) return barDuration; // exactly on boundary, wait for next
    return barDuration - positionInBar;
  }

  /** Set pan for a stem (-1 left to +1 right) */
  setPan(stemId: string, pan: number): void {
    if (!this.mixer) return;
    this.mixer.setPan(stemId, pan);
    this.emit("stem-change");
  }

  /** Get pan for a stem */
  getPan(stemId: string): number {
    return this.mixer?.getPan(stemId) ?? 0;
  }

  /** Set bus assignment for a stem */
  setStemBus(stemId: string, bus: BusId): void {
    if (!this.mixer) return;
    this.mixer.setStemBus(stemId, bus);
    this.emit("stem-change");
  }

  private updateEffectiveGains(): void {
    for (const h of this.handles.values()) {
      let effective: number;
      if (h.muted) {
        effective = 0;
      } else if (this.soloActive && !h.solo) {
        effective = 0;
      } else {
        effective = dbToGain(h.userGainDb);
      }
      h.gainNode.gain.setValueAtTime(effective, this.ctx.currentTime);
    }
  }

  private emit(type: string, detail?: unknown): void {
    this.listener?.({ type: type as PlaybackEventType, detail });
  }
}

/** Convert dB to linear gain */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}
