import type { RuntimeMusicState, TransitionMode } from "@motif-studio/schema";

// ── Active layer plan ──

export interface ActiveLayerPlan {
  sceneId: string;
  sceneName?: string;
  stemIds: string[];
  requiredStemIds: string[];
  warnings: string[];
}

// ── Simulation step ──

export interface SimulationStep {
  index: number;
  state: RuntimeMusicState;

  resolvedSceneId?: string;
  resolvedSceneName?: string;
  winningBindingId?: string;

  fromSceneId?: string;
  transitionMode?: TransitionMode;
  transitionId?: string;

  activatedStemIds: string[];
  requiredStemIds: string[];

  warnings: string[];
}

// ── Simulation trace ──

export interface SimulationTrace {
  steps: SimulationStep[];
}
