// ────────────────────────────────────────────
// SceneClipPlayer — activates all clips for a scene
// ────────────────────────────────────────────

import type {
  Clip,
  SceneClipRef,
  Scene,
  IntensityLevel,
  QuantizeMode,
} from "@motif-studio/schema";
import type { InstrumentRack } from "@motif-studio/instrument-rack";
import { ClipPlayer } from "./clip-player.js";
import { quantizedLaunchTime } from "./scheduler.js";

interface ActiveClipEntry {
  clipId: string;
  ref: SceneClipRef;
  player: ClipPlayer;
  gainNode: GainNode;
  muted: boolean;
}

/** Intensity progression: higher levels include lower */
const INTENSITY_ORDER: IntensityLevel[] = ["low", "mid", "high"];

function intensityIndex(level: IntensityLevel): number {
  return INTENSITY_ORDER.indexOf(level);
}

/**
 * Filter clip layers by intensity: at a given intensity level,
 * clips at that level or below are active.
 */
export function filterByIntensity(
  layers: readonly SceneClipRef[],
  level: IntensityLevel,
): SceneClipRef[] {
  const maxIndex = intensityIndex(level);
  return layers.filter((ref) => {
    if (!ref.intensity) return true; // no intensity tag → always active
    return intensityIndex(ref.intensity) <= maxIndex;
  });
}

/**
 * Sort clip layers by order field (ascending, unset = 0).
 */
export function sortByOrder(layers: readonly SceneClipRef[]): SceneClipRef[] {
  return [...layers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Manages clip playback for an entire scene.
 * Creates a ClipPlayer per SceneClipRef, applies per-clip gain,
 * and provides mute/unmute control, intensity filtering, and section awareness.
 */
export class SceneClipPlayer {
  private entries: ActiveClipEntry[] = [];
  private playing = false;
  private _intensity: IntensityLevel = "high";

  get isPlaying(): boolean {
    return this.playing;
  }

  get intensity(): IntensityLevel {
    return this._intensity;
  }

  /**
   * Start playing all clips assigned to a scene.
   *
   * @param ctx AudioContext
   * @param scene The scene (for clipLayers)
   * @param clips All clips available in the pack
   * @param rack InstrumentRack for voice resolution
   * @param output Destination AudioNode
   * @param startTime Optional AudioContext start time
   * @param options.intensity Initial intensity level (default "high" = all)
   * @param options.quantize Launch quantization mode (default "none")
   * @param options.bpm BPM for quantize calculation
   */
  playScene(
    ctx: AudioContext,
    scene: Scene,
    clips: Clip[],
    rack: InstrumentRack,
    output: AudioNode,
    startTime?: number,
    options?: {
      intensity?: IntensityLevel;
      quantize?: QuantizeMode;
      bpm?: number;
    },
  ): void {
    this.stopAll();

    const allLayers = scene.clipLayers ?? [];
    if (allLayers.length === 0) return;

    this._intensity = options?.intensity ?? "high";
    const sorted = sortByOrder(allLayers);
    const filtered = filterByIntensity(sorted, this._intensity);

    // Compute launch time with quantization
    const baseTime = startTime ?? ctx.currentTime;
    const quantizeMode = options?.quantize ?? "none";
    const bpm = options?.bpm ?? 120;
    const launchTime = quantizedLaunchTime(baseTime, bpm, quantizeMode);

    this.playing = true;

    for (const ref of filtered) {
      const clip = clips.find((c) => c.id === ref.clipId);
      if (!clip) continue;

      const gainNode = ctx.createGain();
      const dbGain = ref.gainDb ?? clip.gainDb ?? 0;
      gainNode.gain.value = dbToGain(dbGain);
      gainNode.connect(output);

      const player = new ClipPlayer();
      const muted = ref.mutedByDefault ?? false;

      if (muted) {
        gainNode.gain.value = 0;
      }

      player.play(ctx, clip, rack, gainNode, launchTime, ref.variantId);

      this.entries.push({ clipId: ref.clipId, ref, player, gainNode, muted });
    }
  }

  /** Stop all clip playback */
  stopAll(): void {
    for (const entry of this.entries) {
      entry.player.stop();
      entry.gainNode.disconnect();
    }
    this.entries = [];
    this.playing = false;
  }

  /**
   * Change intensity level — stops clips above the new level,
   * but keeps existing clips below or at the level playing.
   */
  setIntensity(level: IntensityLevel): void {
    this._intensity = level;
    const maxIndex = intensityIndex(level);

    for (const entry of this.entries) {
      const entryIntensity = entry.ref.intensity;
      if (!entryIntensity) continue; // no tag → always active
      const entryIndex = intensityIndex(entryIntensity);
      if (entryIndex > maxIndex) {
        // Above threshold — mute
        entry.gainNode.gain.value = 0;
        entry.muted = true;
      } else if (entry.muted && !entry.ref.mutedByDefault) {
        // Below threshold and was intensity-muted — unmute
        const dbGain = entry.ref.gainDb ?? 0;
        entry.gainNode.gain.value = dbToGain(dbGain);
        entry.muted = false;
      }
    }
  }

  /** Mute/unmute a clip layer by clipId */
  setMuted(clipId: string, muted: boolean): void {
    const entry = this.entries.find((e) => e.clipId === clipId);
    if (!entry) return;
    entry.muted = muted;
    entry.gainNode.gain.value = muted ? 0 : dbToGain(entry.ref.gainDb ?? 0);
  }

  /** Set gain on a clip layer */
  setGain(clipId: string, gainDb: number): void {
    const entry = this.entries.find((e) => e.clipId === clipId);
    if (!entry || entry.muted) return;
    entry.gainNode.gain.value = dbToGain(gainDb);
  }

  /** Get active clip IDs */
  getActiveClipIds(): string[] {
    return this.entries.map((e) => e.clipId);
  }

  /** Get mute state for a clip */
  isMuted(clipId: string): boolean {
    return this.entries.find((e) => e.clipId === clipId)?.muted ?? false;
  }

  /** Get section roles present in the active entries */
  getActiveSectionRoles(): string[] {
    const roles = new Set<string>();
    for (const entry of this.entries) {
      if (entry.ref.sectionRole) roles.add(entry.ref.sectionRole);
    }
    return [...roles];
  }
}

function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}
