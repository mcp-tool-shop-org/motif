import { describe, it, expect, beforeEach } from "vitest";
import { useStudioStore } from "../src/app/store";
import { starterPack } from "../src/app/seed-data";
import type { SoundtrackPack } from "@motif/schema";

// Reset store before each test
beforeEach(() => {
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack,
    section: "project",
    selectedId: null,
  });
});

describe("store — navigation", () => {
  it("switches section and clears selection", () => {
    const store = useStudioStore.getState();
    store.setSelectedId("asset-explore-base");
    store.setSection("stems");
    const state = useStudioStore.getState();
    expect(state.section).toBe("stems");
    expect(state.selectedId).toBeNull();
  });
});

describe("store — meta editing", () => {
  it("updates pack name", () => {
    useStudioStore.getState().updateMeta({ name: "My Custom Pack" });
    expect(useStudioStore.getState().pack.meta.name).toBe("My Custom Pack");
  });

  it("updates multiple meta fields", () => {
    useStudioStore.getState().updateMeta({
      version: "2.0.0",
      author: "tester",
    });
    const meta = useStudioStore.getState().pack.meta;
    expect(meta.version).toBe("2.0.0");
    expect(meta.author).toBe("tester");
  });
});

describe("store — asset CRUD", () => {
  it("adds an asset and selects it", () => {
    const newAsset = {
      id: "test-asset",
      name: "Test",
      src: "audio/test.ogg",
      kind: "loop" as const,
      durationMs: 1000,
    };
    useStudioStore.getState().addAsset(newAsset);
    const state = useStudioStore.getState();
    expect(state.pack.assets).toHaveLength(9);
    expect(state.selectedId).toBe("test-asset");
  });

  it("updates an asset field", () => {
    useStudioStore
      .getState()
      .updateAsset("asset-explore-base", { name: "Renamed" });
    const asset = useStudioStore
      .getState()
      .pack.assets.find((a) => a.id === "asset-explore-base");
    expect(asset?.name).toBe("Renamed");
  });

  it("deletes an asset and fixes selection", () => {
    useStudioStore.getState().setSelectedId("asset-explore-base");
    useStudioStore.getState().deleteAsset("asset-explore-base");
    const state = useStudioStore.getState();
    expect(state.pack.assets).toHaveLength(7);
    expect(state.pack.assets.find((a) => a.id === "asset-explore-base")).toBeUndefined();
    // selection should move to first surviving asset
    expect(state.selectedId).toBe("asset-explore-accent");
  });

  it("deleting non-selected asset does not change selection", () => {
    useStudioStore.getState().setSelectedId("asset-explore-base");
    useStudioStore.getState().deleteAsset("asset-combat-base");
    expect(useStudioStore.getState().selectedId).toBe("asset-explore-base");
  });
});

describe("store — stem CRUD", () => {
  it("adds a stem", () => {
    const newStem = {
      id: "test-stem",
      name: "Test Stem",
      assetId: "asset-explore-base",
      role: "base" as const,
      loop: true,
    };
    useStudioStore.getState().addStem(newStem);
    expect(useStudioStore.getState().pack.stems).toHaveLength(8);
  });

  it("updates a stem", () => {
    useStudioStore
      .getState()
      .updateStem("stem-explore-base", { role: "danger" });
    const stem = useStudioStore
      .getState()
      .pack.stems.find((s) => s.id === "stem-explore-base");
    expect(stem?.role).toBe("danger");
  });

  it("deletes a stem", () => {
    useStudioStore.getState().deleteStem("stem-explore-base");
    expect(useStudioStore.getState().pack.stems).toHaveLength(6);
  });
});

