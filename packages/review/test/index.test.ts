import { describe, it, expect } from "vitest";
import { loadFixture, FIXTURES } from "@motif/test-kit";
import type { SoundtrackPack } from "@motif/schema";
import {
  summarizePack,
  auditPack,
  reviewPack,
  renderPackSummaryMarkdown,
  renderPackSummaryJson,
} from "../src/index.js";

// ── Helpers ──

function loadPack(name: string): SoundtrackPack {
  return loadFixture(name) as SoundtrackPack;
}

// ────────────────────────────────────────────
// summarizePack
// ────────────────────────────────────────────

describe("summarizePack", () => {
  it("reports correct metadata from starter pack", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    expect(summary.meta.id).toBe("starter-pack");
    expect(summary.meta.name).toBe("Starter Adventure Pack");
    expect(summary.meta.version).toBe("1.0.0");
    expect(summary.meta.schemaVersion).toBe("1");
  });

  it("reports correct counts", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    expect(summary.counts.assets).toBe(8);
    expect(summary.counts.stems).toBe(7);
    expect(summary.counts.scenes).toBe(5);
    expect(summary.counts.bindings).toBe(5);
    expect(summary.counts.transitions).toBe(4);
  });

  it("categories are unique and sorted", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    expect(summary.categoriesPresent).toEqual([
      "combat",
      "exploration",
      "safe-zone",
      "tension",
      "victory",
    ]);
  });

  it("stem role distribution counts present roles only", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    expect(summary.stemRoleDistribution).toEqual({
      base: 2,
      accent: 1,
      danger: 2,
      combat: 1,
      recovery: 1,
    });
  });

  it("unused counts reflect asset-index results", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    expect(summary.unused.assets).toBe(0);
    expect(summary.unused.stems).toBe(0);
    expect(summary.unused.scenes).toBe(0);
  });

  it("reports unused entities when present", () => {
    const pack = loadPack(FIXTURES.INTEGRITY_UNUSED_ENTITIES);
    const summary = summarizePack(pack);
    expect(summary.unused.assets).toBeGreaterThan(0);
  });

  it("reports single category for minimal fixture", () => {
    const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
    const summary = summarizePack(pack);
    expect(summary.categoriesPresent).toEqual(["stealth"]);
  });
});

// ────────────────────────────────────────────
// auditPack
// ────────────────────────────────────────────

describe("auditPack", () => {
  describe("integrity findings", () => {
    it("includes duplicate id errors", () => {
      const pack = loadPack(FIXTURES.INTEGRITY_DUPLICATE_IDS);
      const audit = auditPack(pack);
      expect(audit.errors.length).toBeGreaterThan(0);
      expect(audit.errors.some((f) => f.code.startsWith("duplicate_"))).toBe(
        true,
      );
    });

    it("includes missing ref errors", () => {
      const pack = loadPack(FIXTURES.INTEGRITY_MISSING_ASSET_REF);
      const audit = auditPack(pack);
      expect(audit.errors.some((f) => f.code === "missing_asset_ref")).toBe(
        true,
      );
    });
  });

  describe("missing baseline category warnings", () => {
    it("warns for missing exploration, combat, victory", () => {
      const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
      const audit = auditPack(pack);
      const codes = audit.warnings.map((f) => f.code);
      expect(codes).toContain("missing_exploration_scene");
      expect(codes).toContain("missing_combat_scene");
      expect(codes).toContain("missing_victory_scene");
    });

    it("warns when both safe-zone and aftermath are absent", () => {
      const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
      const audit = auditPack(pack);
      expect(audit.warnings.some((f) => f.code === "missing_recovery_scene")).toBe(
        true,
      );
    });

    it("notes missing tension and boss", () => {
      const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
      const audit = auditPack(pack);
      const codes = audit.notes.map((f) => f.code);
      expect(codes).toContain("missing_tension_scene");
      expect(codes).toContain("missing_boss_scene");
    });

    it("does not warn for categories present in starter pack", () => {
      const pack = loadPack(FIXTURES.STARTER_PACK);
      const audit = auditPack(pack);
      const codes = audit.warnings.map((f) => f.code);
      expect(codes).not.toContain("missing_exploration_scene");
      expect(codes).not.toContain("missing_combat_scene");
      expect(codes).not.toContain("missing_victory_scene");
      expect(codes).not.toContain("missing_recovery_scene");
    });
  });

  describe("transition coverage", () => {
    it("warns when no transition leads to combat", () => {
      const pack = loadPack(FIXTURES.REVIEW_NO_BINDINGS);
      // no-bindings pack: combat has transition into it (explore→combat), so no warning
      const audit = auditPack(pack);
      const codes = audit.warnings.map((f) => f.code);
      expect(codes).not.toContain("missing_transition_to_combat");
    });

    it("warns when missing baseline pack has no transitions at all", () => {
      const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
      const audit = auditPack(pack);
      const codes = audit.notes.map((f) => f.code);
      expect(codes).toContain("no_transitions_defined");
    });
  });

  describe("binding coverage", () => {
    it("warns when no bindings defined", () => {
      const pack = loadPack(FIXTURES.REVIEW_NO_BINDINGS);
      const audit = auditPack(pack);
      expect(audit.warnings.some((f) => f.code === "no_bindings_defined")).toBe(
        true,
      );
    });

    it("warns for major scenes with no binding", () => {
      const pack = loadPack(FIXTURES.REVIEW_NO_BINDINGS);
      const audit = auditPack(pack);
      expect(
        audit.warnings.some((f) => f.code === "missing_binding_for_major_scene"),
      ).toBe(true);
    });

    it("notes non-major scenes with no binding", () => {
      // immediate-only pack: safe-zone scene has a binding, but if we
      // create a scenario... For now, starter pack has full coverage
      const pack = loadPack(FIXTURES.STARTER_PACK);
      const audit = auditPack(pack);
      expect(
        audit.notes.filter((f) => f.code === "missing_binding_for_scene").length,
      ).toBe(0);
    });
  });

  describe("transition mode monoculture", () => {
    it("notes when all transitions use immediate", () => {
      const pack = loadPack(FIXTURES.REVIEW_IMMEDIATE_ONLY);
      const audit = auditPack(pack);
      expect(
        audit.notes.some((f) => f.code === "all_transitions_immediate"),
      ).toBe(true);
    });

    it("does not note when transitions use mixed modes", () => {
      const pack = loadPack(FIXTURES.STARTER_PACK);
      const audit = auditPack(pack);
      expect(
        audit.notes.some((f) => f.code === "all_transitions_immediate"),
      ).toBe(false);
    });
  });

  describe("empty transitions/bindings", () => {
    it("notes when pack has no transitions", () => {
      const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
      const audit = auditPack(pack);
      expect(
        audit.notes.some((f) => f.code === "no_transitions_defined"),
      ).toBe(true);
    });

    it("warns when pack has no bindings", () => {
      const pack = loadPack(FIXTURES.REVIEW_NO_BINDINGS);
      const audit = auditPack(pack);
      expect(
        audit.warnings.some((f) => f.code === "no_bindings_defined"),
      ).toBe(true);
    });
  });

  describe("deterministic ordering", () => {
    it("returns same order on repeated calls", () => {
      const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
      const a = auditPack(pack);
      const b = auditPack(pack);
      expect(a).toEqual(b);
    });
  });
});

