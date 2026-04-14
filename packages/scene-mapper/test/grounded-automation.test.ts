import { describe, it, expect } from "vitest";
import {
  GROUNDED_MACRO_MAPPINGS,
  GROUNDED_SECTION_ENVELOPES,
  GROUNDED_CUES,
  buildGroundedPack,
} from "@motif-studio/scene-mapper";
import {
  evaluateMacros,
  applyMacroInfluence,
  defaultMacroState,
  mappingsForMacro,
  macrosAffectingParam,
  evaluateEnvelope,
  envelopesForTarget,
  entryEnvelopes,
  exitEnvelopes,
} from "@motif-studio/automation";
import type { MacroState } from "@motif-studio/schema";

// ── Macro Mapping inventory ──

describe("GROUNDED_MACRO_MAPPINGS", () => {
  it("contains exactly 12 mappings", () => {
    expect(GROUNDED_MACRO_MAPPINGS).toHaveLength(12);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_MACRO_MAPPINGS.map((m) => m.id);
    expect(new Set(ids).size).toBe(12);
  });

  it("all IDs use mm- prefix", () => {
    for (const m of GROUNDED_MACRO_MAPPINGS) {
      expect(m.id).toMatch(/^mm-/);
    }
  });

  it("all weights are 0-1", () => {
    for (const m of GROUNDED_MACRO_MAPPINGS) {
      expect(m.weight).toBeGreaterThan(0);
      expect(m.weight).toBeLessThanOrEqual(1);
    }
  });

  it("covers all 4 macros", () => {
    const macros = new Set(GROUNDED_MACRO_MAPPINGS.map((m) => m.macro));
    expect(macros).toEqual(new Set(["intensity", "tension", "brightness", "space"]));
  });

  it("covers multiple automation params", () => {
    const params = new Set(GROUNDED_MACRO_MAPPINGS.map((m) => m.param));
    expect(params.size).toBeGreaterThanOrEqual(4);
    expect(params).toContain("volume");
    expect(params).toContain("filterCutoff");
    expect(params).toContain("reverbSend");
    expect(params).toContain("delaySend");
  });

  it("has 2 inverted mappings (reverb tightens with intensity, volume drops with space)", () => {
    const inverted = GROUNDED_MACRO_MAPPINGS.filter((m) => m.invert);
    expect(inverted).toHaveLength(2);
  });

  it("has 1 scoped mapping (Keth communion)", () => {
    const scoped = GROUNDED_MACRO_MAPPINGS.filter((m) => m.targetId);
    expect(scoped).toHaveLength(1);
    expect(scoped[0].targetId).toBe("sc-communion");
  });
});

// ── Macro evaluation ──

describe("macro evaluation with Grounded mappings", () => {
  it("default macro state produces near-zero influence", () => {
    const state = defaultMacroState();
    const result = evaluateMacros(state, GROUNDED_MACRO_MAPPINGS);
    // At midpoint (0.5), all influences should be near 0
    for (const [, influence] of result) {
      expect(Math.abs(influence)).toBeLessThan(0.01);
    }
  });

  it("high intensity opens filter and reduces reverb", () => {
    const state: MacroState = { intensity: 1.0, tension: 0.5, brightness: 0.5, space: 0.5 };
    const result = evaluateMacros(state, GROUNDED_MACRO_MAPPINGS);
    const filter = result.get("filterCutoff") ?? 0;
    const reverb = result.get("reverbSend") ?? 0;
    expect(filter).toBeGreaterThan(0); // filter opens
    expect(reverb).toBeLessThan(0); // reverb tightens (inverted)
  });

  it("low intensity closes filter and increases reverb", () => {
    const state: MacroState = { intensity: 0.0, tension: 0.5, brightness: 0.5, space: 0.5 };
    const result = evaluateMacros(state, GROUNDED_MACRO_MAPPINGS);
    const filter = result.get("filterCutoff") ?? 0;
    const reverb = result.get("reverbSend") ?? 0;
    expect(filter).toBeLessThan(0); // filter closes
    expect(reverb).toBeGreaterThan(0); // reverb expands
  });

  it("high space expands reverb and delay", () => {
    const state: MacroState = { intensity: 0.5, tension: 0.5, brightness: 0.5, space: 1.0 };
    const result = evaluateMacros(state, GROUNDED_MACRO_MAPPINGS);
    const reverb = result.get("reverbSend") ?? 0;
    const delay = result.get("delaySend") ?? 0;
    expect(reverb).toBeGreaterThan(0);
    expect(delay).toBeGreaterThan(0);
  });

  it("applyMacroInfluence clamps to 0-1", () => {
    expect(applyMacroInfluence(0.8, 0.5)).toBe(1.0);
    expect(applyMacroInfluence(0.2, -0.5)).toBe(0.0);
    expect(applyMacroInfluence(0.5, 0.1)).toBeCloseTo(0.6);
  });

  it("intensity macro affects 3 params", () => {
    const mapped = mappingsForMacro(GROUNDED_MACRO_MAPPINGS, "intensity");
    expect(mapped).toHaveLength(3);
  });

  it("filterCutoff is affected by 3 macros", () => {
    const macros = macrosAffectingParam(GROUNDED_MACRO_MAPPINGS, "filterCutoff");
    expect(macros).toHaveLength(3);
    expect(macros.sort()).toEqual(["brightness", "intensity", "tension"]);
  });

  it("reverbSend is affected by 3 macros", () => {
    const macros = macrosAffectingParam(GROUNDED_MACRO_MAPPINGS, "reverbSend");
    expect(macros).toHaveLength(3);
    expect(macros.sort()).toEqual(["brightness", "intensity", "space"]);
  });
});

