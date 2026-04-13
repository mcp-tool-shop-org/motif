import { SoundtrackPackSchema } from "./schemas.js";
import { normalizeZodIssues } from "./errors.js";
import type { SoundtrackPack, ValidationIssue } from "./types.js";

/**
 * Parse unknown input into a SoundtrackPack.
 * Throws on invalid data with a human-readable message.
 */
export function parseSoundtrackPack(input: unknown): SoundtrackPack {
  return SoundtrackPackSchema.parse(input) as SoundtrackPack;
}

/**
 * Safely parse unknown input into a SoundtrackPack.
 * Never throws — returns a discriminated union.
 */
export function safeParseSoundtrackPack(
  input: unknown,
): { success: true; data: SoundtrackPack } | { success: false; errors: ValidationIssue[] } {
  const result = SoundtrackPackSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as SoundtrackPack };
  }
  return { success: false, errors: normalizeZodIssues(result.error.issues) };
}
