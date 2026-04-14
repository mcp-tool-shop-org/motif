import type { SoundtrackPack, RuntimeMusicState } from "@motif-studio/schema";
import type { SceneResolution } from "./types.js";
import { resolveScene } from "./resolve.js";

// ── Game State Types ──

/**
 * A game state value: string, number, or boolean.
 * This is the wire format engines send — flat key-value pairs.
 */
export type GameStateValue = string | number | boolean;

/**
 * Flat key-value map representing the current game state.
 * Engines push this to Motif; scene-mapper resolves the active scene.
 */
export type GameState = Record<string, GameStateValue>;

/**
 * A state update can be a full snapshot (replaces all state)
 * or a delta (merges into existing state).
 */
export interface StateUpdate {
  type: "snapshot" | "delta";
  state: GameState;
  timestampMs?: number;
}

/**
 * A history entry: the state that was active, what scene resolved, and when.
 */
export interface StateHistoryEntry {
  timestampMs: number;
  state: GameState;
  resolution: SceneResolution;
}

// ── Reserved Keys ──

/**
 * Well-known state keys that engines should use for common game concepts.
 * Engines can use any keys they want, but these are recommended.
 */
export const RESERVED_KEYS = {
  /** Current location/area identifier */
  location: "location",
  /** Whether combat is currently active */
  combat_active: "combat_active",
  /** Combat intensity 0-1 (0 = no threat, 1 = maximum danger) */
  combat_intensity: "combat_intensity",
  /** Whether an investigation/discovery sequence is active */
  investigation_active: "investigation_active",
  /** Alert level 0-1 (0 = unaware, 1 = full alert) */
  alert_level: "alert_level",
  /** Current emotional context label */
  emotion: "emotion",
  /** Whether the player is in a safe zone */
  safe_zone: "safe_zone",
  /** Current faction context */
  faction: "faction",
  /** Whether a boss encounter is active */
  boss_active: "boss_active",
  /** Whether the player has won/completed an objective */
  victory: "victory",
} as const;

export type ReservedKey = (typeof RESERVED_KEYS)[keyof typeof RESERVED_KEYS];

// ── State Manager ──

/**
 * Manages game state, applies updates, resolves scenes, and tracks history.
 * This is the main entry point for engine integration.
 */
export class GameStateManager {
  private currentState: GameState = {};
  private history: StateHistoryEntry[] = [];
  private readonly maxHistorySize: number;
  private lastResolution: SceneResolution | undefined;

  constructor(options?: { maxHistorySize?: number }) {
    this.maxHistorySize = options?.maxHistorySize ?? 100;
  }

  /**
   * Apply a state update and resolve the active scene.
   * Returns the scene resolution result.
   */
  resolve(pack: SoundtrackPack, update: StateUpdate): SceneResolution {
    const timestamp = update.timestampMs ?? Date.now();

    if (update.type === "snapshot") {
      this.currentState = { ...update.state };
    } else {
      this.currentState = { ...this.currentState, ...update.state };
    }

    // Convert GameState → RuntimeMusicState (compatible — both are Record<string, unknown>)
    const runtimeState: RuntimeMusicState = { ...this.currentState };
    const resolution = resolveScene(pack, runtimeState);

    // Track history
    const entry: StateHistoryEntry = {
      timestampMs: timestamp,
      state: { ...this.currentState },
      resolution,
    };
    this.history.push(entry);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    this.lastResolution = resolution;
    return resolution;
  }

  /**
   * Convenience: resolve from a flat state snapshot without creating a StateUpdate.
   */
  resolveFromState(pack: SoundtrackPack, state: GameState): SceneResolution {
    return this.resolve(pack, { type: "snapshot", state });
  }

  /**
   * Convenience: apply a delta (partial state change) and resolve.
   */
  pushDelta(
    pack: SoundtrackPack,
    delta: GameState,
    timestampMs?: number,
  ): SceneResolution {
    return this.resolve(pack, { type: "delta", state: delta, timestampMs });
  }

  /**
   * Get the current accumulated state.
   */
  getState(): Readonly<GameState> {
    return { ...this.currentState };
  }

  /**
   * Get the last scene resolution result.
   */
  getLastResolution(): SceneResolution | undefined {
    return this.lastResolution;
  }

  /**
   * Get the full state history (oldest first).
   */
  getHistory(): readonly StateHistoryEntry[] {
    return this.history;
  }

  /**
   * Check whether the scene changed between the last two resolutions.
   */
  didSceneChange(): boolean {
    if (this.history.length < 2) return false;
    const prev = this.history[this.history.length - 2];
    const curr = this.history[this.history.length - 1];
    return prev.resolution.sceneId !== curr.resolution.sceneId;
  }

  /**
   * Reset all state and history.
   */
  reset(): void {
    this.currentState = {};
    this.history = [];
    this.lastResolution = undefined;
  }
}
