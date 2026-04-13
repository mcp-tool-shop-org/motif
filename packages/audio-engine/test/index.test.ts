import { describe, it, expect } from "vitest";
import type { SoundtrackPack, RuntimeMusicState } from "@motif/schema";
import { FIXTURES, loadFixture } from "@motif/test-kit";
import {
  resolveActiveLayers,
  findTransitionRule,
  simulateStateSequence,
} from "../src/index.js";

const load = (name: string) => loadFixture(name) as SoundtrackPack;
const loadSeq = (name: string) => loadFixture(name) as RuntimeMusicState[];

// ── resolveActiveLayers ──

describe("resolveActiveLayers", () => {
  it("resolves all stem ids in scene-layer order", () => {
    const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
    const plan = resolveActiveLayers(pack, "sc-boss");

    expect(plan.sceneId).toBe("sc-boss");
    expect(plan.sceneName).toBe("Boss Fight");
    expect(plan.stemIds).toEqual(["st-boss", "st-choir"]);
    expect(plan.warnings).toEqual([]);
  });

  it("extracts required stem ids correctly", () => {
    const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
    const plan = resolveActiveLayers(pack, "sc-boss");

    expect(plan.requiredStemIds).toEqual(["st-boss", "st-choir"]);
  });

  it("separates required from optional stems", () => {
    const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
    const plan = resolveActiveLayers(pack, "sc-tension");

    expect(plan.stemIds).toEqual(["st-calm", "st-tension"]);
    expect(plan.requiredStemIds).toEqual(["st-tension"]);
  });

  it("warns on missing scene and returns empty lists", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const plan = resolveActiveLayers(pack, "sc-nonexistent");

    expect(plan.stemIds).toEqual([]);
    expect(plan.requiredStemIds).toEqual([]);
    expect(plan.warnings).toHaveLength(1);
    expect(plan.warnings[0]).toContain("scene not found");
  });

  it("warns on missing stem and omits it", () => {
    const pack = load(FIXTURES.SIMULATION_MISSING_STEM);
    const plan = resolveActiveLayers(pack, "sc-broken");

    expect(plan.stemIds).toEqual(["s1"]);
    expect(plan.requiredStemIds).toEqual(["s1"]);
    expect(plan.warnings).toHaveLength(1);
    expect(plan.warnings[0]).toContain("missing stem: s-ghost");
  });

  it("de-dupes layers preserving first occurrence order", () => {
    // Build a pack with duplicate layer refs inline
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const scene = pack.scenes.find((s) => s.id === "sc-explore")!;
    scene.layers = [
      { stemId: "st-bed", required: true },
      { stemId: "st-bed" },
    ];
    const plan = resolveActiveLayers(pack, "sc-explore");

    expect(plan.stemIds).toEqual(["st-bed"]);
    expect(plan.requiredStemIds).toEqual(["st-bed"]);
  });
});

// ── findTransitionRule ──

describe("findTransitionRule", () => {
  it("returns exact from/to match", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const rule = findTransitionRule(pack, "sc-explore", "sc-combat");

    expect(rule).toBeDefined();
    expect(rule!.id).toBe("t-explore-combat");
    expect(rule!.mode).toBe("stinger-then-switch");
  });

  it("returns undefined when no match exists", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const rule = findTransitionRule(pack, "sc-combat", "sc-explore");

    expect(rule).toBeUndefined();
  });

  it("returns undefined for same-scene transition", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const rule = findTransitionRule(pack, "sc-explore", "sc-explore");

    expect(rule).toBeUndefined();
  });

  it("returns undefined when fromSceneId is undefined", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    expect(findTransitionRule(pack, undefined, "sc-combat")).toBeUndefined();
  });

  it("returns undefined when toSceneId is undefined", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    expect(findTransitionRule(pack, "sc-explore", undefined)).toBeUndefined();
  });

  it("returns first matching rule in pack order", () => {
    const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
    const rule = findTransitionRule(pack, "sc-calm", "sc-tension");

    expect(rule).toBeDefined();
    expect(rule!.id).toBe("t-calm-tension");
  });
});

// ── simulateStateSequence ──

