import { describe, it, expect } from "vitest";
import type {
  SoundtrackPack,
  RuntimeMusicState,
  TriggerCondition,
  TriggerBinding,
  Scene,
  Stem,
  AudioAsset,
} from "@motif-studio/schema";
import { FIXTURES, loadFixture } from "@motif-studio/test-kit";
import {
  evaluateCondition,
  evaluateBinding,
  evaluateBindings,
  resolveScene,
} from "../src/index.js";

const load = (name: string) => loadFixture(name) as SoundtrackPack;

// ── evaluateCondition ──

describe("evaluateCondition", () => {
  const cond = (field: string, op: TriggerCondition["op"], value: TriggerCondition["value"]): TriggerCondition => ({
    field,
    op,
    value,
  });

  describe("eq", () => {
    it("matches equal string", () => {
      const r = evaluateCondition(cond("mode", "eq", "exploration"), { mode: "exploration" });
      expect(r.matched).toBe(true);
      expect(r.actualValue).toBe("exploration");
    });

    it("fails on unequal string", () => {
      const r = evaluateCondition(cond("mode", "eq", "combat"), { mode: "exploration" });
      expect(r.matched).toBe(false);
    });

    it("matches equal boolean", () => {
      const r = evaluateCondition(cond("inCombat", "eq", true), { inCombat: true });
      expect(r.matched).toBe(true);
    });

    it("matches equal number", () => {
      const r = evaluateCondition(cond("danger", "eq", 50), { danger: 50 });
      expect(r.matched).toBe(true);
    });
  });

  describe("neq", () => {
    it("matches when not equal", () => {
      const r = evaluateCondition(cond("mode", "neq", "combat"), { mode: "exploration" });
      expect(r.matched).toBe(true);
    });

    it("fails when equal", () => {
      const r = evaluateCondition(cond("mode", "neq", "exploration"), { mode: "exploration" });
      expect(r.matched).toBe(false);
    });
  });

  describe("gt / gte / lt / lte", () => {
    it("gt succeeds", () => {
      expect(evaluateCondition(cond("danger", "gt", 40), { danger: 50 }).matched).toBe(true);
    });

    it("gt fails on equal", () => {
      expect(evaluateCondition(cond("danger", "gt", 50), { danger: 50 }).matched).toBe(false);
    });

    it("gte succeeds on equal", () => {
      expect(evaluateCondition(cond("danger", "gte", 50), { danger: 50 }).matched).toBe(true);
    });

    it("lt succeeds", () => {
      expect(evaluateCondition(cond("danger", "lt", 60), { danger: 50 }).matched).toBe(true);
    });

    it("lt fails on equal", () => {
      expect(evaluateCondition(cond("danger", "lt", 50), { danger: 50 }).matched).toBe(false);
    });

    it("lte succeeds on equal", () => {
      expect(evaluateCondition(cond("danger", "lte", 50), { danger: 50 }).matched).toBe(true);
    });

    it("fails cleanly on non-numeric state value", () => {
      const r = evaluateCondition(cond("mode", "gt", 10), { mode: "exploration" });
      expect(r.matched).toBe(false);
      expect(r.reason).toContain("expected numeric state value for operator gt");
    });

    it("fails cleanly on non-numeric condition value", () => {
      const r = evaluateCondition(cond("danger", "gt", "high" as unknown as number), { danger: 50 });
      expect(r.matched).toBe(false);
      expect(r.reason).toContain("expected numeric condition value for operator gt");
    });
  });

  describe("includes", () => {
    it("matches array contains value", () => {
      const r = evaluateCondition(cond("activeFactions", "includes", "rebels"), {
        activeFactions: ["empire", "rebels"],
      } as RuntimeMusicState);
      expect(r.matched).toBe(true);
    });

    it("fails array not containing value", () => {
      const r = evaluateCondition(cond("activeFactions", "includes", "rebels"), {
        activeFactions: ["empire"],
      } as RuntimeMusicState);
      expect(r.matched).toBe(false);
    });

    it("matches string substring", () => {
      const r = evaluateCondition(cond("region", "includes", "forest"), { region: "dark-forest-east" });
      expect(r.matched).toBe(true);
    });

    it("fails string no substring", () => {
      const r = evaluateCondition(cond("region", "includes", "desert"), { region: "dark-forest-east" });
      expect(r.matched).toBe(false);
    });

    it("fails cleanly on invalid type", () => {
      const r = evaluateCondition(cond("danger", "includes", 5), { danger: 50 });
      expect(r.matched).toBe(false);
      expect(r.reason).toContain("includes requires array or string");
    });
  });

  describe("missing state field", () => {
    it("fails cleanly with reason", () => {
      const r = evaluateCondition(cond("nonexistent", "eq", true), {});
      expect(r.matched).toBe(false);
      expect(r.actualValue).toBeUndefined();
      expect(r.reason).toContain("undefined");
    });
  });
});