describe("store — scene CRUD", () => {
  it("adds a scene", () => {
    const newScene = {
      id: "test-scene",
      name: "Test Scene",
      category: "exploration" as const,
      layers: [{ stemId: "stem-explore-base" }],
    };
    useStudioStore.getState().addScene(newScene);
    expect(useStudioStore.getState().pack.scenes).toHaveLength(6);
  });

  it("updates a scene", () => {
    useStudioStore
      .getState()
      .updateScene("scene-exploration", { name: "Big Forest" });
    const scene = useStudioStore
      .getState()
      .pack.scenes.find((s) => s.id === "scene-exploration");
    expect(scene?.name).toBe("Big Forest");
  });

  it("deletes a scene", () => {
    useStudioStore.getState().deleteScene("scene-safe-zone");
    expect(useStudioStore.getState().pack.scenes).toHaveLength(4);
  });

  it("adds a layer to a scene", () => {
    useStudioStore
      .getState()
      .addSceneLayer("scene-exploration", { stemId: "stem-combat-base" });
    const scene = useStudioStore
      .getState()
      .pack.scenes.find((s) => s.id === "scene-exploration");
    expect(scene?.layers).toHaveLength(3);
  });

  it("updates a layer in a scene", () => {
    useStudioStore.getState().updateSceneLayer("scene-exploration", 0, {
      required: false,
    });
    const scene = useStudioStore
      .getState()
      .pack.scenes.find((s) => s.id === "scene-exploration");
    expect(scene?.layers[0].required).toBe(false);
  });

  it("removes a layer from a scene", () => {
    useStudioStore.getState().removeSceneLayer("scene-exploration", 1);
    const scene = useStudioStore
      .getState()
      .pack.scenes.find((s) => s.id === "scene-exploration");
    expect(scene?.layers).toHaveLength(1);
    expect(scene?.layers[0].stemId).toBe("stem-explore-base");
  });
});

describe("store — binding CRUD", () => {
  it("adds a binding", () => {
    const newBinding = {
      id: "test-binding",
      name: "Test Binding",
      sceneId: "scene-exploration",
      conditions: [{ field: "mode", op: "eq" as const, value: "test" }],
      priority: 50,
    };
    useStudioStore.getState().addBinding(newBinding);
    expect(useStudioStore.getState().pack.bindings).toHaveLength(6);
  });

  it("updates a binding", () => {
    useStudioStore.getState().updateBinding("bind-explore", { priority: 99 });
    const binding = useStudioStore
      .getState()
      .pack.bindings.find((b) => b.id === "bind-explore");
    expect(binding?.priority).toBe(99);
  });

  it("deletes a binding", () => {
    useStudioStore.getState().deleteBinding("bind-explore");
    expect(useStudioStore.getState().pack.bindings).toHaveLength(4);
  });

  it("adds a condition to a binding", () => {
    useStudioStore.getState().addBindingCondition("bind-explore", {
      field: "region",
      op: "eq",
      value: "forest",
    });
    const binding = useStudioStore
      .getState()
      .pack.bindings.find((b) => b.id === "bind-explore");
    expect(binding?.conditions).toHaveLength(2);
  });

  it("updates a condition", () => {
    useStudioStore.getState().updateBindingCondition("bind-explore", 0, {
      value: "stealth",
    });
    const binding = useStudioStore
      .getState()
      .pack.bindings.find((b) => b.id === "bind-explore");
    expect(binding?.conditions[0].value).toBe("stealth");
  });

  it("removes a condition", () => {
    // First add a second condition
    useStudioStore.getState().addBindingCondition("bind-explore", {
      field: "x",
      op: "gt",
      value: 5,
    });
    useStudioStore.getState().removeBindingCondition("bind-explore", 0);
    const binding = useStudioStore
      .getState()
      .pack.bindings.find((b) => b.id === "bind-explore");
    expect(binding?.conditions).toHaveLength(1);
    expect(binding?.conditions[0].field).toBe("x");
  });
});