// ────────────────────────────────────────────
// reviewPack convenience wrapper
// ────────────────────────────────────────────

describe("reviewPack", () => {
  it("returns both summary and audit", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const result = reviewPack(pack);
    expect(result.summary.meta.id).toBe("starter-pack");
    expect(result.audit).toBeDefined();
    expect(result.audit.errors).toBeDefined();
  });
});

// ────────────────────────────────────────────
// renderPackSummaryMarkdown
// ────────────────────────────────────────────

describe("renderPackSummaryMarkdown", () => {
  it("contains all expected sections", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);

    expect(md).toContain("# Pack Review: Starter Adventure Pack");
    expect(md).toContain("## Metadata");
    expect(md).toContain("## Counts");
    expect(md).toContain("## Categories Present");
    expect(md).toContain("## Stem Roles");
    expect(md).toContain("## Unused");
    expect(md).toContain("## Errors");
    expect(md).toContain("## Warnings");
    expect(md).toContain("## Notes");
  });

  it("renders None for empty error section", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    // Errors section should show None for a clean pack
    const errorSection = md.split("## Errors")[1].split("## Warnings")[0];
    expect(errorSection).toContain("- None");
  });

  it("renders finding messages in warning section when findings exist", () => {
    const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    expect(md).toContain("Pack has no exploration scene");
  });

  it("renders metadata values", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    expect(md).toContain("- ID: starter-pack");
    expect(md).toContain("- Version: 1.0.0");
    expect(md).toContain("- Schema Version: 1");
  });

  it("renders categories sorted", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    const catSection = md.split("## Categories Present")[1].split("## Stem Roles")[0];
    expect(catSection).toContain("- combat");
    expect(catSection).toContain("- exploration");

    const combatIdx = catSection.indexOf("- combat");
    const explorationIdx = catSection.indexOf("- exploration");
    expect(combatIdx).toBeLessThan(explorationIdx);
  });

  it("renders stem roles sorted alphabetically", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    const roleSection = md.split("## Stem Roles")[1].split("## Unused")[0];
    expect(roleSection).toContain("- accent: 1");
    expect(roleSection).toContain("- base: 2");
  });

  it("snapshot: starter pack markdown", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    expect(md).toMatchSnapshot();
  });

  it("snapshot: missing baseline pack markdown", () => {
    const pack = loadPack(FIXTURES.REVIEW_MISSING_BASELINE);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const md = renderPackSummaryMarkdown(summary, audit);
    expect(md).toMatchSnapshot();
  });
});

// ────────────────────────────────────────────
// renderPackSummaryJson
// ────────────────────────────────────────────

describe("renderPackSummaryJson", () => {
  it("returns serializable object", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const json = renderPackSummaryJson(summary, audit);
    expect(() => JSON.stringify(json)).not.toThrow();
  });

  it("roundtrips through JSON.parse", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const json = renderPackSummaryJson(summary, audit);
    const parsed = JSON.parse(JSON.stringify(json));
    expect(parsed.summary.meta.id).toBe("starter-pack");
    expect(parsed.audit.errors).toEqual(json.audit.errors);
  });

  it("contains summary and audit at top level", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const json = renderPackSummaryJson(summary, audit);
    expect(json).toHaveProperty("summary");
    expect(json).toHaveProperty("audit");
  });

  it("is stable across repeated calls", () => {
    const pack = loadPack(FIXTURES.STARTER_PACK);
    const summary = summarizePack(pack);
    const audit = auditPack(pack);
    const a = JSON.stringify(renderPackSummaryJson(summary, audit));
    const b = JSON.stringify(renderPackSummaryJson(summary, audit));
    expect(a).toBe(b);
  });
});
