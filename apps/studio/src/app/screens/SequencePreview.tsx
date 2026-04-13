"use client";

import { useStudioStore } from "../store";
import { usePreviewStore } from "../preview-store";
import { usePlaybackStore } from "../playback-store";
import { useSequencePreview } from "../preview-hooks";
import { StateEditor } from "../components/StateEditor";
import { StateChips } from "../components/StateChips";
import { useState } from "react";

export function SequencePreview() {
  const pack = useStudioStore((s) => s.pack);
  const steps = usePreviewStore((s) => s.sequenceSteps);
  const updateStep = usePreviewStore((s) => s.updateSequenceStep);
  const addStep = usePreviewStore((s) => s.addSequenceStep);
  const removeStep = usePreviewStore((s) => s.removeSequenceStep);
  const duplicateStep = usePreviewStore((s) => s.duplicateSequenceStep);
  const resetSequence = usePreviewStore((s) => s.resetSequence);
  const playSequence = usePlaybackStore((s) => s.playSequence);
  const stopPlayback = usePlaybackStore((s) => s.stop);
  const transportState = usePlaybackStore((s) => s.transportState);
  const sequenceState = usePlaybackStore((s) => s.sequenceState);
  const trace = useSequencePreview();
  const [editingStep, setEditingStep] = useState<number | null>(null);

  const isPlaying = transportState === "playing";
  const isLoading = transportState === "loading";

  const handlePlaySequence = () => {
    void playSequence(pack, steps);
  };

  return (
    <div className="sequence-preview">
      {/* Controls bar */}
      <div className="sequence-controls">
        <button className="btn btn-primary" onClick={addStep}>
          + Add Step
        </button>
        <button className="btn" onClick={resetSequence}>
          Reset to Example
        </button>
        <span className="text-dim">{steps.length} steps</span>
        <div className="sequence-playback-controls">
          <button
            className="btn btn-primary"
            onClick={handlePlaySequence}
            disabled={steps.length === 0 || isLoading}
          >
            {isLoading ? "Loading…" : isPlaying ? "▶ Restart" : "▶ Play All"}
          </button>
          <button
            className="btn"
            onClick={stopPlayback}
            disabled={transportState === "stopped"}
          >
            ■ Stop
          </button>
          {sequenceState.playing && (
            <span className="sequence-step-indicator">
              Step {sequenceState.currentStepIndex + 1} / {sequenceState.totalSteps}
            </span>
          )}
        </div>
      </div>

      {/* Step editor (expanded inline) */}
      {editingStep !== null && steps[editingStep] && (
        <div className="sequence-step-editor">
          <div className="sequence-step-editor-header">
            <h4>Edit Step {editingStep + 1}</h4>
            <button
              className="btn btn-sm"
              onClick={() => setEditingStep(null)}
            >
              Done
            </button>
          </div>
          <StateEditor
            state={steps[editingStep]}
            onChange={(field, value) => updateStep(editingStep, field, value)}
          />
        </div>
      )}

      {/* Trace table */}
      <div className="trace-table">
        <div className="trace-header">
          <span className="trace-col-step">#</span>
          <span className="trace-col-state">State</span>
          <span className="trace-col-scene">Scene</span>
          <span className="trace-col-binding">Binding</span>
          <span className="trace-col-transition">Transition</span>
          <span className="trace-col-stems">Active Stems</span>
          <span className="trace-col-actions">Actions</span>
        </div>
        {trace.steps.map((step, i) => {
          const bindingName = step.winningBindingId
            ? pack.bindings.find((b) => b.id === step.winningBindingId)?.name
            : undefined;
          return (
            <div
              key={i}
              className={`trace-row ${step.warnings.length > 0 ? "has-warnings" : ""} ${sequenceState.playing && sequenceState.currentStepIndex === i ? "current-step" : ""}`}
            >
              <span className="trace-col-step">{step.index + 1}</span>
              <span className="trace-col-state">
                <StateChips state={step.state} />
              </span>
              <span className="trace-col-scene">
                {step.resolvedSceneId ? (
                  <>
                    <span className="result-id">{step.resolvedSceneId}</span>
                    {step.resolvedSceneName && (
                      <span className="result-name">
                        {step.resolvedSceneName}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="result-empty">—</span>
                )}
              </span>
              <span className="trace-col-binding">
                {step.winningBindingId ? (
                  <>
                    <span className="result-id">
                      {step.winningBindingId}
                    </span>
                    {bindingName && (
                      <span className="result-name">{bindingName}</span>
                    )}
                  </>
                ) : (
                  <span className="result-empty">—</span>
                )}
              </span>
              <span className="trace-col-transition">
                {step.transitionMode ? (
                  <>
                    <span className="badge badge-mode">
                      {step.transitionMode}
                    </span>
                    {step.fromSceneId && step.resolvedSceneId && (
                      <span className="result-name">
                        {step.fromSceneId} → {step.resolvedSceneId}
                      </span>
                    )}
                  </>
                ) : step.fromSceneId &&
                  step.resolvedSceneId &&
                  step.fromSceneId !== step.resolvedSceneId ? (
                  <span className="result-empty">no rule</span>
                ) : (
                  <span className="result-empty">—</span>
                )}
              </span>
              <span className="trace-col-stems">
                {step.activatedStemIds.length > 0 ? (
                  <span className="result-list compact">
                    {step.activatedStemIds.map((sid) => (
                      <span
                        key={sid}
                        className={`result-chip sm ${step.requiredStemIds.includes(sid) ? "required" : ""}`}
                      >
                        {sid}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="result-empty">—</span>
                )}
              </span>
              <span className="trace-col-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => setEditingStep(i)}
                  title="Edit step"
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => duplicateStep(i)}
                  title="Duplicate step"
                >
                  Dup
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    removeStep(i);
                    if (editingStep === i) setEditingStep(null);
                  }}
                  title="Remove step"
                >
                  ×
                </button>
              </span>
              {step.warnings.length > 0 && (
                <div className="trace-row-warnings">
                  {step.warnings.map((w, wi) => (
                    <div key={wi} className="inline-warning warning">
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {steps.length === 0 && (
        <div className="empty-state">
          <p>No sequence steps. Add a step or reset to the example flow.</p>
        </div>
      )}
    </div>
  );
}
