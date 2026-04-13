// ────────────────────────────────────────────
// Cue Scheduler — resolve cue structures into timed playback plans
// ────────────────────────────────────────────

import type {
  Cue,
  CueSection,
  PerformanceCaptureEvent,
  PerformanceCapture,
  IntensityLevel,
  CaptureActionType,
} from "@motif/schema";
import { TICKS_PER_BEAT } from "./types.js";

// ── Resolved plan types ──

export interface ResolvedSection {
  sectionId: string;
  name: string;
  role: CueSection["role"];
  /** Start tick (absolute from cue start) */
  startTick: number;
  /** End tick (exclusive) */
  endTick: number;
  /** Start bar (0-based) */
  startBar: number;
  /** Duration in bars */
  durationBars: number;
  sceneId?: string;
  clipIds?: string[];
  intensity?: IntensityLevel;
  variantIds?: string[];
}

export interface CuePlaybackPlan {
  cueId: string;
  cueName: string;
  bpm: number;
  beatsPerBar: number;
  /** Total ticks */
  totalTicks: number;
  /** Total bars */
  totalBars: number;
  /** Total duration in seconds */
  totalSeconds: number;
  sections: ResolvedSection[];
}

// ── Helpers ──

function ticksPerBar(bpm: number, beatsPerBar: number): number {
  return beatsPerBar * TICKS_PER_BEAT;
}

function ticksToSeconds(ticks: number, bpm: number): number {
  return (ticks / TICKS_PER_BEAT) * (60 / bpm);
}

function secondsToTicks(seconds: number, bpm: number): number {
  return Math.round(seconds * (bpm / 60) * TICKS_PER_BEAT);
}

function tickToBar(tick: number, bpm: number, beatsPerBar: number): number {
  return Math.floor(tick / ticksPerBar(bpm, beatsPerBar));
}

function tickToBeat(tick: number, bpm: number, beatsPerBar: number): number {
  const tpb = ticksPerBar(bpm, beatsPerBar);
  return Math.floor((tick % tpb) / TICKS_PER_BEAT);
}

// ── Core functions ──

/** Resolve a Cue into a flat playback plan with absolute tick positions */
export function resolveCuePlan(cue: Cue): CuePlaybackPlan {
  const bpm = cue.bpm ?? 120;
  const beatsPerBar = cue.beatsPerBar ?? 4;
  const tpb = ticksPerBar(bpm, beatsPerBar);

  let currentTick = 0;
  let currentBar = 0;
  const sections: ResolvedSection[] = [];

  for (const section of cue.sections) {
    const durationTicks = section.durationBars * tpb;
    sections.push({
      sectionId: section.id,
      name: section.name,
      role: section.role,
      startTick: currentTick,
      endTick: currentTick + durationTicks,
      startBar: currentBar,
      durationBars: section.durationBars,
      sceneId: section.sceneId,
      clipIds: section.clipIds,
      intensity: section.intensity,
      variantIds: section.variantIds,
    });
    currentTick += durationTicks;
    currentBar += section.durationBars;
  }

  return {
    cueId: cue.id,
    cueName: cue.name,
    bpm,
    beatsPerBar,
    totalTicks: currentTick,
    totalBars: currentBar,
    totalSeconds: ticksToSeconds(currentTick, bpm),
    sections,
  };
}

/** Find which section is active at a given tick */
export function sectionAtTick(plan: CuePlaybackPlan, tick: number): ResolvedSection | null {
  for (const s of plan.sections) {
    if (tick >= s.startTick && tick < s.endTick) return s;
  }
  return null;
}

/** Find which section is active at a given bar */
export function sectionAtBar(plan: CuePlaybackPlan, bar: number): ResolvedSection | null {
  for (const s of plan.sections) {
    if (bar >= s.startBar && bar < s.startBar + s.durationBars) return s;
  }
  return null;
}

/** Convert seconds into a tick position for a cue */
export function cueSecondsToTick(seconds: number, bpm: number): number {
  return secondsToTicks(seconds, bpm);
}

/** Convert tick to seconds for a cue */
export function cueTickToSeconds(tick: number, bpm: number): number {
  return ticksToSeconds(tick, bpm);
}

// ── Performance capture helpers ──

/** Create a capture event at a given tick position */
export function createCaptureEvent(
  tick: number,
  bpm: number,
  beatsPerBar: number,
  action: CaptureActionType,
  target?: { sceneId?: string; clipId?: string; intensity?: IntensityLevel; quantize?: "none" | "beat" | "bar" },
): PerformanceCaptureEvent {
  return {
    tick,
    bar: tickToBar(tick, bpm, beatsPerBar),
    beat: tickToBeat(tick, bpm, beatsPerBar),
    action,
    sceneId: target?.sceneId,
    clipId: target?.clipId,
    intensity: target?.intensity,
    quantize: target?.quantize,
  };
}

/** Convert a performance capture into a Cue structure */
export function captureToCue(capture: PerformanceCapture): Cue {
  const { bpm, beatsPerBar, events, totalBars } = capture;

  // Group events by scene-launch boundaries to derive sections
  const sections: CueSection[] = [];
  let sectionStart = 0;
  let currentSceneId: string | undefined;
  let currentIntensity: IntensityLevel | undefined;
  let sectionIndex = 0;

  for (const event of events) {
    if (event.action === "scene-launch" && event.sceneId !== currentSceneId) {
      // Close previous section
      if (sectionIndex > 0 || currentSceneId) {
        const endBar = event.bar;
        const duration = Math.max(1, endBar - sectionStart);
        sections.push({
          id: `sec-${sectionIndex}`,
          name: `Section ${sectionIndex + 1}`,
          role: sectionIndex === 0 ? "intro" : "body",
          durationBars: duration,
          sceneId: currentSceneId,
          intensity: currentIntensity,
        });
        sectionStart = endBar;
        sectionIndex++;
      }
      currentSceneId = event.sceneId;
    }
    if (event.action === "intensity-change") {
      currentIntensity = event.intensity;
    }
  }

  // Close final section
  const finalDuration = Math.max(1, totalBars - sectionStart);
  sections.push({
    id: `sec-${sectionIndex}`,
    name: `Section ${sectionIndex + 1}`,
    role: sectionIndex === 0 ? "intro" : "outro",
    durationBars: finalDuration,
    sceneId: currentSceneId,
    intensity: currentIntensity,
  });

  return {
    id: `cue-from-${capture.id}`,
    name: `${capture.name} (captured)`,
    bpm,
    beatsPerBar,
    sections,
    tags: ["captured"],
  };
}

/** Compute total bars from a capture's events */
export function captureTotalBars(events: readonly PerformanceCaptureEvent[]): number {
  if (events.length === 0) return 0;
  let maxBar = 0;
  for (const e of events) {
    if (e.bar > maxBar) maxBar = e.bar;
  }
  return maxBar + 1;
}

/** Quantize a tick to the nearest bar/beat boundary */
export function quantizeTick(
  tick: number,
  bpm: number,
  beatsPerBar: number,
  mode: "none" | "beat" | "bar",
): number {
  if (mode === "none") return tick;
  if (mode === "beat") {
    return Math.round(tick / TICKS_PER_BEAT) * TICKS_PER_BEAT;
  }
  const tpb = ticksPerBar(bpm, beatsPerBar);
  return Math.round(tick / tpb) * tpb;
}

export { ticksPerBar, ticksToSeconds, secondsToTicks, tickToBar, tickToBeat };
