import type { SoundtrackPack } from "@motif/schema";
import type { RuntimeSoundtrackPack } from "./types.js";
import { exportRuntimePack } from "./export.js";
import { parseRuntimePack } from "./parse.js";

/**
 * Serialize a RuntimeSoundtrackPack to deterministic JSON.
 * Uses two-space indentation and a trailing newline.
 */
export function serializeRuntimePack(pack: RuntimeSoundtrackPack): string {
  return JSON.stringify(pack, null, 2) + "\n";
}

/**
 * Full round-trip: export → serialize → parse.
 * Useful for verifying stability and downstream demos.
 */
export function roundTripRuntimePack(pack: SoundtrackPack): {
  exported: RuntimeSoundtrackPack;
  serialized: string;
  parsed: RuntimeSoundtrackPack;
} {
  const exported = exportRuntimePack(pack);
  const serialized = serializeRuntimePack(exported);
  const parsed = parseRuntimePack(JSON.parse(serialized));
  return { exported, serialized, parsed };
}
