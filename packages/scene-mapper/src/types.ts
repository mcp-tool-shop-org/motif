import type { TriggerCondition } from "@motif-studio/schema";

// ── Condition evaluation ──

export interface ConditionEvaluation {
  condition: TriggerCondition;
  matched: boolean;
  actualValue: unknown;
  reason?: string;
}

// ── Binding evaluation ──

export interface BindingEvaluation {
  bindingId: string;
  bindingName: string;
  sceneId: string;
  priority: number;
  matched: boolean;
  stopProcessing: boolean;
  conditionEvaluations: ConditionEvaluation[];
}

// ── Scene resolution ──

export interface SceneResolution {
  sceneId?: string;
  sceneName?: string;
  matchedBindingIds: string[];
  rejectedBindingIds: string[];
  winningBindingId?: string;
  warnings: string[];
  evaluations: BindingEvaluation[];
}
