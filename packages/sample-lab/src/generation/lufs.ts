import { GenerationError } from "./errors.js";

const LUFS_LINE =
  /Integrated Loudness:\s*([+-]?\d+(?:\.\d+)?)\s*LUFS/i;

/** Parse a SaveText loudness manifest (`Integrated Loudness: -12.32 LUFS`). */
export function parseIntegratedLufs(text: string): number {
  const match = text.match(LUFS_LINE);
  if (!match) {
    throw new GenerationError(
      "LUFS_PARSE",
      `No integrated LUFS line in manifest: ${text.trim().slice(0, 120)}`,
    );
  }
  return Number(match[1]);
}
