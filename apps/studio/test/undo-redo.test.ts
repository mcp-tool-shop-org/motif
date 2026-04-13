import { describe, it, expect, beforeEach } from "vitest";
import { useStudioStore, UNDO_MAX, _resetUndoDebounce } from "../src/app/store";
import { starterPack } from "../src/app/seed-data";
import type { SoundtrackPack, AudioAsset } from "@motif-studio/schema";

function makeAsset(id: string): AudioAsset {
  return {
    id,
    name: `Asset ${id}`,
    file: `${id}.wav`,
    type: "sfx",
    tags: [],
  };
}

beforeEach(() => {
  // Reset debounce so every action gets its own undo entry
  _resetUndoDebounce();
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack,
    section: "assets",
    selectedId: null,
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
  });
});

describe("undo/redo — core", () => {
  it("undo after addAsset reverts the add", () => {
    const before = useStudioStore.getState().pack.assets.length;
    useStudioStore.getState().addAsset(makeAsset("test-1"));
    expect(useStudioStore.getState().pack.assets.length).toBe(before + 1);
    expect(useStudioStore.getState().canUndo).toBe(true);

    useStudioStore.getState().undo();
    expect(useStudioStore.getState().pack.assets.length).toBe(before);
    expect(useStudioStore.getState().canUndo).toBe(false);
  });

  it("redo after undo re-applies the change", () => {
    const before = useStudioStore.getState().pack.assets.length;
    useStudioStore.getState().addAsset(makeAsset("test-2"));
    useStudioStore.getState().undo();
    expect(useStudioStore.getState().pack.assets.length).toBe(before);
    expect(useStudioStore.getState().canRedo).toBe(true);

    useStudioStore.getState().redo();
    expect(useStudioStore.getState().pack.assets.length).toBe(before + 1);
    expect(useStudioStore.getState().canRedo).toBe(false);
  });

  it("redo stack clears on new mutation", () => {
    useStudioStore.getState().addAsset(makeAsset("a"));
    _resetUndoDebounce();
    useStudioStore.getState().undo();
    expect(useStudioStore.getState().canRedo).toBe(true);

    // New mutation should clear redo
    useStudioStore.getState().addAsset(makeAsset("b"));
    expect(useStudioStore.getState().canRedo).toBe(false);
    expect(useStudioStore.getState().redoStack.length).toBe(0);
  });

  it("undo stack caps at UNDO_MAX", () => {
    for (let i = 0; i < UNDO_MAX + 10; i++) {
      _resetUndoDebounce();
      useStudioStore.getState().addAsset(makeAsset(`cap-${i}`));
    }
    expect(useStudioStore.getState().undoStack.length).toBeLessThanOrEqual(UNDO_MAX);
  });

  it("undo with empty stack is a no-op", () => {
    const packBefore = JSON.stringify(useStudioStore.getState().pack);
    useStudioStore.getState().undo();
    expect(JSON.stringify(useStudioStore.getState().pack)).toBe(packBefore);
  });

  it("redo with empty stack is a no-op", () => {
    const packBefore = JSON.stringify(useStudioStore.getState().pack);
    useStudioStore.getState().redo();
    expect(JSON.stringify(useStudioStore.getState().pack)).toBe(packBefore);
  });

  it("multiple undos walk back through history", () => {
    const original = useStudioStore.getState().pack.assets.length;

    useStudioStore.getState().addAsset(makeAsset("m1"));
    _resetUndoDebounce();
    useStudioStore.getState().addAsset(makeAsset("m2"));
    _resetUndoDebounce();
    useStudioStore.getState().addAsset(makeAsset("m3"));

    expect(useStudioStore.getState().pack.assets.length).toBe(original + 3);

    useStudioStore.getState().undo(); // removes m3
    expect(useStudioStore.getState().pack.assets.length).toBe(original + 2);

    useStudioStore.getState().undo(); // removes m2
    expect(useStudioStore.getState().pack.assets.length).toBe(original + 1);

    useStudioStore.getState().undo(); // removes m1
    expect(useStudioStore.getState().pack.assets.length).toBe(original);
  });

  it("loadPack clears undo and redo stacks", () => {
    useStudioStore.getState().addAsset(makeAsset("x"));
    expect(useStudioStore.getState().canUndo).toBe(true);

    useStudioStore.getState().loadPack(JSON.parse(JSON.stringify(starterPack)));
    expect(useStudioStore.getState().undoStack.length).toBe(0);
    expect(useStudioStore.getState().redoStack.length).toBe(0);
    expect(useStudioStore.getState().canUndo).toBe(false);
    expect(useStudioStore.getState().canRedo).toBe(false);
  });

  it("deleteAsset is undoable", () => {
    const assets = useStudioStore.getState().pack.assets;
    const firstId = assets[0]?.id;
    if (!firstId) return; // skip if no assets

    const countBefore = assets.length;
    useStudioStore.getState().deleteAsset(firstId);
    expect(useStudioStore.getState().pack.assets.length).toBe(countBefore - 1);

    useStudioStore.getState().undo();
    expect(useStudioStore.getState().pack.assets.length).toBe(countBefore);
    expect(useStudioStore.getState().pack.assets.find((a) => a.id === firstId)).toBeTruthy();
  });

  it("updateMeta is undoable", () => {
    const originalName = useStudioStore.getState().pack.meta.name;
    useStudioStore.getState().updateMeta({ name: "Changed Name" });
    expect(useStudioStore.getState().pack.meta.name).toBe("Changed Name");

    useStudioStore.getState().undo();
    expect(useStudioStore.getState().pack.meta.name).toBe(originalName);
  });
});

describe("undo/redo — debounce", () => {
  it("rapid mutations within debounce window produce only one undo entry", () => {
    // Do NOT reset debounce between calls — let them collapse
    useStudioStore.getState().addAsset(makeAsset("rapid-1"));
    useStudioStore.getState().addAsset(makeAsset("rapid-2"));
    useStudioStore.getState().addAsset(makeAsset("rapid-3"));

    // Should only have 1 undo entry (all collapsed into one debounce window)
    expect(useStudioStore.getState().undoStack.length).toBe(1);
  });
});
