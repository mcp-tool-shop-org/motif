import type { SoundtrackPack, RuntimeMusicState } from "@motif/schema";
import type { BindingEvaluation, SceneResolution } from "./types.js";
import { evaluateBinding } from "./bindings.js";

/**
 * Evaluate all bindings in a pack against runtime state.
 * Returns evaluations in original binding order.
 */
export function evaluateBindings(
  pack: SoundtrackPack,
  state: RuntimeMusicState,
): BindingEvaluation[] {
  return pack.bindings.map((b) => evaluateBinding(b, state));
}

/**
 * Resolve the winning scene deterministically.
 *
 * 1. Evaluate all bindings
 * 2. Collect matched bindings
 * 3. Sort by higher priority first; original pack order as tie-breaker
 * 4. First matched binding wins
 */
export function resolveScene(
  pack: SoundtrackPack,
  state: RuntimeMusicState,
): SceneResolution {
  const evaluations = evaluateBindings(pack, state);
  const warnings: string[] = [];

  const matched: { eval: BindingEvaluation; index: number }[] = [];
  const matchedBindingIds: string[] = [];
  const rejectedBindingIds: string[] = [];

  for (let i = 0; i < evaluations.length; i++) {
    const ev = evaluations[i];
    if (ev.matched) {
      matched.push({ eval: ev, index: i });
      matchedBindingIds.push(ev.bindingId);
      if (ev.stopProcessing) break;
    } else {
      rejectedBindingIds.push(ev.bindingId);
    }
  }

  if (matched.length === 0) {
    return {
      matchedBindingIds,
      rejectedBindingIds,
      warnings,
      evaluations,
    };
  }

  // Sort: higher priority first, pack order as tie-breaker
  matched.sort((a, b) => {
    const pDiff = b.eval.priority - a.eval.priority;
    if (pDiff !== 0) return pDiff;
    return a.index - b.index;
  });

  const winner = matched[0].eval;
  const scene = pack.scenes.find((s) => s.id === winner.sceneId);

  if (!scene) {
    warnings.push(
      `winning binding references missing scene: ${winner.sceneId}`,
    );
    return {
      matchedBindingIds,
      rejectedBindingIds,
      winningBindingId: winner.bindingId,
      warnings,
      evaluations,
    };
  }

  return {
    sceneId: scene.id,
    sceneName: scene.name,
    matchedBindingIds,
    rejectedBindingIds,
    winningBindingId: winner.bindingId,
    warnings,
    evaluations,
  };
}
