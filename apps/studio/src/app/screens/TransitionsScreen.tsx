"use client";

import { useStudioStore } from "../store";
import type { TransitionRule, TransitionMode } from "@motif-studio/schema";

const TRANSITION_MODES: TransitionMode[] = [
  "immediate",
  "crossfade",
  "bar-sync",
  "stinger-then-switch",
  "cooldown-fade",
];

const MODES_REQUIRING_DURATION: TransitionMode[] = [
  "crossfade",
  "cooldown-fade",
  "stinger-then-switch",
  "bar-sync",
];

function newTransition(n: number): TransitionRule {
  return {
    id: `new-transition-${n}`,
    name: `New Transition ${n}`,
    fromSceneId: "",
    toSceneId: "",
    mode: "immediate",
  };
}

export function TransitionsScreen() {
  const transitions = useStudioStore((s) => s.pack.transitions);
  const scenes = useStudioStore((s) => s.pack.scenes);
  const assets = useStudioStore((s) => s.pack.assets);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addTransition = useStudioStore((s) => s.addTransition);
  const updateTransition = useStudioStore((s) => s.updateTransition);
  const deleteTransition = useStudioStore((s) => s.deleteTransition);

  const selected = transitions.find((t) => t.id === selectedId) ?? null;

  const fromMissing =
    selected != null &&
    selected.fromSceneId !== "" &&
    !scenes.some((s) => s.id === selected.fromSceneId);
  const toMissing =
    selected != null &&
    selected.toSceneId !== "" &&
    !scenes.some((s) => s.id === selected.toSceneId);
  const sameScene =
    selected != null &&
    selected.fromSceneId !== "" &&
    selected.fromSceneId === selected.toSceneId;
  const needsDuration =
    selected != null &&
    MODES_REQUIRING_DURATION.includes(selected.mode) &&
    !selected.durationMs;
  const stingerMissing =
    selected != null &&
    selected.mode === "stinger-then-switch" &&
    selected.stingerAssetId != null &&
    selected.stingerAssetId !== "" &&
    !assets.some((a) => a.id === selected.stingerAssetId);
  const stingerNeeded =
    selected != null &&
    selected.mode === "stinger-then-switch" &&
    !selected.stingerAssetId;

  function handleAdd() {
    let n = transitions.length + 1;
    while (transitions.some((t) => t.id === `new-transition-${n}`)) n++;
    addTransition(newTransition(n));
  }

  return (
    <>
      <div className="screen-header">
        <h2>Transitions</h2>
        <p>Rules for moving between scenes</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* List */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Transitions ({transitions.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                + Add
              </button>
            </div>
            <div className="entity-list-items">
              {transitions.length === 0 && (
                <div className="empty-state">
                  <p>No transitions yet. Add transitions to control how scenes flow into each other.</p>
                  <button className="btn btn-primary" onClick={handleAdd}>
                    Add first transition
                  </button>
                </div>
              )}
              {transitions.map((t) => (
                <button
                  key={t.id}
                  className={`entity-list-item ${selectedId === t.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <span>{t.name || t.id}</span>
                  <span className="badge badge-mode">{t.mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state">
                <p>Select a transition to edit</p>
              </div>
            ) : (
              <>
                <h3>{selected.name || selected.id}</h3>

                {sameScene && (
                  <div className="inline-warning warning">
                    ⚠ Transition goes from a scene to itself
                  </div>
                )}
                {fromMissing && (
                  <div className="inline-warning warning">
                    ⚠ From scene &quot;{selected.fromSceneId}&quot; not found
                  </div>
                )}
                {toMissing && (
                  <div className="inline-warning warning">
                    ⚠ To scene &quot;{selected.toSceneId}&quot; not found
                  </div>
                )}
                {needsDuration && (
                  <div className="inline-warning warning">
                    ⚠ Mode &quot;{selected.mode}&quot; requires a duration
                  </div>
                )}
                {stingerNeeded && (
                  <div className="inline-warning warning">
                    ⚠ Stinger-then-switch mode requires a stinger asset
                  </div>
                )}
                {stingerMissing && (
                  <div className="inline-warning warning">
                    ⚠ Stinger asset &quot;{selected.stingerAssetId}&quot; not
                    found
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
                        updateTransition(selected.id, {
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">From Scene</label>
                    <select
                      className="field-input"
                      value={selected.fromSceneId}
                      onChange={(e) =>
                        updateTransition(selected.id, {
                          fromSceneId: e.target.value,
                        })
                      }
                    >
                      <option value="">— select scene —</option>
                      {scenes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">To Scene</label>
                    <select
                      className="field-input"
                      value={selected.toSceneId}
                      onChange={(e) =>
                        updateTransition(selected.id, {
                          toSceneId: e.target.value,
                        })
                      }
                    >
                      <option value="">— select scene —</option>
                      {scenes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Mode</label>
                    <select
                      className="field-input"
                      value={selected.mode}
                      onChange={(e) =>
                        updateTransition(selected.id, {
                          mode: e.target.value as TransitionMode,
                        })
                      }
                    >
                      {TRANSITION_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Duration (ms)</label>
                    <input
                      className="field-input"
                      type="number"
                      value={selected.durationMs ?? ""}
                      placeholder="—"
                      onChange={(e) =>
                        updateTransition(selected.id, {
                          durationMs: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                {selected.mode === "stinger-then-switch" && (
                  <div className="field-group">
                    <label className="field-label">Stinger Asset</label>
                    <select
                      className="field-input"
                      value={selected.stingerAssetId ?? ""}
                      onChange={(e) =>
                        updateTransition(selected.id, {
                          stingerAssetId: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">— select asset —</option>
                      {assets
                        .filter((a) => a.kind === "stinger")
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name || a.id}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="btn-row">
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteTransition(selected.id)}
                  >
                    Delete Transition
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
