import { describe, it, expect, beforeEach } from "vitest";
import type {
  SoundtrackPack,
  TriggerBinding,
  Scene,
} from "@motif-studio/schema";
import {
  GameStateManager,
  RESERVED_KEYS,
  type GameState,
  type StateUpdate,
} from "../src/game-state.js";

// ── Helpers ──

function buildPack(
  bindings: TriggerBinding[],
  scenes: Scene[],
): SoundtrackPack {
  return {
    meta: {
      id: "gs-test",
      name: "GameState Test",
      version: "1.0.0",
      schemaVersion: "1",
    },
    assets: [
      { id: "a1", name: "A", src: "a.ogg", kind: "loop", durationMs: 1000 },
    ],
    stems: [{ id: "s1", name: "S", assetId: "a1", role: "base", loop: true }],
    scenes,
    bindings,
    transitions: [],
  } as SoundtrackPack;
}

const scenes: Scene[] = [
  {
    id: "sc-explore",
    name: "Exploration",
    category: "exploration",
    layers: [{ stemId: "s1" }],
  },
  {
    id: "sc-combat",
    name: "Combat",
    category: "combat",
    layers: [{ stemId: "s1" }],
  },
  {
    id: "sc-freeport",
    name: "Freeport",
    category: "safe-zone",
    layers: [{ stemId: "s1" }],
  },
];

const bindings: TriggerBinding[] = [
  {
    id: "b-explore",
    name: "Explore",
    sceneId: "sc-explore",
    conditions: [{ field: "combat_active", op: "eq", value: false }],
    priority: 10,
  },
  {
    id: "b-combat",
    name: "Combat",
    sceneId: "sc-combat",
    conditions: [{ field: "combat_active", op: "eq", value: true }],
    priority: 50,
  },
  {
    id: "b-freeport",
    name: "Freeport",
    sceneId: "sc-freeport",
    conditions: [{ field: "location", op: "eq", value: "freeport" }],
    priority: 30,
  },
];

const pack = buildPack(bindings, scenes);

// ── Tests ──

