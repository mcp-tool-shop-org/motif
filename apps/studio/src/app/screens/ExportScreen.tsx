"use client";

import { useMemo, useState } from "react";
import { useStudioStore } from "../store";
import { usePlaybackStore } from "../playback-store";
import { useReview } from "../hooks";
import {
  exportRuntimePack,
  serializeRuntimePack,
  roundTripRuntimePack,
} from "@motif-studio/runtime-pack";
import { encodeWav, type RenderPreset } from "@motif-studio/playback-engine";
import { resolveCuePlan } from "@motif-studio/clip-engine";

type ExportStatus = "ready" | "warnings" | "blocked";

const RENDER_PRESETS: { value: RenderPreset; label: string; desc: string }[] = [
  { value: "full-cue", label: "Full Cue", desc: "Render entire scene with all stems" },
  { value: "loop-only", label: "Loop Only", desc: "Render looping stems for specified duration" },
  { value: "preview-sequence", label: "Preview", desc: "Short preview render (10s)" },
];

export function ExportScreen() {
  const pack = useStudioStore((s) => s.pack);
  const { summary, audit } = useReview();
  const [copied, setCopied] = useState(false);
  const [renderPreset, setRenderPreset] = useState<RenderPreset>("full-cue");
  const [renderDuration, setRenderDuration] = useState(30);
  const [renderSceneId, setRenderSceneId] = useState<string>("");
  const [exportError, setExportError] = useState<string | null>(null);

  const { renderStatus, lastRenderResult, renderScene, renderError } = usePlaybackStore();

  const scenes = pack.scenes;

  const status: ExportStatus = useMemo(() => {
    if (audit.errors.length > 0) return "blocked";
    if (audit.warnings.length > 0) return "warnings";
    return "ready";
  }, [audit]);

  const { serialized, roundTripOk } = useMemo(() => {
    try {
      const result = roundTripRuntimePack(pack);
      setExportError(null);
      return { serialized: result.serialized, roundTripOk: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Round-trip verification failed";
      // If export fails, try basic serialize for display
      try {
        const exported = exportRuntimePack(pack);
        setExportError(msg);
        return { serialized: serializeRuntimePack(exported), roundTripOk: false };
      } catch (err2) {
        const msg2 = err2 instanceof Error ? err2.message : "Export serialization failed";
        setExportError(msg2);
        return { serialized: "", roundTripOk: false };
      }
    }
  }, [pack]);

  const handleCopy = async () => {
    if (!serialized) return;
    try {
      await navigator.clipboard.writeText(serialized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      alert("Copy failed — clipboard access denied");
    }
  };

  const handleDownload = () => {
    if (!serialized) return;
    const blob = new Blob([serialized], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pack.meta.id || "soundtrack-pack"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const statusLabel =
    status === "ready"
      ? "Ready to export"
      : status === "warnings"
        ? `${audit.warnings.length} warning${audit.warnings.length !== 1 ? "s" : ""}`
        : `${audit.errors.length} error${audit.errors.length !== 1 ? "s" : ""} — fix before exporting`;

  return (
    <>
      <div className="screen-header">
        <h2>Export</h2>
        <p>Export your soundtrack pack as a runtime JSON file</p>
      </div>
      <div className="screen-body">
        {/* Readiness badge */}
        <div className="export-readiness">
          <div className={`export-status-badge ${status}`}>
            <span className="export-status-dot" />
            <span>{statusLabel}</span>
          </div>
          {roundTripOk && (
            <span className="export-roundtrip-ok">Round-trip verified</span>
          )}
        </div>

        {/* Runtime summary */}
        <div className="export-summary">
          <h3>Runtime Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{summary.counts.assets}</div>
              <div className="stat-label">Assets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.counts.stems}</div>
              <div className="stat-label">Stems</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.counts.scenes}</div>
              <div className="stat-label">Scenes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.counts.bindings}</div>
              <div className="stat-label">Bindings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.counts.transitions}</div>
              <div className="stat-label">Transitions</div>
            </div>
          </div>
          {summary.categoriesPresent.length > 0 && (
            <div className="export-categories">
              {summary.categoriesPresent.map((cat) => (
                <span key={cat} className="badge badge-category">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Findings (if any) */}
        {status !== "ready" && (
          <div className="export-findings">
            <h3>
              {status === "blocked" ? "Errors (must fix)" : "Warnings"}
            </h3>
            <div className="export-findings-list">
              {(status === "blocked" ? audit.errors : audit.warnings).map(
                (f, i) => (
                  <div
                    key={i}
                    className={`finding-item ${status === "blocked" ? "error" : "warning"}`}
                  >
                    <span className="finding-code">{f.code}</span>
                    <span>{f.message}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="export-actions">
          <button
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={status === "blocked" || !serialized}
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDownload}
            disabled={status === "blocked" || !serialized}
          >
            Download .json
          </button>
        </div>

        {/* Export error banner */}
        {exportError && (
          <div className="finding-item error" role="alert" style={{ marginTop: 8 }}>
            <span className="finding-code">Export</span>
            <span>{exportError}</span>
          </div>
        )}

        {/* Audio render section */}
        <div className="sub-list" style={{ marginTop: 24 }}>
          <div className="sub-list-header">
            <h4>Audio Render</h4>
          </div>
          <p className="text-dim" style={{ fontSize: 12, margin: "4px 0 12px" }}>
            Render a scene to WAV using OfflineAudioContext
          </p>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Scene</label>
              <select
                value={renderSceneId}
                onChange={(e) => setRenderSceneId(e.target.value)}
                style={{ minWidth: 160 }}
              >
                <option value="">Select scene…</option>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Preset</label>
              <select
                value={renderPreset}
                onChange={(e) => setRenderPreset(e.target.value as RenderPreset)}
              >
                {RENDER_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {(renderPreset === "loop-only" || renderPreset === "preview-sequence") && (
              <div className="field-group">
                <label className="field-label">Duration (s)</label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={renderPreset === "preview-sequence" ? 10 : renderDuration}
                  onChange={(e) => setRenderDuration(Number(e.target.value))}
                  disabled={renderPreset === "preview-sequence"}
                  style={{ width: 80 }}
                />
              </div>
            )}
          </div>

          <p className="text-dim" style={{ fontSize: 11, margin: "4px 0" }}>
            {RENDER_PRESETS.find((p) => p.value === renderPreset)?.desc}
          </p>

          <div className="export-actions" style={{ marginTop: 8 }}>
            <button
              className="btn btn-primary"
              disabled={!renderSceneId || renderStatus === "rendering"}
              onClick={() => {
                const dur =
                  renderPreset === "preview-sequence"
                    ? 10
                    : renderPreset === "loop-only"
                      ? renderDuration
                      : undefined;
                renderScene(pack, {
                  preset: renderPreset,
                  sceneId: renderSceneId,
                  durationSeconds: dur,
                });
              }}
            >
              {renderStatus === "rendering" ? "Rendering…" : "Render WAV"}
            </button>
            {lastRenderResult && renderStatus === "done" && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const blob = encodeWav(lastRenderResult.buffer);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${renderSceneId || "render"}.wav`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                Download WAV
              </button>
            )}
          </div>

          {renderStatus === "done" && lastRenderResult && (
            <div className="stats-grid" style={{ marginTop: 12 }}>
              <div className="stat-card">
                <div className="stat-value">
                  {lastRenderResult.durationSeconds.toFixed(1)}s
                </div>
                <div className="stat-label">Duration</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{lastRenderResult.sampleRate}</div>
                <div className="stat-label">Sample Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{lastRenderResult.channels}</div>
                <div className="stat-label">Channels</div>
              </div>
            </div>
          )}

          {renderStatus === "error" && (
            <div className="finding-item error" style={{ marginTop: 8 }}>
              Render failed{renderError ? `: ${renderError}` : " — check console for details"}
            </div>
          )}
        </div>

        {/* Cue render section */}
        {(pack.cues ?? []).length > 0 && (
          <div className="sub-list" style={{ marginTop: 24 }}>
            <div className="sub-list-header">
              <h4>Cue Render</h4>
            </div>
            <p className="text-dim" style={{ fontSize: 12, margin: "4px 0 12px" }}>
              Render a full cue by rendering each section&apos;s scene sequentially
            </p>
            <div className="stats-grid">
              {(pack.cues ?? []).map((cue) => {
                const plan = resolveCuePlan(cue);
                return (
                  <div key={cue.id} className="stat-card" style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{cue.name}</div>
                    <div className="text-dim" style={{ fontSize: 11 }}>
                      {plan.totalBars} bars · {plan.totalSeconds.toFixed(1)}s · {plan.sections.length} sections
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ marginTop: 8 }}
                      disabled={renderStatus === "rendering" || plan.sections.length === 0}
                      onClick={() => {
                        const firstScene = plan.sections.find((s) => s.sceneId);
                        if (firstScene?.sceneId) {
                          renderScene(pack, {
                            preset: "full-cue",
                            sceneId: firstScene.sceneId,
                            durationSeconds: plan.totalSeconds,
                          });
                        }
                      }}
                    >
                      Render Cue
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* JSON preview */}
        {serialized && (
          <div className="export-preview">
            <h3>JSON Preview</h3>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              <pre className="export-json">
                {serialized.length > 10000
                  ? serialized.slice(0, 10000) + "\n\n... (truncated)"
                  : serialized}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
