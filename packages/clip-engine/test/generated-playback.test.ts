import { describe, it, expect } from "vitest";
import type { Cue } from "@motif-studio/schema";
import {
  barDurationSec,
  planCrossFamilySwitch,
  planGeneratedCuePlayback,
  planGeneratedSectionTransitions,
} from "../src/generated-playback.js";

const lastGoodDay: Cue = {
  id: "cue-ardent-ready",
  name: "The Last Good Day",
  bpm: 100,
  beatsPerBar: 4,
  keyRoot: 7,
  keyScale: "minor",
  sections: [
    { id: "arr-intro", name: "Corridor", role: "intro", durationBars: 4, sceneId: "sc-ardent-ready", intensity: "low" },
    { id: "arr-body", name: "Ready Room", role: "body", durationBars: 8, sceneId: "sc-ardent-ready", intensity: "mid" },
    { id: "arr-outro", name: "Brief Ends", role: "outro", durationBars: 4, sceneId: "sc-ardent-ready", intensity: "low" },
  ],
};

const ambush: Cue = {
  id: "cue-ambush",
  name: "The Ambush",
  bpm: 130,
  beatsPerBar: 4,
  sections: [
    {
      id: "amb-intro",
      name: "Drop",
      role: "intro",
      durationBars: 2,
      sceneId: "sc-ambush",
      intensity: "mid",
      transitionMode: "stinger-then-switch",
    },
    { id: "amb-body", name: "Engagement", role: "body", durationBars: 6, sceneId: "sc-ambush", intensity: "high" },
  ],
};

describe("planGeneratedCuePlayback", () => {
  it("uses measured file duration, not an authored request", () => {
    const plan = planGeneratedCuePlayback(lastGoodDay, 120, "run3-fixture");
    expect(plan.measuredDurationSec).toBe(120);
    expect(plan.authoredDurationSec).toBeCloseTo(16 * barDurationSec(100, 4), 8);
    expect(plan.loopTailSec).toBeCloseTo(120 - plan.authoredDurationSec, 8);
    expect(plan.sections).toHaveLength(3);
    expect(plan.sections[0]!.stemRoles).toEqual(["bass", "other"]);
    expect(plan.sections[1]!.stemRoles).toEqual(["bass", "drums", "other"]);
  });

  it("clamps sections when the file is shorter than the authored plan", () => {
    const plan = planGeneratedCuePlayback(lastGoodDay, 5, "short");
    expect(plan.sections.length).toBeGreaterThan(0);
    expect(plan.sections.at(-1)!.endSec).toBeLessThanOrEqual(5);
    expect(plan.loopTailSec).toBe(0);
  });
});

describe("planGeneratedSectionTransitions", () => {
  it("honors stinger-then-switch on the incoming section", () => {
    const plan = planGeneratedCuePlayback(ambush, 60, "amb-gen");
    const steps = planGeneratedSectionTransitions(plan, { "amb-intro": "sfx-ambush" });
    expect(steps).toHaveLength(1);
    expect(steps[0]!.mode).toBe("stinger-then-switch");
    expect(steps[0]!.switchAtBar).toBe(2);
    expect(steps[0]!.switchAtSec).toBeCloseTo(2 * barDurationSec(130, 4), 8);
  });
});

describe("planCrossFamilySwitch", () => {
  it("bar-aligns and clamps to measured duration", () => {
    const from = planGeneratedCuePlayback(lastGoodDay, 120, "from");
    const step = planCrossFamilySwitch({
      fromPlan: from,
      toGeneratedCueId: "to",
      atBar: 16.4,
      mode: "cooldown-fade",
      stingerAssetId: "sfx-verdict",
    });
    expect(step.switchAtBar).toBe(16);
    expect(step.switchAtSec).toBeCloseTo(16 * barDurationSec(100, 4), 8);
    expect(step.mode).toBe("cooldown-fade");
    expect(step.toGeneratedCueId).toBe("to");
  });

  it("never switches past the measured file end", () => {
    const from = planGeneratedCuePlayback(lastGoodDay, 10, "from");
    const step = planCrossFamilySwitch({
      fromPlan: from,
      toGeneratedCueId: "to",
      atBar: 99,
      mode: "bar-sync",
    });
    expect(step.switchAtSec).toBe(10);
  });
});
