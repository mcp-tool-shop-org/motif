import type { SoundtrackPack, RuntimeMusicState } from "@motif-studio/schema";
import { resolveScene } from "@motif-studio/scene-mapper";
import type { SimulationStep, SimulationTrace } from "./types.js";
import { resolveActiveLayers } from "./layers.js";
import { findTransitionRule } from "./transitions.js";

/**
 * Simulate soundtrack behavior across a sequence of runtime states.
 *
 * Produces one step per input state with:
 * - resolved scene and winning binding
 * - active/required stems
 * - transition info when the scene changes
 * - per-step warnings (never throws)
 */
export function simulateStateSequence(
  pack: SoundtrackPack,
  states: RuntimeMusicState[],
): SimulationTrace {
  const steps: SimulationStep[] = [];
  let previousSceneId: string | undefined;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const resolution = resolveScene(pack, state);
    const warnings: string[] = [...resolution.warnings];

    const currentSceneId = resolution.sceneId;

    // Resolve active layers
    let activatedStemIds: string[] = [];
    let requiredStemIds: string[] = [];

    if (currentSceneId) {
      const layers = resolveActiveLayers(pack, currentSceneId);
      activatedStemIds = layers.stemIds;
      requiredStemIds = layers.requiredStemIds;
      warnings.push(...layers.warnings);
    }

    // Resolve transition
    let transitionMode: SimulationStep["transitionMode"];
    let transitionId: string | undefined;
    let fromSceneId: string | undefined;

    if (i > 0) {
      fromSceneId = previousSceneId;

      if (
        previousSceneId != null &&
        currentSceneId != null &&
        previousSceneId !== currentSceneId
      ) {
        const rule = findTransitionRule(pack, previousSceneId, currentSceneId);
        if (rule) {
          transitionMode = rule.mode;
          transitionId = rule.id;
        } else {
          warnings.push(
            `no transition rule from ${previousSceneId} to ${currentSceneId}`,
          );
        }
      }
    }

    steps.push({
      index: i,
      state,
      resolvedSceneId: currentSceneId,
      resolvedSceneName: resolution.sceneName,
      winningBindingId: resolution.winningBindingId,
      fromSceneId,
      transitionMode,
      transitionId,
      activatedStemIds,
      requiredStemIds,
      warnings,
    });

    previousSceneId = currentSceneId;
  }

  return { steps };
}