describe("store — transition CRUD", () => {
  it("adds a transition", () => {
    const newTransition = {
      id: "test-trans",
      name: "Test",
      fromSceneId: "scene-exploration",
      toSceneId: "scene-combat",
      mode: "immediate" as const,
    };
    useStudioStore.getState().addTransition(newTransition);
    expect(useStudioStore.getState().pack.transitions).toHaveLength(5);
  });

  it("updates a transition", () => {
    useStudioStore
      .getState()
      .updateTransition("trans-explore-to-tension", { mode: "bar-sync" });
    const trans = useStudioStore
      .getState()
      .pack.transitions.find((t) => t.id === "trans-explore-to-tension");
    expect(trans?.mode).toBe("bar-sync");
  });

  it("deletes a transition", () => {
    useStudioStore
      .getState()
      .deleteTransition("trans-explore-to-tension");
    expect(useStudioStore.getState().pack.transitions).toHaveLength(3);
  });
});

describe("store — loadPack", () => {
  it("replaces the entire pack", () => {
    const minimalPack: SoundtrackPack = {
      meta: {
        id: "tiny",
        name: "Tiny",
        version: "1.0.0",
        schemaVersion: "1",
      },
      assets: [],
      stems: [],
      scenes: [],
      bindings: [],
      transitions: [],
    };
    useStudioStore.getState().loadPack(minimalPack);
    const state = useStudioStore.getState();
    expect(state.pack.meta.id).toBe("tiny");
    expect(state.section).toBe("arrangement");
    expect(state.selectedId).toBeNull();
  });
});

// ── New domain tests (sample-lab, score-map, automation, library) ──

const testPack: SoundtrackPack = {
  meta: { id: "test", name: "Test Pack", version: "1.0.0", schemaVersion: "1" },
  assets: [
    { id: "a1", name: "Kick", src: "/kick.wav", kind: "oneshot", durationMs: 500, imported: true, sourceType: "drums", tags: ["drums", "low"] },
    { id: "a2", name: "Pad Warm", src: "/pad.wav", kind: "loop", durationMs: 8000, sourceType: "tonal", tags: ["synth"] },
  ],
  stems: [],
  scenes: [],
  bindings: [],
  transitions: [],
};

describe("store — sample slices", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a slice", () => {
    useStudioStore.getState().addSampleSlice({ id: "s1", assetId: "a1", name: "Slice 1", startMs: 0, endMs: 250 });
    expect(useStudioStore.getState().pack.sampleSlices).toHaveLength(1);
  });

  it("updates a slice", () => {
    useStudioStore.getState().addSampleSlice({ id: "s1", assetId: "a1", name: "Slice 1", startMs: 0, endMs: 250 });
    useStudioStore.getState().updateSampleSlice("s1", { name: "Renamed" });
    expect(useStudioStore.getState().pack.sampleSlices![0].name).toBe("Renamed");
  });

  it("deletes a slice", () => {
    useStudioStore.getState().addSampleSlice({ id: "s1", assetId: "a1", name: "S1", startMs: 0, endMs: 250 });
    useStudioStore.getState().deleteSampleSlice("s1");
    expect(useStudioStore.getState().pack.sampleSlices).toHaveLength(0);
  });
});

describe("store — sample kits", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a kit", () => {
    useStudioStore.getState().addSampleKit({ id: "k1", name: "Kit 1", slots: [] });
    expect(useStudioStore.getState().pack.sampleKits).toHaveLength(1);
  });

  it("adds a slot to a kit", () => {
    useStudioStore.getState().addSampleKit({ id: "k1", name: "Kit", slots: [] });
    useStudioStore.getState().addSampleKitSlot("k1", { pitch: 36, assetId: "a1" });
    expect(useStudioStore.getState().pack.sampleKits![0].slots).toHaveLength(1);
  });

  it("updates a slot in a kit", () => {
    useStudioStore.getState().addSampleKit({ id: "k1", name: "Kit", slots: [] });
    useStudioStore.getState().addSampleKitSlot("k1", { pitch: 36, assetId: "a1", label: "Kick" });
    useStudioStore.getState().updateSampleKitSlot("k1", 36, { label: "Big Kick" });
    expect(useStudioStore.getState().pack.sampleKits![0].slots[0].label).toBe("Big Kick");
  });

  it("removes a slot from a kit", () => {
    useStudioStore.getState().addSampleKit({ id: "k1", name: "Kit", slots: [] });
    useStudioStore.getState().addSampleKitSlot("k1", { pitch: 36, assetId: "a1" });
    useStudioStore.getState().removeSampleKitSlot("k1", 36);
    expect(useStudioStore.getState().pack.sampleKits![0].slots).toHaveLength(0);
  });

  it("deletes a kit", () => {
    useStudioStore.getState().addSampleKit({ id: "k1", name: "Kit", slots: [] });
    useStudioStore.getState().deleteSampleKit("k1");
    expect(useStudioStore.getState().pack.sampleKits).toHaveLength(0);
  });
});

