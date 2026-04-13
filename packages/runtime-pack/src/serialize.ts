import type { SoundtrackPack } from "@motif-studio/schema";
import type { RuntimeSoundtrackPack } from "./types.js";
import { exportRuntimePack } from "./export.js";
import { parseRuntimePack } from "./parse.js";

/**
 * FNV-1a hash producing a hex string.
 * Synchronous, browser-safe, no crypto dependency.
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5; // FNV offset basis (32-bit)
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime (32-bit)
  }
  // Convert to unsigned 32-bit then to hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Serialize a RuntimeSoundtrackPack to deterministic JSON.
 * Uses two-space indentation and a trailing newline.
 * Stamps contentHash (FNV-1a of content) and exportedAt (ISO timestamp) on meta.
 */
export function serializeRuntimePack(pack: RuntimeSoundtrackPack): string {
  // Produce JSON without hash/timestamp first for deterministic hashing
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { contentHash: _ch, exportedAt: _ea, ...metaForHash } = pack.meta;
  const packForHash = { ...pack, meta: metaForHash };
  const bodyJson = JSON.stringify(packForHash, null, 2);

  const hash = fnv1aHash(bodyJson);
  const stamped: RuntimeSoundtrackPack = {
    ...pack,
    meta: {
      ...pack.meta,
      contentHash: hash,
      exportedAt: new Date().toISOString(),
    },
  };
  return JSON.stringify(stamped, null, 2) + "\n";
}

/**
 * Full round-trip: export → serialize → parse.
 * Useful for verifying stability and downstream demos.
 *
 * Note: `serialized` and `parsed` include contentHash and exportedAt
 * stamps added during serialization. The `exported` pack returned here
 * is the raw export (before stamps). Compare `parsed` to the JSON-parsed
 * `serialized` for full fidelity checks.
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
