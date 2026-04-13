"use client";

import { useStudioStore } from "../store";
import { usePreviewStore } from "../preview-store";
import { usePlaybackStore } from "../playback-store";
import { useManualPreview } from "../preview-hooks";
import { StateEditor } from "../components/StateEditor";
import { StemMixer } from "../components/StemMixer";

export function ManualPreview() {
  const pack = useStudioStore((s) => s.pack);
  const manualState = usePreviewStore((s) => s.manualState);
  const setManualField = usePreviewStore((s) => s.setManualField);
  const playScene = usePlaybackStore((s) => s.playScene);
  const stopPlayback = usePlaybackStore((s) => s.stop);
  const transportState = usePlaybackStore((s) => s.transportState);
  const { resolution, layers, transition, transitionWarning } =
    useManualPreview();

  const winningBinding = resolution.winningBindingId
    ? pack.bindings.find((b) => b.id === resolution.winningBindingId)
    : undefined;

  const isPlaying = transportState === "playing";
  const isLoading = transportState === "loading";

  const handlePlay = () => {
    if (resolution.sceneId) {
      void playScene(pack, resolution.sceneId);
    }
  };

  const handleStop = () => {
    stopPlayback();
  };

  return (
    <div className="preview-two-panel">
      {/* Left: controls */}
      <div className="preview-controls">
        <div className="meta-section">
          <h3>Runtime State</h3>
          <StateEditor state={manualState} onChange={setManualField} />
        </div>

        {/* Playback controls */}
        <div className="meta-section">
          <h3>Playback</h3>
          <div className="playback-controls">
            <button
              className="btn btn-primary"
              onClick={handlePlay}
              disabled={!resolution.sceneId || isLoading}
            >
              {isLoading ? "Loading…" : isPlaying ? "▶ Replay Scene" : "▶ Play Scene"}
            </button>
            <button
              className="btn"
              onClick={handleStop}
              disabled={transportState === "stopped"}
            >
              ■ Stop
            </button>
          </div>
          <StemMixer />
        </div>
      </div>

      {/* Right: results */}
      <div className="preview-results">
        {/* Resolution card */}
        <div className="result-card">
          <h4>Resolved Scene</h4>
          {resolution.sceneId ? (
            <div className="result-value">
              <span className="result-id">{resolution.sceneId}</span>
              {resolution.sceneName && (
                <span className="result-name">{resolution.sceneName}</span>
              )}
            </div>
          ) : (
            <div className="result-empty">No scene resolved</div>
          )}
        </div>

        <div className="result-card">
          <h4>Winning Binding</h4>
          {winningBinding ? (
            <div className="result-value">
              <span className="result-id">{winningBinding.id}</span>
              <span className="result-name">{winningBinding.name}</span>
            </div>
          ) : (
            <div className="result-empty">No binding matched</div>
          )}
        </div>

        <div className="result-card">
          <h4>Matched Bindings</h4>
          {resolution.matchedBindingIds.length > 0 ? (
            <div className="result-list">
              {resolution.matchedBindingIds.map((id) => (
                <span key={id} className="result-chip">{id}</span>
              ))}
            </div>
          ) : (
            <div className="result-empty">None</div>
          )}
        </div>

        <div className="result-card">
          <h4>Active Stems</h4>
          {layers && layers.stemIds.length > 0 ? (
            <div className="result-list">
              {layers.stemIds.map((id) => {
                const isRequired = layers.requiredStemIds.includes(id);
                return (
                  <span
                    key={id}
                    className={`result-chip ${isRequired ? "required" : ""}`}
                  >
                    {id}
                    {isRequired && <span className="chip-tag">req</span>}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="result-empty">No active stems</div>
          )}
        </div>

        {/* Transition */}
        {(transition || transitionWarning) && (
          <div className="result-card">
            <h4>Transition</h4>
            {transition && (
              <div className="result-value">
                <span className="badge badge-mode">{transition.mode}</span>
                <span className="result-id">{transition.id}</span>
                <span className="result-name">
                  {transition.fromSceneId} → {transition.toSceneId}
                </span>
              </div>
            )}
            {transitionWarning && (
              <div className="inline-warning warning">{transitionWarning}</div>
            )}
          </div>
        )}

        {/* Warnings */}
        {(resolution.warnings.length > 0 ||
          (layers && layers.warnings.length > 0)) && (
          <div className="result-card">
            <h4>Warnings</h4>
            {resolution.warnings.map((w, i) => (
              <div key={`r-${i}`} className="inline-warning warning">
                {w}
              </div>
            ))}
            {layers?.warnings.map((w, i) => (
              <div key={`l-${i}`} className="inline-warning warning">
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Rejected bindings */}
        {resolution.rejectedBindingIds.length > 0 && (
          <div className="result-card muted">
            <h4>Rejected Bindings</h4>
            <div className="result-list">
              {resolution.rejectedBindingIds.map((id) => (
                <span key={id} className="result-chip dim">{id}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
