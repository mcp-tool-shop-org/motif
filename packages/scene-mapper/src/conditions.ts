import type { TriggerCondition, RuntimeMusicState } from "@motif-studio/schema";
import type { ConditionEvaluation } from "./types.js";

/**
 * Evaluate a single trigger condition against the current runtime state.
 */
export function evaluateCondition(
  condition: TriggerCondition,
  state: RuntimeMusicState,
): ConditionEvaluation {
  const { field, op, value } = condition;
  // Cast to Record for dynamic field access — RuntimeMusicState fields are
  // known at design time but looked up by the string `field` at runtime.
  const actualValue: unknown = (state as Record<string, unknown>)[field];

  // Missing field — always fails
  if (actualValue === undefined) {
    return {
      condition,
      matched: false,
      actualValue: undefined,
      reason: `state field "${field}" is undefined`,
    };
  }

  switch (op) {
    case "eq":
      return result(condition, actualValue, actualValue === value);

    case "neq":
      return result(condition, actualValue, actualValue !== value);

    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return evaluateNumeric(condition, actualValue, op, value);

    case "includes":
      return evaluateIncludes(condition, actualValue, value);

    default:
      return {
        condition,
        matched: false,
        actualValue,
        reason: `unsupported operator "${op as string}"`,
      };
  }
}

function evaluateNumeric(
  condition: TriggerCondition,
  actualValue: unknown,
  op: "gt" | "gte" | "lt" | "lte",
  expected: string | number | boolean,
): ConditionEvaluation {
  if (typeof actualValue !== "number") {
    return {
      condition,
      matched: false,
      actualValue,
      reason: `expected numeric state value for operator ${op}`,
    };
  }
  if (typeof expected !== "number") {
    return {
      condition,
      matched: false,
      actualValue,
      reason: `expected numeric condition value for operator ${op}`,
    };
  }

  let matched: boolean;
  switch (op) {
    case "gt":
      matched = actualValue > expected;
      break;
    case "gte":
      matched = actualValue >= expected;
      break;
    case "lt":
      matched = actualValue < expected;
      break;
    case "lte":
      matched = actualValue <= expected;
      break;
  }

  return result(condition, actualValue, matched);
}

function evaluateIncludes(
  condition: TriggerCondition,
  actualValue: unknown,
  expected: string | number | boolean,
): ConditionEvaluation {
  if (Array.isArray(actualValue)) {
    return result(condition, actualValue, actualValue.includes(expected));
  }
  if (typeof actualValue === "string" && typeof expected === "string") {
    return result(condition, actualValue, actualValue.includes(expected));
  }
  return {
    condition,
    matched: false,
    actualValue,
    reason: `includes requires array or string state value`,
  };
}

function result(
  condition: TriggerCondition,
  actualValue: unknown,
  matched: boolean,
): ConditionEvaluation {
  return { condition, matched, actualValue };
}
