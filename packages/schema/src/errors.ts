import type { ZodIssue } from "zod";
import type { ValidationIssue } from "./types.js";

/**
 * Convert a ZodIssue array into stable, human-readable ValidationIssue[].
 * Sorted by path for deterministic output.
 */
export function normalizeZodIssues(zodIssues: ZodIssue[]): ValidationIssue[] {
  return zodIssues
    .map((issue): ValidationIssue => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return {
        path,
        code: issue.code,
        message: issue.message,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
