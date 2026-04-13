// ────────────────────────────────────────────
// CuePlayer — section-based playback with capture
// ────────────────────────────────────────────

import type {
  SoundtrackPack,
  Cue,
  PerformanceCaptureEvent,
  PerformanceCapture,
  IntensityLevel,
} from "@motif/schema";
import type {
  PlaybackListener,
  PlaybackEventType,
} from "./types.js";
import type { ScenePlayer } from "./scene-player.js";
import type { TransitionPlayer } from "./transition-player.js";

export interface CuePlaybackState {
  playing: boolean;
  currentSectionIndex: number;
  totalSections: number;
  /** Current bar within the cue (0-based) */
  currentBar: number;
  totalBars: number;
  /** Elapsed seconds */
  elapsedSeconds: number;
  totalSeconds: number;
  loopingSectionIndex: number | null;
  recording: boolean;
}

interface ResolvedSec {
  id: string;
  name: string;
  startBar: number;
  durationBars: number;
  sceneId?: string;
  intensity?: IntensityLevel;
}

export class CuePlayer {
  private scenePlayer: ScenePlayer;
  private transitionPlayer: TransitionPlayer;
  private listener: PlaybackListener | null = null;

  private playing = false;
  private currentSection = -1;
  private sections: ResolvedSec[] = [];
  private bpm = 120;
  private beatsPerBar = 4;
  private totalBars = 0;
  private currentBar = 0;
  private loopingSectionIndex: number | null = null;
  private abortController: AbortController | null = null;

  // Capture state
  private recording = false;
  private captureEvents: PerformanceCaptureEvent[] = [];
  private captureStartTime = 0;

  constructor(
    scenePlayer: ScenePlayer,
    transitionPlayer: TransitionPlayer,
  ) {
    this.scenePlayer = scenePlayer;
    this.transitionPlayer = transitionPlayer;
  }

  setListener(listener: PlaybackListener): void {
    this.listener = listener;
  }

  get state(): CuePlaybackState {
    const secondsPerBar = (this.beatsPerBar / this.bpm) * 60;
    return {
      playing: this.playing,
      currentSectionIndex: this.currentSection,
      totalSections: this.sections.length,
      currentBar: this.currentBar,
      totalBars: this.totalBars,
      elapsedSeconds: this.currentBar * secondsPerBar,
      totalSeconds: this.totalBars * secondsPerBar,
      loopingSectionIndex: this.loopingSectionIndex,
      recording: this.recording,
    };
  }

  /** Play a full cue from the beginning (or from a specific section) */
  async playCue(
    pack: SoundtrackPack,
    cue: Cue,
    startSectionIndex = 0,
  ): Promise<void> {
    this.stop();

    this.bpm = cue.bpm ?? 120;
    this.beatsPerBar = cue.beatsPerBar ?? 4;

    // Resolve sections
    let bar = 0;
    this.sections = cue.sections.map((s) => {
      const sec: ResolvedSec = {
        id: s.id,
        name: s.name,
        startBar: bar,
        durationBars: s.durationBars,
        sceneId: s.sceneId,
        intensity: s.intensity,
      };
      bar += s.durationBars;
      return sec;
    });
    this.totalBars = bar;

    this.playing = true;
    this.currentBar = 0;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const secondsPerBar = (this.beatsPerBar / this.bpm) * 60;

    try {
      for (let i = startSectionIndex; i < this.sections.length; i++) {
        if (signal.aborted) break;

        this.currentSection = i;
        const section = this.sections[i];
        this.currentBar = section.startBar;

        this.emit("cue-section", {
          sectionIndex: i,
          sectionId: section.id,
          name: section.name,
          bar: section.startBar,
        });

        // Launch scene for this section
        if (section.sceneId) {
          if (i === startSectionIndex) {
            await this.scenePlayer.playScene(pack, section.sceneId);
          } else {
            await this.transitionPlayer.switchScene(pack, section.sceneId);
          }
        }

        // Play through bars in this section
        for (let b = 0; b < section.durationBars; b++) {
          if (signal.aborted) break;

          this.currentBar = section.startBar + b;
          this.emit("cue-bar", {
            bar: this.currentBar,
            sectionIndex: i,
            total: this.totalBars,
          });

          await abortableSleep(secondsPerBar * 1000, signal);

          // If looping this section and we're at the end, restart it
          if (
            this.loopingSectionIndex === i &&
            b === section.durationBars - 1 &&
            !signal.aborted
          ) {
            b = -1; // Will increment to 0
          }
        }
      }
    } finally {
      if (!signal.aborted) {
        this.playing = false;
        this.emit("cue-end", { cueId: cue.id });
      }
    }
  }

  /** Jump to a specific section */
  async jumpToSection(
    pack: SoundtrackPack,
    cue: Cue,
    sectionIndex: number,
  ): Promise<void> {
    this.stop();
    await this.playCue(pack, cue, sectionIndex);
  }

  /** Toggle looping on a specific section */
  setLoopSection(sectionIndex: number | null): void {
    this.loopingSectionIndex = sectionIndex;
    this.emit("cue-loop", { loopingSectionIndex: sectionIndex });
  }

  /** Stop cue playback */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.playing = false;
    this.loopingSectionIndex = null;
    this.currentSection = -1;
    this.currentBar = 0;
  }

  // ── Capture ──

  /** Start recording performance events */
  startCapture(): void {
    this.recording = true;
    this.captureEvents = [];
    this.captureStartTime = Date.now();
    this.emit("capture-start", {});
  }

  /** Record a capture event at the current playback position */
  recordEvent(event: PerformanceCaptureEvent): void {
    if (!this.recording) return;
    this.captureEvents.push(event);
    this.emit("capture-event", { event });
  }

  /** Stop recording and return the captured performance */
  stopCapture(name: string): PerformanceCapture {
    this.recording = false;
    const capture: PerformanceCapture = {
      id: `cap-${Date.now()}`,
      name,
      bpm: this.bpm,
      beatsPerBar: this.beatsPerBar,
      totalBars: this.totalBars > 0 ? this.totalBars : Math.max(1, ...this.captureEvents.map((e) => e.bar + 1)),
      events: [...this.captureEvents],
      createdAt: new Date().toISOString(),
    };
    this.captureEvents = [];
    this.emit("capture-stop", { captureId: capture.id });
    return capture;
  }

  /** Get current capture events */
  getCaptureEvents(): readonly PerformanceCaptureEvent[] {
    return this.captureEvents;
  }

  private emit(type: string, detail?: unknown): void {
    this.listener?.({ type: type as PlaybackEventType, detail });
  }
}

function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}
