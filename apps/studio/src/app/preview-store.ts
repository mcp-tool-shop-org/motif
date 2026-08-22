"use client";

import { create } from "zustand";
import type { RuntimeMusicState, SoundtrackPack } from "@motif-studio/schema";
import { singleAxisMenuField } from "./pack-fields";

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
  syncPackFields: (pack: SoundtrackPack) => void;
  setSequenceSteps: (steps: RuntimeMusicState[]) => void;
  updateSequenceStep: <K extends keyof RuntimeMusicState>(index: number, field: K, value: RuntimeMusicState[K]) => void;
  addSequenceStep: () => void;
  removeSequenceStep: (index: number) => void;
  duplicateSequenceStep: (index: number) => void;
  resetSequence: (pack?: SoundtrackPack) => void;
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

  /**
   * Seed the manual state for a single-axis menu pack — one whose bindings are
   * a flat `eq` menu on one field, which is how a genre library pack binds (the
   * game names the cue it wants). Without this such a pack opens Preview with
   * every binding rejected, because the built-in mode/danger/flag controls
   * can't set the field it keys on.
   *
   * Only fires when the current value can't match this pack, so it seeds on
   * first load and re-seeds across a pack switch, but never overwrites a
   * choice. Multi-axis game packs are left alone: there is no defensible
   * default combination of their flags, so the director drives them by hand.
   */
  syncPackFields: (pack) =>
    set((state) => {
      const menu = singleAxisMenuField(pack);
      if (!menu || menu.options.length === 0) return state;

      const current = state.manualState[menu.field];
      if (current !== undefined && menu.options.includes(current as string | number | boolean)) {
        return state;
      }

      return {
        // A transition out of the previous pack's scene is meaningless.
        previousManualState: null,
        manualState: { ...state.manualState, [menu.field]: menu.options[0] },
      };
    }),

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

  /**
   * For a single-axis menu pack, the example flow is the menu itself — one step
   * per cue, so Sequence mode walks the pack. Every other pack (and the no-arg
   * call) gets the authored escalation flow.
   */
  resetSequence: (pack) =>
    set(() => {
      const menu = pack ? singleAxisMenuField(pack) : null;
      if (menu && menu.options.length > 0) {
        return {
          sequenceSteps: menu.options.map((value) => ({ [menu.field]: value })),
        };
      }
      return { sequenceSteps: defaultSequence.map((s) => ({ ...s })) };
    }),
}));
