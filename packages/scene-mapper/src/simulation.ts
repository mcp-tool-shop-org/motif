import type { SoundtrackPack, RuntimeMusicState } from "@motif-studio/schema";
import type { SceneResolution } from "./types.js";
import type { StingerResolution } from "./stingers.js";
import { resolveScene } from "./resolve.js";
import { resolveStingers } from "./stingers.js";
import type { GameState } from "./game-state.js";

// ── Session Timeline Types ──

/**
 * A single state change event in a session timeline.
 */
export interface TimelineEvent {
  /** Time in ms from session start */
  timeMs: number;
  /** State update to apply (merged as delta into accumulated state) */
  state: GameState;
  /** Optional label for visualization */
  label?: string;
}

/**
 * A session timeline: an ordered sequence of state changes
 * that simulate a game session for previewing adaptive score behavior.
 */
export interface SessionTimeline {
  /** Unique ID for this timeline */
  id: string;
  /** Human-readable name */
  name: string;
  /** Ordered events (must be sorted by timeMs ascending) */
  events: TimelineEvent[];
  /** Total duration of the session in ms */
  durationMs: number;
  /** Description of what this timeline simulates */
  description?: string;
}

/**
 * Result of resolving a single timeline event.
 */
export interface TimelineStepResult {
  /** The timeline event that triggered this step */
  event: TimelineEvent;
  /** Accumulated game state after applying this event */
  accumulatedState: GameState;
  /** Scene resolution result */
  sceneResolution: SceneResolution;
  /** Stinger resolution result */
  stingerResolution: StingerResolution;
  /** Whether the scene changed from the previous step */
  sceneChanged: boolean;
  /** Previous scene ID (if scene changed) */
  previousSceneId?: string;
}

/**
 * Full result of simulating a session timeline.
 */
export interface TimelineSimulationResult {
  timeline: SessionTimeline;
  steps: TimelineStepResult[];
  /** Unique scene IDs visited during the simulation */
  scenesVisited: string[];
  /** Total number of scene changes */
  sceneChangeCount: number;
  /** Total stingers triggered across all steps */
  stingersTriggerCount: number;
}

// ── Simulation Engine ──

/**
 * Simulate a full session timeline against a soundtrack pack.
 * Walks through each event in order, accumulating state and resolving
 * scenes and stingers at each step.
 */
export function simulateTimeline(
  pack: SoundtrackPack,
  timeline: SessionTimeline,
): TimelineSimulationResult {
  const steps: TimelineStepResult[] = [];
  let accumulatedState: GameState = {};
  let previousSceneId: string | undefined;
  const scenesVisited = new Set<string>();
  let sceneChangeCount = 0;
  let stingersTriggerCount = 0;

  // Ensure events are sorted by time
  const sorted = [...timeline.events].sort((a, b) => a.timeMs - b.timeMs);

  for (const event of sorted) {
    // Merge delta into accumulated state
    accumulatedState = { ...accumulatedState, ...event.state };

    // Resolve scene
    const runtimeState: RuntimeMusicState = { ...accumulatedState };
    const sceneResolution = resolveScene(pack, runtimeState);
    const stingerResolution = resolveStingers(pack, runtimeState);

    const sceneChanged =
      sceneResolution.sceneId !== previousSceneId;

    if (sceneChanged && sceneResolution.sceneId) {
      sceneChangeCount++;
      scenesVisited.add(sceneResolution.sceneId);
    }

    stingersTriggerCount += stingerResolution.triggered.length;

    steps.push({
      event,
      accumulatedState: { ...accumulatedState },
      sceneResolution,
      stingerResolution,
      sceneChanged,
      previousSceneId: sceneChanged ? previousSceneId : undefined,
    });

    previousSceneId = sceneResolution.sceneId;
  }

  return {
    timeline,
    steps,
    scenesVisited: [...scenesVisited],
    sceneChangeCount,
    stingersTriggerCount,
  };
}

/**
 * Validate a session timeline for correctness.
 * Returns an array of warning messages (empty = valid).
 */
