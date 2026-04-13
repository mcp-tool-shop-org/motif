import type { SoundtrackPack } from "@motif/schema";
import { auditPackIntegrity } from "@motif/asset-index";
import type { PackAudit, AuditFinding } from "./types.js";

/**
 * Run integrity + coverage + quality checks and return a structured audit.
 */
export function auditPack(pack: SoundtrackPack): PackAudit {
  const findings: AuditFinding[] = [];

  // ── A. Integrity findings from asset-index ──
  const integrity = auditPackIntegrity(pack);
  for (const f of [...integrity.errors, ...integrity.warnings, ...integrity.notes]) {
    findings.push({
      severity: f.severity,
      code: f.code,
      message: f.message,
      entityType: f.entityType,
      entityId: f.entityId,
    });
  }

  // ── B. Coverage rules ──
  const categoriesPresent = new Set(pack.scenes.map((s) => s.category));

  // B.1 Missing recommended scene categories
  if (!categoriesPresent.has("exploration")) {
    findings.push({
      severity: "warning",
      code: "missing_exploration_scene",
      message: "Pack has no exploration scene",
      entityType: "pack",
    });
  }
  if (!categoriesPresent.has("combat")) {
    findings.push({
      severity: "warning",
      code: "missing_combat_scene",
      message: "Pack has no combat scene",
      entityType: "pack",
    });
  }
  if (!categoriesPresent.has("victory")) {
    findings.push({
      severity: "warning",
      code: "missing_victory_scene",
      message: "Pack has no victory scene",
      entityType: "pack",
    });
  }
  if (!categoriesPresent.has("safe-zone") && !categoriesPresent.has("aftermath")) {
    findings.push({
      severity: "warning",
      code: "missing_recovery_scene",
      message: "Pack has no safe-zone or aftermath scene",
      entityType: "pack",
    });
  }
  if (!categoriesPresent.has("tension")) {
    findings.push({
      severity: "note",
      code: "missing_tension_scene",
      message: "Pack has no tension scene",
      entityType: "pack",
    });
  }
  if (!categoriesPresent.has("boss")) {
    findings.push({
      severity: "note",
      code: "missing_boss_scene",
      message: "Pack has no boss scene",
      entityType: "pack",
    });
  }

  // B.2 Scene transition coverage
  const transitionTargetIds = new Set(pack.transitions.map((t) => t.toSceneId));

  const combatScenes = pack.scenes.filter((s) => s.category === "combat");
  for (const scene of combatScenes) {
    if (!transitionTargetIds.has(scene.id)) {
      findings.push({
        severity: "warning",
        code: "missing_transition_to_combat",
        message: `No transition leads to combat scene "${scene.id}"`,
        entityType: "scene",
        entityId: scene.id,
      });
    }
  }

  const victoryScenes = pack.scenes.filter((s) => s.category === "victory");
  for (const scene of victoryScenes) {
    if (!transitionTargetIds.has(scene.id)) {
      findings.push({
        severity: "warning",
        code: "missing_transition_to_victory",
        message: `No transition leads to victory scene "${scene.id}"`,
        entityType: "scene",
        entityId: scene.id,
      });
    }
  }

  const bossScenes = pack.scenes.filter((s) => s.category === "boss");
  for (const scene of bossScenes) {
    if (!transitionTargetIds.has(scene.id)) {
      findings.push({
        severity: "warning",
        code: "missing_transition_to_boss",
        message: `No transition leads to boss scene "${scene.id}"`,
        entityType: "scene",
        entityId: scene.id,
      });
    }
  }

  // B.3 Binding coverage
  const boundSceneIds = new Set(pack.bindings.map((b) => b.sceneId));
  const majorCategories = new Set(["exploration", "combat", "victory"]);

  for (const scene of pack.scenes) {
    if (!boundSceneIds.has(scene.id)) {
      if (majorCategories.has(scene.category)) {
        findings.push({
          severity: "warning",
          code: "missing_binding_for_major_scene",
          message: `Major scene "${scene.id}" (${scene.category}) has no binding`,
          entityType: "scene",
          entityId: scene.id,
        });
      } else {
        findings.push({
          severity: "note",
          code: "missing_binding_for_scene",
          message: `Scene "${scene.id}" has no binding`,
          entityType: "scene",
          entityId: scene.id,
        });
      }
    }
  }

  // B.4 Transition mode monoculture
  if (
    pack.transitions.length > 0 &&
    pack.transitions.every((t) => t.mode === "immediate")
  ) {
    findings.push({
      severity: "note",
      code: "all_transitions_immediate",
      message: "All transitions use immediate mode",
      entityType: "pack",
    });
  }

  // B.5 Empty transitions
  if (pack.transitions.length === 0) {
    findings.push({
      severity: "note",
      code: "no_transitions_defined",
      message: "Pack has no transitions defined",
      entityType: "pack",
    });
  }

  // B.6 Empty bindings
  if (pack.bindings.length === 0) {
    findings.push({
      severity: "warning",
      code: "no_bindings_defined",
      message: "Pack has no bindings defined",
      entityType: "pack",
    });
  }

  // ── Sort deterministically ──
  findings.sort(compareFinding);

  return {
    errors: findings.filter((f) => f.severity === "error"),
    warnings: findings.filter((f) => f.severity === "warning"),
    notes: findings.filter((f) => f.severity === "note"),
  };
}

function compareFinding(a: AuditFinding, b: AuditFinding): number {
  const entityOrder = (a.entityType ?? "").localeCompare(b.entityType ?? "");
  if (entityOrder !== 0) return entityOrder;
  const idOrder = (a.entityId ?? "").localeCompare(b.entityId ?? "");
  if (idOrder !== 0) return idOrder;
  return a.code.localeCompare(b.code);
}
