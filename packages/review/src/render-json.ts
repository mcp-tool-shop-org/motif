import type { PackSummary, PackAudit } from "./types.js";

/**
 * Render a plain serializable JSON review object.
 *
 * This is a pass-through that returns the summary and audit as-is.
 * It exists for API symmetry with `renderPackSummaryMarkdown` so callers
 * can choose an output format without special-casing.
 */
export function renderPackSummaryJson(
  summary: PackSummary,
  audit: PackAudit,
): { summary: PackSummary; audit: PackAudit } {
  return { summary, audit };
}