describe("store — sample instruments", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds an instrument", () => {
    useStudioStore.getState().addSampleInstrument({ id: "i1", name: "Piano", assetId: "a1", rootNote: 60, pitchMin: 0, pitchMax: 127 });
    expect(useStudioStore.getState().pack.sampleInstruments).toHaveLength(1);
  });

  it("updates an instrument", () => {
    useStudioStore.getState().addSampleInstrument({ id: "i1", name: "Piano", assetId: "a1", rootNote: 60, pitchMin: 0, pitchMax: 127 });
    useStudioStore.getState().updateSampleInstrument("i1", { name: "Grand Piano" });
    expect(useStudioStore.getState().pack.sampleInstruments![0].name).toBe("Grand Piano");
  });

  it("deletes an instrument", () => {
    useStudioStore.getState().addSampleInstrument({ id: "i1", name: "Piano", assetId: "a1", rootNote: 60, pitchMin: 0, pitchMax: 127 });
    useStudioStore.getState().deleteSampleInstrument("i1");
    expect(useStudioStore.getState().pack.sampleInstruments).toHaveLength(0);
  });
});

describe("store — asset search and filter", () => {
  it("sets search query", () => {
    useStudioStore.getState().setAssetSearchQuery("kick");
    expect(useStudioStore.getState().assetSearchQuery).toBe("kick");
  });

  it("sets tag filter", () => {
    useStudioStore.getState().setAssetTagFilter("drums");
    expect(useStudioStore.getState().assetTagFilter).toBe("drums");
  });

  it("sets source filter", () => {
    useStudioStore.getState().setAssetSourceFilter("tonal");
    expect(useStudioStore.getState().assetSourceFilter).toBe("tonal");
  });

  it("clears filters", () => {
    useStudioStore.getState().setAssetSearchQuery("test");
    useStudioStore.getState().setAssetTagFilter("drums");
    useStudioStore.getState().setAssetSourceFilter("tonal");
    useStudioStore.getState().setAssetSearchQuery("");
    useStudioStore.getState().setAssetTagFilter(null);
    useStudioStore.getState().setAssetSourceFilter(null);
    expect(useStudioStore.getState().assetSearchQuery).toBe("");
    expect(useStudioStore.getState().assetTagFilter).toBeNull();
    expect(useStudioStore.getState().assetSourceFilter).toBeNull();
  });
});

describe("store — motif families", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a motif family", () => {
    useStudioStore.getState().addMotifFamily({ id: "m1", name: "Boss", sourceIds: ["a1"] });
    expect(useStudioStore.getState().pack.motifFamilies).toHaveLength(1);
  });

  it("updates a motif family", () => {
    useStudioStore.getState().addMotifFamily({ id: "m1", name: "Boss", sourceIds: ["a1"] });
    useStudioStore.getState().updateMotifFamily("m1", { name: "Renamed Boss" });
    expect(useStudioStore.getState().pack.motifFamilies![0].name).toBe("Renamed Boss");
  });

  it("deletes a motif family", () => {
    useStudioStore.getState().addMotifFamily({ id: "m1", name: "Boss", sourceIds: ["a1"] });
    useStudioStore.getState().deleteMotifFamily("m1");
    expect(useStudioStore.getState().pack.motifFamilies).toHaveLength(0);
  });
});

