// ────────────────────────────────────────────
// @motif-studio/review — review-facing types
// ────────────────────────────────────────────

export interface PackSummary {
  meta: {
    id: string;
    name: string;
    version: string;
    schemaVersion: string;
  };

  counts: {
    assets: number;
    stems: number;
    scenes: number;
    bindings: number;
    transitions: number;
  };

  categoriesPresent: string[];
  stemRoleDistribution: Record<string, number>;

  unused: {
    assets: number;
    stems: number;
    scenes: number;
  };
}

export type AuditSeverity = "error" | "warning" | "note";

export type AuditEntityType =
  | "asset"
  | "stem"
  | "scene"
  | "binding"
  | "transition"
  | "pack";

export interface AuditFinding {
  severity: AuditSeverity;
  code: string;
  message: string;
  entityType?: AuditEntityType;
  entityId?: string;
}

export interface PackAudit {
  errors: AuditFinding[];
  warnings: AuditFinding[];
  notes: AuditFinding[];
}