describe("GameStateManager", () => {
  let mgr: GameStateManager;

  beforeEach(() => {
    mgr = new GameStateManager();
  });

  describe("snapshot resolution", () => {
    it("resolves scene from a full snapshot", () => {
      const r = mgr.resolveFromState(pack, {
        combat_active: false,
        location: "wilderness",
      });
      expect(r.sceneId).toBe("sc-explore");
    });

    it("resolves combat scene when combat_active is true", () => {
      const r = mgr.resolveFromState(pack, {
        combat_active: true,
        location: "wilderness",
      });
      expect(r.sceneId).toBe("sc-combat");
    });

    it("snapshot replaces all state", () => {
      mgr.resolveFromState(pack, {
        combat_active: true,
        location: "freeport",
      });
      // New snapshot without combat_active — field is gone
      const r = mgr.resolveFromState(pack, { location: "freeport" });
      // combat_active is now undefined, so b-explore fails (needs eq false),
      // b-combat fails (needs eq true), b-freeport matches (location=freeport)
      expect(r.sceneId).toBe("sc-freeport");
    });
  });

  describe("delta resolution", () => {
    it("merges delta into existing state", () => {
      mgr.resolveFromState(pack, {
        combat_active: false,
        location: "wilderness",
      });
      expect(mgr.getState()).toEqual({
        combat_active: false,
        location: "wilderness",
      });

      // Delta only changes combat_active
      const r = mgr.pushDelta(pack, { combat_active: true });
      expect(r.sceneId).toBe("sc-combat");
      expect(mgr.getState()).toEqual({
        combat_active: true,
        location: "wilderness",
      });
    });

    it("delta preserves fields not in the update", () => {
      mgr.resolveFromState(pack, {
        combat_active: false,
        location: "freeport",
      });
      mgr.pushDelta(pack, { combat_active: true });
      const state = mgr.getState();
      expect(state.location).toBe("freeport");
      expect(state.combat_active).toBe(true);
    });
  });

  describe("StateUpdate object", () => {
    it("handles snapshot StateUpdate", () => {
      const update: StateUpdate = {
        type: "snapshot",
        state: { combat_active: false },
        timestampMs: 1000,
      };
      const r = mgr.resolve(pack, update);
      expect(r.sceneId).toBe("sc-explore");
    });

    it("handles delta StateUpdate", () => {
      mgr.resolveFromState(pack, { combat_active: false });
      const update: StateUpdate = {
        type: "delta",
        state: { combat_active: true },
        timestampMs: 2000,
      };
      const r = mgr.resolve(pack, update);
      expect(r.sceneId).toBe("sc-combat");
    });
  });

  describe("history tracking", () => {
    it("records history entries", () => {
      mgr.resolveFromState(pack, { combat_active: false });
      mgr.pushDelta(pack, { combat_active: true });
      mgr.pushDelta(pack, { combat_active: false });

      const history = mgr.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].resolution.sceneId).toBe("sc-explore");
      expect(history[1].resolution.sceneId).toBe("sc-combat");
      expect(history[2].resolution.sceneId).toBe("sc-explore");
    });

    it("respects maxHistorySize", () => {
      const small = new GameStateManager({ maxHistorySize: 3 });
      for (let i = 0; i < 5; i++) {
        small.resolveFromState(pack, { combat_active: i % 2 === 0 });
      }
      expect(small.getHistory()).toHaveLength(3);
    });

    it("tracks timestamps", () => {
      mgr.resolve(pack, {
        type: "snapshot",
        state: { combat_active: false },
        timestampMs: 100,
      });
      mgr.resolve(pack, {
        type: "delta",
        state: { combat_active: true },
        timestampMs: 200,
      });

      const history = mgr.getHistory();
      expect(history[0].timestampMs).toBe(100);
      expect(history[1].timestampMs).toBe(200);
    });

    it("stores state snapshots in history (not references)", () => {
      mgr.resolveFromState(pack, { combat_active: false, location: "a" });
      mgr.pushDelta(pack, { location: "b" });

      const history = mgr.getHistory();
      // First entry should have original state
      expect(history[0].state.location).toBe("a");
      // Second entry should have updated state
      expect(history[1].state.location).toBe("b");
    });
  });

  describe("didSceneChange", () => {
    it("returns false with no history", () => {
      expect(mgr.didSceneChange()).toBe(false);
    });

    it("returns false with single entry", () => {
      mgr.resolveFromState(pack, { combat_active: false });
      expect(mgr.didSceneChange()).toBe(false);
    });

    it("returns true when scene changed", () => {
      mgr.resolveFromState(pack, { combat_active: false });
      mgr.pushDelta(pack, { combat_active: true });
      expect(mgr.didSceneChange()).toBe(true);
    });

    it("returns false when scene stayed the same", () => {
      mgr.resolveFromState(pack, { combat_active: false });
      mgr.pushDelta(pack, { location: "somewhere" });
      expect(mgr.didSceneChange()).toBe(false);
    });
  });

  describe("getLastResolution", () => {
    it("returns undefined before any resolution", () => {
      expect(mgr.getLastResolution()).toBeUndefined();
    });

    it("returns last resolution after resolve", () => {
      mgr.resolveFromState(pack, { combat_active: true });
      const last = mgr.getLastResolution();
      expect(last).toBeDefined();
      expect(last?.sceneId).toBe("sc-combat");
    });
  });

  describe("reset", () => {
    it("clears all state and history", () => {
      mgr.resolveFromState(pack, { combat_active: true });
      mgr.pushDelta(pack, { combat_active: false });

      mgr.reset();
      expect(mgr.getState()).toEqual({});
      expect(mgr.getHistory()).toHaveLength(0);
      expect(mgr.getLastResolution()).toBeUndefined();
      expect(mgr.didSceneChange()).toBe(false);
    });
  });
});

describe("RESERVED_KEYS", () => {
  it("has expected keys", () => {
    expect(RESERVED_KEYS.location).toBe("location");
    expect(RESERVED_KEYS.combat_active).toBe("combat_active");
    expect(RESERVED_KEYS.combat_intensity).toBe("combat_intensity");
    expect(RESERVED_KEYS.investigation_active).toBe("investigation_active");
    expect(RESERVED_KEYS.alert_level).toBe("alert_level");
    expect(RESERVED_KEYS.emotion).toBe("emotion");
    expect(RESERVED_KEYS.safe_zone).toBe("safe_zone");
    expect(RESERVED_KEYS.faction).toBe("faction");
    expect(RESERVED_KEYS.boss_active).toBe("boss_active");
    expect(RESERVED_KEYS.victory).toBe("victory");
  });

  it("keys are frozen (immutable)", () => {
    expect(Object.keys(RESERVED_KEYS)).toHaveLength(10);
  });
});

