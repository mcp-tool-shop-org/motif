"use client";

import { useStudioStore } from "../store";
import type { Stem, StemRole } from "@motif/schema";

const STEM_ROLES: StemRole[] = [
  "base",
  "danger",
  "combat",
  "boss",
  "recovery",
  "mystery",
  "faction",
  "accent",
];

function newStem(n: number): Stem {
  return {
    id: `new-stem-${n}`,
    name: `New Stem ${n}`,
    assetId: "",
    role: "base",
    loop: true,
  };
}

export function StemsScreen() {
  const stems = useStudioStore((s) => s.pack.stems);
  const assets = useStudioStore((s) => s.pack.assets);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addStem = useStudioStore((s) => s.addStem);
  const updateStem = useStudioStore((s) => s.updateStem);
  const deleteStem = useStudioStore((s) => s.deleteStem);
  const searchQuery = useStudioStore((s) => s.stemSearchQuery);
  const setStemSearch = useStudioStore((s) => s.setStemSearch);

  const filteredStems = stems
    .filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (s.name || s.id).toLowerCase().includes(q);
    })
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

  const selected = stems.find((s) => s.id === selectedId) ?? null;
  const assetMissing =
    selected != null && !assets.some((a) => a.id === selected.assetId);

  function handleAdd() {
    let n = stems.length + 1;
    while (stems.some((s) => s.id === `new-stem-${n}`)) n++;
    addStem(newStem(n));
  }

  return (
    <>
      <div className="screen-header">
        <h2>Stems</h2>
        <p>Playback layers linking assets to roles</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* List */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Stems ({filteredStems.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                + Add
              </button>
            </div>
            <input
              type="text"
              placeholder="Search stems..."
              value={searchQuery}
              onChange={(e) => setStemSearch(e.target.value)}
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
              {filteredStems.length === 0 && (
                <div className="empty-state">
                  <p>{stems.length === 0 ? "No stems yet. Create stems to layer your audio assets into scenes." : "No stems match your search."}</p>
                  {stems.length === 0 && (
                    <button className="btn btn-primary" onClick={handleAdd}>
                      Add first stem
                    </button>
                  )}
                </div>
              )}
              {filteredStems.map((s) => (
                <button
                  key={s.id}
                  className={`entity-list-item ${selectedId === s.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span>{s.name || s.id}</span>
                  <span className="badge badge-role">{s.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state">
                <p>Select a stem to edit</p>
              </div>
            ) : (
              <>
                <h3>{selected.name || selected.id}</h3>

                {assetMissing && (
                  <div className="inline-warning warning">
                    ⚠ Asset &quot;{selected.assetId || "(empty)"}&quot; not
                    found in pack
                  </div>
                )}

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
                        updateStem(selected.id, { name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Asset ID</label>
                    <select
                      className="field-input"
                      value={selected.assetId}
                      onChange={(e) =>
                        updateStem(selected.id, { assetId: e.target.value })
                      }
                    >
                      <option value="">— select asset —</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name || a.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Role</label>
                    <select
                      className="field-input"
                      value={selected.role}
                      onChange={(e) =>
                        updateStem(selected.id, {
                          role: e.target.value as StemRole,
                        })
                      }
                    >
                      {STEM_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Gain (dB)</label>
                    <input
                      className="field-input"
                      type="number"
                      value={selected.gainDb ?? ""}
                      placeholder="0"
                      onChange={(e) =>
                        updateStem(selected.id, {
                          gainDb: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="field-group" style={{ paddingTop: 22 }}>
                    <label className="field-checkbox">
                      <input
                        type="checkbox"
                        checked={selected.loop}
                        onChange={(e) =>
                          updateStem(selected.id, { loop: e.target.checked })
                        }
                      />
                      Loop
                    </label>
                    <label className="field-checkbox" style={{ marginTop: 6 }}>
                      <input
                        type="checkbox"
                        checked={selected.mutedByDefault ?? false}
                        onChange={(e) =>
                          updateStem(selected.id, {
                            mutedByDefault: e.target.checked || undefined,
                          })
                        }
                      />
                      Muted by default
                    </label>
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Tags (comma-separated)</label>
                  <input
                    className="field-input"
                    value={(selected.tags ?? []).join(", ")}
                    onChange={(e) =>
                      updateStem(selected.id, {
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
                    onClick={() => deleteStem(selected.id)}
                  >
                    Delete Stem
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
