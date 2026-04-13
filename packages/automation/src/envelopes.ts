import type { SectionEnvelope, SectionEnvelopeShape } from "@motif/schema";

/** Create a section envelope. */
export function createEnvelope(
  id: string,
  targetId: string,
  shape: SectionEnvelopeShape,
  durationMs: number,
  position: "entry" | "exit",
  depth?: number,
): SectionEnvelope {
  const env: SectionEnvelope = { id, targetId, shape, durationMs, position };
  if (depth != null) env.depth = depth;
  return env;
}

/**
 * Evaluate an envelope at a given time offset from the envelope's start.
 * Returns a gain/multiplier value 0–1.
 *
 * @param envelope   The envelope to evaluate
 * @param offsetMs   Time since the envelope shape started (0 = envelope start)
 */
export function evaluateEnvelope(
  envelope: SectionEnvelope,
  offsetMs: number,
): number {
  const { shape, durationMs, depth } = envelope;
  const d = depth ?? 1;

  // Guard: zero or negative duration — return target value immediately
  if (durationMs <= 0) {
    // At "completed" state: fade-in→full, fade-out→zero, others→endpoint
    switch (shape) {
      case "fade-in":
      case "swell":
      case "filter-rise":
        return d;
      case "fade-out":
        return 0;
      case "duck":
        return 1;
      case "filter-fall":
        return 0;
    }
  }

  // Clamp progress to 0–1
  const t = Math.max(0, Math.min(1, offsetMs / durationMs));

  switch (shape) {
    case "fade-in":
      return t * d;
    case "fade-out":
      return (1 - t) * d;
    case "swell":
      // Quadratic swell curve
      return t * t * d;
    case "duck":
      // Dip then recover
      return 1 - d * Math.sin(t * Math.PI);
    case "filter-rise":
      // Smooth rise for filter opening
      return t * t * (3 - 2 * t) * d;
    case "filter-fall":
      // Smooth fall for filter closing
      return (1 - t * t * (3 - 2 * t)) * d;
  }
}

/** Get all envelopes for a specific target. */
export function envelopesForTarget(
  envelopes: SectionEnvelope[],
  targetId: string,
): SectionEnvelope[] {
  return envelopes.filter((e) => e.targetId === targetId);
}

/** Get entry envelopes only. */
export function entryEnvelopes(envelopes: SectionEnvelope[]): SectionEnvelope[] {
  return envelopes.filter((e) => e.position === "entry");
}

/** Get exit envelopes only. */
export function exitEnvelopes(envelopes: SectionEnvelope[]): SectionEnvelope[] {
  return envelopes.filter((e) => e.position === "exit");
}