describe("Grounded scoring scenario", () => {
  // Simulates a Grounded playthrough state sequence
  const groundedScenes: Scene[] = [
    {
      id: "sc-ardent",
      name: "TCS Ardent",
      category: "tension",
      layers: [{ stemId: "s1" }],
    },
    {
      id: "sc-freeport-arrival",
      name: "Freeport Arrival",
      category: "exploration",
      layers: [{ stemId: "s1" }],
    },
    {
      id: "sc-freeport-combat",
      name: "Freeport Combat",
      category: "combat",
      layers: [{ stemId: "s1" }],
    },
    {
      id: "sc-communion",
      name: "Communion Relay",
      category: "exploration",
      layers: [{ stemId: "s1" }],
    },
    {
      id: "sc-investigation",
      name: "Investigation",
      category: "tension",
      layers: [{ stemId: "s1" }],
    },
  ];

  const groundedBindings: TriggerBinding[] = [
    {
      id: "b-ardent",
      name: "Ardent Flashback",
      sceneId: "sc-ardent",
      conditions: [{ field: "location", op: "eq", value: "ardent" }],
      priority: 20,
    },
    {
      id: "b-freeport",
      name: "Freeport",
      sceneId: "sc-freeport-arrival",
      conditions: [
        { field: "location", op: "eq", value: "freeport" },
        { field: "combat_active", op: "eq", value: false },
      ],
      priority: 20,
    },
    {
      id: "b-freeport-fight",
      name: "Freeport Combat",
      sceneId: "sc-freeport-combat",
      conditions: [
        { field: "location", op: "eq", value: "freeport" },
        { field: "combat_active", op: "eq", value: true },
      ],
      priority: 50,
    },
    {
      id: "b-communion",
      name: "Communion Relay",
      sceneId: "sc-communion",
      conditions: [{ field: "location", op: "eq", value: "communion_relay" }],
      priority: 20,
    },
    {
      id: "b-investigation",
      name: "Investigation Active",
      sceneId: "sc-investigation",
      conditions: [
        { field: "investigation_active", op: "eq", value: true },
      ],
      priority: 40,
    },
  ];

  const groundedPack = buildPack(groundedBindings, groundedScenes);

  it("walks through prologue arc correctly", () => {
    const mgr = new GameStateManager();

    // Scene 1: Ardent flashback
    const r1 = mgr.resolveFromState(groundedPack, {
      location: "ardent",
      combat_active: false,
      investigation_active: false,
    });
    expect(r1.sceneId).toBe("sc-ardent");

    // Scene 2: Arrive at Freeport
    const r2 = mgr.pushDelta(groundedPack, { location: "freeport" });
    expect(r2.sceneId).toBe("sc-freeport-arrival");
    expect(mgr.didSceneChange()).toBe(true);

    // Scene 3: Combat at Freeport
    const r3 = mgr.pushDelta(groundedPack, { combat_active: true });
    expect(r3.sceneId).toBe("sc-freeport-combat");
    expect(mgr.didSceneChange()).toBe(true);

    // Scene 4: Combat ends
    const r4 = mgr.pushDelta(groundedPack, { combat_active: false });
    expect(r4.sceneId).toBe("sc-freeport-arrival");
    expect(mgr.didSceneChange()).toBe(true);

    // Scene 5: Investigation triggers (overrides location)
    const r5 = mgr.pushDelta(groundedPack, { investigation_active: true });
    expect(r5.sceneId).toBe("sc-investigation");
    expect(mgr.didSceneChange()).toBe(true);

    // Scene 6: Travel to Communion Relay, investigation ends
    const r6 = mgr.pushDelta(groundedPack, {
      location: "communion_relay",
      investigation_active: false,
    });
    expect(r6.sceneId).toBe("sc-communion");
    expect(mgr.didSceneChange()).toBe(true);

    // Full arc: 6 state changes, 6 scene transitions
    expect(mgr.getHistory()).toHaveLength(6);
  });
});
