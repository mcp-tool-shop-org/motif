import type { SoundtrackPack, TransitionRule } from "@motif-studio/schema";

/**
 * Find the first exact transition rule between two scenes.
 *
 * Returns undefined when:
 * - fromSceneId or toSceneId is undefined
 * - fromSceneId === toSceneId (same-scene, no transition needed)
 * - no matching rule exists
 *
 * If multiple rules match, first in pack order wins.
 */
export function findTransitionRule(
  pack: SoundtrackPack,
  fromSceneId: string | undefined,
  toSceneId: string | undefined,
): TransitionRule | undefined {
  if (fromSceneId == null || toSceneId == null) return undefined;
  if (fromSceneId === toSceneId) return undefined;

  return pack.transitions.find(
    (t) => t.fromSceneId === fromSceneId && t.toSceneId === toSceneId,
  );
}
