"use client";

import { useStudioStore } from "../store";
import type { TriggerBinding, TriggerOp } from "@motif-studio/schema";

const TRIGGER_OPS: TriggerOp[] = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "includes",
];

function newBinding(n: number): TriggerBinding {
  return {
    id: `new-binding-${n}`,
    name: `New Binding ${n}`,
    sceneId: "",
    conditions: [{ field: "", op: "eq", value: "" }],
    priority: 0,
  };
}

export function BindingsScreen() {
  const bindings = useStudioStore((s) => s.pack.bindings);
  const scenes = useStudioStore((s) => s.pack.scenes);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addBinding = useStudioStore((s) => s.addBinding);
  const updateBinding = useStudioStore((s) => s.updateBinding);
  const deleteBinding = useStudioStore((s) => s.deleteBinding);
  const addBindingCondition = useStudioStore((s) => s.addBindingCondition);
  const updateBindingCondition = useStudioStore(
    (s) => s.updateBindingCondition,
  );
  const removeBindingCondition = useStudioStore(
    (s) => s.removeBindingCondition,
  );

  const selected = bindings.find((b) => b.id === selectedId) ?? null;
  const sceneMissing =
    selected != null &&
    selected.sceneId !== "" &&
    !scenes.some((s) => s.id === selected.sceneId);

  function handleAdd() {
    let n = bindings.length + 1;
    while (bindings.some((b) => b.id === `new-binding-${n}`)) n++;
    addBinding(newBinding(n));
  }

  function parseConditionValue(raw: string): string | number | boolean {
    if (raw === "true") return true;
    if (raw === "false") return false;
    const num = Number(raw);
    if (!isNaN(num) && raw.trim() !== "") return num;
    return raw;
  }

  return (
    <>
      <div className="screen-header">
        <h2>Bindings</h2>
        <p>Runtime state conditions that trigger scene changes</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* List */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Bindings ({bindings.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                + Add
              </button>
            </div>
            <div className="entity-list-items">
              {bindings.length === 0 && (
                <div className="empty-state">
                  <p>No bindings yet. Define trigger conditions to make your soundtrack respond to game state.</p>
                  <button className="btn btn-primary" onClick={handleAdd}>
                    Add first binding
                  </button>
                </div>
              )}
              {bindings.map((b) => (
                <button
                  key={b.id}
                  className={`entity-list-item ${selectedId === b.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(b.id)}
                >
                  <span>{b.name || b.id}</span>
                  <span className="item-badge">p:{b.priority}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state">
                <p>Select a binding to edit</p>
              </div>
            ) : (
              <>
                <h3>{selected.name || selected.id}</h3>

                {sceneMissing && (
                  <div className="inline-warning warning">
                    ⚠ Target scene &quot;{selected.sceneId}&quot; not found
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
                        updateBinding(selected.id, { name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Target Scene</label>
                    <select
                      className="field-input"
                      value={selected.sceneId}
                      onChange={(e) =>
                        updateBinding(selected.id, {
                          sceneId: e.target.value,
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
                    <label className="field-label">Priority</label>
                    <input
                      className="field-input"
                      type="number"
                      value={selected.priority}
                      onChange={(e) =>
                        updateBinding(selected.id, {
                          priority: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.stopProcessing ?? false}
                      onChange={(e) =>
                        updateBinding(selected.id, {
                          stopProcessing: e.target.checked || undefined,
                        })
                      }
                    />
                    Stop processing after match
                  </label>
                </div>

                {/* Conditions */}
                <div className="sub-list">
                  <div className="sub-list-header">
                    <h4>Conditions ({selected.conditions.length})</h4>
                    <button
                      className="btn btn-sm"
                      onClick={() =>
                        addBindingCondition(selected.id, {
                          field: "",
                          op: "eq",
                          value: "",
                        })
                      }
                    >
                      + Add Condition
                    </button>
                  </div>
                  {selected.conditions.length === 0 && (
                    <div className="inline-warning warning">
                      ⚠ Binding has no conditions
                    </div>
                  )}
                  {selected.conditions.map((cond, i) => (
                    <div key={i} className="sub-list-item">
                      <input
                        className="field-input"
                        style={{ width: 120 }}
                        placeholder="field"
                        value={cond.field}
                        onChange={(e) =>
                          updateBindingCondition(selected.id, i, {
                            field: e.target.value,
                          })
                        }
                      />
                      <select
                        className="field-input"
                        style={{ width: 80 }}
                        value={cond.op}
                        onChange={(e) =>
                          updateBindingCondition(selected.id, i, {
                            op: e.target.value as TriggerOp,
                          })
                        }
                      >
                        {TRIGGER_OPS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                      <input
                        className="field-input"
                        style={{ flex: 1 }}
                        placeholder="value"
                        value={String(cond.value)}
                        onChange={(e) =>
                          updateBindingCondition(selected.id, i, {
                            value: parseConditionValue(e.target.value),
                          })
                        }
                      />
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          removeBindingCondition(selected.id, i)
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="btn-row">
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteBinding(selected.id)}
                  >
                    Delete Binding
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
