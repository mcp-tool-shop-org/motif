"use client";

import { useRef, useState, useCallback } from "react";
import { useStudioStore } from "../store";
import { useReview } from "../hooks";
import { saveProjectToFile, parseProjectFile } from "../autosave";

export function ProjectScreen() {
  const pack = useStudioStore((s) => s.pack);
  const updateMeta = useStudioStore((s) => s.updateMeta);
  const loadPack = useStudioStore((s) => s.loadPack);
  const globalBpm = useStudioStore((s) => s.globalBpm);
  const timeSignature = useStudioStore((s) => s.timeSignature);
  const autosave = useStudioStore((s) => s.autosave);
  const { summary, audit } = useReview();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmLoad, setConfirmLoad] = useState<{
    project: ReturnType<typeof parseProjectFile>;
  } | null>(null);

  const handleSave = useCallback(() => {
    saveProjectToFile(pack, globalBpm, timeSignature);
  }, [pack, globalBpm, timeSignature]);

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoadError(null);
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
      if (file.size > MAX_FILE_SIZE) {
        setLoadError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 50 MB.`);
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const project = parseProjectFile(reader.result as string);
          // If current project has content, confirm before replacing
          if (autosave.dirty || pack.assets.length > 0 || (pack.clips ?? []).length > 0) {
            setConfirmLoad({ project });
          } else {
            applyProject(project);
          }
        } catch (err) {
          setLoadError(err instanceof Error ? err.message : "Failed to load file");
        }
      };
      reader.readAsText(file);
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [autosave.dirty, pack],
  );

  const applyProject = useCallback(
    (project: ReturnType<typeof parseProjectFile>) => {
      loadPack(project.pack);
      useStudioStore.getState().setGlobalBpm(project.globalBpm);
      useStudioStore.getState().setTimeSignature(project.timeSignature);
      setConfirmLoad(null);
      setLoadError(null);
    },
    [loadPack],
  );

  return (
    <>
      <div className="screen-header">
        <h2>Project</h2>
        <p>Pack metadata, stats, and health overview</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn btn-sm" onClick={handleSave} title="Save project to file (Ctrl+S)">
            Save Project
          </button>
          <button
            className="btn btn-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Load a .motif.json file"
          >
            Load Project
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".motif.json,.json"
            style={{ display: "none" }}
            onChange={handleFileSelected}
            data-testid="load-file-input"
          />
        </div>
        {loadError && (
          <div role="alert" style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6 }}>
            {loadError}
          </div>
        )}
        {confirmLoad && (
          <div
            role="dialog"
            aria-label="Confirm load"
            style={{
              marginTop: 8,
              padding: "10px 14px",
              background: "#2a2000",
              border: "1px solid #554400",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <p style={{ margin: "0 0 8px" }}>
              Current project has unsaved changes. Load anyway?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={() => applyProject(confirmLoad.project)}>
                Yes, load
              </button>
              <button className="btn btn-sm" onClick={() => setConfirmLoad(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="screen-body">
        {/* Stats */}
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
          <div className="stat-card">
            <div className="stat-value">{audit.errors.length}</div>
            <div className="stat-label">Errors</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{audit.warnings.length}</div>
            <div className="stat-label">Warnings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{audit.notes.length}</div>
            <div className="stat-label">Notes</div>
          </div>
        </div>

        {/* Metadata editing */}
        <div className="meta-section">
          <h3>Pack Metadata</h3>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Name</label>
              <input
                className="field-input"
                value={pack.meta.name}
                onChange={(e) => updateMeta({ name: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Version</label>
              <input
                className="field-input"
                value={pack.meta.version}
                onChange={(e) => updateMeta({ version: e.target.value })}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">ID</label>
              <input
                className="field-input"
                value={pack.meta.id}
                onChange={(e) => updateMeta({ id: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Author</label>
              <input
                className="field-input"
                value={pack.meta.author ?? ""}
                onChange={(e) => updateMeta({ author: e.target.value || undefined })}
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea
              className="field-input"
              value={pack.meta.description ?? ""}
              onChange={(e) =>
                updateMeta({ description: e.target.value || undefined })
              }
            />
          </div>
          <div className="field-group">
            <label className="field-label">Tags (comma-separated)</label>
            <input
              className="field-input"
              value={(pack.meta.tags ?? []).join(", ")}
              onChange={(e) =>
                updateMeta({
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Schema Version</label>
              <input
                className="field-input"
                value={pack.meta.schemaVersion}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Categories present */}
        <div className="meta-section">
          <h3>Categories Present</h3>
          {summary.categoriesPresent.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>None</p>
          ) : (
            <div className="category-list">
              {summary.categoriesPresent.map((cat) => (
                <span key={cat} className="badge badge-category">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Unused entities */}
        <div className="meta-section">
          <h3>Unused Entities</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{summary.unused.assets}</div>
              <div className="stat-label">Unused Assets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.unused.stems}</div>
              <div className="stat-label">Unused Stems</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.unused.scenes}</div>
              <div className="stat-label">Unreferenced Scenes</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
