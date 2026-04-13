"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  SoundtrackPack,
  SoundtrackPackMeta,
  AudioAsset,
  Stem,
  Scene,
  SceneLayerRef,
  SceneClipRef,
  TriggerBinding,
  TriggerCondition,
  TransitionRule,
  Clip,
  ClipNote,
  ClipVariant,
  Cue,
  CueSection,
  PerformanceCapture,
  SampleSlice,
  SampleKit,
  SampleKitSlot,
  SampleInstrument,
  AssetSourceType,
  MotifFamily,
  ScoreProfile,
  CueFamily,
  ScoreMapEntry,
  DerivationRecord,
  AutomationLane,
  MacroMapping,
  MacroState,
  SectionEnvelope,
  AutomationCapture,
  LibraryTemplate,
  Snapshot,
  Branch,
  Favorite,
  Collection,
} from "@motif/schema";

// ── Section type ──

export type Section =
  | "arrangement"
  | "project"
  | "overview"
  | "assets"
  | "stems"
  | "scenes"
  | "clips"
  | "bindings"
  | "transitions"
  | "review"
  | "preview"
  | "performance"
  | "cues"
  | "mixer"
  | "export"
  | "sample-lab"
  | "score-map"
  | "automation"
  | "library";

// ── Undo/redo constants ──

export const UNDO_MAX = 50;
const UNDO_DEBOUNCE_MS = 500;

// ── Store shape ──

// ── Time signature ──

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

// ── Autosave state ──

export interface AutosaveState {
  lastSavedAt: string | null;
  dirty: boolean;
}

export interface StudioState {
  pack: SoundtrackPack;
  section: Section;
  selectedId: string | null;

  // Global BPM & time signature (studio-level, serialized in save files)
  globalBpm: number;
  timeSignature: TimeSignature;
  setGlobalBpm: (bpm: number) => void;
  setTimeSignature: (ts: TimeSignature) => void;

  // Autosave
  autosave: AutosaveState;
  _markDirty: () => void;
  _markSaved: () => void;

