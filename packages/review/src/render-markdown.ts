import type { PackSummary, PackAudit, AuditFinding } from "./types.js";

/**
 * Render a human-readable markdown report from summary + audit.
 */
export function renderPackSummaryMarkdown(
  summary: PackSummary,
  audit: PackAudit,
): string {
  const lines: string[] = [];

  // ── Title ──
  lines.push(`# Pack Review: ${summary.meta.name}`);
  lines.push("");

  // ── Metadata ──
  lines.push("## Metadata");
  lines.push(`- ID: ${summary.meta.id}`);
  lines.push(`- Version: ${summary.meta.version}`);
  lines.push(`- Schema Version: ${summary.meta.schemaVersion}`);
  lines.push("");

  // ── Counts ──
  lines.push("## Counts");
  lines.push(`- Assets: ${summary.counts.assets}`);
  lines.push(`- Stems: ${summary.counts.stems}`);
  lines.push(`- Scenes: ${summary.counts.scenes}`);
  lines.push(`- Bindings: ${summary.counts.bindings}`);
  lines.push(`- Transitions: ${summary.counts.transitions}`);
  lines.push("");

  // ── Categories ──
  lines.push("## Categories Present");
  if (summary.categoriesPresent.length === 0) {
    lines.push("- None");
  } else {
    for (const cat of summary.categoriesPresent) {
      lines.push(`- ${cat}`);
    }
  }
  lines.push("");

  // ── Stem roles ──
  lines.push("## Stem Roles");
  const roles = Object.entries(summary.stemRoleDistribution);
  if (roles.length === 0) {
    lines.push("- None");
  } else {
    for (const [role, count] of roles.sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(`- ${role}: ${count}`);
    }
  }
  lines.push("");

  // ── Unused ──
  lines.push("## Unused");
  lines.push(`- Assets: ${summary.unused.assets}`);
  lines.push(`- Stems: ${summary.unused.stems}`);
  lines.push(`- Scenes: ${summary.unused.scenes}`);
  lines.push("");

  // ── Errors ──
  lines.push("## Errors");
  renderFindingSection(lines, audit.errors);
  lines.push("");

  // ── Warnings ──
  lines.push("## Warnings");
  renderFindingSection(lines, audit.warnings);
  lines.push("");

  // ── Notes ──
  lines.push("## Notes");
  renderFindingSection(lines, audit.notes);
  lines.push("");

  return lines.join("\n");
}

function renderFindingSection(lines: string[], findings: AuditFinding[]): void {
  if (findings.length === 0) {
    lines.push("- None");
  } else {
    for (const f of findings) {
      lines.push(`- ${f.message}`);
    }
  }
}