// ── evaluateBinding ──

describe("evaluateBinding", () => {
  const binding = (conditions: TriggerCondition[]): TriggerBinding => ({
    id: "b1",
    name: "Test Bind",
    sceneId: "sc1",
    conditions,
    priority: 10,
  });

  it("matches when all conditions match", () => {
    const b = binding([
      { field: "mode", op: "eq", value: "exploration" },
      { field: "danger", op: "lt", value: 50 },
    ]);
    const r = evaluateBinding(b, { mode: "exploration", danger: 20 });
    expect(r.matched).toBe(true);
    expect(r.conditionEvaluations).toHaveLength(2);
    expect(r.conditionEvaluations.every((e) => e.matched)).toBe(true);
  });

  it("fails when one condition fails", () => {
    const b = binding([
      { field: "mode", op: "eq", value: "exploration" },
      { field: "danger", op: "gt", value: 50 },
    ]);
    const r = evaluateBinding(b, { mode: "exploration", danger: 20 });
    expect(r.matched).toBe(false);
    expect(r.conditionEvaluations[0].matched).toBe(true);
    expect(r.conditionEvaluations[1].matched).toBe(false);
  });

  it("preserves metadata", () => {
    const b: TriggerBinding = {
      id: "bind-x",
      name: "Named Bind",
      sceneId: "scene-y",
      conditions: [{ field: "mode", op: "eq", value: "exploration" }],
      priority: 42,
      stopProcessing: true,
    };
    const r = evaluateBinding(b, { mode: "exploration" });
    expect(r.bindingId).toBe("bind-x");
    expect(r.bindingName).toBe("Named Bind");
    expect(r.sceneId).toBe("scene-y");
    expect(r.priority).toBe(42);
    expect(r.stopProcessing).toBe(true);
  });

  it("includes actual values in evaluations", () => {
    const b = binding([{ field: "danger", op: "gt", value: 30 }]);
    const r = evaluateBinding(b, { danger: 75 });
    expect(r.conditionEvaluations[0].actualValue).toBe(75);
  });
});

// ── evaluateBindings ──

describe("evaluateBindings", () => {
  it("preserves original binding order", () => {
    const pack = load(FIXTURES.RESOLUTION_BASIC);
    const evals = evaluateBindings(pack, { mode: "exploration", inCombat: true });

    expect(evals).toHaveLength(2);
    expect(evals[0].bindingId).toBe("b-explore");
    expect(evals[1].bindingId).toBe("b-combat");
  });

  it("evaluates all bindings even after match", () => {
    const pack = load(FIXTURES.RESOLUTION_BASIC);
    const evals = evaluateBindings(pack, { mode: "exploration", inCombat: true });

    expect(evals[0].matched).toBe(true);
    expect(evals[1].matched).toBe(true);
  });
});

// ── resolveScene ──

