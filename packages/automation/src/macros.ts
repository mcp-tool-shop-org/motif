import type {
  MacroParam,
  MacroMapping,
  MacroState,
  AutomationParam,
} from "@motif/schema";

/** Default macro state — everything at midpoint. */
export function defaultMacroState(): MacroState {
  return { intensity: 0.5, tension: 0.5, brightness: 0.5, space: 0.5 };
}

/** Create a macro mapping. */
export function createMacroMapping(
  id: string,
  macro: MacroParam,
  param: AutomationParam,
  weight: number,
  options?: { targetId?: string; invert?: boolean },
): MacroMapping {
  const m: MacroMapping = { id, macro, param, weight };
  if (options?.targetId) m.targetId = options.targetId;
  if (options?.invert) m.invert = options.invert;
  return m;
}

/**
 * Evaluate macro mappings at a given macro state, returning the effective
 * parameter influence map. Values represent the additive offset (can be
 * positive or negative) that each mapped parameter receives.
 */
export function evaluateMacros(
  state: MacroState,
  mappings: MacroMapping[],
  targetId?: string,
): Map<AutomationParam, number> {
  const result = new Map<AutomationParam, number>();

  for (const m of mappings) {
    // Skip if mapping is scoped to a different target
    if (m.targetId && targetId && m.targetId !== targetId) continue;

    const macroValue = state[m.macro];
    // Map 0–1 macro value to -0.5..+0.5 influence, scaled by weight
    const raw = (macroValue - 0.5) * m.weight;
    const influence = m.invert ? -raw : raw;

    const current = result.get(m.param) ?? 0;
    result.set(m.param, current + influence);
  }

  return result;
}

/**
 * Apply macro influence on top of a base parameter value, clamping to 0–1.
 */
export function applyMacroInfluence(
  baseValue: number,
  influence: number,
): number {
  return Math.max(0, Math.min(1, baseValue + influence));
}

/** Get all mappings for a specific macro. */
export function mappingsForMacro(
  mappings: MacroMapping[],
  macro: MacroParam,
): MacroMapping[] {
  return mappings.filter((m) => m.macro === macro);
}

/** Get all macros that affect a specific parameter. */
export function macrosAffectingParam(
  mappings: MacroMapping[],
  param: AutomationParam,
): MacroParam[] {
  return [...new Set(mappings.filter((m) => m.param === param).map((m) => m.macro))];
}
