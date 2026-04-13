"use client";

import { useMemo } from "react";
import { useStudioStore } from "./store";
import { usePreviewStore } from "./preview-store";
import { resolveScene } from "@motif/scene-mapper";
import {
  resolveActiveLayers,
  findTransitionRule,
  simulateStateSequence,
} from "@motif/audio-engine";
import type { SceneResolution } from "@motif/scene-mapper";
import type {
  ActiveLayerPlan,
  SimulationTrace,
} from "@motif/audio-engine";
import type { TransitionRule } from "@motif/schema";

export interface ManualResult {
  resolution: SceneResolution;
  layers: ActiveLayerPlan | null;
  transition: TransitionRule | undefined;
  transitionWarning: string | null;
}

export function useManualPreview(): ManualResult {
  const pack = useStudioStore((s) => s.pack);
  const manualState = usePreviewStore((s) => s.manualState);
  const previousManualState = usePreviewStore((s) => s.previousManualState);

  return useMemo(() => {
    const resolution = resolveScene(pack, manualState);

    let layers: ActiveLayerPlan | null = null;
    if (resolution.sceneId) {
      layers = resolveActiveLayers(pack, resolution.sceneId);
    }

    let transition: TransitionRule | undefined;
    let transitionWarning: string | null = null;

    if (previousManualState) {
      const prevResolution = resolveScene(pack, previousManualState);
      if (
        prevResolution.sceneId &&
        resolution.sceneId &&
        prevResolution.sceneId !== resolution.sceneId
      ) {
        transition = findTransitionRule(
          pack,
          prevResolution.sceneId,
          resolution.sceneId,
        );
        if (!transition) {
          transitionWarning = `no transition rule from ${prevResolution.sceneId} to ${resolution.sceneId}`;
        }
      }
    }

    return { resolution, layers, transition, transitionWarning };
  }, [pack, manualState, previousManualState]);
}

export function useSequencePreview(): SimulationTrace {
  const pack = useStudioStore((s) => s.pack);
  const steps = usePreviewStore((s) => s.sequenceSteps);

  return useMemo(
    () => simulateStateSequence(pack, steps),
    [pack, steps],
  );
}
