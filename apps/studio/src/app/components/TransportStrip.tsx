"use client";

import { useRef, useCallback } from "react";
import { usePlaybackStore } from "../playback-store";
import { useStudioStore } from "../store";

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

export function TransportStrip() {
  const transportState = usePlaybackStore((s) => s.transportState);
  const currentSceneId = usePlaybackStore((s) => s.currentSceneId);
  const sequenceState = usePlaybackStore((s) => s.sequenceState);
  const stop = usePlaybackStore((s) => s.stop);
  const errorMessage = usePlaybackStore((s) => s.errorMessage);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const canUndo = useStudioStore((s) => s.canUndo);
  const canRedo = useStudioStore((s) => s.canRedo);
  const undoCount = useStudioStore((s) => s.undoStack.length);
  const redoCount = useStudioStore((s) => s.redoStack.length);
  const globalBpm = useStudioStore((s) => s.globalBpm);
  const setGlobalBpm = useStudioStore((s) => s.setGlobalBpm);
  const timeSignature = useStudioStore((s) => s.timeSignature);
  const autosave = useStudioStore((s) => s.autosave);

  const bpmInputRef = useRef<HTMLInputElement>(null);

  const isPlaying = transportState === "playing";
  const isLoading = transportState === "loading";

  const dismissError = () => {
    usePlaybackStore.setState({ errorMessage: null });
  };

  const handleBpmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalBpm(Number(e.target.value) || 120);
    },
    [setGlobalBpm],
  );

  const handleBpmBlur = useCallback(() => {
    // Re-clamp on blur
    setGlobalBpm(globalBpm);
  }, [globalBpm, setGlobalBpm]);

  return (
    <div className="transport-strip" role="toolbar" aria-label="Playback transport">
      {errorMessage && (
        <div
          className="transport-error-banner"
          role="alert"
          style={{
            background: "#3a1a1a",
            color: "#fff",
            padding: "6px 12px",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #5a2a2a",
          }}
        >
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button
            onClick={dismissError}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              color: "#ff8888",
              cursor: "pointer",
              fontSize: 16,
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}
      <div className="transport-status">
        <span
          className={`transport-indicator ${transportState}`}
          title={transportState}
        />
        <span className="transport-label">
          {isLoading && "Loading\u2026"}
          {isPlaying && currentSceneId && `Playing: ${currentSceneId}`}
          {transportState === "stopped" && "Stopped"}
          {transportState === "error" && `Error: ${errorMessage ?? "unknown"}`}
        </span>
      </div>

      {sequenceState.playing && (
        <span className="transport-sequence-info">
          Step {sequenceState.currentStepIndex + 1} / {sequenceState.totalSteps}
        </span>
      )}

      <div className="transport-meta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <span style={{ color: "var(--text-dim)" }}>BPM</span>
          <input
            ref={bpmInputRef}
            className="field-input"
            type="number"
            min={20}
            max={999}
            value={globalBpm}
            onChange={handleBpmChange}
            onBlur={handleBpmBlur}
            aria-label="Global BPM"
            style={{ width: 60, textAlign: "center", fontSize: 14, fontWeight: 700 }}
          />
        </label>
        <span
          className="transport-time-sig"
          style={{ fontSize: 14, fontWeight: 600, color: "var(--text-bright)" }}
          title="Time signature"
          aria-label={`Time signature ${timeSignature.numerator}/${timeSignature.denominator}`}
        >
          {timeSignature.numerator}/{timeSignature.denominator}
        </span>
        <span
          className="transport-autosave"
          style={{ fontSize: 11, color: "var(--text-dim)", minWidth: 80 }}
          aria-label="Autosave status"
        >
          {autosave.dirty
            ? "Unsaved changes"
            : autosave.lastSavedAt
              ? `Saved ${formatTimestamp(autosave.lastSavedAt)}`
              : ""}
        </span>
      </div>

      <div className="transport-actions">
        <button
          className="btn btn-sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          {"\u21B6"} {undoCount > 0 ? undoCount : ""}
        </button>
        <button
          className="btn btn-sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          {"\u21B7"} {redoCount > 0 ? redoCount : ""}
        </button>
        <button
          className="btn btn-sm"
          onClick={stop}
          disabled={transportState === "stopped"}
          title="Stop (Escape)"
        >
          ■ Stop
        </button>
      </div>
    </div>
  );
}
