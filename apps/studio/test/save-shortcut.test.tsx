import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import Studio from "../src/app/Studio";
import { useStudioStore } from "../src/app/store";
import { usePlaybackStore } from "../src/app/playback-store";
import { starterPack } from "../src/app/seed-data";
import * as autosave from "../src/app/autosave";
import type { SoundtrackPack } from "@motif/schema";

// Mock the saveProjectToFile function since it uses DOM APIs (createElement, etc.)
vi.mock("../src/app/autosave", async () => {
  const actual = await vi.importActual("../src/app/autosave");
  return {
    ...actual,
    saveProjectToFile: vi.fn(),
  };
});

beforeEach(() => {
  localStorage.clear();
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack,
    section: "project",
    selectedId: null,
    globalBpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    autosave: { lastSavedAt: null, dirty: false },
  });
  usePlaybackStore.setState({ previewingClipId: null });
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Ctrl+S shortcut", () => {
  it("triggers saveProjectToFile and prevents default", () => {
    render(<Studio />);
    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const prevented = !window.dispatchEvent(event);

    expect(autosave.saveProjectToFile).toHaveBeenCalledTimes(1);
    expect(prevented).toBe(true);
  });

  it("passes current pack, globalBpm, and timeSignature", () => {
    useStudioStore.setState({ globalBpm: 145 });
    render(<Studio />);
    fireEvent.keyDown(window, { key: "s", ctrlKey: true });

    expect(autosave.saveProjectToFile).toHaveBeenCalledWith(
      expect.objectContaining({ meta: expect.objectContaining({ name: expect.any(String) }) }),
      145,
      expect.objectContaining({ numerator: 4, denominator: 4 }),
    );
  });

  it("Ctrl+S works even when focus is in an input", () => {
    render(<Studio />);
    // Ctrl+S should NOT be blocked by the tag check for inputs
    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(autosave.saveProjectToFile).toHaveBeenCalledTimes(1);
  });
});