describe("simulateStateSequence", () => {
  it("emits one step per input state", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const seq = loadSeq(FIXTURES.SIMULATION_BASIC_SEQUENCE);
    const trace = simulateStateSequence(pack, seq);

    expect(trace.steps).toHaveLength(3);
    expect(trace.steps.map((s) => s.index)).toEqual([0, 1, 2]);
  });

  it("first step has no transition and no fromSceneId", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const seq = loadSeq(FIXTURES.SIMULATION_BASIC_SEQUENCE);
    const trace = simulateStateSequence(pack, seq);
    const step0 = trace.steps[0];

    expect(step0.resolvedSceneId).toBe("sc-explore");
    expect(step0.fromSceneId).toBeUndefined();
    expect(step0.transitionMode).toBeUndefined();
    expect(step0.transitionId).toBeUndefined();
  });

  it("includes transition when scene changes and rule exists", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const seq = loadSeq(FIXTURES.SIMULATION_BASIC_SEQUENCE);
    const trace = simulateStateSequence(pack, seq);
    const step1 = trace.steps[1];

    expect(step1.resolvedSceneId).toBe("sc-combat");
    expect(step1.fromSceneId).toBe("sc-explore");
    expect(step1.transitionMode).toBe("stinger-then-switch");
    expect(step1.transitionId).toBe("t-explore-combat");
  });

  it("warns when scene changes but no transition rule exists", () => {
    const pack = load(FIXTURES.SIMULATION_MISSING_TRANSITION);
    const seq = [{ mode: "a" }, { mode: "b" }] as RuntimeMusicState[];
    const trace = simulateStateSequence(pack, seq);
    const step1 = trace.steps[1];

    expect(step1.resolvedSceneId).toBe("sc-b");
    expect(step1.fromSceneId).toBe("sc-a");
    expect(step1.transitionMode).toBeUndefined();
    expect(step1.warnings.some((w) => w.includes("no transition rule"))).toBe(true);
  });

  it("emits step even when no scene resolves", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const seq = [{ mode: "unknown" }] as RuntimeMusicState[];
    const trace = simulateStateSequence(pack, seq);

    expect(trace.steps).toHaveLength(1);
    expect(trace.steps[0].resolvedSceneId).toBeUndefined();
    expect(trace.steps[0].activatedStemIds).toEqual([]);
  });

  it("active stems are correct per step", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const seq = loadSeq(FIXTURES.SIMULATION_BASIC_SEQUENCE);
    const trace = simulateStateSequence(pack, seq);

    expect(trace.steps[0].activatedStemIds).toEqual(["st-bed"]);
    expect(trace.steps[0].requiredStemIds).toEqual(["st-bed"]);
    expect(trace.steps[1].activatedStemIds).toEqual(["st-combat"]);
    expect(trace.steps[2].activatedStemIds).toEqual(["st-victory"]);
  });

  it("missing stem warning appears on affected step", () => {
    const pack = load(FIXTURES.SIMULATION_MISSING_STEM);
    const seq = [{ mode: "exploration" }] as RuntimeMusicState[];
    const trace = simulateStateSequence(pack, seq);
    const step = trace.steps[0];

    expect(step.activatedStemIds).toEqual(["s1"]);
    expect(step.warnings.some((w) => w.includes("missing stem: s-ghost"))).toBe(true);
  });

  it("missing winning scene propagates warning cleanly", () => {
    const pack = load(FIXTURES.RESOLUTION_MISSING_SCENE_WINNER);
    const seq = [{ mode: "exploration" }] as RuntimeMusicState[];
    const trace = simulateStateSequence(pack, seq);
    const step = trace.steps[0];

    expect(step.resolvedSceneId).toBeUndefined();
    expect(step.warnings.some((w) => w.includes("missing scene"))).toBe(true);
  });

  describe("combat escalation sequence", () => {
    it("follows calm → tension → combat → boss → victory", () => {
      const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
      const seq = loadSeq(FIXTURES.SIMULATION_ESCALATION_SEQUENCE);
      const trace = simulateStateSequence(pack, seq);

      expect(trace.steps).toHaveLength(5);

      const sceneIds = trace.steps.map((s) => s.resolvedSceneId);
      expect(sceneIds).toEqual([
        "sc-calm",
        "sc-tension",
        "sc-combat",
        "sc-boss",
        "sc-victory",
      ]);
    });

    it("assigns correct transitions across escalation", () => {
      const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
      const seq = loadSeq(FIXTURES.SIMULATION_ESCALATION_SEQUENCE);
      const trace = simulateStateSequence(pack, seq);

      expect(trace.steps[0].transitionMode).toBeUndefined();
      expect(trace.steps[1].transitionMode).toBe("crossfade");
      expect(trace.steps[1].transitionId).toBe("t-calm-tension");
      expect(trace.steps[2].transitionMode).toBe("crossfade");
      expect(trace.steps[2].transitionId).toBe("t-tension-combat");
      expect(trace.steps[3].transitionMode).toBe("immediate");
      expect(trace.steps[3].transitionId).toBe("t-combat-boss");
      expect(trace.steps[4].transitionMode).toBe("cooldown-fade");
      expect(trace.steps[4].transitionId).toBe("t-boss-victory");
    });

    it("active stems are correct across escalation", () => {
      const pack = load(FIXTURES.SIMULATION_COMBAT_ESCALATION);
      const seq = loadSeq(FIXTURES.SIMULATION_ESCALATION_SEQUENCE);
      const trace = simulateStateSequence(pack, seq);

      expect(trace.steps[0].activatedStemIds).toEqual(["st-calm"]);
      expect(trace.steps[1].activatedStemIds).toEqual(["st-calm", "st-tension"]);
      expect(trace.steps[2].activatedStemIds).toEqual(["st-combat"]);
      expect(trace.steps[3].activatedStemIds).toEqual(["st-boss", "st-choir"]);
      expect(trace.steps[4].activatedStemIds).toEqual(["st-victory"]);
    });
  });

  it("no transition when scene stays the same", () => {
    const pack = load(FIXTURES.SIMULATION_BASIC);
    const seq = [
      { mode: "exploration" },
      { mode: "exploration" },
    ] as RuntimeMusicState[];
    const trace = simulateStateSequence(pack, seq);

    expect(trace.steps[1].transitionMode).toBeUndefined();
    expect(trace.steps[1].transitionId).toBeUndefined();
    expect(trace.steps[1].warnings).toEqual([]);
  });
});
