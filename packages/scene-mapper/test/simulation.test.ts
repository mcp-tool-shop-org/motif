import { describe, it, expect } from "vitest";
import type {
  SoundtrackPack,
  TriggerBinding,
  Scene,
  Stinger,
} from "@motif-studio/schema";
import {
  simulateTimeline,
  validateTimeline,
  createGroundedPrologueTimeline,
  type SessionTimeline,
} from "../src/simulation.js";

// ── Helpers ──

function buildPack(
  bindings: TriggerBinding[],
  scenes: Scene[],
  stingers?: Stinger[],
): SoundtrackPack {
  return {
    meta: { id: "sim-test", name: "Sim Test", version: "1.0.0", schemaVersion: "1" },
    assets: [{ id: "a1", name: "A", src: "a.ogg", kind: "loop", durationMs: 1000 }],
    stems: [{ id: "s1", name: "S", assetId: "a1", role: "base", loop: true }],
    scenes,
    bindings,
    transitions: [],
    stingers,
  } as SoundtrackPack;
}

const scenes: Scene[] = [
  { id: "sc-ardent", name: "Ardent", category: "tension", layers: [{ stemId: "s1" }] },
  { id: "sc-freeport", name: "Freeport", category: "exploration", layers: [{ stemId: "s1" }] },
  { id: "sc-combat", name: "Combat", category: "combat", layers: [{ stemId: "s1" }] },
  { id: "sc-communion", name: "Communion", category: "exploration", layers: [{ stemId: "s1" }] },
  { id: "sc-investigation", name: "Investigation", category: "tension", layers: [{ stemId: "s1" }] },
];

const bindings: TriggerBinding[] = [
  {
    id: "b-ardent", name: "Ardent", sceneId: "sc-ardent",
    conditions: [{ field: "location", op: "eq", value: "ardent" }], priority: 20,
  },
  {
    id: "b-freeport", name: "Freeport", sceneId: "sc-freeport",
    conditions: [{ field: "location", op: "eq", value: "freeport" }, { field: "combat_active", op: "eq", value: false }], priority: 20,
  },
  {
    id: "b-combat", name: "Combat", sceneId: "sc-combat",
    conditions: [{ field: "combat_active", op: "eq", value: true }], priority: 50,
  },
  {
    id: "b-communion", name: "Communion", sceneId: "sc-communion",
    conditions: [{ field: "location", op: "eq", value: "communion_relay" }], priority: 20,
  },
  {
    id: "b-investigation", name: "Investigation", sceneId: "sc-investigation",
    conditions: [{ field: "investigation_active", op: "eq", value: true }], priority: 40,
  },
];

const stingers: Stinger[] = [
  {
    id: "st-keth", name: "Keth Contact", assetId: "a1",
    conditions: [{ field: "first_contact", op: "eq", value: true }], priority: 10,
  },
];

const pack = buildPack(bindings, scenes, stingers);

// ── simulateTimeline ──