describe("store — score profiles", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a score profile", () => {
    useStudioStore.getState().addScoreProfile({ id: "p1", name: "Forest" });
    expect(useStudioStore.getState().pack.scoreProfiles).toHaveLength(1);
  });

  it("updates a score profile", () => {
    useStudioStore.getState().addScoreProfile({ id: "p1", name: "Forest" });
    useStudioStore.getState().updateScoreProfile("p1", { key: "Am" });
    expect(useStudioStore.getState().pack.scoreProfiles![0].key).toBe("Am");
  });

  it("deletes a score profile", () => {
    useStudioStore.getState().addScoreProfile({ id: "p1", name: "Forest" });
    useStudioStore.getState().deleteScoreProfile("p1");
    expect(useStudioStore.getState().pack.scoreProfiles).toHaveLength(0);
  });
});

describe("store — cue families", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a cue family", () => {
    useStudioStore.getState().addCueFamily({ id: "cf1", name: "Battle", role: "combat", sceneIds: [] });
    expect(useStudioStore.getState().pack.cueFamilies).toHaveLength(1);
  });

  it("updates a cue family", () => {
    useStudioStore.getState().addCueFamily({ id: "cf1", name: "Battle", role: "combat", sceneIds: [] });
    useStudioStore.getState().updateCueFamily("cf1", { sceneIds: ["s1", "s2"] });
    expect(useStudioStore.getState().pack.cueFamilies![0].sceneIds).toEqual(["s1", "s2"]);
  });

  it("deletes a cue family", () => {
    useStudioStore.getState().addCueFamily({ id: "cf1", name: "Battle", role: "combat", sceneIds: [] });
    useStudioStore.getState().deleteCueFamily("cf1");
    expect(useStudioStore.getState().pack.cueFamilies).toHaveLength(0);
  });
});

describe("store — score map entries", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a score map entry", () => {
    useStudioStore.getState().addScoreMapEntry({ id: "sme1", name: "Dark Forest", contextType: "region" });
    expect(useStudioStore.getState().pack.scoreMap).toHaveLength(1);
  });

  it("updates a score map entry", () => {
    useStudioStore.getState().addScoreMapEntry({ id: "sme1", name: "Dark Forest", contextType: "region" });
    useStudioStore.getState().updateScoreMapEntry("sme1", { scoreProfileId: "p1" });
    expect(useStudioStore.getState().pack.scoreMap![0].scoreProfileId).toBe("p1");
  });

  it("deletes a score map entry", () => {
    useStudioStore.getState().addScoreMapEntry({ id: "sme1", name: "Dark Forest", contextType: "region" });
    useStudioStore.getState().deleteScoreMapEntry("sme1");
    expect(useStudioStore.getState().pack.scoreMap).toHaveLength(0);
  });
});

describe("store — derivations", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a derivation", () => {
    useStudioStore.getState().addDerivation({ id: "d1", sourceId: "s1", targetId: "s2", transform: "darken" });
    expect(useStudioStore.getState().pack.derivations).toHaveLength(1);
  });

  it("deletes a derivation", () => {
    useStudioStore.getState().addDerivation({ id: "d1", sourceId: "s1", targetId: "s2", transform: "darken" });
    useStudioStore.getState().deleteDerivation("d1");
    expect(useStudioStore.getState().pack.derivations).toHaveLength(0);
  });
});