  // Undo/redo
  undoStack: SoundtrackPack[];
  redoStack: SoundtrackPack[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Navigation
  setSection: (s: Section) => void;
  setSelectedId: (id: string | null) => void;

  // Pack loading
  loadPack: (pack: SoundtrackPack) => void;

  // Meta editing
  updateMeta: (partial: Partial<SoundtrackPackMeta>) => void;

  // Asset CRUD
  addAsset: (asset: AudioAsset) => void;
  updateAsset: (id: string, partial: Partial<AudioAsset>) => void;
  deleteAsset: (id: string) => void;

  // Asset search / filter
  assetSearchQuery: string;
  assetTagFilter: string | null;
  assetSourceFilter: AssetSourceType | null;
  setAssetSearchQuery: (q: string) => void;
  setAssetTagFilter: (t: string | null) => void;
  setAssetSourceFilter: (s: AssetSourceType | null) => void;

  // Stem CRUD
  addStem: (stem: Stem) => void;
  updateStem: (id: string, partial: Partial<Stem>) => void;
  deleteStem: (id: string) => void;

  // Scene CRUD
  addScene: (scene: Scene) => void;
  updateScene: (id: string, partial: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  addSceneLayer: (sceneId: string, layer: SceneLayerRef) => void;
  updateSceneLayer: (
    sceneId: string,
    layerIndex: number,
    partial: Partial<SceneLayerRef>,
  ) => void;
  removeSceneLayer: (sceneId: string, layerIndex: number) => void;

  // Binding CRUD
  addBinding: (binding: TriggerBinding) => void;
  updateBinding: (id: string, partial: Partial<TriggerBinding>) => void;
  deleteBinding: (id: string) => void;
  addBindingCondition: (
    bindingId: string,
    condition: TriggerCondition,
  ) => void;
  updateBindingCondition: (
    bindingId: string,
    conditionIndex: number,
    partial: Partial<TriggerCondition>,
  ) => void;
  removeBindingCondition: (
    bindingId: string,
    conditionIndex: number,
  ) => void;

  // Transition CRUD
  addTransition: (transition: TransitionRule) => void;
  updateTransition: (id: string, partial: Partial<TransitionRule>) => void;
  deleteTransition: (id: string) => void;

  // Clip CRUD
  addClip: (clip: Clip) => void;
  updateClip: (id: string, partial: Partial<Clip>) => void;
  deleteClip: (id: string) => void;
  addClipNote: (clipId: string, note: ClipNote) => void;
  updateClipNote: (
    clipId: string,
    noteIndex: number,
    partial: Partial<ClipNote>,
  ) => void;
  removeClipNote: (clipId: string, noteIndex: number) => void;

  // Scene clip-layer CRUD
  addSceneClipLayer: (sceneId: string, ref: SceneClipRef) => void;
  updateSceneClipLayer: (
    sceneId: string,
    layerIndex: number,
    partial: Partial<SceneClipRef>,
  ) => void;
  removeSceneClipLayer: (sceneId: string, layerIndex: number) => void;

  // Clip variant CRUD
  addClipVariant: (clipId: string, variant: ClipVariant) => void;
  updateClipVariant: (
    clipId: string,
    variantId: string,
    partial: Partial<ClipVariant>,
  ) => void;
  removeClipVariant: (clipId: string, variantId: string) => void;
  duplicateClipAsVariant: (clipId: string, variantName: string) => void;

  // Cue actions
  addCue: (cue: Cue) => void;
  updateCue: (id: string, partial: Partial<Cue>) => void;
  deleteCue: (id: string) => void;
  addCueSection: (cueId: string, section: CueSection) => void;
  updateCueSection: (cueId: string, sectionId: string, partial: Partial<CueSection>) => void;
  removeCueSection: (cueId: string, sectionId: string) => void;
  reorderCueSections: (cueId: string, sectionIds: string[]) => void;

  // Capture actions
  captures: PerformanceCapture[];
  addCapture: (capture: PerformanceCapture) => void;
  deleteCapture: (id: string) => void;

  // Sample slices
  addSampleSlice: (slice: SampleSlice) => void;
  updateSampleSlice: (id: string, update: Partial<SampleSlice>) => void;
  deleteSampleSlice: (id: string) => void;

  // Sample kits
  addSampleKit: (kit: SampleKit) => void;
  updateSampleKit: (id: string, update: Partial<SampleKit>) => void;
  deleteSampleKit: (id: string) => void;
  addSampleKitSlot: (kitId: string, slot: SampleKitSlot) => void;
  updateSampleKitSlot: (kitId: string, pitch: number, update: Partial<Omit<SampleKitSlot, "pitch">>) => void;
  removeSampleKitSlot: (kitId: string, pitch: number) => void;

  // Sample instruments
  addSampleInstrument: (inst: SampleInstrument) => void;
  updateSampleInstrument: (id: string, update: Partial<SampleInstrument>) => void;
  deleteSampleInstrument: (id: string) => void;

  // Motif families
  addMotifFamily: (family: MotifFamily) => void;
  updateMotifFamily: (id: string, update: Partial<MotifFamily>) => void;
  deleteMotifFamily: (id: string) => void;

  // Score profiles
  addScoreProfile: (profile: ScoreProfile) => void;
  updateScoreProfile: (id: string, update: Partial<ScoreProfile>) => void;
  deleteScoreProfile: (id: string) => void;

  // Cue families
  addCueFamily: (family: CueFamily) => void;
  updateCueFamily: (id: string, update: Partial<CueFamily>) => void;
  deleteCueFamily: (id: string) => void;

  // Score map
  addScoreMapEntry: (entry: ScoreMapEntry) => void;
  updateScoreMapEntry: (id: string, update: Partial<ScoreMapEntry>) => void;
  deleteScoreMapEntry: (id: string) => void;

  // Derivations
  addDerivation: (record: DerivationRecord) => void;
  deleteDerivation: (id: string) => void;

  // Automation lanes
  addAutomationLane: (lane: AutomationLane) => void;
  updateAutomationLane: (id: string, update: Partial<AutomationLane>) => void;
  deleteAutomationLane: (id: string) => void;

  // Macro mappings
  addMacroMapping: (mapping: MacroMapping) => void;
  updateMacroMapping: (id: string, update: Partial<MacroMapping>) => void;
  deleteMacroMapping: (id: string) => void;

  // Macro state (live performance)
  macroState: MacroState;
  setMacroState: (update: Partial<MacroState>) => void;

  // Section envelopes
  addSectionEnvelope: (envelope: SectionEnvelope) => void;
  updateSectionEnvelope: (id: string, update: Partial<SectionEnvelope>) => void;
  deleteSectionEnvelope: (id: string) => void;

  // Automation captures
  addAutomationCapture: (capture: AutomationCapture) => void;
  deleteAutomationCapture: (id: string) => void;

  // Library: templates
  addTemplate: (template: LibraryTemplate) => void;
  updateTemplate: (id: string, update: Partial<LibraryTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Library: snapshots
  addSnapshot: (snapshot: Snapshot) => void;
  deleteSnapshot: (id: string) => void;

  // Library: branches
  addBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;

  // Library: favorites
  addFavorite: (fav: Favorite) => void;
  deleteFavorite: (id: string) => void;

  // Library: collections
  addCollection: (col: Collection) => void;
  updateCollection: (id: string, update: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
}

// ── Default empty pack ──

const emptyPack: SoundtrackPack = {
  meta: {
    id: "new-pack",
    name: "New Pack",
    version: "1.0.0",
    schemaVersion: "1",
  },
  assets: [],
  stems: [],
  scenes: [],
  bindings: [],
  transitions: [],
};

// ── Helper: fix selection after delete ──

function fixSelection(
  items: { id: string }[],
  deletedId: string,
  currentSelectedId: string | null,
): string | null {
  if (currentSelectedId !== deletedId) return currentSelectedId;
  if (items.length === 0) return null;
  return items[0].id;
}

// ── Store ──

// Debounce timer for undo pushes — collapses rapid mutations into one snapshot
let _undoDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let _undoPending = false;

/** Push current pack onto undo stack (debounced). Call before any pack mutation. */
function _pushUndo(set: (fn: (state: StudioState) => Partial<StudioState>) => void) {
  if (_undoPending) return; // already scheduled for this debounce window
  _undoPending = true;

  if (_undoDebounceTimer !== null) {
    clearTimeout(_undoDebounceTimer);
  }
  // Capture immediately — we want the pack BEFORE the mutation
  set((state) => {
    const newStack = [...state.undoStack, JSON.parse(JSON.stringify(state.pack)) as SoundtrackPack];
    if (newStack.length > UNDO_MAX) newStack.shift();
    return {
      undoStack: newStack,
      redoStack: [],
      canUndo: true,
      canRedo: false,
    };
  });

  _undoDebounceTimer = setTimeout(() => {
    _undoPending = false;
    _undoDebounceTimer = null;
  }, UNDO_DEBOUNCE_MS);
}

export const useStudioStore = create<StudioState>()(devtools((set) => ({
  pack: emptyPack,
  section: "arrangement",
  selectedId: null,

  // Global BPM & time signature
  globalBpm: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  setGlobalBpm: (bpm) => {
    const clamped = Math.max(20, Math.min(999, Math.round(bpm)));
    set({ globalBpm: clamped });
  },
  setTimeSignature: (ts) => set({ timeSignature: ts }),

  // Autosave
  autosave: { lastSavedAt: null, dirty: false },
  _markDirty: () => set((s) => ({ autosave: { ...s.autosave, dirty: true } })),
  _markSaved: () => set({ autosave: { lastSavedAt: new Date().toISOString(), dirty: false } }),

  // Undo/redo state
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const newUndoStack = [...state.undoStack];
      const prevPack = newUndoStack.pop()!;
      const newRedoStack = [...state.redoStack, JSON.parse(JSON.stringify(state.pack)) as SoundtrackPack];
      return {
        pack: prevPack,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        canUndo: newUndoStack.length > 0,
        canRedo: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const newRedoStack = [...state.redoStack];
      const nextPack = newRedoStack.pop()!;
      const newUndoStack = [...state.undoStack, JSON.parse(JSON.stringify(state.pack)) as SoundtrackPack];
      return {
        pack: nextPack,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        canUndo: true,
        canRedo: newRedoStack.length > 0,
      };
    }),

  setSection: (section) => set({ section, selectedId: null }),
  setSelectedId: (selectedId) => set({ selectedId }),

  loadPack: (pack) => set({ pack, section: "arrangement", selectedId: null, undoStack: [], redoStack: [], canUndo: false, canRedo: false, autosave: { lastSavedAt: null, dirty: false } }),

  // Meta
  updateMeta: (partial) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, meta: { ...state.pack.meta, ...partial } },
      autosave: { ...state.autosave, dirty: true },
    }));
  },

  // Asset search / filter
  assetSearchQuery: "",
  assetTagFilter: null,
  assetSourceFilter: null,
  setAssetSearchQuery: (assetSearchQuery) => set({ assetSearchQuery }),
  setAssetTagFilter: (assetTagFilter) => set({ assetTagFilter }),
  setAssetSourceFilter: (assetSourceFilter) => set({ assetSourceFilter }),

  // Assets
  addAsset: (asset) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, assets: [...state.pack.assets, asset] },
      selectedId: asset.id,
    }));
  },
  updateAsset: (id, partial) => {
    _pushUndo(set);
    return set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = partial;
      return {
        pack: {
          ...state.pack,
          assets: state.pack.assets.map((a) =>
            a.id === id ? { ...a, ...rest } : a,
          ),
        },
      };
    });
  },
  deleteAsset: (id) => {
    _pushUndo(set);
    return set((state) => {
      const assets = state.pack.assets.filter((a) => a.id !== id);
      return {
        pack: { ...state.pack, assets },
        selectedId: fixSelection(assets, id, state.selectedId),
      };
    });
  },

  // Stems
  addStem: (stem) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, stems: [...state.pack.stems, stem] },
      selectedId: stem.id,
    }));
  },
  updateStem: (id, partial) => {
    _pushUndo(set);
    return set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = partial;
      return {
        pack: {
          ...state.pack,
          stems: state.pack.stems.map((s) =>
            s.id === id ? { ...s, ...rest } : s,
          ),
        },
      };
    });
  },
  deleteStem: (id) => {
    _pushUndo(set);
    return set((state) => {
      const stems = state.pack.stems.filter((s) => s.id !== id);
      return {
        pack: { ...state.pack, stems },
        selectedId: fixSelection(stems, id, state.selectedId),
      };
    });
  },

  // Scenes
  addScene: (scene) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, scenes: [...state.pack.scenes, scene] },
      selectedId: scene.id,
    }));
  },
  updateScene: (id, partial) => {
    _pushUndo(set);
    return set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = partial;
      return {
        pack: {
          ...state.pack,
          scenes: state.pack.scenes.map((s) =>
            s.id === id ? { ...s, ...rest } : s,
          ),
        },
      };
    });
  },
  deleteScene: (id) => {
    _pushUndo(set);
    return set((state) => {
      const scenes = state.pack.scenes.filter((s) => s.id !== id);
      return {
        pack: { ...state.pack, scenes },
        selectedId: fixSelection(scenes, id, state.selectedId),
      };
    });
  },
  addSceneLayer: (sceneId, layer) => {
    _pushUndo(set);
    return set((state) => {
      if (process.env.NODE_ENV !== "production" && !state.pack.scenes.some((s) => s.id === sceneId)) {
        console.warn(`[store] addSceneLayer: scene "${sceneId}" not found`);
      }
      return {
        pack: {
          ...state.pack,
          scenes: state.pack.scenes.map((s) =>
            s.id === sceneId ? { ...s, layers: [...s.layers, layer] } : s,
          ),
        },
      };
    });
  },
  updateSceneLayer: (sceneId, layerIndex, partial) => {
    _pushUndo(set);
    return set((state) => {
      if (process.env.NODE_ENV !== "production" && !state.pack.scenes.some((s) => s.id === sceneId)) {
        console.warn(`[store] updateSceneLayer: scene "${sceneId}" not found`);
      }
      return {
        pack: {
          ...state.pack,
          scenes: state.pack.scenes.map((s) =>
            s.id === sceneId
              ? {
                  ...s,
                  layers: s.layers.map((l, i) =>
                    i === layerIndex ? { ...l, ...partial } : l,
                  ),
                }
              : s,
          ),
        },
      };
    });
  },
  removeSceneLayer: (sceneId, layerIndex) => {
    _pushUndo(set);
    return set((state) => {
      if (process.env.NODE_ENV !== "production" && !state.pack.scenes.some((s) => s.id === sceneId)) {
        console.warn(`[store] removeSceneLayer: scene "${sceneId}" not found`);
      }
      return {
        pack: {
          ...state.pack,
          scenes: state.pack.scenes.map((s) =>
            s.id === sceneId
              ? { ...s, layers: s.layers.filter((_, i) => i !== layerIndex) }
              : s,
          ),
        },
      };
    });
  },

  // Bindings
  addBinding: (binding) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, bindings: [...state.pack.bindings, binding] },
      selectedId: binding.id,
    }));
  },
  updateBinding: (id, partial) => {
    _pushUndo(set);
    return set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = partial;
      return {
        pack: {
          ...state.pack,
          bindings: state.pack.bindings.map((b) =>
            b.id === id ? { ...b, ...rest } : b,
          ),
        },
      };
    });
  },
  deleteBinding: (id) => {
    _pushUndo(set);
    return set((state) => {
      const bindings = state.pack.bindings.filter((b) => b.id !== id);
      return {
        pack: { ...state.pack, bindings },
        selectedId: fixSelection(bindings, id, state.selectedId),
      };
    });
  },
  addBindingCondition: (bindingId, condition) => {
    _pushUndo(set);
    return set((state) => {
      if (process.env.NODE_ENV !== "production" && !state.pack.bindings.some((b) => b.id === bindingId)) {
        console.warn(`[store] addBindingCondition: binding "${bindingId}" not found`);
      }
      return {
        pack: {
          ...state.pack,
          bindings: state.pack.bindings.map((b) =>
            b.id === bindingId
              ? { ...b, conditions: [...b.conditions, condition] }
              : b,
          ),
        },
      };
    });
  },
  updateBindingCondition: (bindingId, conditionIndex, partial) => {
    _pushUndo(set);
    return set((state) => {
      if (process.env.NODE_ENV !== "production" && !state.pack.bindings.some((b) => b.id === bindingId)) {
        console.warn(`[store] updateBindingCondition: binding "${bindingId}" not found`);
      }
      return {
        pack: {
          ...state.pack,
          bindings: state.pack.bindings.map((b) =>
            b.id === bindingId
              ? {
                  ...b,
                  conditions: b.conditions.map((c, i) =>
                    i === conditionIndex ? { ...c, ...partial } : c,
                  ),
                }
              : b,
          ),
        },
      };
    });
  },
  removeBindingCondition: (bindingId, conditionIndex) => {
    _pushUndo(set);
    return set((state) => {
      if (process.env.NODE_ENV !== "production" && !state.pack.bindings.some((b) => b.id === bindingId)) {
        console.warn(`[store] removeBindingCondition: binding "${bindingId}" not found`);
      }
      return {
        pack: {
          ...state.pack,
          bindings: state.pack.bindings.map((b) =>
            b.id === bindingId
              ? {
                  ...b,
                  conditions: b.conditions.filter(
                    (_, i) => i !== conditionIndex,
                  ),
                }
              : b,
          ),
        },
      };
    });
  },

  // Transitions
  addTransition: (transition) => {
    _pushUndo(set);
    return set((state) => ({
      pack: {
        ...state.pack,
        transitions: [...state.pack.transitions, transition],
      },
      selectedId: transition.id,
    }));
  },
  updateTransition: (id, partial) => {
    _pushUndo(set);
    return set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = partial;
      return {
        pack: {
          ...state.pack,
          transitions: state.pack.transitions.map((t) =>
            t.id === id ? { ...t, ...rest } : t,
          ),
        },
      };
    });
  },
  deleteTransition: (id) => {
    _pushUndo(set);
    return set((state) => {
      const transitions = state.pack.transitions.filter((t) => t.id !== id);
      return {
        pack: { ...state.pack, transitions },
        selectedId: fixSelection(transitions, id, state.selectedId),
      };
    });
  },

  // Clips
  addClip: (clip) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: [...(state.pack.clips ?? []), clip] },
      selectedId: clip.id,
    }));
  },
  updateClip: (id, partial) => {
    _pushUndo(set);
    return set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = partial;
      return {
        pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === id ? { ...c, ...rest } : c) },
      };
    });
  },
  deleteClip: (id) => {
    _pushUndo(set);
    return set((state) => {
      const clips = (state.pack.clips ?? []).filter((c) => c.id !== id);
      return { pack: { ...state.pack, clips }, selectedId: fixSelection(clips, id, state.selectedId) };
    });
  },
  addClipNote: (clipId, note) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === clipId ? { ...c, notes: [...c.notes, note] } : c) },
    }));
  },
  updateClipNote: (clipId, noteIndex, partial) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === clipId ? { ...c, notes: c.notes.map((n, i) => i === noteIndex ? { ...n, ...partial } : n) } : c) },
    }));
  },
  removeClipNote: (clipId, noteIndex) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === clipId ? { ...c, notes: c.notes.filter((_, i) => i !== noteIndex) } : c) },
    }));
  },

  // Scene clip layers
  addSceneClipLayer: (sceneId, ref) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, scenes: state.pack.scenes.map((s) => s.id === sceneId ? { ...s, clipLayers: [...(s.clipLayers ?? []), ref] } : s) },
    }));
  },
  updateSceneClipLayer: (sceneId, layerIndex, partial) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, scenes: state.pack.scenes.map((s) => s.id === sceneId ? { ...s, clipLayers: (s.clipLayers ?? []).map((l, i) => i === layerIndex ? { ...l, ...partial } : l) } : s) },
    }));
  },
  removeSceneClipLayer: (sceneId, layerIndex) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, scenes: state.pack.scenes.map((s) => s.id === sceneId ? { ...s, clipLayers: (s.clipLayers ?? []).filter((_, i) => i !== layerIndex) } : s) },
    }));
  },

  // Clip variants
  addClipVariant: (clipId, variant) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === clipId ? { ...c, variants: [...(c.variants ?? []), variant] } : c) },
    }));
  },
  updateClipVariant: (clipId, variantId, partial) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === clipId ? { ...c, variants: (c.variants ?? []).map((v) => v.id === variantId ? { ...v, ...partial } : v) } : c) },
    }));
  },
  removeClipVariant: (clipId, variantId) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => c.id === clipId ? { ...c, variants: (c.variants ?? []).filter((v) => v.id !== variantId) } : c) },
    }));
  },
  duplicateClipAsVariant: (clipId, variantName) => {
    _pushUndo(set);
    return set((state) => ({
      pack: { ...state.pack, clips: (state.pack.clips ?? []).map((c) => {
        if (c.id !== clipId) return c;
        const variant: ClipVariant = { id: `var-${crypto.randomUUID()}`, name: variantName, notes: [...c.notes] };
        return { ...c, variants: [...(c.variants ?? []), variant] };
      }) },
    }));
  },

  // ── Cue actions ──
  addCue: (cue) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cues: [...(state.pack.cues ?? []), cue] }, selectedId: cue.id,
  })); },
  updateCue: (id, partial) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cues: (state.pack.cues ?? []).map((c) => c.id === id ? { ...c, ...partial } : c) },
  })); },
  deleteCue: (id) => { _pushUndo(set); return set((state) => {
    const cues = (state.pack.cues ?? []).filter((c) => c.id !== id);
    return { pack: { ...state.pack, cues }, selectedId: fixSelection(cues, id, state.selectedId) };
  }); },
  addCueSection: (cueId, section) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cues: (state.pack.cues ?? []).map((c) => c.id === cueId ? { ...c, sections: [...c.sections, section] } : c) },
  })); },
  updateCueSection: (cueId, sectionId, partial) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cues: (state.pack.cues ?? []).map((c) => c.id === cueId ? { ...c, sections: c.sections.map((s) => s.id === sectionId ? { ...s, ...partial } : s) } : c) },
  })); },
  removeCueSection: (cueId, sectionId) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cues: (state.pack.cues ?? []).map((c) => c.id === cueId ? { ...c, sections: c.sections.filter((s) => s.id !== sectionId) } : c) },
  })); },
  reorderCueSections: (cueId, sectionIds) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cues: (state.pack.cues ?? []).map((c) => {
      if (c.id !== cueId) return c;
      const byId = new Map(c.sections.map((s) => [s.id, s]));
      const reordered = sectionIds.map((id) => byId.get(id)).filter(Boolean) as CueSection[];
      return { ...c, sections: reordered };
    }) },
  })); },

  // ── Capture actions (not pack mutations — no undo) ──
  captures: [],
  addCapture: (capture) => set((state) => ({ captures: [...state.captures, capture] })),
  deleteCapture: (id) => set((state) => ({ captures: state.captures.filter((c) => c.id !== id) })),

  // ── Sample slices ──
  addSampleSlice: (slice) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleSlices: [...(state.pack.sampleSlices ?? []), slice] },
  })); },
  updateSampleSlice: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleSlices: (state.pack.sampleSlices ?? []).map((sl) => sl.id === id ? { ...sl, ...update } : sl) },
  })); },
  deleteSampleSlice: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleSlices: (state.pack.sampleSlices ?? []).filter((sl) => sl.id !== id) },
  })); },

  // ── Sample kits ──
  addSampleKit: (kit) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleKits: [...(state.pack.sampleKits ?? []), kit] },
  })); },
  updateSampleKit: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleKits: (state.pack.sampleKits ?? []).map((k) => k.id === id ? { ...k, ...update } : k) },
  })); },
  deleteSampleKit: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleKits: (state.pack.sampleKits ?? []).filter((k) => k.id !== id) },
  })); },
  addSampleKitSlot: (kitId, slot) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleKits: (state.pack.sampleKits ?? []).map((k) => k.id === kitId ? { ...k, slots: [...k.slots, slot] } : k) },
  })); },
  updateSampleKitSlot: (kitId, pitch, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleKits: (state.pack.sampleKits ?? []).map((k) => k.id === kitId ? { ...k, slots: k.slots.map((sl) => sl.pitch === pitch ? { ...sl, ...update } : sl) } : k) },
  })); },
  removeSampleKitSlot: (kitId, pitch) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleKits: (state.pack.sampleKits ?? []).map((k) => k.id === kitId ? { ...k, slots: k.slots.filter((sl) => sl.pitch !== pitch) } : k) },
  })); },

  // ── Sample instruments ──
  addSampleInstrument: (inst) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleInstruments: [...(state.pack.sampleInstruments ?? []), inst] },
  })); },
  updateSampleInstrument: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleInstruments: (state.pack.sampleInstruments ?? []).map((i) => i.id === id ? { ...i, ...update } : i) },
  })); },
  deleteSampleInstrument: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sampleInstruments: (state.pack.sampleInstruments ?? []).filter((i) => i.id !== id) },
  })); },

  // ── Motif families ──
  addMotifFamily: (family) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, motifFamilies: [...(state.pack.motifFamilies ?? []), family] },
  })); },
  updateMotifFamily: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, motifFamilies: (state.pack.motifFamilies ?? []).map((f) => f.id === id ? { ...f, ...update } : f) },
  })); },
  deleteMotifFamily: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, motifFamilies: (state.pack.motifFamilies ?? []).filter((f) => f.id !== id) },
  })); },

  // ── Score profiles ──
  addScoreProfile: (profile) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, scoreProfiles: [...(state.pack.scoreProfiles ?? []), profile] },
  })); },
  updateScoreProfile: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, scoreProfiles: (state.pack.scoreProfiles ?? []).map((pr) => pr.id === id ? { ...pr, ...update } : pr) },
  })); },
  deleteScoreProfile: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, scoreProfiles: (state.pack.scoreProfiles ?? []).filter((pr) => pr.id !== id) },
  })); },

  // ── Cue families ──
  addCueFamily: (family) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cueFamilies: [...(state.pack.cueFamilies ?? []), family] },
  })); },
  updateCueFamily: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cueFamilies: (state.pack.cueFamilies ?? []).map((f) => f.id === id ? { ...f, ...update } : f) },
  })); },
  deleteCueFamily: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, cueFamilies: (state.pack.cueFamilies ?? []).filter((f) => f.id !== id) },
  })); },

  // ── Score map ──
  addScoreMapEntry: (entry) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, scoreMap: [...(state.pack.scoreMap ?? []), entry] },
  })); },
  updateScoreMapEntry: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, scoreMap: (state.pack.scoreMap ?? []).map((e) => e.id === id ? { ...e, ...update } : e) },
  })); },
  deleteScoreMapEntry: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, scoreMap: (state.pack.scoreMap ?? []).filter((e) => e.id !== id) },
  })); },

  // ── Derivations ──
  addDerivation: (record) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, derivations: [...(state.pack.derivations ?? []), record] },
  })); },
  deleteDerivation: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, derivations: (state.pack.derivations ?? []).filter((d) => d.id !== id) },
  })); },

  // ── Automation lanes ──
  addAutomationLane: (lane) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, automationLanes: [...(state.pack.automationLanes ?? []), lane] },
  })); },
  updateAutomationLane: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, automationLanes: (state.pack.automationLanes ?? []).map((l) => l.id === id ? { ...l, ...update } : l) },
  })); },
  deleteAutomationLane: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, automationLanes: (state.pack.automationLanes ?? []).filter((l) => l.id !== id) },
  })); },

  // ── Macro mappings ──
  addMacroMapping: (mapping) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, macroMappings: [...(state.pack.macroMappings ?? []), mapping] },
  })); },
  updateMacroMapping: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, macroMappings: (state.pack.macroMappings ?? []).map((m) => m.id === id ? { ...m, ...update } : m) },
  })); },
  deleteMacroMapping: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, macroMappings: (state.pack.macroMappings ?? []).filter((m) => m.id !== id) },
  })); },

  // ── Macro state (not a pack mutation — no undo) ──
  macroState: { intensity: 0.5, tension: 0.5, brightness: 0.5, space: 0.5 },
  setMacroState: (update) =>
    set((s) => ({ macroState: { ...s.macroState, ...update } })),

  // ── Section envelopes ──
  addSectionEnvelope: (envelope) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sectionEnvelopes: [...(state.pack.sectionEnvelopes ?? []), envelope] },
  })); },
  updateSectionEnvelope: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sectionEnvelopes: (state.pack.sectionEnvelopes ?? []).map((e) => e.id === id ? { ...e, ...update } : e) },
  })); },
  deleteSectionEnvelope: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, sectionEnvelopes: (state.pack.sectionEnvelopes ?? []).filter((e) => e.id !== id) },
  })); },

  // ── Automation captures ──
  addAutomationCapture: (capture) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, automationCaptures: [...(state.pack.automationCaptures ?? []), capture] },
  })); },
  deleteAutomationCapture: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, automationCaptures: (state.pack.automationCaptures ?? []).filter((c) => c.id !== id) },
  })); },

  // ── Library: templates ──
  addTemplate: (template) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, templates: [...(state.pack.templates ?? []), template] },
  })); },
  updateTemplate: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, templates: (state.pack.templates ?? []).map((t) => t.id === id ? { ...t, ...update } : t) },
  })); },
  deleteTemplate: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, templates: (state.pack.templates ?? []).filter((t) => t.id !== id) },
  })); },

  // ── Library: snapshots ──
  addSnapshot: (snapshot) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, snapshots: [...(state.pack.snapshots ?? []), snapshot] },
  })); },
  deleteSnapshot: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, snapshots: (state.pack.snapshots ?? []).filter((sn) => sn.id !== id) },
  })); },

  // ── Library: branches ──
  addBranch: (branch) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, branches: [...(state.pack.branches ?? []), branch] },
  })); },
  deleteBranch: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, branches: (state.pack.branches ?? []).filter((b) => b.id !== id) },
  })); },

  // ── Library: favorites ──
  addFavorite: (fav) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, favorites: [...(state.pack.favorites ?? []), fav] },
  })); },
  deleteFavorite: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, favorites: (state.pack.favorites ?? []).filter((f) => f.id !== id) },
  })); },

  // ── Library: collections ──
  addCollection: (col) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, collections: [...(state.pack.collections ?? []), col] },
  })); },
  updateCollection: (id, update) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, collections: (state.pack.collections ?? []).map((c) => c.id === id ? { ...c, ...update } : c) },
  })); },
  deleteCollection: (id) => { _pushUndo(set); return set((state) => ({
    pack: { ...state.pack, collections: (state.pack.collections ?? []).filter((c) => c.id !== id) },
  })); },
}), { name: "motif-studio", enabled: process.env.NODE_ENV !== "production" }));

/** Reset undo debounce state — test-only helper */
export function _resetUndoDebounce() {
  if (_undoDebounceTimer !== null) {
    clearTimeout(_undoDebounceTimer);
    _undoDebounceTimer = null;
  }
  _undoPending = false;
}
