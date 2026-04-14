// ────────────────────────────────────────────
// Runtime pack validation — structural + referential integrity
// ────────────────────────────────────────────

import type { RuntimeSoundtrackPack } from "./types.js";

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    assets: number;
    stems: number;
    scenes: number;
    bindings: number;
    transitions: number;
    stingers: number;
  };
}

/**
 * Validate a runtime pack for structural and referential integrity.
 * This is the gate that engine consumers should run before loading a pack.
 */
export function auditRuntimePack(
  pack: RuntimeSoundtrackPack,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // ── Meta ──
  if (!pack.meta?.id) {
    issues.push({ code: "META_MISSING_ID", severity: "error", message: "Pack meta.id is required" });
  }
  if (!pack.meta?.schemaVersion) {
    issues.push({ code: "META_MISSING_VERSION", severity: "error", message: "Pack meta.schemaVersion is required" });
  }
  if (pack.meta?.schemaVersion && pack.meta.schemaVersion !== "1") {
    issues.push({
      code: "META_UNKNOWN_SCHEMA",
      severity: "error",
      message: `Unknown schemaVersion "${pack.meta.schemaVersion}", expected "1"`,
    });
  }

  // ── Build index maps ──
  const assetIds = new Set(pack.assets?.map((a) => a.id) ?? []);
  const stemIds = new Set(pack.stems?.map((s) => s.id) ?? []);
  const sceneIds = new Set(pack.scenes?.map((s) => s.id) ?? []);

  // ── Duplicate ID checks ──
  checkDuplicateIds(pack.assets ?? [], "asset", issues);
  checkDuplicateIds(pack.stems ?? [], "stem", issues);
  checkDuplicateIds(pack.scenes ?? [], "scene", issues);
  checkDuplicateIds(pack.bindings ?? [], "binding", issues);
  checkDuplicateIds(pack.transitions ?? [], "transition", issues);

  // ── Stem → Asset refs ──
  for (const stem of pack.stems ?? []) {
    if (!assetIds.has(stem.assetId)) {
      issues.push({
        code: "STEM_MISSING_ASSET",
        severity: "error",
        message: `Stem "${stem.id}" references missing asset "${stem.assetId}"`,
        path: `stems/${stem.id}`,
      });
    }
  }

  // ── Scene → Stem refs ──
  for (const scene of pack.scenes ?? []) {
    if (scene.layers.length === 0) {
      issues.push({
        code: "SCENE_NO_LAYERS",
        severity: "warning",
        message: `Scene "${scene.id}" has no layers`,
        path: `scenes/${scene.id}`,
      });
    }
    for (const layer of scene.layers) {
      if (!stemIds.has(layer.stemId)) {
        issues.push({
          code: "SCENE_MISSING_STEM",
          severity: "error",
          message: `Scene "${scene.id}" layer references missing stem "${layer.stemId}"`,
          path: `scenes/${scene.id}/layers`,
        });
      }
    }
    if (scene.fallbackSceneId && !sceneIds.has(scene.fallbackSceneId)) {
      issues.push({
        code: "SCENE_MISSING_FALLBACK",
        severity: "error",
        message: `Scene "${scene.id}" fallback references missing scene "${scene.fallbackSceneId}"`,
        path: `scenes/${scene.id}`,
      });
    }
  }

  // ── Binding → Scene refs ──
  for (const binding of pack.bindings ?? []) {
    if (!sceneIds.has(binding.sceneId)) {
      issues.push({
        code: "BINDING_MISSING_SCENE",
        severity: "error",
        message: `Binding "${binding.id}" references missing scene "${binding.sceneId}"`,
        path: `bindings/${binding.id}`,
      });
    }
    if (binding.conditions.length === 0) {
      issues.push({
        code: "BINDING_NO_CONDITIONS",
        severity: "warning",
        message: `Binding "${binding.id}" has no conditions (always matches)`,
        path: `bindings/${binding.id}`,
      });
    }
  }

  // ── Transition → Scene refs ──
  for (const transition of pack.transitions ?? []) {
    if (!sceneIds.has(transition.fromSceneId)) {
      issues.push({
        code: "TRANSITION_MISSING_FROM",
        severity: "error",
        message: `Transition "${transition.id}" references missing fromScene "${transition.fromSceneId}"`,
        path: `transitions/${transition.id}`,
      });
    }
    if (!sceneIds.has(transition.toSceneId)) {
      issues.push({
        code: "TRANSITION_MISSING_TO",
        severity: "error",
        message: `Transition "${transition.id}" references missing toScene "${transition.toSceneId}"`,
        path: `transitions/${transition.id}`,
      });
    }
    if (transition.mode === "stinger-then-switch" && transition.stingerAssetId) {
      if (!assetIds.has(transition.stingerAssetId)) {
        issues.push({
          code: "TRANSITION_MISSING_STINGER",
          severity: "error",
          message: `Transition "${transition.id}" stinger references missing asset "${transition.stingerAssetId}"`,
          path: `transitions/${transition.id}`,
        });
      }
    }
  }

  // ── Stinger refs (if present in extended runtime pack) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stingerCount = Array.isArray((pack as any).stingers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (pack as any).stingers.length
    : 0;

  const errors = issues.filter((i) => i.severity === "error");

  return {
    valid: errors.length === 0,
    issues,
    stats: {
      assets: pack.assets?.length ?? 0,
      stems: pack.stems?.length ?? 0,
      scenes: pack.scenes?.length ?? 0,
      bindings: pack.bindings?.length ?? 0,
      transitions: pack.transitions?.length ?? 0,
      stingers: stingerCount,
    },
  };
}

function checkDuplicateIds(
  items: { id: string }[],
  entityType: string,
  issues: ValidationIssue[],
): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      issues.push({
        code: `DUPLICATE_${entityType.toUpperCase()}_ID`,
        severity: "error",
        message: `Duplicate ${entityType} ID: "${item.id}"`,
        path: `${entityType}s/${item.id}`,
      });
    }
    seen.add(item.id);
  }
}
