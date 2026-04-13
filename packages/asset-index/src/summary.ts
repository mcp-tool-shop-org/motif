import type { SoundtrackPack } from "@motif/schema";
import type { IntegritySummary } from "./types.js";
import { auditPackIntegrity } from "./audit.js";

/**
 * Produce a summary of pack composition and integrity.
 *
 * Unused entity counts are derived from the audit findings (which already
 * compute unused_asset, unused_stem, and unreferenced_scene) to avoid
 * duplicating the traversal that findUnused* functions perform.
 */
export function summarizePackIntegrity(pack: SoundtrackPack): IntegritySummary {
  const audit = auditPackIntegrity(pack);

  const allFindings = [...audit.errors, ...audit.warnings, ...audit.notes];

  return {
    assetCount: pack.assets.length,
    stemCount: pack.stems.length,
    sceneCount: pack.scenes.length,
    bindingCount: pack.bindings.length,
    transitionCount: pack.transitions.length,

    unusedAssetCount: allFindings.filter((f) => f.code === "unused_asset").length,
    unusedStemCount: allFindings.filter((f) => f.code === "unused_stem").length,
    unreferencedSceneCount: allFindings.filter((f) => f.code === "unreferenced_scene").length,

    errorCount: audit.errors.length,
    warningCount: audit.warnings.length,
    noteCount: audit.notes.length,
  };
}
