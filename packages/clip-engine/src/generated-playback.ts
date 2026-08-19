import type {
  Cue,
  GenerationStemRole,
  IntensityLevel,
  TransitionMode,
} from "@motif-studio/schema";
import { resolveCuePlan } from "./cue-scheduler.js";

const STEM_ROLES_BY_INTENSITY: Record<IntensityLevel, readonly GenerationStemRole[]> = {
  low: ["bass", "other"],
  mid: ["bass", "drums", "other"],
  high: ["bass", "drums", "other", "vocals"],
};

export function barDurationSec(bpm: number, beatsPerBar: number): number {
  return (60 / bpm) * beatsPerBar;
}

export interface GeneratedSectionPlayback {
  sectionId: string;
  name: string;
  role: Cue["sections"][number]["role"];
  intensity: IntensityLevel;
  startBar: number;
  durationBars: number;
  startSec: number;
  endSec: number;
  stemRoles: GenerationStemRole[];
  transitionMode?: TransitionMode;
}

export interface GeneratedCuePlaybackPlan {
  generatedCueId: string;
  cueId: string;
  bpm: number;
  beatsPerBar: number;
  measuredDurationSec: number;
  authoredDurationSec: number;
  loopTailSec: number;
  totalBars: number;
  sections: GeneratedSectionPlayback[];
}

/**
 * Map an authored cue onto a generated file.
 * Section bars stay authored (bpm-locked). Timing uses file duration —
 * never the requested generation figure. Extra measured length is loop tail.
 */
export function planGeneratedCuePlayback(
  cue: Cue,
  measuredDurationSec: number,
  generatedCueId: string,
): GeneratedCuePlaybackPlan {
  if (!(cue.bpm != null && cue.bpm > 0)) {
    throw new Error("planGeneratedCuePlayback requires authored bpm");
  }
  const authored = resolveCuePlan(cue);
  const barSec = barDurationSec(authored.bpm, authored.beatsPerBar);
  const sections: GeneratedSectionPlayback[] = [];

  for (const section of authored.sections) {
    const startSec = section.startBar * barSec;
    if (startSec >= measuredDurationSec) break;
    const authoredEnd = startSec + section.durationBars * barSec;
    const endSec = Math.min(authoredEnd, measuredDurationSec);
    const intensity = section.intensity ?? "mid";
    const authoredSection = cue.sections.find((s) => s.id === section.sectionId);
    sections.push({
      sectionId: section.sectionId,
      name: section.name,
      role: section.role,
      intensity,
      startBar: section.startBar,
      durationBars: Math.max(1, Math.round((endSec - startSec) / barSec)),
      startSec,
      endSec,
      stemRoles: [...STEM_ROLES_BY_INTENSITY[intensity]],
      transitionMode: authoredSection?.transitionMode,
    });
  }

  return {
    generatedCueId,
    cueId: cue.id,
    bpm: authored.bpm,
    beatsPerBar: authored.beatsPerBar,
    measuredDurationSec,
    authoredDurationSec: authored.totalSeconds,
    loopTailSec: Math.max(0, measuredDurationSec - authored.totalSeconds),
    totalBars: sections.reduce((n, s) => n + s.durationBars, 0),
    sections,
  };
}

export interface GeneratedTransitionStep {
  fromSectionId: string;
  toSectionId?: string;
  toGeneratedCueId?: string;
  mode: TransitionMode;
  switchAtSec: number;
  switchAtBar: number;
  stingerAssetId?: string;
}

/** Family-internal section boundaries, honoring authored transitionMode. */
export function planGeneratedSectionTransitions(
  plan: GeneratedCuePlaybackPlan,
  stingerBySection?: Record<string, string>,
): GeneratedTransitionStep[] {
  const steps: GeneratedTransitionStep[] = [];
  for (let i = 0; i < plan.sections.length - 1; i++) {
    const from = plan.sections[i]!;
    const to = plan.sections[i + 1]!;
    const mode = to.transitionMode ?? from.transitionMode ?? "bar-sync";
    steps.push({
      fromSectionId: from.sectionId,
      toSectionId: to.sectionId,
      mode,
      switchAtSec: to.startSec,
      switchAtBar: to.startBar,
      stingerAssetId:
        stingerBySection?.[to.sectionId] ?? stingerBySection?.[from.sectionId],
    });
  }
  return steps;
}

/**
 * Cross-family (or cross-cue) switch. `atBar` is bar-aligned on the FROM
 * cue and clamped to the measured file duration.
 */
export function planCrossFamilySwitch(options: {
  fromPlan: GeneratedCuePlaybackPlan;
  toGeneratedCueId: string;
  atBar: number;
  mode: TransitionMode;
  stingerAssetId?: string;
}): GeneratedTransitionStep {
  const barSec = barDurationSec(options.fromPlan.bpm, options.fromPlan.beatsPerBar);
  const switchAtBar = Math.max(0, Math.round(options.atBar));
  const rawSec = switchAtBar * barSec;
  const switchAtSec = Math.min(rawSec, options.fromPlan.measuredDurationSec);
  const fromSection =
    [...options.fromPlan.sections].reverse().find((s) => s.startSec <= switchAtSec) ??
    options.fromPlan.sections[0];
  return {
    fromSectionId: fromSection?.sectionId ?? "unknown",
    toGeneratedCueId: options.toGeneratedCueId,
    mode: options.mode,
    switchAtSec,
    switchAtBar,
    stingerAssetId: options.stingerAssetId,
  };
}
