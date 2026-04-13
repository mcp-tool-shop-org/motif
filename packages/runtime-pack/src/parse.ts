import type { ZodIssue } from "zod";
import { RuntimeSoundtrackPackSchema } from "./schemas.js";
import type { RuntimeSoundtrackPack } from "./types.js";

export interface RuntimeValidationIssue {
  path: string;
  code: string;
  message: string;
}

/**
 * Parse unknown input into a RuntimeSoundtrackPack.
 * Throws on invalid data with a human-readable message.
 */
export function parseRuntimePack(input: unknown): RuntimeSoundtrackPack {
  return RuntimeSoundtrackPackSchema.parse(input) as RuntimeSoundtrackPack;
}

/**
 * Safely parse unknown input into a RuntimeSoundtrackPack.
 * Never throws — returns a discriminated union.
 */
export function safeParseRuntimePack(
  input: unknown,
):
  | { success: true; data: RuntimeSoundtrackPack }
  | { success: false; issues: RuntimeValidationIssue[] } {
  const result = RuntimeSoundtrackPackSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as RuntimeSoundtrackPack };
  }
  return { success: false, issues: normalizeIssues(result.error.issues) };
}

/**
 * Validate unknown input and return a structured result.
 */
export function validateRuntimePack(
  input: unknown,
): {
  ok: boolean;
  data?: RuntimeSoundtrackPack;
  issues: RuntimeValidationIssue[];
} {
  const result = safeParseRuntimePack(input);
  if (result.success) {
    return { ok: true, data: result.data, issues: [] };
  }
  return { ok: false, issues: result.issues };
}

function normalizeIssues(zodIssues: ZodIssue[]): RuntimeValidationIssue[] {
  return zodIssues
    .map(
      (issue): RuntimeValidationIssue => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
        code: issue.code,
        message: issue.message,
      }),
    )
    .sort((a, b) => a.path.localeCompare(b.path));
}
