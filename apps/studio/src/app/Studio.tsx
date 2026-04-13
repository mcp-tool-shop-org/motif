"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStudioStore, type Section } from "./store";
import { usePlaybackStore } from "./playback-store";
import { SidebarNav } from "./components/SidebarNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { KeyboardShortcutsOverlay } from "./components/KeyboardShortcutsOverlay";
import { initAutosave, loadAutosave, saveProjectToFile } from "./autosave";
import {
  ArrangementScreen,
  ProjectScreen,
  AssetsScreen,
  StemsScreen,
  ScenesScreen,
  ClipsScreen,
  BindingsScreen,
  TransitionsScreen,
  ReviewScreen,
  PreviewScreen,
  PerformanceScreen,
  CuesScreen,
  MixerScreen,
  ExportScreen,
  SampleLabScreen,
  ScoreMapScreen,
  AutomationScreen,
  LibraryScreen,
} from "./screens";
import { synthDemoPack } from "./seed-data";

function ScreenRouter() {
  const section = useStudioStore((s) => s.section);
  switch (section) {
    case "arrangement":
      return <ArrangementScreen />;
    case "project":
    case "overview":
      return <ProjectScreen />;
    case "assets":
      return <AssetsScreen />;
    case "stems":
      return <StemsScreen />;
    case "scenes":
      return <ScenesScreen />;
    case "clips":
      return <ClipsScreen />;
    case "bindings":
      return <BindingsScreen />;
    case "transitions":
      return <TransitionsScreen />;
    case "review":
      return <ReviewScreen />;
    case "preview":
      return <PreviewScreen />;
    case "performance":
      return <PerformanceScreen />;
    case "cues":
      return <CuesScreen />;
    case "mixer":
      return <MixerScreen />;
    case "export":
      return <ExportScreen />;
    case "sample-lab":
      return <SampleLabScreen />;
    case "score-map":
      return <ScoreMapScreen />;
    case "automation":
      return <AutomationScreen />;
    case "library":
      return <LibraryScreen />;
    default:
      return <div>Unknown screen</div>;
  }
}

// Sidebar sections in display order (maps 1-9 number keys)
const SIDEBAR_SECTIONS: Section[] = [
  "arrangement", "clips", "scenes", "mixer",
  "project", "assets", "stems", "bindings", "transitions",
];

export default function Studio() {
  const loadPack = useStudioStore((s) => s.loadPack);
  const packId = useStudioStore((s) => s.pack.meta.id);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const autosaveInitRef = useRef(false);

  // Initialize autosave subscription
  useEffect(() => {
    const cleanup = initAutosave();
    return cleanup;
  }, []);

  useEffect(() => {
    // Only load on first mount when store is uninitialized
    if (packId !== "new-pack" || autosaveInitRef.current) return;
    autosaveInitRef.current = true;

    // Try restoring from autosave first
    const saved = loadAutosave();
    if (saved) {
      loadPack(saved.pack);
      if (saved.globalBpm) useStudioStore.getState().setGlobalBpm(saved.globalBpm);
      if (saved.timeSignature) useStudioStore.getState().setTimeSignature(saved.timeSignature);
      return;
    }
    loadPack(synthDemoPack);
  }, [loadPack, packId]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+S — save project to file
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const state = useStudioStore.getState();
        saveProjectToFile(state.pack, state.globalBpm, state.timeSignature);
        return;
      }

      // Undo/Redo — works even when focus is in inputs
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          useStudioStore.getState().redo();
        } else {
          useStudioStore.getState().undo();
        }
        return;
      }

      const tag = (e.target as HTMLElement)?.tagName;
      // Don't fire shortcuts when typing in inputs
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case " ": {
          e.preventDefault();
          const pb = usePlaybackStore.getState();
          if (pb.transportState === "playing") {
            pb.stop();
          } else {
            // Space with no scene just stops preview if playing
            pb.stopPreview();
          }
          break;
        }
        case "Escape": {
          if (showShortcuts) {
            setShowShortcuts(false);
          } else {
            const pb = usePlaybackStore.getState();
            pb.stop();
            pb.stopPreview();
          }
          break;
        }
        case "?": {
          setShowShortcuts((prev) => !prev);
          break;
        }
        case "Delete":
        case "Backspace": {
          const state = useStudioStore.getState();
          if (state.selectedId) {
            // Delegate deletion to the current screen's entity type
            const section = state.section;
            if (section === "clips") state.deleteClip(state.selectedId);
            else if (section === "assets") state.deleteAsset(state.selectedId);
            else if (section === "stems") state.deleteStem(state.selectedId);
            else if (section === "scenes") state.deleteScene(state.selectedId);
            else if (section === "bindings") state.deleteBinding(state.selectedId);
            else if (section === "transitions") state.deleteTransition(state.selectedId);
          }
          break;
        }
        default: {
          // Number keys 1-9: switch screen
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 9 && num <= SIDEBAR_SECTIONS.length) {
            useStudioStore.getState().setSection(SIDEBAR_SECTIONS[num - 1]);
          }
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcuts]);

  const handleErrorReset = useCallback(() => {
    loadPack({
      meta: { id: "new-pack", name: "New Pack", version: "1.0.0", schemaVersion: "1" },
      assets: [],
      stems: [],
      scenes: [],
      bindings: [],
      transitions: [],
    });
  }, [loadPack]);

  return (
    <div className="app-shell">
      <SidebarNav />
      <main className="main-content">
        <ErrorBoundary onReset={handleErrorReset}>
          <ScreenRouter />
        </ErrorBoundary>
      </main>
      {showShortcuts && (
        <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
