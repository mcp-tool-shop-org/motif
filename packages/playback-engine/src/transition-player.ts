// ────────────────────────────────────────────
// Transition player — crossfade, stinger-then-switch, immediate,
// bar-sync, cooldown-fade
// Supports exponential + linear fade curves and stinger level control
// ────────────────────────────────────────────

import type { SoundtrackPack, TransitionRule } from "@motif-studio/schema";
import { findTransitionRule } from "@motif-studio/audio-engine";
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
        case "bar-sync":
          await this.barSync(pack, toSceneId, rule, fadeCurve);
          break;
        case "cooldown-fade":
          await this.cooldownFade(pack, toSceneId, rule);
          break;
        case "immediate":
          await this.scenePlayer.playScene(pack, toSceneId);
          break;
        default:
          console.warn(`[TransitionPlayer] Transition mode '${rule.mode}' is not implemented — falling back to immediate switch.`);
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
    // so the old scene audio completes its fade naturally.
    // Safety margin (+50ms) prevents premature cutoff from setTimeout drift.
    await sleep(durationMs + 50);

    // Play new scene (this stops old stems and resets master gain)
    await this.scenePlayer.playScene(pack, toSceneId);

    // Fade in new scene — restore to the user's original gain, not hardcoded 1.0
    const newMasterGain = this.mixer
      ? this.mixer.getMasterGain()
      : this.scenePlayer.getMasterGain();
    const fadeInStart = this.ctx.currentTime;

    // If originalGain is effectively zero, skip the ramp entirely — both
    // exponential and linear paths would either mask the mute or ramp to 0.
    if (originalGain < 0.001) {
      newMasterGain.gain.setValueAtTime(originalGain, fadeInStart);
    } else {
      newMasterGain.gain.setValueAtTime(0.0001, fadeInStart);
      if (fadeCurve === "exponential") {
        newMasterGain.gain.exponentialRampToValueAtTime(
          originalGain,
          fadeInStart + durationS / 2,
        );
      } else {
        newMasterGain.gain.linearRampToValueAtTime(
          originalGain,
          fadeInStart + durationS / 2,
        );
      }
    }

    // Safety margin (+50ms) prevents premature scene cutoff when setTimeout
    // drifts behind the AudioContext clock.
    await sleep(durationMs / 2 + 50);
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

  /**
   * Bar-sync: wait until the next bar boundary, then crossfade at that moment.
   * Resolves BPM from the current scene's first stem asset. Falls back to
   * immediate switch if BPM cannot be determined.
   */
  private async barSync(
    pack: SoundtrackPack,
    toSceneId: string,
    rule: TransitionRule,
    fadeCurve: FadeCurve,
  ): Promise<void> {
    // Resolve BPM from the current scene's stems
    const fromSceneId = this.scenePlayer.sceneId;
    const scene = pack.scenes.find((s) => s.id === fromSceneId);
    const stemsById = new Map(pack.stems.map((s) => [s.id, s]));
    const assetsById = new Map(pack.assets.map((a) => [a.id, a]));

    let bpm: number | undefined;
    if (scene) {
      for (const layer of scene.layers) {
        const stem = stemsById.get(layer.stemId);
        if (!stem) continue;
        const asset = assetsById.get(stem.assetId);
        if (asset?.bpm) {
          bpm = asset.bpm;
          break;
        }
      }
    }

    if (!bpm) {
      console.warn(
        `[TransitionPlayer] bar-sync: no BPM found for scene '${fromSceneId}' — falling back to immediate switch.`,
      );
      await this.scenePlayer.playScene(pack, toSceneId);
      return;
    }

    const beatsPerBar = 4; // Default time signature
    const delayS = this.scenePlayer.getTimeToNextBar(bpm, beatsPerBar);
    const delayMs = delayS * 1000;

    // Wait until the bar boundary
    if (delayMs > 10) {
      await sleep(delayMs);
    }

    // Crossfade at the bar boundary using the existing crossfade logic
    await this.crossfade(pack, toSceneId, rule, fadeCurve);
  }

  /**
   * Cooldown-fade: fade out the current scene over durationMs, then switch
   * to the new scene after a brief gap. Sequential — no overlap.
   */
  private async cooldownFade(
    pack: SoundtrackPack,
    toSceneId: string,
    rule: TransitionRule,
  ): Promise<void> {
    const durationMs = rule.durationMs ?? 1000;
    const durationS = durationMs / 1000;
    const now = this.ctx.currentTime;

    // Get the gain node for the fade-out
    const masterGain = this.mixer
      ? this.mixer.getMasterGain()
      : this.scenePlayer.getMasterGain();

    const originalGain = masterGain.gain.value;

    // Linear fade out over the full duration
    masterGain.gain.setValueAtTime(originalGain, now);
    masterGain.gain.linearRampToValueAtTime(0, now + durationS);

    // Wait for the fade-out to complete (+ safety margin)
    await sleep(durationMs + 50);

    // Stop old scene, start new scene (no overlap — sequential)
    await this.scenePlayer.playScene(pack, toSceneId);

    // Restore gain to original level immediately (no fade-in for cooldown)
    const newMasterGain = this.mixer
      ? this.mixer.getMasterGain()
      : this.scenePlayer.getMasterGain();
    newMasterGain.gain.setValueAtTime(originalGain, this.ctx.currentTime);
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