export function validateTimeline(timeline: SessionTimeline): string[] {
  const warnings: string[] = [];

  if (timeline.events.length === 0) {
    warnings.push("Timeline has no events");
  }

  // Check events are sorted
  for (let i = 1; i < timeline.events.length; i++) {
    if (timeline.events[i].timeMs < timeline.events[i - 1].timeMs) {
      warnings.push(
        `Event at index ${i} (${timeline.events[i].timeMs}ms) is before previous event (${timeline.events[i - 1].timeMs}ms)`,
      );
    }
  }

  // Check duration
  if (timeline.events.length > 0) {
    const lastEvent = timeline.events[timeline.events.length - 1];
    if (lastEvent.timeMs > timeline.durationMs) {
      warnings.push(
        `Last event (${lastEvent.timeMs}ms) exceeds timeline duration (${timeline.durationMs}ms)`,
      );
    }
  }

  return warnings;
}

/**
 * Create a Grounded prologue session timeline for testing/preview.
 *
 * Full 16-beat arc across 3 acts (9 minutes compressed):
 * Act 1 — TCS Ardent: ready room → sweep → ambush → court martial
 * Act 2 — Freeport: arrival → contracts → crew → lane travel
 * Act 3 — Communion Relay → investigation → patrol → derelict → closing
 */
export function createGroundedPrologueTimeline(): SessionTimeline {
  return {
    id: "grounded-prologue",
    name: "Star Freight: Grounded — Full Prologue",
    description:
      "Full 16-beat prologue arc: Ardent (disgrace) → Freeport (rock bottom) → Communion (wonder) → Investigation (hook)",
    durationMs: 540000, // 9 minutes (compressed from 2-3 hours)
    events: [
      // ── Act 1: The Fall ──
      {
        timeMs: 0,
        state: { location: "ardent", combat_active: false, investigation_active: false, alert_level: 0 },
        label: "Beat 1: Ardent Ready Room",
      },
      {
        timeMs: 30000,
        state: { alert_level: 0.4 },
        label: "Beat 2: Sweep — station investigation",
      },
      {
        timeMs: 60000,
        state: { combat_active: true, alert_level: 0.8 },
        label: "Beat 4: Ambush — combat tutorial",
      },
      {
        timeMs: 90000,
        state: { combat_active: false, casualty: true },
        label: "Beat 4b: Wingmate death",
      },
      {
        timeMs: 100000,
        state: { alert_level: 0, court_martial: "guilty", casualty: false },
        label: "Beat 5: Court martial verdict",
      },

      // ── Act 2: Rock Bottom ──
      {
        timeMs: 140000,
        state: { location: "freeport", court_martial: "served" },
        label: "Beat 6: Freeport arrival (6 months later)",
      },
      {
        timeMs: 180000,
        state: { contracts_active: true },
        label: "Beat 8: Contract board",
      },
      {
        timeMs: 210000,
        state: { contracts_active: false, crew_recruiting: true },
        label: "Beat 9: Crew recruitment",
      },
      {
        timeMs: 240000,
        state: { location: "lane", crew_recruiting: false },
        label: "Beat 10: Lane travel",
      },

      // ── Act 3: First Light ──
      {
        timeMs: 290000,
        state: { location: "communion_relay", first_contact: true },
        label: "Beat 11: Communion Relay arrival",
      },
      {
        timeMs: 340000,
        state: { investigation_active: true },
        label: "Beat 13: Investigation — Tessik's fragment",
      },
      {
        timeMs: 380000,
        state: { location: "lane", investigation_active: false, patrol_intercept: true, first_contact: false },
        label: "Beat 14: Compact patrol intercept",
      },
      {
        timeMs: 410000,
        state: { location: "derelict", patrol_intercept: false, combat_active: true },
        label: "Beat 15: Derelict combat",
      },
      {
        timeMs: 460000,
        state: { combat_active: false, victory: true },
        label: "Beat 15b: Combat victory",
      },
      {
        timeMs: 490000,
        state: { location: "threshold_view", victory: false },
        label: "Beat 16: Closing — threshold view",
      },
    ],
  };
}