// ── Section Envelope inventory ──

describe("GROUNDED_SECTION_ENVELOPES", () => {
  it("contains exactly 18 envelopes", () => {
    expect(GROUNDED_SECTION_ENVELOPES).toHaveLength(18);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_SECTION_ENVELOPES.map((e) => e.id);
    expect(new Set(ids).size).toBe(18);
  });

  it("all IDs use env- prefix", () => {
    for (const e of GROUNDED_SECTION_ENVELOPES) {
      expect(e.id).toMatch(/^env-/);
    }
  });

  it("all durations are positive", () => {
    for (const e of GROUNDED_SECTION_ENVELOPES) {
      expect(e.durationMs).toBeGreaterThan(0);
    }
  });

  it("all depths are 0-1", () => {
    for (const e of GROUNDED_SECTION_ENVELOPES) {
      if (e.depth != null) {
        expect(e.depth).toBeGreaterThan(0);
        expect(e.depth).toBeLessThanOrEqual(1);
      }
    }
  });

  it("all targetIds reference valid cue section IDs", () => {
    const sectionIds = new Set(GROUNDED_CUES.flatMap((c) => c.sections.map((s) => s.id)));
    for (const e of GROUNDED_SECTION_ENVELOPES) {
      expect(sectionIds.has(e.targetId)).toBe(true);
    }
  });
});

// ── Envelope distribution ──

describe("envelope distribution", () => {
  it("has entry and exit envelopes", () => {
    const entries = entryEnvelopes(GROUNDED_SECTION_ENVELOPES);
    const exits = exitEnvelopes(GROUNDED_SECTION_ENVELOPES);
    expect(entries.length).toBeGreaterThan(0);
    expect(exits.length).toBeGreaterThan(0);
    expect(entries.length + exits.length).toBe(18);
  });

  it("uses multiple envelope shapes", () => {
    const shapes = new Set(GROUNDED_SECTION_ENVELOPES.map((e) => e.shape));
    expect(shapes.size).toBeGreaterThanOrEqual(4);
    expect(shapes).toContain("fade-in");
    expect(shapes).toContain("fade-out");
    expect(shapes).toContain("swell");
    expect(shapes).toContain("filter-rise");
  });

  it("court martial outro has the longest fade (6s)", () => {
    const courtOutro = GROUNDED_SECTION_ENVELOPES.find((e) => e.id === "env-court-outro-exit")!;
    expect(courtOutro.durationMs).toBe(6000);
    for (const e of GROUNDED_SECTION_ENVELOPES) {
      expect(courtOutro.durationMs).toBeGreaterThanOrEqual(e.durationMs);
    }
  });

  it("ambush intro uses swell (dramatic entry)", () => {
    const ambush = GROUNDED_SECTION_ENVELOPES.find((e) => e.id === "env-ambush-intro-entry")!;
    expect(ambush.shape).toBe("swell");
    expect(ambush.depth).toBe(1.0);
  });
});

// ── Envelope evaluation ──

describe("envelope evaluation", () => {
  it("fade-in starts at 0 and ends at depth", () => {
    const env = GROUNDED_SECTION_ENVELOPES.find((e) => e.id === "env-ardent-intro-entry")!;
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(0);
    expect(evaluateEnvelope(env, env.durationMs)).toBeCloseTo(env.depth!);
  });

  it("fade-out starts at depth and ends at 0", () => {
    const env = GROUNDED_SECTION_ENVELOPES.find((e) => e.id === "env-ambush-outro-exit")!;
    expect(evaluateEnvelope(env, 0)).toBeCloseTo(env.depth!);
    expect(evaluateEnvelope(env, env.durationMs)).toBeCloseTo(0);
  });

  it("swell has slow start and fast finish", () => {
    const env = GROUNDED_SECTION_ENVELOPES.find((e) => e.id === "env-ambush-intro-entry")!;
    const quarter = evaluateEnvelope(env, env.durationMs * 0.25);
    const half = evaluateEnvelope(env, env.durationMs * 0.5);
    // Quadratic: at 25% time, value should be ~6.25% of depth
    expect(quarter).toBeLessThan(half);
    expect(quarter).toBeLessThan(0.1); // slow start
  });

  it("filter-rise has smooth S-curve", () => {
    const env = GROUNDED_SECTION_ENVELOPES.find((e) => e.id === "env-communion-intro-entry")!;
    const start = evaluateEnvelope(env, 0);
    const mid = evaluateEnvelope(env, env.durationMs * 0.5);
    const end = evaluateEnvelope(env, env.durationMs);
    expect(start).toBeCloseTo(0);
    expect(mid).toBeCloseTo(env.depth! * 0.5, 0);
    expect(end).toBeCloseTo(env.depth!);
  });
});

// ── Pack integration ──

describe("buildGroundedPack automation", () => {
  const pack = buildGroundedPack();

  it("pack includes 12 macro mappings", () => {
    expect(pack.macroMappings).toHaveLength(12);
  });

  it("pack includes 18 section envelopes", () => {
    expect(pack.sectionEnvelopes).toHaveLength(18);
  });
});