describe("resolveScene", () => {
  it("resolves no match when no bindings match", () => {
    const pack = load(FIXTURES.RESOLUTION_BASIC);
    const r = resolveScene(pack, { mode: "stealth" });

    expect(r.sceneId).toBeUndefined();
    expect(r.winningBindingId).toBeUndefined();
    expect(r.matchedBindingIds).toEqual([]);
    expect(r.rejectedBindingIds).toEqual(["b-explore", "b-combat"]);
    expect(r.warnings).toEqual([]);
  });

  it("resolves single match", () => {
    const pack = load(FIXTURES.RESOLUTION_BASIC);
    const r = resolveScene(pack, { mode: "exploration" });

    expect(r.sceneId).toBe("sc-explore");
    expect(r.sceneName).toBe("Exploration");
    expect(r.winningBindingId).toBe("b-explore");
    expect(r.matchedBindingIds).toEqual(["b-explore"]);
    expect(r.rejectedBindingIds).toEqual(["b-combat"]);
  });

  it("highest priority wins when multiple match", () => {
    const pack = load(FIXTURES.RESOLUTION_BASIC);
    const r = resolveScene(pack, { mode: "exploration", inCombat: true });

    expect(r.sceneId).toBe("sc-combat");
    expect(r.winningBindingId).toBe("b-combat");
    expect(r.matchedBindingIds).toContain("b-explore");
    expect(r.matchedBindingIds).toContain("b-combat");
  });

  it("uses pack order as tie-breaker for equal priority", () => {
    const pack = load(FIXTURES.RESOLUTION_TIEBREAK);
    const r = resolveScene(pack, { mode: "exploration" });

    expect(r.sceneId).toBe("sc-first");
    expect(r.winningBindingId).toBe("b-first");
    expect(r.matchedBindingIds).toEqual(["b-first", "b-second"]);
  });

  it("resolves priority fixture correctly", () => {
    const pack = load(FIXTURES.RESOLUTION_PRIORITY);

    // Low danger — only calm matches
    const r1 = resolveScene(pack, { danger: 10 });
    expect(r1.sceneId).toBe("sc-calm");
    expect(r1.winningBindingId).toBe("b-calm");

    // High danger — danger zone wins over calm
    const r2 = resolveScene(pack, { danger: 50 });
    expect(r2.sceneId).toBe("sc-danger");
    expect(r2.winningBindingId).toBe("b-danger");

    // Boss — boss wins over everything
    const r3 = resolveScene(pack, { danger: 50, boss: true });
    expect(r3.sceneId).toBe("sc-boss");
    expect(r3.winningBindingId).toBe("b-boss");
  });

  it("warns on winning binding with missing scene", () => {
    const pack = load(FIXTURES.RESOLUTION_MISSING_SCENE_WINNER);
    const r = resolveScene(pack, { mode: "exploration" });

    expect(r.sceneId).toBeUndefined();
    expect(r.winningBindingId).toBe("b-ghost");
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]).toContain("missing scene");
    expect(r.warnings[0]).toContain("sc-nonexistent");
  });

  it("correct matched/rejected ids", () => {
    const pack = load(FIXTURES.RESOLUTION_PRIORITY);
    const r = resolveScene(pack, { danger: 50 });

    // danger=50: calm needs lt 30 → fail, danger needs gte 30 → pass, boss needs true → fail
    expect(r.matchedBindingIds).toEqual(["b-danger"]);
    expect(r.rejectedBindingIds).toContain("b-calm");
    expect(r.rejectedBindingIds).toContain("b-boss");
  });

  it("includes full evaluations in result", () => {
    const pack = load(FIXTURES.RESOLUTION_BASIC);
    const r = resolveScene(pack, { mode: "exploration" });

    expect(r.evaluations).toHaveLength(2);
    expect(r.evaluations[0].bindingId).toBe("b-explore");
    expect(r.evaluations[1].bindingId).toBe("b-combat");
  });

  describe("numeric ops fixture", () => {
    it("low danger matches calm", () => {
      const pack = load(FIXTURES.RESOLUTION_NUMERIC_OPS);
      const r = resolveScene(pack, { danger: 20 });
      expect(r.sceneId).toBe("sc-calm");
    });

    it("mid danger matches tense", () => {
      const pack = load(FIXTURES.RESOLUTION_NUMERIC_OPS);
      const r = resolveScene(pack, { danger: 60 });
      expect(r.sceneId).toBe("sc-tense");
    });

    it("very high danger matches neither tense band", () => {
      const pack = load(FIXTURES.RESOLUTION_NUMERIC_OPS);
      const r = resolveScene(pack, { danger: 90 });
      // b-calm: lte 40 → false, b-tense: gt 40 true AND lt 80 false → false
      expect(r.sceneId).toBeUndefined();
    });
  });

  describe("includes fixture", () => {
    it("matches array-based includes", () => {
      const pack = load(FIXTURES.RESOLUTION_INCLUDES);
      const r = resolveScene(pack, {
        activeFactions: ["empire", "rebels"],
        region: "desert",
      } as RuntimeMusicState);

      expect(r.sceneId).toBe("sc-faction");
      expect(r.winningBindingId).toBe("b-faction");
    });

    it("matches string-based includes", () => {
      const pack = load(FIXTURES.RESOLUTION_INCLUDES);
      const r = resolveScene(pack, {
        region: "dark-forest-east",
      } as RuntimeMusicState);

      expect(r.sceneId).toBe("sc-faction");
      expect(r.winningBindingId).toBe("b-region");
    });
  });

  // ── stopProcessing + priority interaction (SP-F004 fix) ──

  describe("stopProcessing does not block higher-priority winner", () => {
    function buildPack(bindings: TriggerBinding[], scenes: Scene[]): SoundtrackPack {
      return {
        meta: { id: "sp-test", name: "SP Test", version: "1.0.0", schemaVersion: "1" },
        assets: [{ id: "a1", name: "A", src: "a.ogg", kind: "loop", durationMs: 1000 }],
        stems: [{ id: "s1", name: "S", assetId: "a1", role: "base", loop: true }],
        scenes,
        bindings,
        transitions: [],
      } as SoundtrackPack;
    }

    const scenes: Scene[] = [
      { id: "sc-low", name: "Low", category: "exploration", layers: [{ stemId: "s1" }] },
      { id: "sc-high", name: "High", category: "combat", layers: [{ stemId: "s1" }] },
      { id: "sc-mid", name: "Mid", category: "tension", layers: [{ stemId: "s1" }] },
    ];

    it("low-priority stopProcessing does NOT prevent higher-priority from winning", () => {
      const pack = buildPack(
        [
          {
            id: "b-low",
            name: "Low Stop",
            sceneId: "sc-low",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 10,
            stopProcessing: true,
          },
          {
            id: "b-high",
            name: "High",
            sceneId: "sc-high",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 50,
          },
        ],
        scenes,
      );

      const r = resolveScene(pack, { active: true } as RuntimeMusicState);
      // Higher priority wins despite lower priority having stopProcessing
      expect(r.sceneId).toBe("sc-high");
      expect(r.winningBindingId).toBe("b-high");
    });

    it("stopProcessing truncates results after priority sort", () => {
      const pack = buildPack(
        [
          {
            id: "b-high",
            name: "High Stop",
            sceneId: "sc-high",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 50,
            stopProcessing: true,
          },
          {
            id: "b-mid",
            name: "Mid",
            sceneId: "sc-mid",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 30,
          },
          {
            id: "b-low",
            name: "Low",
            sceneId: "sc-low",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 10,
          },
        ],
        scenes,
      );

      const r = resolveScene(pack, { active: true } as RuntimeMusicState);
      // b-high wins (highest priority) and stopProcessing truncates after it
      expect(r.sceneId).toBe("sc-high");
      expect(r.winningBindingId).toBe("b-high");
      // All three matched before truncation
      expect(r.matchedBindingIds).toContain("b-high");
      expect(r.matchedBindingIds).toContain("b-mid");
      expect(r.matchedBindingIds).toContain("b-low");
    });

    it("multiple matched bindings with different priorities resolve correctly", () => {
      const pack = buildPack(
        [
          {
            id: "b-low",
            name: "Low",
            sceneId: "sc-low",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 5,
          },
          {
            id: "b-mid",
            name: "Mid",
            sceneId: "sc-mid",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 25,
          },
          {
            id: "b-high",
            name: "High",
            sceneId: "sc-high",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 100,
          },
        ],
        scenes,
      );

      const r = resolveScene(pack, { active: true } as RuntimeMusicState);
      expect(r.sceneId).toBe("sc-high");
      expect(r.winningBindingId).toBe("b-high");
      expect(r.matchedBindingIds).toEqual(["b-low", "b-mid", "b-high"]);
      expect(r.rejectedBindingIds).toEqual([]);
    });

    it("mid-priority stopProcessing keeps higher-priority winner but drops lower", () => {
      const pack = buildPack(
        [
          {
            id: "b-high",
            name: "High",
            sceneId: "sc-high",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 50,
          },
          {
            id: "b-mid",
            name: "Mid Stop",
            sceneId: "sc-mid",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 30,
            stopProcessing: true,
          },
          {
            id: "b-low",
            name: "Low",
            sceneId: "sc-low",
            conditions: [{ field: "active", op: "eq", value: true }],
            priority: 10,
          },
        ],
        scenes,
      );

      const r = resolveScene(pack, { active: true } as RuntimeMusicState);
      // After sort: [b-high(50), b-mid(30,stop), b-low(10)]
      // stopProcessing at b-mid truncates after it, removing b-low from sorted list
      // Winner is still b-high
      expect(r.sceneId).toBe("sc-high");
      expect(r.winningBindingId).toBe("b-high");
    });
  });
});
