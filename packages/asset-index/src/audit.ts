import type { SoundtrackPack } from "@motif-studio/schema";
import type { IntegrityAudit, IntegrityFinding } from "./types.js";
import { buildPackIndex } from "./index-pack.js";

/**
 * Run all integrity checks on a pack and return categorized findings.
 */
export function auditPackIntegrity(pack: SoundtrackPack): IntegrityAudit {
  const index = buildPackIndex(pack);
  const findings: IntegrityFinding[] = [];

  // ── Duplicate ids ──

  for (const id of index.duplicateAssetIds) {
    findings.push({
      severity: "error",
      code: "duplicate_asset_id",
      message: `Duplicate asset id: "${id}"`,
      entityType: "asset",
      entityId: id,
    });
  }
  for (const id of index.duplicateStemIds) {
    findings.push({
      severity: "error",
      code: "duplicate_stem_id",
      message: `Duplicate stem id: "${id}"`,
      entityType: "stem",
      entityId: id,
    });
  }
  for (const id of index.duplicateSceneIds) {
    findings.push({
      severity: "error",
      code: "duplicate_scene_id",
      message: `Duplicate scene id: "${id}"`,
      entityType: "scene",
      entityId: id,
    });
  }
  for (const id of index.duplicateBindingIds) {
    findings.push({
      severity: "error",
      code: "duplicate_binding_id",
      message: `Duplicate binding id: "${id}"`,
      entityType: "binding",
      entityId: id,
    });
  }
  for (const id of index.duplicateTransitionIds) {
    findings.push({
      severity: "error",
      code: "duplicate_transition_id",
      message: `Duplicate transition id: "${id}"`,
      entityType: "transition",
      entityId: id,
    });
  }

  // ── Missing asset refs ──

  for (let i = 0; i < pack.stems.length; i++) {
    const stem = pack.stems[i];
    if (!index.assetsById.has(stem.assetId)) {
      findings.push({
        severity: "error",
        code: "missing_asset_ref",
        message: `Stem "${stem.id}" references nonexistent asset "${stem.assetId}"`,
        entityType: "stem",
        entityId: stem.id,
        path: `stems[${i}].assetId`,
      });
    }
  }

  for (let i = 0; i < pack.transitions.length; i++) {
    const tr = pack.transitions[i];
    if (tr.stingerAssetId && !index.assetsById.has(tr.stingerAssetId)) {
      findings.push({
        severity: "error",
        code: "missing_stinger_asset_ref",
        message: `Transition "${tr.id}" references nonexistent stinger asset "${tr.stingerAssetId}"`,
        entityType: "transition",
        entityId: tr.id,
        path: `transitions[${i}].stingerAssetId`,
      });
    }
  }

  // ── Missing stem refs ──

  for (let i = 0; i < pack.scenes.length; i++) {
    const scene = pack.scenes[i];
    for (let j = 0; j < scene.layers.length; j++) {
      const layer = scene.layers[j];
      if (!index.stemsById.has(layer.stemId)) {
        findings.push({
          severity: "error",
          code: "missing_stem_ref",
          message: `Scene "${scene.id}" layer references nonexistent stem "${layer.stemId}"`,
          entityType: "scene",
          entityId: scene.id,
          path: `scenes[${i}].layers[${j}].stemId`,
        });
      }
    }
  }

  // ── Missing scene refs ──

  for (let i = 0; i < pack.scenes.length; i++) {
    const scene = pack.scenes[i];
    if (scene.fallbackSceneId != null) {
      if (!index.scenesById.has(scene.fallbackSceneId)) {
        findings.push({
          severity: "error",
          code: "missing_fallback_scene_ref",
          message: `Scene "${scene.id}" fallback references nonexistent scene "${scene.fallbackSceneId}"`,
          entityType: "scene",
          entityId: scene.id,
          path: `scenes[${i}].fallbackSceneId`,
        });
      }
    }
  }

  for (let i = 0; i < pack.bindings.length; i++) {
    const binding = pack.bindings[i];
    if (!index.scenesById.has(binding.sceneId)) {
      findings.push({
        severity: "error",
        code: "missing_binding_scene_ref",
        message: `Binding "${binding.id}" references nonexistent scene "${binding.sceneId}"`,
        entityType: "binding",
        entityId: binding.id,
        path: `bindings[${i}].sceneId`,
      });
    }
  }

  for (let i = 0; i < pack.transitions.length; i++) {
    const tr = pack.transitions[i];
    if (!index.scenesById.has(tr.fromSceneId)) {
      findings.push({
        severity: "error",
        code: "missing_transition_from_scene_ref",
        message: `Transition "${tr.id}" references nonexistent from-scene "${tr.fromSceneId}"`,
        entityType: "transition",
        entityId: tr.id,
        path: `transitions[${i}].fromSceneId`,
      });
    }
    if (!index.scenesById.has(tr.toSceneId)) {
      findings.push({
        severity: "error",
        code: "missing_transition_to_scene_ref",
        message: `Transition "${tr.id}" references nonexistent to-scene "${tr.toSceneId}"`,
        entityType: "transition",
        entityId: tr.id,
        path: `transitions[${i}].toSceneId`,
      });
    }
  }

  // ── Self-reference warnings ──

  for (let i = 0; i < pack.scenes.length; i++) {
    const scene = pack.scenes[i];
    if (scene.fallbackSceneId === scene.id) {
      findings.push({
        severity: "warning",
        code: "scene_self_fallback",
        message: `Scene "${scene.id}" falls back to itself`,
        entityType: "scene",
        entityId: scene.id,
        path: `scenes[${i}].fallbackSceneId`,
      });
    }
  }

  for (let i = 0; i < pack.transitions.length; i++) {
    const tr = pack.transitions[i];
    if (tr.fromSceneId === tr.toSceneId) {
      findings.push({
        severity: "warning",
        code: "transition_self_reference",
        message: `Transition "${tr.id}" goes from scene "${tr.fromSceneId}" to itself`,
        entityType: "transition",
        entityId: tr.id,
        path: `transitions[${i}].fromSceneId`,
      });
    }
  }

  // ── Unused entity warnings/notes ──

  const usedAssetIds = new Set<string>();
  for (const stem of pack.stems) usedAssetIds.add(stem.assetId);
  for (const tr of pack.transitions) {
    if (tr.stingerAssetId) usedAssetIds.add(tr.stingerAssetId);
  }
  for (const asset of pack.assets) {
    if (!usedAssetIds.has(asset.id)) {
      findings.push({
        severity: "warning",
        code: "unused_asset",
        message: `Asset "${asset.id}" is not referenced by any stem or transition`,
        entityType: "asset",
        entityId: asset.id,
      });
    }
  }

  const usedStemIds = new Set<string>();
  for (const scene of pack.scenes) {
    for (const layer of scene.layers) usedStemIds.add(layer.stemId);
  }
  for (const stem of pack.stems) {
    if (!usedStemIds.has(stem.id)) {
      findings.push({
        severity: "warning",
        code: "unused_stem",
        message: `Stem "${stem.id}" is not referenced by any scene layer`,
        entityType: "stem",
        entityId: stem.id,
      });
    }
  }

  const referencedSceneIds = new Set<string>();
  for (const b of pack.bindings) referencedSceneIds.add(b.sceneId);
  for (const s of pack.scenes) {
    if (s.fallbackSceneId) referencedSceneIds.add(s.fallbackSceneId);
  }
  for (const t of pack.transitions) {
    referencedSceneIds.add(t.fromSceneId);
    referencedSceneIds.add(t.toSceneId);
  }
  for (const scene of pack.scenes) {
    if (!referencedSceneIds.has(scene.id)) {
      findings.push({
        severity: "note",
        code: "unreferenced_scene",
        message: `Scene "${scene.id}" is not referenced by any binding, fallback, or transition`,
        entityType: "scene",
        entityId: scene.id,
      });
    }
  }

  // ── Sort findings deterministically ──

  findings.sort(compareFinding);

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");
  const notes = findings.filter((f) => f.severity === "note");

  return { errors, warnings, notes };
}

function compareFinding(a: IntegrityFinding, b: IntegrityFinding): number {
  const entityOrder = (a.entityType ?? "").localeCompare(b.entityType ?? "");
  if (entityOrder !== 0) return entityOrder;
  const idOrder = (a.entityId ?? "").localeCompare(b.entityId ?? "");
  if (idOrder !== 0) return idOrder;
  const pathOrder = (a.path ?? "").localeCompare(b.path ?? "");
  if (pathOrder !== 0) return pathOrder;
  return a.code.localeCompare(b.code);
}
