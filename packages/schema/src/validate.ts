import { SoundtrackPackSchema } from "./schemas.js";
import { normalizeZodIssues } from "./errors.js";
import type { SoundtrackPack, ValidationResult } from "./types.js";

/**
 * Validate unknown input against the SoundtrackPack schema.
 * Returns a ValidationResult with structured issues on failure.
 */
export function validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack> {
  const result = SoundtrackPackSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data as SoundtrackPack, issues: [] };
  }
  return { ok: false, issues: normalizeZodIssues(result.error.issues) };
}
