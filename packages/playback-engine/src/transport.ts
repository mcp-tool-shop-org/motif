// ────────────────────────────────────────────
// Transport — top-level orchestrator for playback
// ────────────────────────────────────────────

import type { SoundtrackPack, RuntimeMusicState, Cue, PerformanceCaptureEvent, PerformanceCapture } from "@motif/schema";
import type {
  TransportState,
  PlaybackSnapshot,
  PlaybackListener,
  PlaybackEvent,
  SequencePlaybackState,
} from "./types.js";
import type {
  BusId,
  FxType,
  FxParams,
  MixerSnapshot,
  RenderOptions,
  RenderResult,
} from "./mixer-types.js";
import { AssetLoader } from "./loader.js";
import { ScenePlayer } from "./scene-player.js";
import { TransitionPlayer, type TransitionOptions } from "./transition-player.js";
import { SequencePlayer } from "./sequence-player.js";
import { Mixer } from "./mixer.js";
import { CueRenderer, encodeWav } from "./renderer.js";
import { CuePlayer, type CuePlaybackState } from "./cue-player.js";

/**
 * Top-level playback transport.
 *
 * Manages AudioContext lifecycle, coordinates scene/transition/sequence players,
 * and provides a unified event system for UI binding.
 */
export class Transport {
  private ctx: AudioContext | null = null;
  private loader: AssetLoader | null = null;
  private scenePlayer: ScenePlayer | null = null;
  private transitionPlayer: TransitionPlayer | null = null;
  private sequencePlayer: SequencePlayer | null = null;
  private mixer: Mixer | null = null;
  private renderer: CueRenderer | null = null;
  private cuePlayer: CuePlayer | null = null;
  private state: TransportState = "stopped";
  private listeners = new Set<PlaybackListener>();
  private errorMessage: string | null = null;

  // ── Metronome state ──
  private _metronomeEnabled = false;
  private _metronomeBpm = 120;
  private metronomeGain: GainNode | null = null;
  private metronomeTimerId: ReturnType<typeof setTimeout> | null = null;
  private metronomeBeatIndex = 0;
  private metronomeNextBeatTime = 0;
  /** Lookahead window in seconds */
  private readonly metronomeLookahead = 0.1;
  /** Scheduling interval in ms */
  private readonly metronomeScheduleInterval = 25;

  /** Ensure AudioContext exists (requires user gesture in browsers) */
  ensureContext(): AudioContext {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        this.errorMessage =
          "Audio engine unavailable. Your browser may not support Web Audio, or audio is blocked by browser policy.";
        this.setState("error");
        throw new Error(this.errorMessage + (detail ? ` (${detail})` : ""));
      }
      this.loader = new AssetLoader(this.ctx);
      this.scenePlayer = new ScenePlayer(this.ctx, this.loader);

      // Create mixer and wire into scene player
      this.mixer = new Mixer(this.ctx, this.ctx.destination);
      this.scenePlayer.setMixer(this.mixer);

      this.transitionPlayer = new TransitionPlayer(
        this.ctx,
        this.scenePlayer,
        this.loader,
      );
      this.transitionPlayer.setMixer(this.mixer);

      this.sequencePlayer = new SequencePlayer(
        this.scenePlayer,
        this.transitionPlayer,
      );

      this.renderer = new CueRenderer(this.ctx, this.loader);

      this.cuePlayer = new CuePlayer(
        this.scenePlayer,
        this.transitionPlayer,
      );

