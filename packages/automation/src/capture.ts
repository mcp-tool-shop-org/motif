import type {
  AutomationCapture,
  AutomationPoint,
  AutomationParam,
  MacroParam,
  AutomationLane,
} from "@motif-studio/schema";

/** Start a new automation capture session. */
export function createCapture(
  id: string,
  name: string,
  source: MacroParam | AutomationParam,
): AutomationCapture {
  return {
    id,
    name,
    recordedAt: new Date().toISOString(),
    source,
    points: [],
  };
}

/** Record a single point into a capture. */
export function recordPoint(
  capture: AutomationCapture,
  timeMs: number,
  value: number,
): AutomationCapture {
  const point: AutomationPoint = { timeMs, value };
  return { ...capture, points: [...capture.points, point] };
}

/** Finalize a capture by sorting points and setting the lane reference. */
export function finalizeCapture(
  capture: AutomationCapture,
  laneId?: string,
): AutomationCapture {
  const points = [...capture.points].sort((a, b) => a.timeMs - b.timeMs);
  const result: AutomationCapture = { ...capture, points };
  if (laneId != null) result.laneId = laneId;
  return result;
}

/**
 * Apply a capture's recorded points to a lane, replacing the lane's existing points.
 */
export function applyCaptureToLane(
  capture: AutomationCapture,
  lane: AutomationLane,
): AutomationLane {
  return { ...lane, points: [...capture.points] };
}

/**
 * Merge a capture's points into a lane's existing points, keeping both.
 * Points are sorted by time after merging.
 */
export function mergeCaptureIntoLane(
  capture: AutomationCapture,
  lane: AutomationLane,
): AutomationLane {
  const points = [...lane.points, ...capture.points].sort(
    (a, b) => a.timeMs - b.timeMs,
  );
  return { ...lane, points };
}

/** Thin captured points by removing those within a time tolerance of each other. */
export function thinCapture(
  capture: AutomationCapture,
  toleranceMs: number,
): AutomationCapture {
  if (capture.points.length <= 1) return capture;

  const sorted = [...capture.points].sort((a, b) => a.timeMs - b.timeMs);
  const thinned: AutomationPoint[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].timeMs - thinned[thinned.length - 1].timeMs >= toleranceMs) {
      thinned.push(sorted[i]);
    }
  }

  return { ...capture, points: thinned };
}

/** Get the duration covered by a capture. */
export function captureDuration(capture: AutomationCapture): number {
  if (capture.points.length < 2) return 0;
  const sorted = [...capture.points].sort((a, b) => a.timeMs - b.timeMs);
  return sorted[sorted.length - 1].timeMs - sorted[0].timeMs;
}