describe("store — automation lanes", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds an automation lane", () => {
    useStudioStore.getState().addAutomationLane({ id: "al1", name: "Volume", param: "volume", target: { kind: "clip-layer", targetId: "c1" }, points: [{ timeMs: 0, value: 0.5 }] });
    expect(useStudioStore.getState().pack.automationLanes).toHaveLength(1);
  });

  it("updates an automation lane", () => {
    useStudioStore.getState().addAutomationLane({ id: "al1", name: "Volume", param: "volume", target: { kind: "clip-layer", targetId: "c1" }, points: [] });
    useStudioStore.getState().updateAutomationLane("al1", { name: "Main Volume" });
    expect(useStudioStore.getState().pack.automationLanes![0].name).toBe("Main Volume");
  });

  it("deletes an automation lane", () => {
    useStudioStore.getState().addAutomationLane({ id: "al1", name: "Volume", param: "volume", target: { kind: "clip-layer", targetId: "c1" }, points: [] });
    useStudioStore.getState().deleteAutomationLane("al1");
    expect(useStudioStore.getState().pack.automationLanes).toHaveLength(0);
  });
});

describe("store — macro mappings", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a macro mapping", () => {
    useStudioStore.getState().addMacroMapping({ id: "mm1", macro: "intensity", param: "volume", weight: 0.8 });
    expect(useStudioStore.getState().pack.macroMappings).toHaveLength(1);
  });

  it("updates a macro mapping", () => {
    useStudioStore.getState().addMacroMapping({ id: "mm1", macro: "intensity", param: "volume", weight: 0.8 });
    useStudioStore.getState().updateMacroMapping("mm1", { weight: 0.5 });
    expect(useStudioStore.getState().pack.macroMappings![0].weight).toBe(0.5);
  });

  it("deletes a macro mapping", () => {
    useStudioStore.getState().addMacroMapping({ id: "mm1", macro: "intensity", param: "volume", weight: 0.8 });
    useStudioStore.getState().deleteMacroMapping("mm1");
    expect(useStudioStore.getState().pack.macroMappings).toHaveLength(0);
  });
});

describe("store — macro state", () => {
  it("has default macro state at midpoint", () => {
    expect(useStudioStore.getState().macroState).toEqual({ intensity: 0.5, tension: 0.5, brightness: 0.5, space: 0.5 });
  });

  it("sets macro state partially", () => {
    useStudioStore.getState().setMacroState({ intensity: 0.9 });
    expect(useStudioStore.getState().macroState.intensity).toBe(0.9);
    expect(useStudioStore.getState().macroState.tension).toBe(0.5);
  });
});

describe("store — section envelopes", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a section envelope", () => {
    useStudioStore.getState().addSectionEnvelope({ id: "se1", targetId: "scene-1", shape: "fade-in", durationMs: 1000, position: "entry" });
    expect(useStudioStore.getState().pack.sectionEnvelopes).toHaveLength(1);
  });

  it("updates a section envelope", () => {
    useStudioStore.getState().addSectionEnvelope({ id: "se1", targetId: "scene-1", shape: "fade-in", durationMs: 1000, position: "entry" });
    useStudioStore.getState().updateSectionEnvelope("se1", { durationMs: 2000 });
    expect(useStudioStore.getState().pack.sectionEnvelopes![0].durationMs).toBe(2000);
  });

  it("deletes a section envelope", () => {
    useStudioStore.getState().addSectionEnvelope({ id: "se1", targetId: "scene-1", shape: "fade-in", durationMs: 1000, position: "entry" });
    useStudioStore.getState().deleteSectionEnvelope("se1");
    expect(useStudioStore.getState().pack.sectionEnvelopes).toHaveLength(0);
  });
});

describe("store — automation captures", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds an automation capture", () => {
    useStudioStore.getState().addAutomationCapture({ id: "ac1", name: "Take 1", recordedAt: new Date().toISOString(), source: "intensity", points: [{ timeMs: 0, value: 0.5 }, { timeMs: 100, value: 0.8 }] });
    expect(useStudioStore.getState().pack.automationCaptures).toHaveLength(1);
  });

  it("deletes an automation capture", () => {
    useStudioStore.getState().addAutomationCapture({ id: "ac1", name: "Take 1", recordedAt: new Date().toISOString(), source: "volume", points: [] });
    useStudioStore.getState().deleteAutomationCapture("ac1");
    expect(useStudioStore.getState().pack.automationCaptures).toHaveLength(0);
  });
});

