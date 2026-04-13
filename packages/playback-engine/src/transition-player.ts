// ────────────────────────────────────────────
// Transition player — crossfade, stinger-then-switch, immediate
// Supports exponential + linear fade curves and stinger level control
// ────────────────────────────────────────────

import type { SoundtrackPack, TransitionRule } from "@motif/schema";
import { findTransitionRule } from "@motif/audio-engine";
import type { PlaybackListener } from "./types.js";
import type { ScenePlayer } from "./scene-player.js";
import type { AssetLoader } from "./loader.js";
import type { Mixer } from "./mixer.js";

/** Fade curve style */
export type FadeCurve = "linear" | "exponential";

/** Options for transition polish */
export interface TransitionOptions {
  immediate?: boolean;
  fadeCurve?: FadeCurve;
  stingerGainDb?: number;
}

export class TransitionPlayer {
  private ctx: AudioContext;
  private scenePlayer: ScenePlayer;
  private loader: AssetLoader;
  private listener: PlaybackListener | null = null;
  private transitioning = false;
  private mixer: Mixer | null = null;

  constructor(
    ctx: AudioContext,
    scenePlayer: ScenePlayer,
    loader: AssetLoader,
  ) {
    this.ctx = ctx;
    this.scenePlayer = scenePlayer;
    this.loader = loader;
  }

  setListener(listener: PlaybackListener): void {
    this.listener = listener;
  }

  /** Attach a mixer (for routing stingers through the master bus) */
  setMixer(mixer: Mixer): void {
    this.mixer = mixer;
  }

  get isTransitioning(): boolean {
    return this.transitioning;
  }

  /**
   * Switch from current scene to target scene, applying the transition rule if one exists.
   * Falls back to immediate switch if no rule or unsupported mode.
   */
  async switchScene(
    pack: SoundtrackPack,
    toSceneId: string,
    options?: TransitionOptions,
  ): Promise<void> {
    const fromSceneId = this.scenePlayer.sceneId;

    if (options?.immediate || !fromSceneId || fromSceneId === toSceneId) {
      await this.scenePlayer.playScene(pack, toSceneId);
      return;
    }

    const rule = findTransitionRule(pack, fromSceneId, toSceneId);
    if (!rule) {
      // No rule → immediate hard cut
      await this.scenePlayer.playScene(pack, toSceneId);
      return;
    }

    this.transitioning = true;
    this.emit("transition-start", {
      fromSceneId,
      toSceneId,
      mode: rule.mode,
      durationMs: rule.durationMs ?? 1000,
    });
    try {
      const fadeCurve = options?.fadeCurve ?? "exponential";
      switch (rule.mode) {
        case "crossfade":
          await this.crossfade(pack, toSceneId, rule, fadeCurve);
          break;
        case "stinger-then-switch":
          await this.stingerThenSwitch(
            pack,
            toSceneId,
            rule,
            options?.stingerGainDb ?? 0,
          );
          break;
        case "immediate":
        default:
          await this.scenePlayer.playScene(pack, toSceneId);
          break;
      }
      this.emit("scene-change", { sceneId: toSceneId });
    } finally {
      this.transitioning = false;
    }
  }

  private async crossfade(
    pack: SoundtrackPack,
    toSceneId: string,
    rule: TransitionRule,
    fadeCurve: FadeCurve,
  ): Promise<void> {
    const durationMs = rule.durationMs ?? 1000;
    const durationS = durationMs / 1000;
    const now = this.ctx.currentTime;

    // Get the gain node to ramp: mixer master or scene-player master
    const masterGain = this.mixer
      ? this.mixer.getMasterGain()
      : this.scenePlayer.getMasterGain();

    // Capture the user's master gain so we can restore it after the fade-in.
    // Without this, the crossfade would overwrite the musician's volume to 1.0.
    const originalGain = masterGain.gain.value;

    // Fade out using selected curve
    masterGain.gain.setValueAtTime(originalGain, now);
    if (fadeCurve === "exponential") {
      // exponentialRamp needs a non-zero target; use near-zero
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationS);
    } else {
      masterGain.gain.linearRampToValueAtTime(0, now + durationS);
    }

    // Wait for the full fade-out before starting the new scene,
    // so the old scene audio completes its fade naturally
    await sleep(durationMs);

    // Play new scene (this stops old stems and resets master gain)
    await this.scenePlayer.playScene(pack, toSceneId);

    // Fade in new scene — restore to the user's original gain, not hardcoded 1.0
    const newMasterGain = this.mixer
      ? this.mixer.getMasterGain()
      : this.scenePlayer.getMasterGain();
    const fadeInStart = this.ctx.currentTime;
    newMasterGain.gain.setValueAtTime(0.0001, fadeInStart);
    if (fadeCurve === "exponential") {
      newMasterGain.gain.exponentialRampToValueAtTime(
        originalGain || 1,
        fadeInStart + durationS / 2,
      );
    } else {
      newMasterGain.gain.linearRampToValueAtTime(
        originalGain,
        fadeInStart + durationS / 2,
      );
    }

    await sleep(durationMs / 2);
  }

  private async stingerThenSwitch(
    pack: SoundtrackPack,
    toSceneId: string,
    rule: TransitionRule,
    stingerGainDb: number,
  ): Promise<void> {
    if (!rule.stingerAssetId) {
      await this.scenePlayer.playScene(pack, toSceneId);
      return;
    }

    const buffer = await this.loader.loadStingerAsset(
      pack,
      rule.stingerAssetId,
    );
    if (!buffer) {
      await this.scenePlayer.playScene(pack, toSceneId);
      return;
    }

    // Play stinger through the mixer's master bus if available, else destination
    const stingerGain = this.ctx.createGain();
    stingerGain.gain.value = dbToLinear(stingerGainDb);
    if (this.mixer) {
      stingerGain.connect(this.mixer.getMasterGain());
    } else {
      stingerGain.connect(this.ctx.destination);
    }

    const stingerSource = this.ctx.createBufferSource();
    stingerSource.buffer = buffer;
    stingerSource.connect(stingerGain);
    stingerSource.start(0);

    const waitMs = rule.durationMs ?? buffer.duration * 1000;
    await sleep(waitMs);

    stingerGain.disconnect();

    await this.scenePlayer.playScene(pack, toSceneId);
  }

  private emit(type: string, detail: unknown): void {
    this.listener?.({ type: type as import("./types.js").PlaybackEventType, detail });
  }

}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}