describe("simulateTimeline", () => {
  it("simulates a basic timeline", () => {
    const timeline: SessionTimeline = {
      id: "basic", name: "Basic", durationMs: 5000,
      events: [
        { timeMs: 0, state: { location: "ardent", combat_active: false, investigation_active: false } },
        { timeMs: 2000, state: { location: "freeport" } },
      ],
    };

    const result = simulateTimeline(pack, timeline);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].sceneResolution.sceneId).toBe("sc-ardent");
    expect(result.steps[1].sceneResolution.sceneId).toBe("sc-freeport");
    expect(result.sceneChangeCount).toBe(2); // initial + change
    expect(result.scenesVisited).toContain("sc-ardent");
    expect(result.scenesVisited).toContain("sc-freeport");
  });

  it("accumulates state across events", () => {
    const timeline: SessionTimeline = {
      id: "accum", name: "Accum", durationMs: 10000,
      events: [
        { timeMs: 0, state: { location: "freeport", combat_active: false } },
        { timeMs: 5000, state: { combat_active: true } },
      ],
    };

    const result = simulateTimeline(pack, timeline);
    // Second step should have accumulated state
    expect(result.steps[1].accumulatedState).toEqual({
      location: "freeport",
      combat_active: true,
    });
    expect(result.steps[1].sceneResolution.sceneId).toBe("sc-combat");
  });

  it("detects scene changes", () => {
    const timeline: SessionTimeline = {
      id: "changes", name: "Changes", durationMs: 10000,
      events: [
        { timeMs: 0, state: { location: "ardent", combat_active: false, investigation_active: false } },
        { timeMs: 3000, state: { location: "freeport" } },
        { timeMs: 6000, state: { combat_active: true } },
      ],
    };

    const result = simulateTimeline(pack, timeline);
    expect(result.steps[0].sceneChanged).toBe(true); // initial scene
    expect(result.steps[1].sceneChanged).toBe(true); // ardent -> freeport
    expect(result.steps[2].sceneChanged).toBe(true); // freeport -> combat
    expect(result.sceneChangeCount).toBe(3);
  });

  it("detects stingers", () => {
    const timeline: SessionTimeline = {
      id: "stingers", name: "Stingers", durationMs: 5000,
      events: [
        { timeMs: 0, state: { location: "communion_relay", combat_active: false, investigation_active: false } },
        { timeMs: 2000, state: { first_contact: true } },
      ],
    };

    const result = simulateTimeline(pack, timeline);
    expect(result.steps[0].stingerResolution.triggered).toHaveLength(0);
    expect(result.steps[1].stingerResolution.triggered).toHaveLength(1);
    expect(result.steps[1].stingerResolution.triggered[0].stingerId).toBe("st-keth");
    expect(result.stingersTriggerCount).toBe(1);
  });

  it("sorts out-of-order events", () => {
    const timeline: SessionTimeline = {
      id: "unordered", name: "Unordered", durationMs: 5000,
      events: [
        { timeMs: 3000, state: { location: "freeport" } },
        { timeMs: 0, state: { location: "ardent", combat_active: false, investigation_active: false } },
      ],
    };

    const result = simulateTimeline(pack, timeline);
    expect(result.steps[0].event.timeMs).toBe(0);
    expect(result.steps[1].event.timeMs).toBe(3000);
  });

  it("handles empty timeline", () => {
    const timeline: SessionTimeline = {
      id: "empty", name: "Empty", durationMs: 0, events: [],
    };
    const result = simulateTimeline(pack, timeline);
    expect(result.steps).toHaveLength(0);
    expect(result.sceneChangeCount).toBe(0);
    expect(result.scenesVisited).toEqual([]);
  });
});

// ── validateTimeline ──

describe("validateTimeline", () => {
  it("passes valid timeline", () => {
    const timeline: SessionTimeline = {
      id: "valid", name: "Valid", durationMs: 5000,
      events: [
        { timeMs: 0, state: { a: 1 } },
        { timeMs: 2000, state: { b: 2 } },
      ],
    };
    expect(validateTimeline(timeline)).toEqual([]);
  });

  it("warns on empty events", () => {
    const timeline: SessionTimeline = {
      id: "e", name: "E", durationMs: 1000, events: [],
    };
    expect(validateTimeline(timeline)).toContain("Timeline has no events");
  });

  it("warns on out-of-order events", () => {
    const timeline: SessionTimeline = {
      id: "o", name: "O", durationMs: 5000,
      events: [
        { timeMs: 3000, state: {} },
        { timeMs: 1000, state: {} },
      ],
    };
    const warnings = validateTimeline(timeline);
    expect(warnings.some((w) => w.includes("before previous event"))).toBe(true);
  });

  it("warns when event exceeds duration", () => {
    const timeline: SessionTimeline = {
      id: "d", name: "D", durationMs: 1000,
      events: [{ timeMs: 2000, state: {} }],
    };
    const warnings = validateTimeline(timeline);
    expect(warnings.some((w) => w.includes("exceeds timeline duration"))).toBe(true);
  });
});

// ── createGroundedPrologueTimeline ──

describe("createGroundedPrologueTimeline", () => {
  it("creates a valid timeline", () => {
    const timeline = createGroundedPrologueTimeline();
    expect(timeline.id).toBe("grounded-prologue");
    expect(timeline.events.length).toBeGreaterThan(5);
    expect(validateTimeline(timeline)).toEqual([]);
  });

  it("covers key prologue beats", () => {
    const timeline = createGroundedPrologueTimeline();
    const labels = timeline.events.map((e) => e.label).filter(Boolean);
    expect(labels.some((l) => l!.includes("Ardent"))).toBe(true);
    expect(labels.some((l) => l!.includes("Freeport"))).toBe(true);
    expect(labels.some((l) => l!.includes("combat"))).toBe(true);
    expect(labels.some((l) => l!.includes("Communion"))).toBe(true);
    expect(labels.some((l) => l!.includes("Investigation"))).toBe(true);
  });
});
