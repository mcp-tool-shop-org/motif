import { describe, it, expect, beforeEach } from "vitest";
import { usePreviewStore } from "../src/app/preview-store";
import type { RuntimeMusicState } from "@motif/schema";

beforeEach(() => {
  usePreviewStore.setState({
    previewMode: "manual",
    manualState: {
      mode: "exploration",
      danger: 0,
      inCombat: false,
      boss: false,
      safeZone: false,
      victory: false,
      region: "",
      faction: "",
    },
    previousManualState: null,
    sequenceSteps: [
      { mode: "exploration", danger: 0, inCombat: false, boss: false, safeZone: false, victory: false },
      { mode: "exploration", danger: 0.5, inCombat: false, boss: false, safeZone: false, victory: false },
      { mode: "exploration", danger: 0.8, inCombat: true, boss: false, safeZone: false, victory: false },
      { mode: "exploration", danger: 1.0, inCombat: true, boss: true, safeZone: false, victory: false },
      { mode: "exploration", danger: 0, inCombat: false, boss: false, safeZone: false, victory: true },
      { mode: "exploration", danger: 0, inCombat: false, boss: false, safeZone: true, victory: false },
    ],
  });
});

describe("preview store — mode switching", () => {
  it("defaults to manual mode", () => {
    expect(usePreviewStore.getState().previewMode).toBe("manual");
  });

  it("switches to sequence mode", () => {
    usePreviewStore.getState().setPreviewMode("sequence");
    expect(usePreviewStore.getState().previewMode).toBe("sequence");
  });
});

describe("preview store — manual state", () => {
  it("sets a manual field and snapshots previous", () => {
    usePreviewStore.getState().setManualField("danger", 0.7);
    const state = usePreviewStore.getState();
    expect(state.manualState.danger).toBe(0.7);
    expect(state.previousManualState).not.toBeNull();
    expect(state.previousManualState!.danger).toBe(0);
  });

  it("sets boolean fields", () => {
    usePreviewStore.getState().setManualField("inCombat", true);
    expect(usePreviewStore.getState().manualState.inCombat).toBe(true);
  });

  it("sets string fields", () => {
    usePreviewStore.getState().setManualField("region", "forest");
    expect(usePreviewStore.getState().manualState.region).toBe("forest");
  });
});

describe("preview store — sequence steps", () => {
  it("has 6 default steps", () => {
    expect(usePreviewStore.getState().sequenceSteps).toHaveLength(6);
  });

  it("adds a step", () => {
    usePreviewStore.getState().addSequenceStep();
    expect(usePreviewStore.getState().sequenceSteps).toHaveLength(7);
  });

  it("removes a step", () => {
    usePreviewStore.getState().removeSequenceStep(2);
    const steps = usePreviewStore.getState().sequenceSteps;
    expect(steps).toHaveLength(5);
    // step 2 was danger:0.8 inCombat:true, now step 2 should be the old step 3
    expect(steps[2].boss).toBe(true);
  });

  it("duplicates a step", () => {
    usePreviewStore.getState().duplicateSequenceStep(0);
    const steps = usePreviewStore.getState().sequenceSteps;
    expect(steps).toHaveLength(7);
    expect(steps[0].mode).toBe(steps[1].mode);
    expect(steps[0].danger).toBe(steps[1].danger);
  });

  it("updates a step field", () => {
    usePreviewStore.getState().updateSequenceStep(0, "danger", 0.9);
    expect(usePreviewStore.getState().sequenceSteps[0].danger).toBe(0.9);
  });

  it("resets to default sequence", () => {
    usePreviewStore.getState().removeSequenceStep(0);
    usePreviewStore.getState().removeSequenceStep(0);
    expect(usePreviewStore.getState().sequenceSteps).toHaveLength(4);
    usePreviewStore.getState().resetSequence();
    expect(usePreviewStore.getState().sequenceSteps).toHaveLength(6);
  });

  it("duplicateSequenceStep ignores negative index", () => {
    usePreviewStore.getState().duplicateSequenceStep(-1);
    expect(usePreviewStore.getState().sequenceSteps).toHaveLength(6);
  });

  it("duplicateSequenceStep ignores out-of-bounds index", () => {
    usePreviewStore.getState().duplicateSequenceStep(100);
    expect(usePreviewStore.getState().sequenceSteps).toHaveLength(6);
  });
});
