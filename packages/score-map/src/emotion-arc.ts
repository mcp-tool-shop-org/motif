import type { EmotionTag, Scene, Cue, CueFamily } from "@motif-studio/schema";

/**
 * An arc point: a named entity with an emotion tag and ordering context.
 */
export interface ArcPoint {
  id: string;
  name: string;
  emotion: EmotionTag;
  /** Source entity type */
  source: "scene" | "cue" | "cue-family";
  /** Order index (for plotting on the arc) */
  order: number;
}

/**
 * The full emotional arc of a score, ordered by composition sequence.
 */
export interface EmotionArc {
  points: ArcPoint[];
  /** Average valence across all points */
  avgValence: number;
  /** Average arousal across all points */
  avgArousal: number;
  /** Maximum emotional distance between consecutive points */
  maxDelta: number;
  /** Whether the arc trends positive (valence increases over time) */
  trendsPositive: boolean;
}

/**
 * Extract emotion-tagged scenes into ordered arc points.
 * Only includes scenes that have an emotion tag.
 */
export function scenesToArcPoints(scenes: Scene[]): ArcPoint[] {
  return scenes
    .filter((s): s is Scene & { emotion: EmotionTag } => s.emotion != null)
    .map((s, i) => ({
      id: s.id,
      name: s.name,
      emotion: s.emotion,
      source: "scene" as const,
      order: i,
    }));
}

/**
 * Extract emotion-tagged cues into ordered arc points.
 */
export function cuesToArcPoints(cues: Cue[]): ArcPoint[] {
  return cues
    .filter((c): c is Cue & { emotion: EmotionTag } => c.emotion != null)
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      emotion: c.emotion,
      source: "cue" as const,
      order: i,
    }));
}

/**
 * Extract emotion-tagged cue families into ordered arc points.
 */
export function cueFamiliesToArcPoints(families: CueFamily[]): ArcPoint[] {
  return families
    .filter(
      (f): f is CueFamily & { emotion: EmotionTag } => f.emotion != null,
    )
    .map((f, i) => ({
      id: f.id,
      name: f.name,
      emotion: f.emotion,
      source: "cue-family" as const,
      order: i,
    }));
}

/**
 * Calculate the Euclidean distance between two emotion points
 * in the valence-arousal space.
 */
export function emotionDistance(a: EmotionTag, b: EmotionTag): number {
  const dv = b.valence - a.valence;
  const da = b.arousal - a.arousal;
  return Math.sqrt(dv * dv + da * da);
}

/**
 * Build the full emotion arc from ordered arc points.
 * Computes statistics: average valence/arousal, max delta, trend direction.
 */
export function buildEmotionArc(points: ArcPoint[]): EmotionArc {
  if (points.length === 0) {
    return {
      points,
      avgValence: 0,
      avgArousal: 0,
      maxDelta: 0,
      trendsPositive: false,
    };
  }

  let totalValence = 0;
  let totalArousal = 0;
  let maxDelta = 0;

  for (let i = 0; i < points.length; i++) {
    totalValence += points[i].emotion.valence;
    totalArousal += points[i].emotion.arousal;

    if (i > 0) {
      const d = emotionDistance(points[i - 1].emotion, points[i].emotion);
      if (d > maxDelta) maxDelta = d;
    }
  }

  const avgValence = totalValence / points.length;
  const avgArousal = totalArousal / points.length;

  // Trend: compare first half avg valence to second half
  const mid = Math.floor(points.length / 2);
  const firstHalf = points.slice(0, mid || 1);
  const secondHalf = points.slice(mid);
  const firstAvg =
    firstHalf.reduce((sum, p) => sum + p.emotion.valence, 0) /
    firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, p) => sum + p.emotion.valence, 0) /
    secondHalf.length;

  return {
    points,
    avgValence,
    avgArousal,
    maxDelta,
    trendsPositive: secondAvg > firstAvg,
  };
}
