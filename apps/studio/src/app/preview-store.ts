"use client";

import { create } from "zustand";
import type { RuntimeMusicState } from "@motif/schema";

export type PreviewMode = "manual" | "sequence";

// ── Default example sequence ──

const defaultSequence: RuntimeMusicState[] = [
  { mode: "exploration", danger: 0, inCombat: false, boss: false, safeZone: false, victory: false },
  { mode: "exploration", danger: 0.5, inCombat: false, boss: false, safeZone: false, victory: false },
  { mode: "exploration", danger: 0.8, inCombat: true, boss: false, safeZone: false, victory: false },
  { mode: "exploration", danger: 1.0, inCombat: true, boss: true, safeZone: false, victory: false },
  { mode: "exploration", danger: 0, inCombat: false, boss: false, safeZone: false, victory: true },
  { mode: "exploration", danger: 0, inCombat: false, boss: false, safeZone: true, victory: false },
];

const defaultManualState: RuntimeMusicState = {
  mode: "exploration",
  danger: 0,
  inCombat: false,
  boss: false,
  safeZone: false,
  victory: false,
  region: "",
  faction: "",
};

export interface PreviewState {
  previewMode: PreviewMode;
  manualState: RuntimeMusicState;
  previousManualState: RuntimeMusicState | null;
  sequenceSteps: RuntimeMusicState[];

  setPreviewMode: (mode: PreviewMode) => void;
  setManualField: <K extends keyof RuntimeMusicState>(field: K, value: RuntimeMusicState[K]) => void;
  snapshotManualState: () => void;
  setSequenceSteps: (steps: RuntimeMusicState[]) => void;
  updateSequenceStep: <K extends keyof RuntimeMusicState>(index: number, field: K, value: RuntimeMusicState[K]) => void;
  addSequenceStep: () => void;
  removeSequenceStep: (index: number) => void;
  duplicateSequenceStep: (index: number) => void;
  resetSequence: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  previewMode: "manual",
  manualState: { ...defaultManualState },
  previousManualState: null,
  sequenceSteps: defaultSequence.map((s) => ({ ...s })),

  setPreviewMode: (previewMode) => set({ previewMode }),

  setManualField: (field, value) =>
    set((state) => ({
      previousManualState: { ...state.manualState },
      manualState: { ...state.manualState, [field]: value },
    })),

  snapshotManualState: () =>
    set((state) => ({
      previousManualState: { ...state.manualState },
    })),

  setSequenceSteps: (sequenceSteps) => set({ sequenceSteps }),

  updateSequenceStep: (index, field, value) =>
    set((state) => ({
      sequenceSteps: state.sequenceSteps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step,
      ),
    })),

  addSequenceStep: () =>
    set((state) => ({
      sequenceSteps: [
        ...state.sequenceSteps,
        { ...defaultManualState },
      ],
    })),

  removeSequenceStep: (index) =>
    set((state) => ({
      sequenceSteps: state.sequenceSteps.filter((_, i) => i !== index),
    })),

  duplicateSequenceStep: (index) =>
    set((state) => {
      if (index < 0 || index >= state.sequenceSteps.length) return state;
      const copy = { ...state.sequenceSteps[index] };
      const steps = [...state.sequenceSteps];
      steps.splice(index + 1, 0, copy);
      return { sequenceSteps: steps };
    }),

  resetSequence: () =>
    set({ sequenceSteps: defaultSequence.map((s) => ({ ...s })) }),
}));
