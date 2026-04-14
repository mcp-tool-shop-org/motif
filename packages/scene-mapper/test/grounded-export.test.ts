import { describe, it, expect } from "vitest";
import { buildGroundedPack } from "@motif-studio/scene-mapper";
import { reviewPack, summarizePack, auditPack } from "@motif-studio/review";
import {
  exportRuntimePack,
  safeParseRuntimePack,
  validateRuntimePack,
} from "@motif-studio/runtime-pack";

// ── Pack summary ──

describe("Grounded pack summary", () => {
  const pack = buildGroundedPack();
  const summary = summarizePack(pack);

  it("reports correct asset count", () => {
    expect(summary.counts.assets).toBe(pack.assets.length);
  });

  it("reports correct scene count", () => {
    expect(summary.counts.scenes).toBe(12);
  });

  it("reports correct binding count", () => {
    expect(summary.counts.bindings).toBe(14);
  });

  it("reports correct transition count", () => {
    expect(summary.counts.transitions).toBe(13);
  });

  it("has exploration and combat categories present", () => {
    expect(summary.categoriesPresent).toContain("exploration");
    expect(summary.categoriesPresent).toContain("combat");
    expect(summary.categoriesPresent).toContain("tension");
    expect(summary.categoriesPresent).toContain("safe-zone");
  });
});

// ── Pack audit ──

describe("Grounded pack audit", () => {
  const pack = buildGroundedPack();
  const audit = auditPack(pack);

  it("has zero errors", () => {
    expect(audit.errors).toHaveLength(0);
  });

  it("has no missing-binding warnings for major scenes", () => {
    const bindingWarnings = audit.warnings.filter((w) =>
      w.code === "missing_binding_for_major_scene",
    );
    expect(bindingWarnings).toHaveLength(0);
  });

  it("has no missing-transition-to-combat warnings", () => {
    const combatTransitions = audit.warnings.filter((w) =>
      w.code === "missing_transition_to_combat",
    );
    expect(combatTransitions).toHaveLength(0);
  });

  it("passes exploration and combat scene coverage", () => {
    const missingExplore = audit.warnings.filter((w) => w.code === "missing_exploration_scene");
    const missingCombat = audit.warnings.filter((w) => w.code === "missing_combat_scene");
    expect(missingExplore).toHaveLength(0);
    expect(missingCombat).toHaveLength(0);
  });

  it("only expected warnings (no victory scene — prologue has none)", () => {
    const victoryWarning = audit.warnings.find((w) => w.code === "missing_victory_scene");
    expect(victoryWarning).toBeDefined();
  });
});

// ── Runtime pack export ──

describe("Grounded runtime pack export", () => {
  const pack = buildGroundedPack();

  it("exports without errors", () => {
    const exported = exportRuntimePack(pack);
    expect(exported).toBeDefined();
  });

  it("round-trips through safe parse", () => {
    const exported = exportRuntimePack(pack);
    const json = JSON.stringify(exported);
    const parsed = safeParseRuntimePack(JSON.parse(json));
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBeDefined();
  });

  it("validates with no blocking issues", () => {
    const result = validateRuntimePack(pack);
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });
});

// ── Full review ──

describe("reviewPack integration", () => {
  it("produces summary + audit in one call", () => {
    const pack = buildGroundedPack();
    const { summary, audit } = reviewPack(pack);
    expect(summary.counts.scenes).toBe(12);
    expect(audit.errors).toHaveLength(0);
  });
});
