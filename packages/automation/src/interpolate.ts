import type { AutomationLane, AutomationCurve, AutomationPoint } from "@motif/schema";

/**
 * Evaluate a single automation lane at a given time, returning the interpolated value.
 * Returns the lane's defaultValue (or 0.5) if no points exist.
 */
export function evaluateLane(lane: AutomationLane, timeMs: number): number {
  const { points, defaultValue } = lane;
  const fallback = defaultValue ?? 0.5;

  if (points.length === 0) return fallback;
  if (timeMs <= points[0].timeMs) return points[0].value;
  if (timeMs >= points[points.length - 1].timeMs)
    return points[points.length - 1].value;

  // Find the segment
  let a: AutomationPoint = points[0];
  let b: AutomationPoint = points[1];
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].timeMs <= timeMs && points[i + 1].timeMs >= timeMs) {
      a = points[i];
      b = points[i + 1];
      break;
    }
  }

  const span = b.timeMs - a.timeMs;
  const t = span === 0 ? 1 : (timeMs - a.timeMs) / span;
  return interpolate(a.value, b.value, t, a.curve ?? "linear");
}

/** Interpolate between two values using a curve type. */
export function interpolate(
  from: number,
  to: number,
  t: number,
  curve: AutomationCurve,
): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (curve) {
    case "step":
      return clamped < 1 ? from : to;
    case "exponential":
      return from + (to - from) * (clamped * clamped);
    case "smooth":
      // Smoothstep
      return from + (to - from) * (clamped * clamped * (3 - 2 * clamped));
    case "linear":
    default:
      return from + (to - from) * clamped;
  }
}

/**
 * Sample an automation lane at regular intervals, returning an array of values.
 * Useful for rendering automation curves in UI.
 */
export function sampleLane(
  lane: AutomationLane,
  startMs: number,
  endMs: number,
  stepMs: number,
): number[] {
  if (stepMs <= 0) {
    throw new RangeError("sampleLane: stepMs must be positive");
  }
  const values: number[] = [];
  for (let t = startMs; t <= endMs; t += stepMs) {
    values.push(evaluateLane(lane, t));
  }
  return values;
}

/**
 * Evaluate all lanes for a given target at a specific time,
 * returning a map of param → value.
 */
export function evaluateLanesAt(
  lanes: AutomationLane[],
  targetId: string,
  timeMs: number,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const lane of lanes) {
    if (lane.target.targetId === targetId) {
      result.set(lane.param, evaluateLane(lane, timeMs));
    }
  }
  return result;
}
