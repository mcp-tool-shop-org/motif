// ────────────────────────────────────────────
// Per-stem export — plan and manifest generation
// ────────────────────────────────────────────

import type { SoundtrackPack, StemRole } from "@motif-studio/schema";
import { resolveActiveLayers } from "@motif-studio/audio-engine";
import type {
  ExportMode,
  StemExportEntry,
  StemExportManifest,
  StemExportRole,
  WavBitDepth,
  WavSampleRate,
} from "./mixer-types.js";

/**
 * Map stem roles (from schema) to export roles (for engine consumption).
 */
export function stemRoleToExportRole(role: StemRole): StemExportRole {
  switch (role) {
    case "base":
      return "pad";
    case "danger":
    case "combat":
    case "boss":
      return "melody";
    case "recovery":
      return "pad";
    case "mystery":
      return "fx";
    case "faction":
      return "accent";
    case "accent":
      return "accent";
    default:
      return "pad";
  }
}

/**
 * Generate a deterministic file path for a stem export.
 * Convention: stems/{sceneId}_{stemId}.wav
 */
export function stemExportPath(sceneId: string, stemId: string): string {
  // Sanitize IDs for filesystem safety
  const safeScene = sceneId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeStem = stemId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `stems/${safeScene}_${safeStem}.wav`;
}

/**
 * Build a stem export manifest for a scene.
 * This describes what files need to be rendered — the actual rendering
 * happens in the CueRenderer using the manifest as a guide.
 */
export function buildStemExportManifest(
  pack: SoundtrackPack,
  sceneId: string,
  options?: {
    mode?: ExportMode;
    sampleRate?: WavSampleRate;
    bitDepth?: WavBitDepth;
    channels?: number;
  },
): StemExportManifest {
  const scene = pack.scenes.find((s) => s.id === sceneId);
  if (!scene) throw new Error(`Scene not found: ${sceneId}`);

  const mode = options?.mode ?? "both";
  const sampleRate = options?.sampleRate ?? 48000;
  const bitDepth = options?.bitDepth ?? 24;
  const channels = options?.channels ?? 2;

  // Resolve active layers for this scene
  const plan = resolveActiveLayers(pack, sceneId);
  const stemsById = new Map(pack.stems.map((s) => [s.id, s]));

  const stems: StemExportEntry[] = [];

  for (const stemId of plan.stemIds) {
    const stem = stemsById.get(stemId);
    if (!stem) continue;

    stems.push({
      stemId: stem.id,
      stemName: stem.name,
      filePath: stemExportPath(sceneId, stem.id),
      role: stemRoleToExportRole(stem.role),
      defaultGainDb: stem.gainDb ?? 0,
      defaultPan: 0, // Default center — can be overridden by mixer state
      sceneId,
    });
  }

  const safeScene = sceneId.replace(/[^a-zA-Z0-9_-]/g, "_");

  return {
    sceneId,
    sceneName: scene.name,
    mode,
    mixedFilePath:
      mode === "mixed" || mode === "both"
        ? `mixed/${safeScene}.wav`
        : undefined,
    stems,
    sampleRate,
    bitDepth,
    channels,
  };
}

/**
 * Build stem export manifests for ALL scenes in a pack.
 */
export function buildAllStemManifests(
  pack: SoundtrackPack,
  options?: {
    mode?: ExportMode;
    sampleRate?: WavSampleRate;
    bitDepth?: WavBitDepth;
    channels?: number;
  },
): StemExportManifest[] {
  return pack.scenes.map((scene) =>
    buildStemExportManifest(pack, scene.id, options),
  );
}
