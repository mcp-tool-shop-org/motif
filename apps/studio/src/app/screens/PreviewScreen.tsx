"use client";

import { useStudioStore } from "../store";
import { usePreviewStore } from "../preview-store";
import { useReview } from "../hooks";
import { ManualPreview } from "./ManualPreview";
import { SequencePreview } from "./SequencePreview";
import { TransportStrip } from "../components/TransportStrip";

export function PreviewScreen() {
  const pack = useStudioStore((s) => s.pack);
  const previewMode = usePreviewStore((s) => s.previewMode);
  const setPreviewMode = usePreviewStore((s) => s.setPreviewMode);
  const { summary } = useReview();

  return (
    <>
      <div className="screen-header">
        <h2>Preview</h2>
        <p>Simulate runtime state changes and inspect soundtrack behavior</p>
      </div>
      <div className="screen-body">
        {/* Top bar: mode switch + pack summary */}
        <div className="preview-top-bar">
          <div className="preview-mode-switch">
            <button
              className={`btn ${previewMode === "manual" ? "btn-primary" : ""}`}
              onClick={() => setPreviewMode("manual")}
            >
              Manual
            </button>
            <button
              className={`btn ${previewMode === "sequence" ? "btn-primary" : ""}`}
              onClick={() => setPreviewMode("sequence")}
            >
              Sequence
            </button>
          </div>
          <div className="preview-pack-summary">
            <span className="badge badge-category">{pack.meta.name}</span>
            <span className="text-dim">
              {summary.counts.scenes} scenes · {summary.counts.bindings} bindings · {summary.counts.transitions} transitions
            </span>
          </div>
        </div>

        {previewMode === "manual" ? <ManualPreview /> : <SequencePreview />}

        <TransportStrip />
      </div>
    </>
  );
}
