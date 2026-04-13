// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useStudioStore } from "../src/app/store";
import {
  AUTOSAVE_KEY,
  createProjectFile,
  parseProjectFile,
  isValidProjectFile,
  loadAutosave,
  scheduleAutosave,
  clearAutosaveTimer,
  clearAutosave,
} from "../src/app/autosave";
import type { SoundtrackPack } from "@motif-studio/schema";

const testPack: SoundtrackPack = {
  meta: { id: "test-pack", name: "Test Pack", version: "1.0.0", schemaVersion: "1" },
  assets: [],
  stems: [],
  scenes: [],
  bindings: [],
  transitions: [],
};

beforeEach(() => {
  localStorage.clear();
  clearAutosaveTimer();
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(testPack)),
    section: "project",
    selectedId: null,
    globalBpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    autosave: { lastSavedAt: null, dirty: false },
  });
});

afterEach(() => {
  clearAutosaveTimer();
  localStorage.clear();
});

// ── createProjectFile ──

describe("createProjectFile", () => {
  it("creates a valid project envelope", () => {
    const project = createProjectFile(testPack, 140, { numerator: 3, denominator: 4 });
    expect(project._format).toBe("motif-project");
    expect(project._version).toBe(1);
    expect(project.pack.meta.id).toBe("test-pack");
    expect(project.globalBpm).toBe(140);
    expect(project.timeSignature).toEqual({ numerator: 3, denominator: 4 });
  });
});

// ── isValidProjectFile ──

describe("isValidProjectFile", () => {
  it("accepts a valid project file", () => {
    const project = createProjectFile(testPack, 120, { numerator: 4, denominator: 4 });
    expect(isValidProjectFile(project)).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidProjectFile(null)).toBe(false);
  });

  it("rejects missing _format", () => {
    expect(isValidProjectFile({ _version: 1, pack: testPack })).toBe(false);
  });

  it("rejects missing pack arrays", () => {
    expect(
      isValidProjectFile({
        _format: "motif-project",
        _version: 1,
        pack: { meta: { id: "x" } },
      }),
    ).toBe(false);
  });
});

// ── parseProjectFile ──

describe("parseProjectFile", () => {
  it("parses a valid project file", () => {
    const project = createProjectFile(testPack, 140, { numerator: 6, denominator: 8 });
    const parsed = parseProjectFile(JSON.stringify(project));
    expect(parsed.pack.meta.name).toBe("Test Pack");
    expect(parsed.globalBpm).toBe(140);
    expect(parsed.timeSignature).toEqual({ numerator: 6, denominator: 8 });
  });

  it("parses a raw SoundtrackPack (no envelope)", () => {
    const parsed = parseProjectFile(JSON.stringify(testPack));
    expect(parsed._format).toBe("motif-project");
    expect(parsed.pack.meta.id).toBe("test-pack");
    expect(parsed.globalBpm).toBe(120); // default
  });

  it("throws on invalid JSON", () => {
    expect(() => parseProjectFile("not json")).toThrow("File is not valid JSON");
  });

  it("throws on unrecognized format", () => {
    expect(() => parseProjectFile(JSON.stringify({ foo: "bar" }))).toThrow(
      "Unrecognized file format",
    );
  });

  it("throws on invalid project structure", () => {
    expect(() =>
      parseProjectFile(
        JSON.stringify({
          _format: "motif-project",
          _version: 1,
          pack: { meta: null },
        }),
      ),
    ).toThrow("Invalid Motif project file");
  });
});

// ── Autosave to localStorage ──

describe("autosave localStorage", () => {
  it("scheduleAutosave writes to localStorage after debounce", async () => {
    vi.useFakeTimers();
    scheduleAutosave();
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();

    vi.advanceTimersByTime(2100);
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    expect(raw).not.toBeNull();
    const saved = JSON.parse(raw!);
    expect(saved._format).toBe("motif-project");
    expect(saved.pack.meta.id).toBe("test-pack");

    // Check that _markSaved was called
    const state = useStudioStore.getState();
    expect(state.autosave.dirty).toBe(false);
    expect(state.autosave.lastSavedAt).not.toBeNull();

    vi.useRealTimers();
  });

  it("clearAutosaveTimer cancels pending save", () => {
    vi.useFakeTimers();
    scheduleAutosave();
    clearAutosaveTimer();
    vi.advanceTimersByTime(3000);
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
    vi.useRealTimers();
  });

  it("loadAutosave returns null when nothing saved", () => {
    expect(loadAutosave()).toBeNull();
  });

  it("loadAutosave returns saved project", () => {
    const project = createProjectFile(testPack, 120, { numerator: 4, denominator: 4 });
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
    const loaded = loadAutosave();
    expect(loaded).not.toBeNull();
    expect(loaded!.pack.meta.id).toBe("test-pack");
  });

  it("loadAutosave returns null on corrupted data", () => {
    localStorage.setItem(AUTOSAVE_KEY, "not json");
    expect(loadAutosave()).toBeNull();
  });

  it("clearAutosave removes the localStorage item", () => {
    localStorage.setItem(AUTOSAVE_KEY, "test");
    clearAutosave();
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
  });
});
