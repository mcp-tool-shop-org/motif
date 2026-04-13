import type { TriggerBinding, RuntimeMusicState } from "@motif-studio/schema";
import type { BindingEvaluation } from "./types.js";
import { evaluateCondition } from "./conditions.js";

/**
 * Evaluate a single binding against the current runtime state.
 * A binding matches only if ALL conditions match.
 */
export function evaluateBinding(
  binding: TriggerBinding,
  state: RuntimeMusicState,
): BindingEvaluation {
  const conditionEvaluations = binding.conditions.map((c) =>
    evaluateCondition(c, state),
  );
  const matched = conditionEvaluations.every((e) => e.matched);

  return {
    bindingId: binding.id,
    bindingName: binding.name,
    sceneId: binding.sceneId,
    priority: binding.priority,
    matched,
    stopProcessing: binding.stopProcessing ?? false,
    conditionEvaluations,
  };
}
