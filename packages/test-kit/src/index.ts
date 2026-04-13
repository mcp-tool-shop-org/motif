// @motif-studio/test-kit — fixtures, sample packs, contract tests
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(join(__dirname, "..", "fixtures"));

export function fixturePath(name: string): string {
  const resolved = resolve(join(fixturesDir, name));
  if (!resolved.startsWith(fixturesDir)) {
    throw new Error(`Path traversal detected: ${name}`);
  }
  return resolved;
}

export function loadFixture(name: string): unknown {
  const raw = readFileSync(fixturePath(name), "utf-8");
  return JSON.parse(raw);
}

// Known fixture names
export const FIXTURES = {
  MINIMAL_PACK: "minimal-pack.json",
  STARTER_PACK: "starter-pack.json",
  INVALID_MISSING_META: "invalid-pack-missing-meta.json",
  INVALID_BAD_TRANSITION: "invalid-pack-bad-transition.json",
  INVALID_EMPTY_SCENE_LAYERS: "invalid-pack-empty-scene-layers.json",
  INVALID_BAD_ASSET_DURATION: "invalid-pack-bad-asset-duration.json",
  INTEGRITY_VALID: "integrity-valid-pack.json",
  INTEGRITY_MISSING_ASSET_REF: "integrity-missing-asset-ref.json",
  INTEGRITY_MISSING_STEM_REF: "integrity-missing-stem-ref.json",
  INTEGRITY_MISSING_SCENE_REF: "integrity-missing-scene-ref.json",
  INTEGRITY_DUPLICATE_IDS: "integrity-duplicate-ids.json",
  INTEGRITY_SELF_REFERENCE: "integrity-self-reference-pack.json",
  INTEGRITY_UNUSED_ENTITIES: "integrity-unused-entities.json",
  RESOLUTION_BASIC: "resolution-basic-pack.json",
  RESOLUTION_PRIORITY: "resolution-priority-pack.json",
  RESOLUTION_TIEBREAK: "resolution-tiebreak-pack.json",
  RESOLUTION_INCLUDES: "resolution-includes-pack.json",
  RESOLUTION_MISSING_SCENE_WINNER: "resolution-missing-scene-winner.json",
  RESOLUTION_NUMERIC_OPS: "resolution-numeric-ops-pack.json",
  SIMULATION_BASIC: "simulation-basic-pack.json",
  SIMULATION_COMBAT_ESCALATION: "simulation-combat-escalation-pack.json",
  SIMULATION_MISSING_TRANSITION: "simulation-missing-transition-pack.json",
  SIMULATION_MISSING_STEM: "simulation-missing-stem-pack.json",
  SIMULATION_BASIC_SEQUENCE: "simulation-basic-sequence.json",
  SIMULATION_ESCALATION_SEQUENCE: "simulation-escalation-sequence.json",
  REVIEW_MISSING_BASELINE: "review-missing-baseline-pack.json",
  REVIEW_NO_BINDINGS: "review-no-bindings-pack.json",
  REVIEW_IMMEDIATE_ONLY: "review-immediate-only-pack.json",
  RUNTIME_INVALID_MISSING_META: "runtime-invalid-missing-meta.json",
  RUNTIME_INVALID_BAD_TRANSITION: "runtime-invalid-bad-transition.json",
  RUNTIME_INVALID_EMPTY_LAYERS: "runtime-invalid-empty-layers.json",
} as const;
