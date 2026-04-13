// @motif-studio/review — summaries, audits, preview helpers
export * from "./types.js";
export { summarizePack } from "./summary.js";
export { auditPack } from "./audit.js";
export { renderPackSummaryMarkdown } from "./render-markdown.js";
export { renderPackSummaryJson } from "./render-json.js";

import type { SoundtrackPack } from "@motif-studio/schema";
import type { PackSummary, PackAudit } from "./types.js";
import { summarizePack } from "./summary.js";
import { auditPack } from "./audit.js";

/**
 * Convenience wrapper: summarize + audit in a single call.
 */
export function reviewPack(
  pack: SoundtrackPack,
): { summary: PackSummary; audit: PackAudit } {
  return {
    summary: summarizePack(pack),
    audit: auditPack(pack),
  };
}
