import type {
  AutomationLane,
  AutomationParam,
  AutomationPoint,
  AutomationTarget,
  AutomationTargetKind,
} from "@motif-studio/schema";

/** Create a new automation lane. */
export function createLane(
  id: string,
  name: string,
  param: AutomationParam,
  target: AutomationTarget,
): AutomationLane {
  return { id, name, param, target, points: [] };
}

/** Build an automation target descriptor. */
export function makeTarget(
  kind: AutomationTargetKind,
  targetId: string,
  layerRef?: string,
): AutomationTarget {
  const t: AutomationTarget = { kind, targetId };
  if (layerRef != null) t.layerRef = layerRef;
  return t;
}

/** Add a point to a lane, keeping points sorted by time. */
export function addPoint(
  lane: AutomationLane,
  point: AutomationPoint,
): AutomationLane {
  const points = [...lane.points, point].sort((a, b) => a.timeMs - b.timeMs);
  return { ...lane, points };
}

/** Remove the point closest to a given time within a tolerance. */
export function removePointAt(
  lane: AutomationLane,
  timeMs: number,
  toleranceMs = 5,
): AutomationLane {
  const points = lane.points.filter(
    (p) => Math.abs(p.timeMs - timeMs) > toleranceMs,
  );
  return { ...lane, points };
}

/** Update a point's value at a specific index. */
export function updatePoint(
  lane: AutomationLane,
  index: number,
  update: Partial<AutomationPoint>,
): AutomationLane {
  if (index < 0 || index >= lane.points.length) return lane;
  const points = lane.points.map((p, i) =>
    i === index ? { ...p, ...update } : p,
  );
  return { ...lane, points };
}

/** Get all lanes attached to a specific target. */
export function lanesForTarget(
  lanes: AutomationLane[],
  targetId: string,
): AutomationLane[] {
  return lanes.filter((l) => l.target.targetId === targetId);
}

/** Get lanes filtered by parameter type. */
export function lanesForParam(
  lanes: AutomationLane[],
  param: AutomationParam,
): AutomationLane[] {
  return lanes.filter((l) => l.param === param);
}

/** Clear all points from a lane. */
export function clearLane(lane: AutomationLane): AutomationLane {
  return { ...lane, points: [] };
}

/** Get the total time span covered by a lane's points. */
export function laneTimeSpan(lane: AutomationLane): number {
  if (lane.points.length === 0) return 0;
  return lane.points[lane.points.length - 1].timeMs - lane.points[0].timeMs;
}
