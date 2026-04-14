import type {
  SoundtrackPack,
  RuntimeMusicState,
  Stinger,
} from "@motif-studio/schema";
import { evaluateCondition } from "./conditions.js";

/**
 * Result of evaluating a single stinger against game state.
 */
export interface StingerEvaluation {
  stingerId: string;
  stingerName: string;
  assetId: string;
  matched: boolean;
  priority: number;
  duckDb: number;
  fadeInMs: number;
  fadeOutMs: number;
}

/**
 * Result of resolving all stingers in a pack against game state.
 */
export interface StingerResolution {
  /** Stingers that should fire (matched conditions), sorted by priority (highest first) */
  triggered: StingerEvaluation[];
  /** Stingers that did not match */
  rejected: StingerEvaluation[];
}

/**
 * Evaluate a single stinger's conditions against runtime state.
 */
export function evaluateStinger(
  stinger: Stinger,
  state: RuntimeMusicState,
): StingerEvaluation {
  const conditionResults = stinger.conditions.map((c) =>
    evaluateCondition(c, state),
  );
  const matched = conditionResults.every((e) => e.matched);

  return {
    stingerId: stinger.id,
    stingerName: stinger.name,
    assetId: stinger.assetId,
    matched,
    priority: stinger.priority ?? 0,
    duckDb: stinger.duckDb ?? 0,
    fadeInMs: stinger.fadeInMs ?? 0,
    fadeOutMs: stinger.fadeOutMs ?? 0,
  };
}

/**
 * Resolve all stingers in a pack against the current game state.
 * Returns triggered stingers sorted by priority (highest first).
 *
 * This runs independently from scene resolution — stingers layer
 * on top of whatever scene is playing.
 */
export function resolveStingers(
  pack: SoundtrackPack,
  state: RuntimeMusicState,
): StingerResolution {
  const stingers = pack.stingers ?? [];
  const triggered: StingerEvaluation[] = [];
  const rejected: StingerEvaluation[] = [];

  for (const s of stingers) {
    const ev = evaluateStinger(s, state);
    if (ev.matched) {
      triggered.push(ev);
    } else {
      rejected.push(ev);
    }
  }

  // Sort triggered by priority (highest first), then pack order as tiebreaker
  triggered.sort((a, b) => b.priority - a.priority);

  return { triggered, rejected };
}

/**
 * Stinger cooldown tracker. Manages per-stinger cooldown state
 * so the same stinger doesn't fire in rapid succession.
 */
export class StingerCooldownTracker {
  private lastFiredAt = new Map<string, number>();

  /**
   * Check if a stinger is off cooldown and can fire.
   */
  canFire(stinger: Stinger, nowMs: number): boolean {
    const cooldown = stinger.cooldownMs ?? 0;
    if (cooldown <= 0) return true;

    const lastFired = this.lastFiredAt.get(stinger.id);
    if (lastFired == null) return true;

    return nowMs - lastFired >= cooldown;
  }

  /**
   * Record that a stinger has fired.
   */
  recordFire(stingerId: string, nowMs: number): void {
    this.lastFiredAt.set(stingerId, nowMs);
  }

  /**
   * Filter a list of matched stingers by cooldown eligibility.
   */
  filterByCooldown(
    pack: SoundtrackPack,
    triggered: StingerEvaluation[],
    nowMs: number,
  ): StingerEvaluation[] {
    const stingerMap = new Map(
      (pack.stingers ?? []).map((s) => [s.id, s]),
    );
    return triggered.filter((ev) => {
      const stinger = stingerMap.get(ev.stingerId);
      return stinger ? this.canFire(stinger, nowMs) : true;
    });
  }

  /**
   * Reset all cooldown state.
   */
  reset(): void {
    this.lastFiredAt.clear();
  }
}