describe("store — templates", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a template", () => {
    useStudioStore.getState().addTemplate({ id: "tmpl-1", name: "Combat Scene", kind: "scene", data: { bpm: 120 }, createdAt: "2024-01-01T00:00:00Z" });
    expect(useStudioStore.getState().pack.templates).toHaveLength(1);
  });

  it("updates a template", () => {
    useStudioStore.getState().addTemplate({ id: "tmpl-1", name: "Old Name", kind: "scene", data: {}, createdAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().updateTemplate("tmpl-1", { name: "New Name", tags: ["epic"] });
    expect(useStudioStore.getState().pack.templates![0].name).toBe("New Name");
  });

  it("deletes a template", () => {
    useStudioStore.getState().addTemplate({ id: "tmpl-1", name: "X", kind: "clip", data: {}, createdAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().deleteTemplate("tmpl-1");
    expect(useStudioStore.getState().pack.templates).toHaveLength(0);
  });
});

describe("store — snapshots", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a snapshot", () => {
    useStudioStore.getState().addSnapshot({ id: "snap-1", label: "Before edit", entityId: "e-1", entityKind: "scene", data: { name: "Battle" }, createdAt: "2024-01-01T00:00:00Z" });
    expect(useStudioStore.getState().pack.snapshots).toHaveLength(1);
  });

  it("deletes a snapshot", () => {
    useStudioStore.getState().addSnapshot({ id: "snap-1", label: "V1", entityId: "e-1", entityKind: "clip", data: {}, createdAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().deleteSnapshot("snap-1");
    expect(useStudioStore.getState().pack.snapshots).toHaveLength(0);
  });
});

describe("store — branches", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a branch", () => {
    useStudioStore.getState().addBranch({ id: "br-1", name: "Alt Version", sourceSnapshotId: "snap-1", entityId: "e-2", entityKind: "scene", createdAt: "2024-01-01T00:00:00Z" });
    expect(useStudioStore.getState().pack.branches).toHaveLength(1);
  });

  it("deletes a branch", () => {
    useStudioStore.getState().addBranch({ id: "br-1", name: "X", sourceSnapshotId: "snap-1", entityId: "e-3", entityKind: "clip", createdAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().deleteBranch("br-1");
    expect(useStudioStore.getState().pack.branches).toHaveLength(0);
  });
});

describe("store — favorites", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a favorite", () => {
    useStudioStore.getState().addFavorite({ id: "fav-1", entityId: "e-1", entityKind: "scene", addedAt: "2024-01-01T00:00:00Z" });
    expect(useStudioStore.getState().pack.favorites).toHaveLength(1);
  });

  it("deletes a favorite", () => {
    useStudioStore.getState().addFavorite({ id: "fav-1", entityId: "e-1", entityKind: "clip", addedAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().deleteFavorite("fav-1");
    expect(useStudioStore.getState().pack.favorites).toHaveLength(0);
  });
});

describe("store — collections", () => {
  beforeEach(() => { useStudioStore.getState().loadPack(testPack); });

  it("adds a collection", () => {
    useStudioStore.getState().addCollection({ id: "col-1", name: "Best Of", favoriteIds: ["fav-1"], createdAt: "2024-01-01T00:00:00Z" });
    expect(useStudioStore.getState().pack.collections).toHaveLength(1);
  });

  it("updates a collection", () => {
    useStudioStore.getState().addCollection({ id: "col-1", name: "Old", favoriteIds: [], createdAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().updateCollection("col-1", { name: "Renamed", tags: ["curated"] });
    expect(useStudioStore.getState().pack.collections![0].name).toBe("Renamed");
  });

  it("deletes a collection", () => {
    useStudioStore.getState().addCollection({ id: "col-1", name: "X", favoriteIds: [], createdAt: "2024-01-01T00:00:00Z" });
    useStudioStore.getState().deleteCollection("col-1");
    expect(useStudioStore.getState().pack.collections).toHaveLength(0);
  });
});
