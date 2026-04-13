import { describe, it, expect, beforeEach } from "vitest";
import { useStudioStore } from "../src/app/store";
import type { SoundtrackPack } from "@motif/schema";

const emptyPack: SoundtrackPack = {
  meta: { id: "test-pack", name: "Test", version: "1.0.0", schemaVersion: "1" },
  assets: [],
  stems: [],
  scenes: [],
  bindings: [],
  transitions: [],
};

beforeEach(() => {
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(emptyPack)),
    globalBpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
  });
});

describe("store — globalBpm", () => {
  it("defaults to 120", () => {
    expect(useStudioStore.getState().globalBpm).toBe(120);
  });

  it("sets global BPM", () => {
    useStudioStore.getState().setGlobalBpm(140);
    expect(useStudioStore.getState().globalBpm).toBe(140);
  });

  it("clamps BPM below 20 to 20", () => {
    useStudioStore.getState().setGlobalBpm(5);
    expect(useStudioStore.getState().globalBpm).toBe(20);
  });

  it("clamps BPM above 999 to 999", () => {
    useStudioStore.getState().setGlobalBpm(1500);
    expect(useStudioStore.getState().globalBpm).toBe(999);
  });

  it("rounds fractional BPM to integer", () => {
    useStudioStore.getState().setGlobalBpm(128.7);
    expect(useStudioStore.getState().globalBpm).toBe(129);
  });
});

describe("store — timeSignature", () => {
  it("defaults to 4/4", () => {
    const ts = useStudioStore.getState().timeSignature;
    expect(ts).toEqual({ numerator: 4, denominator: 4 });
  });

  it("sets time signature", () => {
    useStudioStore.getState().setTimeSignature({ numerator: 3, denominator: 4 });
    expect(useStudioStore.getState().timeSignature).toEqual({ numerator: 3, denominator: 4 });
  });

  it("supports 6/8", () => {
    useStudioStore.getState().setTimeSignature({ numerator: 6, denominator: 8 });
    expect(useStudioStore.getState().timeSignature).toEqual({ numerator: 6, denominator: 8 });
  });
});

describe("store — autosave state", () => {
  it("starts clean", () => {
    const state = useStudioStore.getState();
    expect(state.autosave.dirty).toBe(false);
    expect(state.autosave.lastSavedAt).toBeNull();
  });

  it("_markDirty sets dirty flag", () => {
    useStudioStore.getState()._markDirty();
    expect(useStudioStore.getState().autosave.dirty).toBe(true);
  });

  it("_markSaved clears dirty and sets timestamp", () => {
    useStudioStore.getState()._markDirty();
    useStudioStore.getState()._markSaved();
    const state = useStudioStore.getState();
    expect(state.autosave.dirty).toBe(false);
    expect(state.autosave.lastSavedAt).not.toBeNull();
  });

  it("loadPack resets autosave state", () => {
    useStudioStore.getState()._markDirty();
    useStudioStore.getState()._markSaved();
    useStudioStore.getState().loadPack(emptyPack);
    const state = useStudioStore.getState();
    expect(state.autosave.dirty).toBe(false);
    expect(state.autosave.lastSavedAt).toBeNull();
  });

  it("updateMeta sets dirty flag", () => {
    useStudioStore.getState().updateMeta({ name: "Changed" });
    expect(useStudioStore.getState().autosave.dirty).toBe(true);
  });
});
