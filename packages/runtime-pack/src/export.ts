import type { SoundtrackPack } from "@motif/schema";
import type {
  RuntimeSoundtrackPack,
  RuntimeAudioAsset,
  RuntimeStem,
  RuntimeScene,
  RuntimeSceneLayer,
  RuntimeTriggerBinding,
  RuntimeTransitionRule,
} from "./types.js";

/**
 * Export a validated authoring pack into a clean runtime pack.
 * Strips editor-only fields (notes, name on bindings/transitions, etc.)
 * and preserves original array ordering.
 */
export function exportRuntimePack(
  pack: SoundtrackPack,
): RuntimeSoundtrackPack {
  return {
    meta: {
      id: pack.meta.id,
      name: pack.meta.name,
      version: pack.meta.version,
      schemaVersion: pack.meta.schemaVersion,
      ...(pack.meta.description != null && {
        description: pack.meta.description,
      }),
      ...(pack.meta.author != null && { author: pack.meta.author }),
      ...(pack.meta.tags != null && { tags: [...pack.meta.tags] }),
    },
    assets: pack.assets.map(exportAsset),
    stems: pack.stems.map(exportStem),
    scenes: pack.scenes.map(exportScene),
    bindings: pack.bindings.map(exportBinding),
    transitions: pack.transitions.map(exportTransition),
  };
}

function exportAsset(a: SoundtrackPack["assets"][number]): RuntimeAudioAsset {
  return {
    id: a.id,
    src: a.src,
    kind: a.kind,
    durationMs: a.durationMs,
    ...(a.bpm != null && { bpm: a.bpm }),
    ...(a.key != null && { key: a.key }),
    ...(a.loopStartMs != null && { loopStartMs: a.loopStartMs }),
    ...(a.loopEndMs != null && { loopEndMs: a.loopEndMs }),
    ...(a.tags != null && { tags: [...a.tags] }),
    // notes: stripped
  };
}

function exportStem(s: SoundtrackPack["stems"][number]): RuntimeStem {
  return {
    id: s.id,
    assetId: s.assetId,
    role: s.role,
    ...(s.gainDb != null && { gainDb: s.gainDb }),
    ...(s.mutedByDefault != null && { mutedByDefault: s.mutedByDefault }),
    loop: s.loop,
    ...(s.tags != null && { tags: [...s.tags] }),
  };
}

function exportScene(s: SoundtrackPack["scenes"][number]): RuntimeScene {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    layers: s.layers.map(exportLayer),
    ...(s.fallbackSceneId != null && { fallbackSceneId: s.fallbackSceneId }),
    ...(s.tags != null && { tags: [...s.tags] }),
    // notes: stripped
  };
}

function exportLayer(
  l: SoundtrackPack["scenes"][number]["layers"][number],
): RuntimeSceneLayer {
  return {
    stemId: l.stemId,
    ...(l.required != null && { required: l.required }),
    ...(l.startMode != null && { startMode: l.startMode }),
    ...(l.gainDb != null && { gainDb: l.gainDb }),
  };
}

function exportBinding(
  b: SoundtrackPack["bindings"][number],
): RuntimeTriggerBinding {
  return {
    id: b.id,
    // name: stripped (editor-only)
    sceneId: b.sceneId,
    priority: b.priority,
    ...(b.stopProcessing != null && { stopProcessing: b.stopProcessing }),
    conditions: b.conditions.map((c) => ({
      field: c.field,
      op: c.op,
      value: c.value,
    })),
  };
}

function exportTransition(
  t: SoundtrackPack["transitions"][number],
): RuntimeTransitionRule {
  return {
    id: t.id,
    // name: stripped (editor-only)
    // notes: stripped
    fromSceneId: t.fromSceneId,
    toSceneId: t.toSceneId,
    mode: t.mode,
    ...(t.durationMs != null && { durationMs: t.durationMs }),
    ...(t.stingerAssetId != null && { stingerAssetId: t.stingerAssetId }),
  };
}
