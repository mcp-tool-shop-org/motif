// ────────────────────────────────────────────
// Sequence player — step through states audibly
// ────────────────────────────────────────────

import type { SoundtrackPack, RuntimeMusicState } from "@motif-studio/schema";
import { simulateStateSequence } from "@motif-studio/audio-engine";
import type {
  PlaybackListener,
  PlaybackEventType,
  SequencePlaybackState,
} from "./types.js";
import type { TransitionPlayer } from "./transition-player.js";
import type { ScenePlayer } from "./scene-player.js";

const DEFAULT_STEP_DURATION_MS = 4000;

export class SequencePlayer {
  private scenePlayer: ScenePlayer;
  private transitionPlayer: TransitionPlayer;
  private listener: PlaybackListener | null = null;
  private playing = false;
  private currentStep = -1;
  private totalSteps = 0;
  private abortController: AbortController | null = null;

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

  get state(): SequencePlaybackState {
    return {
      playing: this.playing,
      currentStepIndex: this.currentStep,
      totalSteps: this.totalSteps,
    };
  }

  /**
   * Play through a sequence of runtime states, switching scenes audibly.
   * Each step plays for stepDurationMs before advancing.
   */
  async playSequence(
    pack: SoundtrackPack,
    states: RuntimeMusicState[],
    stepDurationMs = DEFAULT_STEP_DURATION_MS,
  ): Promise<void> {
    this.stop();

    const trace = simulateStateSequence(pack, states);
    this.totalSteps = trace.steps.length;
    this.playing = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      for (let i = 0; i < trace.steps.length; i++) {
        if (signal.aborted) break;

        this.currentStep = i;
        const step = trace.steps[i];
        this.emit("sequence-step", { step: i, total: trace.steps.length });

        if (step.resolvedSceneId) {
          if (i === 0 || !step.fromSceneId) {
            // First step or no previous scene → play directly
            await this.scenePlayer.playScene(pack, step.resolvedSceneId);
          } else if (step.fromSceneId !== step.resolvedSceneId) {
            // Scene changed → apply transition
            await this.transitionPlayer.switchScene(pack, step.resolvedSceneId);
          }
          // Same scene → keep playing
        }

        // Wait for step duration
        await abortableSleep(stepDurationMs, signal);
      }
    } finally {
      this.playing = false;
      this.emit("sequence-step", {
        step: this.currentStep,
        total: this.totalSteps,
        done: true,
      });
    }
  }

  /** Stop the current sequence */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.playing = false;
    this.currentStep = -1;
    this.totalSteps = 0;
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
