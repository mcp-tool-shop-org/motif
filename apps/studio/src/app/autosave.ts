"use client";

import { useStudioStore } from "./store";
import type { SoundtrackPack } from "@motif-studio/schema";
import { validateSoundtrackPack } from "@motif-studio/schema";
import type { TimeSignature } from "./store";

// ── Constants ──

export const AUTOSAVE_KEY = "motif-autosave";
export const AUTOSAVE_DEBOUNCE_MS = 2000;

// ── Serialization envelope (wraps pack + studio-level settings) ──

export interface ProjectFile {
  _format: "motif-project";
  _version: 1;
  pack: SoundtrackPack;
  globalBpm: number;
  timeSignature: TimeSignature;
}

export function createProjectFile(
  pack: SoundtrackPack,
  globalBpm: number,
  timeSignature: TimeSignature,
): ProjectFile {
  return {
    _format: "motif-project",
    _version: 1,
    pack,
    globalBpm,
    timeSignature,
  };
}

export function isValidProjectFile(data: unknown): data is ProjectFile {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (obj._format !== "motif-project") return false;
  if (typeof obj._version !== "number") return false;
  if (typeof obj.pack !== "object" || obj.pack === null) return false;
  const pack = obj.pack as Record<string, unknown>;
  if (typeof pack.meta !== "object" || pack.meta === null) return false;
  if (!Array.isArray(pack.assets)) return false;
  if (!Array.isArray(pack.stems)) return false;
  if (!Array.isArray(pack.scenes)) return false;
  return true;
}

// ── Save to file (download) ──

export function saveProjectToFile(
  pack: SoundtrackPack,
  globalBpm: number,
  timeSignature: TimeSignature,
): void {
  const project = createProjectFile(pack, globalBpm, timeSignature);
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const name = (pack.meta.name || "untitled").replace(/[^a-zA-Z0-9_-]/g, "_");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.motif.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Load from file ──

export function parseProjectFile(text: string): ProjectFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON");
  }

  // Support loading raw SoundtrackPack files (no envelope)
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj._format === "motif-project") {
      if (!isValidProjectFile(data)) {
        throw new Error("Invalid Motif project file");
      }
      // Deep-validate the pack against the Zod schema
      const validation = validateSoundtrackPack(data.pack);
      if (!validation.ok) {
        const summary = validation.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
        throw new Error(`Pack validation failed: ${summary}`);
      }
      return { ...data, pack: validation.data! };
    }
    // Try interpreting as a raw pack
    if (typeof obj.meta === "object" && obj.meta !== null && Array.isArray(obj.assets)) {
      const validation = validateSoundtrackPack(obj);
      if (!validation.ok) {
        const summary = validation.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
        throw new Error(`Pack validation failed: ${summary}`);
      }
      return createProjectFile(validation.data!, 120, { numerator: 4, denominator: 4 });
    }
  }

  throw new Error("Unrecognized file format");
}

// ── Autosave to localStorage ──

let _autosaveTimer: ReturnType<typeof setTimeout> | null = null;

/** Last autosave error message, or null if the last save succeeded. */
export let autosaveError: string | null = null;

export function scheduleAutosave(): void {
  if (_autosaveTimer !== null) {
    clearTimeout(_autosaveTimer);
  }
  _autosaveTimer = setTimeout(() => {
    _autosaveTimer = null;
    const state = useStudioStore.getState();
    const project = createProjectFile(state.pack, state.globalBpm, state.timeSignature);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
        autosaveError = null;
        state._markSaved();
      }
    } catch (err) {
      autosaveError = err instanceof Error ? err.message : "localStorage quota exceeded";
      console.error("[Motif] Autosave failed: localStorage quota exceeded. Save your project manually.");
    }
  }, AUTOSAVE_DEBOUNCE_MS);
}

export function clearAutosaveTimer(): void {
  if (_autosaveTimer !== null) {
    clearTimeout(_autosaveTimer);
    _autosaveTimer = null;
  }
}

export function loadAutosave(): ProjectFile | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!isValidProjectFile(data)) return null;

    // Deep-validate the pack against the Zod schema
    const validation = validateSoundtrackPack(data.pack);
    if (!validation.ok) {
      const summary = validation.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
      console.warn(`[Motif] Autosave pack failed schema validation: ${summary}. Clearing corrupted autosave.`);
      clearAutosave();
      return null;
    }

    return { ...data, pack: validation.data! };
  } catch {
    // Corrupted autosave — clear and ignore
    console.warn("[Motif] Autosave data is corrupted. Clearing autosave.");
    clearAutosave();
  }
  return null;
}

export function clearAutosave(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch {
    // ignore
  }
}

// ── Subscribe to pack mutations for autosave ──

let _unsubscribe: (() => void) | null = null;

export function initAutosave(): () => void {
  if (_unsubscribe) _unsubscribe();

  _unsubscribe = useStudioStore.subscribe(
    (state, prevState) => {
      if (state.pack !== prevState.pack) {
        scheduleAutosave();
      }
    },
  );

  return () => {
    clearAutosaveTimer();
    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
    }
  };
}
