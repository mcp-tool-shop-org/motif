"use client";

import { useStudioStore } from "../store";
import type { Scene, SceneCategory, SectionRole, IntensityLevel } from "@motif/schema";

const EMPTY_CLIPS: never[] = [];

const SECTION_ROLES: SectionRole[] = ["intro", "loop", "outro"];
const INTENSITY_LEVELS: IntensityLevel[] = ["low", "mid", "high"];

const SCENE_CATEGORIES: SceneCategory[] = [
  "exploration",
  "tension",
  "combat",
  "boss",
  "victory",
  "aftermath",
  "stealth",
  "safe-zone",
];

const START_MODES = ["immediate", "next-bar", "after-transition"] as const;

function newScene(n: number): Scene {
  return {
    id: `new-scene-${n}`,
    name: `New Scene ${n}`,
    category: "exploration",
    layers: [{ stemId: "" }],
  };
}

export function ScenesScreen() {
  const scenes = useStudioStore((s) => s.pack.scenes);
  const stems = useStudioStore((s) => s.pack.stems);
  const clips = useStudioStore((s) => s.pack.clips ?? EMPTY_CLIPS);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addScene = useStudioStore((s) => s.addScene);
  const updateScene = useStudioStore((s) => s.updateScene);
  const deleteScene = useStudioStore((s) => s.deleteScene);
  const addSceneLayer = useStudioStore((s) => s.addSceneLayer);
  const updateSceneLayer = useStudioStore((s) => s.updateSceneLayer);
  const removeSceneLayer = useStudioStore((s) => s.removeSceneLayer);
  const addSceneClipLayer = useStudioStore((s) => s.addSceneClipLayer);
  const updateSceneClipLayer = useStudioStore((s) => s.updateSceneClipLayer);
  const removeSceneClipLayer = useStudioStore((s) => s.removeSceneClipLayer);

  const selected = scenes.find((s) => s.id === selectedId) ?? null;

  function handleAdd() {
    let n = scenes.length + 1;
    while (scenes.some((s) => s.id === `new-scene-${n}`)) n++;
    addScene(newScene(n));
  }

  return (
    <>
      <div className="screen-header">
        <h2>Scenes</h2>
        <p>Adaptive music scenes with layered stems</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* List */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Scenes ({scenes.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                + Add
              </button>
            </div>
            <div className="entity-list-items">
              {scenes.length === 0 && (
                <div className="empty-state">
                  <p>No scenes yet. Add your first scene to start building your soundtrack.</p>
                  <button className="btn btn-primary" onClick={handleAdd}>
                    Add first scene
                  </button>
                </div>
              )}
              {scenes.map((s) => (
                <button
                  key={s.id}
                  className={`entity-list-item ${selectedId === s.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span>{s.name || s.id}</span>
                  <span className="badge badge-category">{s.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state">
                <p>Select a scene to edit</p>
              </div>
            ) : (
              <>
                <h3>{selected.name || selected.id}</h3>

                {/* Missing fallback warning */}
                {selected.fallbackSceneId &&
                  !scenes.some(
                    (s) => s.id === selected.fallbackSceneId,
                  ) && (
                    <div className="inline-warning warning">
                      ⚠ Fallback scene &quot;{selected.fallbackSceneId}&quot;
                      not found
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
                        updateScene(selected.id, { name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Category</label>
                    <select
                      className="field-input"
                      value={selected.category}
                      onChange={(e) =>
                        updateScene(selected.id, {
                          category: e.target.value as SceneCategory,
                        })
                      }
                    >
                      {SCENE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Fallback Scene</label>
                    <select
                      className="field-input"
                      value={selected.fallbackSceneId ?? ""}
                      onChange={(e) =>
                        updateScene(selected.id, {
                          fallbackSceneId: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">— none —</option>
                      {scenes
                        .filter((s) => s.id !== selected.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name || s.id}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Tags (comma-separated)</label>
                  <input
                    className="field-input"
                    value={(selected.tags ?? []).join(", ")}
                    onChange={(e) =>
                      updateScene(selected.id, {
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>

                {/* Layers */}
                <div className="sub-list">
                  <div className="sub-list-header">
                    <h4>Layers ({selected.layers.length})</h4>
                    <button
                      className="btn btn-sm"
                      onClick={() =>
                        addSceneLayer(selected.id, { stemId: "" })
                      }
                    >
                      + Add Layer
                    </button>
                  </div>
                  {selected.layers.length === 0 && (
                    <div className="inline-warning warning">
                      ⚠ Scene has no layers
                    </div>
                  )}
                  {selected.layers.map((layer, i) => {
                    const stemMissing =
                      layer.stemId !== "" &&
                      !stems.some((s) => s.id === layer.stemId);
                    return (
                      <div key={i} className="sub-list-item">
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <select
                              className="field-input"
                              style={{ flex: 1 }}
                              value={layer.stemId}
                              onChange={(e) =>
                                updateSceneLayer(selected.id, i, {
                                  stemId: e.target.value,
                                })
                              }
                            >
                              <option value="">— select stem —</option>
                              {stems.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name || s.id}
                                </option>
                              ))}
                            </select>
                            <select
                              className="field-input"
                              style={{ width: 130 }}
                              value={layer.startMode ?? "immediate"}
                              onChange={(e) =>
                                updateSceneLayer(selected.id, i, {
                                  startMode: e.target.value as typeof START_MODES[number],
                                })
                              }
                            >
                              {START_MODES.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <label className="field-checkbox">
                              <input
                                type="checkbox"
                                checked={layer.required ?? false}
                                onChange={(e) =>
                                  updateSceneLayer(selected.id, i, {
                                    required: e.target.checked || undefined,
                                  })
                                }
                              />
                              Req
                            </label>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removeSceneLayer(selected.id, i)}
                            >
                              ×
                            </button>
                          </div>
                          {stemMissing && (
                            <div
                              className="inline-warning warning"
                              style={{ margin: 0 }}
                            >
                              ⚠ Stem &quot;{layer.stemId}&quot; not found
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clip Layers — Arrangement */}
                <div className="sub-list">
                  <div className="sub-list-header">
                    <h4>Clip Arrangement ({(selected.clipLayers ?? []).length})</h4>
                    <button
                      className="btn btn-sm"
                      onClick={() =>
                        addSceneClipLayer(selected.id, { clipId: "", order: (selected.clipLayers ?? []).length })
                      }
                    >
                      + Add Clip
                    </button>
                  </div>
                  {(selected.clipLayers ?? []).length === 0 && (
                    <div className="empty-state" style={{ padding: "8px 0" }}>
                      <p style={{ fontSize: 13 }}>No clip layers — add clips from the Clips screen first</p>
                    </div>
                  )}
                  {[...(selected.clipLayers ?? [])]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((ref, i) => {
                    const clipMissing =
                      ref.clipId !== "" &&
                      !clips.some((c) => c.id === ref.clipId);
                    const selectedClip = clips.find((c) => c.id === ref.clipId);
                    const variants = selectedClip?.variants ?? [];
                    return (
                      <div key={i} className="sub-list-item">
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                              className="field-input"
                              type="number"
                              style={{ width: 48 }}
                              title="Order"
                              value={ref.order ?? 0}
                              onChange={(e) =>
                                updateSceneClipLayer(selected.id, i, {
                                  order: Number(e.target.value) || 0,
                                })
                              }
                            />
                            <select
                              className="field-input"
                              style={{ flex: 1 }}
                              value={ref.clipId}
                              onChange={(e) =>
                                updateSceneClipLayer(selected.id, i, {
                                  clipId: e.target.value,
                                })
                              }
                            >
                              <option value="">— select clip —</option>
                              {clips.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name || c.id} ({c.lane})
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                removeSceneClipLayer(selected.id, i)
                              }
                            >
                              ×
                            </button>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <select
                              className="field-input"
                              style={{ width: 100 }}
                              title="Section"
                              value={ref.sectionRole ?? "loop"}
                              onChange={(e) =>
                                updateSceneClipLayer(selected.id, i, {
                                  sectionRole: e.target.value as SectionRole,
                                })
                              }
                            >
                              {SECTION_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <select
                              className="field-input"
                              style={{ width: 80 }}
                              title="Intensity"
                              value={ref.intensity ?? "low"}
                              onChange={(e) =>
                                updateSceneClipLayer(selected.id, i, {
                                  intensity: e.target.value as IntensityLevel,
                                })
                              }
                            >
                              {INTENSITY_LEVELS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                            {variants.length > 0 && (
                              <select
                                className="field-input"
                                style={{ width: 120 }}
                                title="Variant"
                                value={ref.variantId ?? ""}
                                onChange={(e) =>
                                  updateSceneClipLayer(selected.id, i, {
                                    variantId: e.target.value || undefined,
                                  })
                                }
                              >
                                <option value="">Main</option>
                                {variants.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <label className="field-checkbox">
                              <input
                                type="checkbox"
                                checked={ref.mutedByDefault ?? false}
                                onChange={(e) =>
                                  updateSceneClipLayer(selected.id, i, {
                                    mutedByDefault: e.target.checked || undefined,
                                  })
                                }
                              />
                              Muted
                            </label>
                          </div>
                          {clipMissing && (
                            <div
                              className="inline-warning warning"
                              style={{ margin: 0 }}
                            >
                              ⚠ Clip &quot;{ref.clipId}&quot; not found
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="btn-row">
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteScene(selected.id)}
                  >
                    Delete Scene
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