      // Wire internal events to transport listeners
      const relay = (evt: PlaybackEvent) => this.emit(evt.type, evt.detail);
      this.loader.setListener(relay);
      this.scenePlayer.setListener(relay);
      this.transitionPlayer.setListener(relay);
      this.sequencePlayer.setListener(relay);
      this.cuePlayer.setListener(relay);
    }

    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {
        // If resume fails, the context stays suspended.
        // We surface the error on next play attempt via ensureResumed().
      });
    }

    return this.ctx;
  }

  /**
   * Ensure AudioContext is running. Call this at the start of any playback
   * operation. If the context is suspended (browser autoplay policy), this
   * awaits resume and surfaces a clear message on failure.
   */
  private async ensureResumed(): Promise<void> {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        // resume() rejected
      }
      if (this.ctx.state === "suspended") {
        this.setState("stopped");
        throw new Error(
          "Audio blocked by browser. Click anywhere on the page to enable audio, then try again.",
        );
      }
    }
  }

  /** Play a specific scene */
  async playScene(pack: SoundtrackPack, sceneId: string): Promise<void> {
    try {
      this.ensureContext();
      await this.ensureResumed();
      this.setState("loading");
      this.sequencePlayer!.stop();
      await this.transitionPlayer!.switchScene(pack, sceneId);
      this.setState("playing");
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Play a scene with transition from current */
  async switchScene(
    pack: SoundtrackPack,
    toSceneId: string,
    options?: TransitionOptions,
  ): Promise<void> {
    try {
      this.ensureContext();
      await this.ensureResumed();
      this.setState("loading");
      this.sequencePlayer!.stop();
      await this.transitionPlayer!.switchScene(pack, toSceneId, options);
      this.setState("playing");
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Play through a sequence of states */
  async playSequence(
    pack: SoundtrackPack,
    states: RuntimeMusicState[],
    stepDurationMs?: number,
  ): Promise<void> {
    try {
      this.ensureContext();
      await this.ensureResumed();
      this.setState("playing");
      await this.sequencePlayer!.playSequence(pack, states, stepDurationMs);
      this.setState("stopped");
    } catch (err) {
      this.handleError(err);
    }
  }

  // ── Metronome API ──

  /** Whether metronome is enabled */
  get metronomeEnabled(): boolean {
    return this._metronomeEnabled;
  }

  /** Current metronome BPM */
  get metronomeBpm(): number {
    return this._metronomeBpm;
  }

  /** Toggle metronome on/off */
  toggleMetronome(): void {
    this._metronomeEnabled = !this._metronomeEnabled;
    if (this._metronomeEnabled && this.state === "playing") {
      this.startMetronome();
    } else {
      this.stopMetronome();
    }
    this.emit("metronome-change", {
      enabled: this._metronomeEnabled,
      bpm: this._metronomeBpm,
    });
  }

  /** Set metronome BPM */
  setMetronomeBpm(bpm: number): void {
    this._metronomeBpm = Math.max(20, Math.min(300, bpm));
    this.emit("metronome-change", {
      enabled: this._metronomeEnabled,
      bpm: this._metronomeBpm,
    });
  }

  /** Schedule metronome clicks using lookahead pattern */
  private startMetronome(): void {
    if (!this.ctx) return;
    this.stopMetronome();

    // Create a dedicated gain node for metronome (not routed through mixer)
    this.metronomeGain = this.ctx.createGain();
    this.metronomeGain.gain.value = 1;
    this.metronomeGain.connect(this.ctx.destination);

    this.metronomeBeatIndex = 0;
    this.metronomeNextBeatTime = this.ctx.currentTime;

    this.scheduleMetronomeBeats();
  }

  private scheduleMetronomeBeats(): void {
    if (!this.ctx || !this.metronomeGain) return;

    const secondsPerBeat = 60 / this._metronomeBpm;

    // Schedule all beats that fall within the lookahead window
    while (this.metronomeNextBeatTime < this.ctx.currentTime + this.metronomeLookahead) {
      const isDownbeat = this.metronomeBeatIndex % 4 === 0;
      this.scheduleMetronomeClick(
        this.metronomeNextBeatTime,
        isDownbeat,
      );
      this.metronomeNextBeatTime += secondsPerBeat;
      this.metronomeBeatIndex++;
    }

    // Schedule next check
    this.metronomeTimerId = setTimeout(
      () => this.scheduleMetronomeBeats(),
      this.metronomeScheduleInterval,
    );
  }

  private scheduleMetronomeClick(time: number, isDownbeat: boolean): void {
    if (!this.ctx || !this.metronomeGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(isDownbeat ? 1000 : 800, time);

    const clickGain = isDownbeat ? 0.5 : 0.3;
    const clickDuration = isDownbeat ? 0.03 : 0.02;

    gain.gain.setValueAtTime(clickGain, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + clickDuration);

    osc.connect(gain);
    gain.connect(this.metronomeGain);

    osc.start(time);
    osc.stop(time + clickDuration + 0.001);
  }

  private stopMetronome(): void {
    if (this.metronomeTimerId !== null) {
      clearTimeout(this.metronomeTimerId);
      this.metronomeTimerId = null;
    }
    if (this.metronomeGain) {
      try {
        this.metronomeGain.disconnect();
      } catch {
        // Already disconnected
      }
      this.metronomeGain = null;
    }
  }

  /** Stop all playback */
  stop(): void {
    this.sequencePlayer?.stop();
    this.cuePlayer?.stop();
    this.scenePlayer?.stopAll();
    this.stopMetronome();
    this.setState("stopped");
  }

  // ── Cue playback ──

  /** Play a cue from the beginning or a specific section */
  async playCue(
    pack: SoundtrackPack,
    cue: Cue,
    startSectionIndex?: number,
  ): Promise<void> {
    try {
      this.ensureContext();
      await this.ensureResumed();
      this.setState("playing");
      await this.cuePlayer!.playCue(pack, cue, startSectionIndex);
      this.setState("stopped");
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Jump to a specific section in a cue */
  async jumpToSection(
    pack: SoundtrackPack,
    cue: Cue,
    sectionIndex: number,
  ): Promise<void> {
    try {
      this.ensureContext();
      await this.ensureResumed();
      this.setState("playing");
      await this.cuePlayer!.jumpToSection(pack, cue, sectionIndex);
      this.setState("stopped");
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Toggle section looping */
  setLoopSection(sectionIndex: number | null): void {
    this.cuePlayer?.setLoopSection(sectionIndex);
  }

  /** Get cue playback state */
  getCueState(): CuePlaybackState {
    return (
      this.cuePlayer?.state ?? {
        playing: false,
        currentSectionIndex: -1,
        totalSections: 0,
        currentBar: 0,
        totalBars: 0,
        elapsedSeconds: 0,
        totalSeconds: 0,
        loopingSectionIndex: null,
        recording: false,
      }
    );
  }

  /** Start recording performance capture */
  startCapture(): void {
    this.cuePlayer?.startCapture();
  }

  /** Record a capture event */
  recordCaptureEvent(event: PerformanceCaptureEvent): void {
    this.cuePlayer?.recordEvent(event);
  }

  /** Stop recording and return the capture */
  stopCapture(name: string): PerformanceCapture | null {
    return this.cuePlayer?.stopCapture(name) ?? null;
  }

  /** Get current capture events */
  getCaptureEvents(): readonly PerformanceCaptureEvent[] {
    return this.cuePlayer?.getCaptureEvents() ?? [];
  }

  /** Mute a stem */
  setMuted(stemId: string, muted: boolean): void {
    this.scenePlayer?.setMuted(stemId, muted);
  }

  /** Solo a stem */
  setSolo(stemId: string, solo: boolean): void {
    this.scenePlayer?.setSolo(stemId, solo);
  }

  /** Set gain on a stem */
  setGain(stemId: string, gainDb: number): void {
    this.scenePlayer?.setGain(stemId, gainDb);
  }

  /** Set pan on a stem (-1 left to +1 right) */
  setPan(stemId: string, pan: number): void {
    this.scenePlayer?.setPan(stemId, pan);
  }

  /** Set bus assignment for a stem */
  setStemBus(stemId: string, bus: BusId): void {
    this.scenePlayer?.setStemBus(stemId, bus);
  }

  /** Set master gain in dB */
  setMasterGain(gainDb: number): void {
    this.mixer?.setMasterGain(gainDb);
  }

  /** Set bus gain in dB */
  setBusGain(busId: BusId, gainDb: number): void {
    this.mixer?.setBusGain(busId, gainDb);
  }

  /** Mute/unmute a bus */
  setBusMuted(busId: BusId, muted: boolean): void {
    this.mixer?.setBusMuted(busId, muted);
  }

  /** Add an FX slot to a bus */
  addFxSlot(busId: BusId, type: FxType): void {
    this.mixer?.addFxSlot(busId, type);
  }

  /** Remove an FX slot from a bus */
  removeFxSlot(busId: BusId, slotIndex: number): void {
    this.mixer?.removeFxSlot(busId, slotIndex);
  }

  /** Update FX slot parameters */
  updateFxSlot(busId: BusId, slotIndex: number, params: FxParams): void {
    this.mixer?.updateFxSlot(busId, slotIndex, params);
  }

  /** Bypass/enable an FX slot */
  setFxBypassed(busId: BusId, slotIndex: number, bypassed: boolean): void {
    this.mixer?.setFxBypassed(busId, slotIndex, bypassed);
  }

  // ── Per-stem FX insert API ──

  /** Add an FX insert to a stem (max 4 per stem) */
  addStemFx(stemId: string, type: FxType, params?: FxParams): void {
    this.mixer?.addStemFx(stemId, type, params);
  }

  /** Remove an FX insert from a stem by slot index */
  removeStemFx(stemId: string, slotIndex: number): void {
    this.mixer?.removeStemFx(stemId, slotIndex);
  }

  /** Update FX parameters for a stem FX slot */
  updateStemFx(stemId: string, slotIndex: number, params: FxParams): void {
    this.mixer?.updateStemFx(stemId, slotIndex, params);
  }

  /** Get mixer snapshot */
  getMixerSnapshot(): MixerSnapshot | null {
    return this.mixer?.getSnapshot() ?? null;
  }

  /** Render a scene to an AudioBuffer */
  async renderScene(
    pack: SoundtrackPack,
    options: RenderOptions,
  ): Promise<RenderResult> {
    this.ensureContext();
    return this.renderer!.render(pack, options);
  }

  /** Render a scene to a WAV Blob */
  async renderToWav(
    pack: SoundtrackPack,
    options: RenderOptions,
  ): Promise<Blob> {
    const result = await this.renderScene(pack, options);
    return encodeWav(result.buffer, options.bitDepth);
  }

  /** Subscribe to events */
  on(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Get current snapshot */
  getSnapshot(): PlaybackSnapshot {
    return {
      transport: this.state,
      currentSceneId: this.scenePlayer?.sceneId ?? null,
      stemHandles: this.scenePlayer?.stemHandles ?? new Map(),
      loadState: this.state === "loading" ? "loading" : this.state === "error" ? "error" : "idle",
      loadProgress: 1,
      errorMessage: this.errorMessage,
    };
  }

  /** Get sequence playback state */
  getSequenceState(): SequencePlaybackState {
    return (
      this.sequencePlayer?.state ?? {
        playing: false,
        currentStepIndex: -1,
        totalSteps: 0,
      }
    );
  }

  /** Dispose all resources */
  dispose(): void {
    this.stop();
    this.stopMetronome();
    this.mixer?.dispose();
    this.loader?.clear();
    if (this.ctx && this.ctx.state !== "closed") {
      void this.ctx.close();
    }
    this.ctx = null;
    this.loader = null;
    this.scenePlayer = null;
    this.transitionPlayer = null;
    this.sequencePlayer = null;
    this.cuePlayer = null;
    this.mixer = null;
    this.renderer = null;
    this.listeners.clear();
  }

  private setState(s: TransportState): void {
    if (s !== "error") this.errorMessage = null;
    this.state = s;

    // Start/stop metronome based on transport state
    if (s === "playing" && this._metronomeEnabled) {
      this.startMetronome();
    } else if (s !== "playing") {
      this.stopMetronome();
    }

    this.emit("transport-change", { state: s });
  }

  private handleError(err: unknown): void {
    // Stop all playback first — stale timers and audio nodes must not outlive the error
    this.sequencePlayer?.stop();
    this.cuePlayer?.stop();
    this.scenePlayer?.stopAll();

    const msg = err instanceof Error ? err.message : String(err);
    this.errorMessage = msg;
    this.setState("error");
    this.emit("error", { message: msg });
  }

  private emit(type: string, detail?: unknown): void {
    const event: PlaybackEvent = {
      type: type as PlaybackEvent["type"],
      detail,
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // A single bad listener must not crash the notification loop
        // or corrupt transport state. Swallow and continue.
      }
    }
  }
}
