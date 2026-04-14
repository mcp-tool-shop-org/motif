import type { LoopRegion } from "@motif-studio/schema";

/**
 * Validate a loop region's timing constraints.
 * Returns an array of error messages (empty = valid).
 */
export function validateLoopRegion(region: LoopRegion): string[] {
  const errors: string[] = [];

  if (region.loopStartMs < 0) {
    errors.push("loopStartMs must be >= 0");
  }
  if (region.loopEndMs <= region.loopStartMs) {
    errors.push("loopEndMs must be greater than loopStartMs");
  }

  const duration = region.loopEndMs - region.loopStartMs;

  if (region.crossfadeDurationMs != null) {
    if (region.crossfadeDurationMs < 0) {
      errors.push("crossfadeDurationMs must be >= 0");
    }
    if (region.crossfadeDurationMs > duration) {
      errors.push(
        `crossfadeDurationMs (${region.crossfadeDurationMs}) exceeds loop region duration (${duration})`,
      );
    }
  }

  if (region.count != null && region.count < 0) {
    errors.push("count must be >= 0");
  }

  return errors;
}

/**
 * Get the duration of a single loop iteration in milliseconds.
 */
export function loopDurationMs(region: LoopRegion): number {
  return region.loopEndMs - region.loopStartMs;
}

/**
 * Calculate the total playback duration for a loop region.
 * Returns Infinity if count is 0 or undefined (loop forever).
 */
export function totalLoopDurationMs(region: LoopRegion): number {
  const iterationMs = loopDurationMs(region);
  const count = region.count ?? 0;
  if (count === 0) return Infinity;
  return region.loopStartMs + iterationMs * count;
}

/**
 * Given a playback position in ms, calculate the effective position
 * within the loop region (accounting for looping).
 * Returns the position mapped back to the loop start-end range.
 *
 * If positionMs < loopStartMs, returns positionMs (pre-loop intro).
 * If positionMs >= loopEndMs, wraps within the loop region.
 */
export function resolveLoopPosition(
  region: LoopRegion,
  positionMs: number,
): number {
  if (positionMs < region.loopStartMs) {
    return positionMs;
  }

  const duration = loopDurationMs(region);
  if (duration <= 0) return region.loopStartMs;

  const elapsed = positionMs - region.loopStartMs;
  const count = region.count ?? 0;

  // If count is set, check if we've exceeded the loop count
  if (count > 0) {
    const totalLoop = duration * count;
    if (elapsed >= totalLoop) {
      // Past the end of all iterations — clamp to end
      return region.loopEndMs;
    }
  }

  const offset = elapsed % duration;
  return region.loopStartMs + offset;
}

/**
 * Calculate crossfade gain at a given position within a loop iteration.
 * Returns a value 0-1 representing the fade envelope.
 *
 * - At loop start: fades in from 0 to 1 over crossfadeDurationMs
 * - At loop end: fades out from 1 to 0 over crossfadeDurationMs
 * - In the middle: returns 1 (full volume)
 *
 * For the first iteration (positionMs < loopEndMs for the first time),
 * there is no fade-in (starts at 1).
 */
export function crossfadeGain(
  region: LoopRegion,
  positionMs: number,
  isFirstIteration: boolean,
): number {
  const xfade = region.crossfadeDurationMs ?? 0;
  if (xfade <= 0) return 1;

  const loopPos = positionMs - region.loopStartMs;
  const duration = loopDurationMs(region);

  // Fade-in at loop start (skip for first iteration — intro plays clean)
  if (!isFirstIteration && loopPos < xfade) {
    return loopPos / xfade;
  }

  // Fade-out at loop end
  const remaining = duration - loopPos;
  if (remaining < xfade) {
    return Math.max(0, remaining / xfade);
  }

  return 1;
}
