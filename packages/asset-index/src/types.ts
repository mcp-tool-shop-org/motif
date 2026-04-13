import type { AudioAsset, Stem, Scene, TriggerBinding, TransitionRule } from "@motif-studio/schema";

// ── Pack index ──

export interface PackIndex {
  assetsById: Map<string, AudioAsset>;
  stemsById: Map<string, Stem>;
  scenesById: Map<string, Scene>;
  bindingsById: Map<string, TriggerBinding>;
  transitionsById: Map<string, TransitionRule>;

  duplicateAssetIds: string[];
  duplicateStemIds: string[];
  duplicateSceneIds: string[];
  duplicateBindingIds: string[];
  duplicateTransitionIds: string[];
}

// ── Integrity finding ──

export type IntegritySeverity = "error" | "warning" | "note";

export type IntegrityEntityType =
  | "asset"
  | "stem"
  | "scene"
  | "binding"
  | "transition"
  | "pack";

export interface IntegrityFinding {
  severity: IntegritySeverity;
  code: string;
  message: string;
  entityType?: IntegrityEntityType;
  entityId?: string;
  path?: string;
}

// ── Integrity audit ──

export interface IntegrityAudit {
  errors: IntegrityFinding[];
  warnings: IntegrityFinding[];
  notes: IntegrityFinding[];
}

// ── Integrity summary ──

export interface IntegritySummary {
  assetCount: number;
  stemCount: number;
  sceneCount: number;
  bindingCount: number;
  transitionCount: number;

  unusedAssetCount: number;
  unusedStemCount: number;
  unreferencedSceneCount: number;

  errorCount: number;
  warningCount: number;
  noteCount: number;
}
