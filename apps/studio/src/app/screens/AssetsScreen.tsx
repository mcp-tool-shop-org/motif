"use client";

import { useStudioStore } from "../store";
import type { AudioAsset, AudioAssetKind } from "@motif-studio/schema";

const ASSET_KINDS: AudioAssetKind[] = ["loop", "oneshot", "stinger", "ambient"];

function newAsset(n: number): AudioAsset {
  return {
    id: `new-asset-${n}`,
    name: `New Asset ${n}`,
    src: `audio/new-asset-${n}.ogg`,
    kind: "loop",
    durationMs: 1000,
  };
}

export function AssetsScreen() {
  const assets = useStudioStore((s) => s.pack.assets);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addAsset = useStudioStore((s) => s.addAsset);
  const updateAsset = useStudioStore((s) => s.updateAsset);
  const deleteAsset = useStudioStore((s) => s.deleteAsset);
  const searchQuery = useStudioStore((s) => s.assetSearchQuery);
  const setAssetSearch = useStudioStore((s) => s.setAssetSearch);

  const filteredAssets = assets
    .filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (a.name || a.id).toLowerCase().includes(q);
    })
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  function handleAdd() {
    let n = assets.length + 1;
    while (assets.some((a) => a.id === `new-asset-${n}`)) n++;
    addAsset(newAsset(n));
  }

  return (
    <>
      <div className="screen-header">
        <h2>Assets</h2>
        <p>Audio files that power the soundtrack</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* List */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Assets ({filteredAssets.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                + Add
              </button>
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setAssetSearch(e.target.value)}
              style={{
                background: "#2a2a2a",
                border: "1px solid #444",
                color: "#eee",
                padding: "6px 10px",
                borderRadius: 4,
                width: "100%",
                marginBottom: 4,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <div className="entity-list-items">
              {filteredAssets.length === 0 && (
                <div className="empty-state">
                  <p>{assets.length === 0 ? "No assets yet. Add audio files to build your sound palette." : "No assets match your search."}</p>
                  {assets.length === 0 && (
                    <button className="btn btn-primary" onClick={handleAdd}>
                      Add first asset
                    </button>
                  )}
                </div>
              )}
              {filteredAssets.map((a) => (
                <button
                  key={a.id}
                  className={`entity-list-item ${selectedId === a.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <span>{a.name || a.id}</span>
                  <span className="badge badge-kind">{a.kind}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state">
                <p>Select an asset to edit</p>
              </div>
            ) : (
              <>
                <h3>{selected.name || selected.id}</h3>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">ID</label>
                    <input
                      className="field-input"
                      value={selected.id}
                      readOnly
                      style={{ background: "#2a2a2a", cursor: "default" }}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Name</label>
                    <input
                      className="field-input"
                      value={selected.name}
                      onChange={(e) =>
                        updateAsset(selected.id, { name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Source</label>
                  <input
                    className="field-input"
                    value={selected.src}
                    onChange={(e) =>
                      updateAsset(selected.id, { src: e.target.value })
                    }
                  />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Kind</label>
                    <select
                      className="field-input"
                      value={selected.kind}
                      onChange={(e) =>
                        updateAsset(selected.id, {
                          kind: e.target.value as AudioAssetKind,
                        })
                      }
                    >
                      {ASSET_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Duration (ms)</label>
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      value={selected.durationMs}
                      onChange={(e) =>
                        updateAsset(selected.id, {
                          durationMs: Number(e.target.value) || 0,
                        })
                      }
                      onBlur={(e) =>
                        updateAsset(selected.id, {
                          durationMs: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">BPM</label>
                    <input
                      className="field-input"
                      type="number"
                      value={selected.bpm ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateAsset(selected.id, {
                          bpm: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Key</label>
                    <input
                      className="field-input"
                      value={selected.key ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateAsset(selected.id, {
                          key: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Loop Start (ms)</label>
                    <input
                      className="field-input"
                      type="number"
                      value={selected.loopStartMs ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateAsset(selected.id, {
                          loopStartMs: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Loop End (ms)</label>
                    <input
                      className="field-input"
                      type="number"
                      value={selected.loopEndMs ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateAsset(selected.id, {
                          loopEndMs: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Tags (comma-separated)</label>
                  <input
                    className="field-input"
                    value={(selected.tags ?? []).join(", ")}
                    onChange={(e) =>
                      updateAsset(selected.id, {
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="btn-row">
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteAsset(selected.id)}
                  >
                    Delete Asset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
