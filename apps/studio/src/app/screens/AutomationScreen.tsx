"use client";

import { useState, useEffect } from "react";
import { useStudioStore } from "../store";
import type {
  AutomationParam,
  AutomationTargetKind,
  MacroParam,
  SectionEnvelopeShape,
} from "@motif/schema";

type Tab = "lanes" | "macros" | "envelopes" | "capture" | "mixer";

const PARAMS: AutomationParam[] = [
  "volume", "pan", "filterCutoff", "reverbSend", "delaySend", "intensity",
];
const TARGET_KINDS: AutomationTargetKind[] = [
  "clip-layer", "scene-layer", "cue-section",
];
const MACRO_PARAMS: MacroParam[] = ["intensity", "tension", "brightness", "space"];
const ENVELOPE_SHAPES: SectionEnvelopeShape[] = [
  "fade-in", "fade-out", "swell", "duck", "filter-rise", "filter-fall",
];

export function AutomationScreen() {
  const [tab, setTab] = useState<Tab>("lanes");

  const tabs: { key: Tab; label: string }[] = [
    { key: "lanes", label: "Automation Lanes" },
    { key: "macros", label: "Macro Controls" },
    { key: "envelopes", label: "Section Envelopes" },
    { key: "capture", label: "Performance Capture" },
    { key: "mixer", label: "Mixer View" },
  ];

  return (
    <section>
      <h2>Automation &amp; Orchestration</h2>

      <div role="tablist" style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontWeight: tab === t.key ? "bold" : "normal",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: tab === t.key ? "2px solid currentColor" : "2px solid transparent",
              cursor: "pointer",
              padding: "0.5rem 1rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lanes" && <LanesPanel />}
      {tab === "macros" && <MacrosPanel />}
      {tab === "envelopes" && <EnvelopesPanel />}
      {tab === "capture" && <CapturePanel />}
      {tab === "mixer" && <MixerPanel />}
    </section>
  );
}

// ── Automation Lanes Panel ──

function LanesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addLane = useStudioStore((s) => s.addAutomationLane);
  const updateLane = useStudioStore((s) => s.updateAutomationLane);
  const deleteLane = useStudioStore((s) => s.deleteAutomationLane);
  const lanes = pack.automationLanes ?? [];
  const scenes = pack.scenes;
  const [selectedId, setSelectedId] = useState("");
  const [ptTime, setPtTime] = useState("");
  const [ptVal, setPtVal] = useState("");

  useEffect(() => {
    setPtTime("");
    setPtVal("");
  }, [selectedId]);

  const lane = lanes.find((l) => l.id === selectedId);

  const handleCreate = () => {
    const id = `lane-${crypto.randomUUID()}`;
    addLane({
      id,
      name: "New Lane",
      param: "volume",
      target: { kind: "scene-layer", targetId: scenes[0]?.id ?? "" },
      points: [],
    });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Automation Lanes</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Add expressive parameter curves to clips, scenes, or cue sections.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select a lane…</option>
          {lanes.map((l) => (
            <option key={l.id} value={l.id}>{l.name} ({l.param})</option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          disabled={scenes.length === 0}
          title={scenes.length === 0 ? "Add a scene first" : "Create a new automation lane"}
        >
          + New Lane
        </button>
        {scenes.length === 0 && (
          <span style={{ color: "#888", fontSize: "0.8rem", alignSelf: "center" }}>Add a scene first</span>
        )}
        {lane && (
          <button onClick={() => { deleteLane(lane.id); setSelectedId(""); }}>
            Delete
          </button>
        )}
      </div>

      {lane && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 500 }}>
          <label>Name</label>
          <input
            value={lane.name}
            onChange={(e) => updateLane(lane.id, { name: e.target.value })}
          />
          <label>Parameter</label>
          <select
            value={lane.param}
            onChange={(e) => updateLane(lane.id, { param: e.target.value as AutomationParam })}
          >
            {PARAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <label>Target Kind</label>
          <select
            value={lane.target.kind}
            onChange={(e) =>
              updateLane(lane.id, {
                target: { ...lane.target, kind: e.target.value as AutomationTargetKind },
              })
            }
          >
            {TARGET_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <label>Target ID</label>
          <select
            value={lane.target.targetId}
            onChange={(e) =>
              updateLane(lane.id, {
                target: { ...lane.target, targetId: e.target.value },
              })
            }
          >
            <option value="">Select target…</option>
            {scenes.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <label>Default Value</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={lane.defaultValue ?? 0.5}
            onChange={(e) => updateLane(lane.id, { defaultValue: Number(e.target.value) })}
          />
          <label>Points</label>
          <span>{lane.points.length} keyframes</span>

          {/* Quick point editor */}
          <label>Add Point</label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <input
              type="number"
              min={0}
              placeholder="ms"
              style={{ width: 70 }}
              value={ptTime}
              onChange={(e) => setPtTime(e.target.value)}
            />
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              placeholder="val"
              style={{ width: 60 }}
              value={ptVal}
              onChange={(e) => setPtVal(e.target.value)}
            />
            <button
              onClick={() => {
                const timeMs = Number(ptTime);
                const value = Number(ptVal);
                if (!isNaN(timeMs) && !isNaN(value)) {
                  const pts = [...lane.points, { timeMs, value }].sort(
                    (a, b) => a.timeMs - b.timeMs,
                  );
                  updateLane(lane.id, { points: pts });
                  setPtTime("");
                  setPtVal("");
                }
              }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Points list */}
      {lane && lane.points.length > 0 && (
        <table style={{ marginTop: "0.5rem", borderCollapse: "collapse", width: "100%", maxWidth: 500 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Time (ms)</th>
              <th style={{ textAlign: "left" }}>Value</th>
              <th style={{ textAlign: "left" }}>Curve</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lane.points.map((pt, i) => (
              <tr key={i}>
                <td>{pt.timeMs}</td>
                <td>{pt.value.toFixed(2)}</td>
                <td>{pt.curve ?? "linear"}</td>
                <td>
                  <button
                    onClick={() => {
                      const pts = lane.points.filter((_, idx) => idx !== i);
                      updateLane(lane.id, { points: pts });
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Macro Controls Panel ──

function MacrosPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const macroState = useStudioStore((s) => s.macroState);
  const setMacroState = useStudioStore((s) => s.setMacroState);
  const addMapping = useStudioStore((s) => s.addMacroMapping);
  const updateMapping = useStudioStore((s) => s.updateMacroMapping);
  const deleteMapping = useStudioStore((s) => s.deleteMacroMapping);
  const mappings = pack.macroMappings ?? [];

  return (
    <div>
      <h3>Macro Controls</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        High-value controls that drive multiple parameters at once for expressive, adaptive scoring.
      </p>

      {/* Live macro faders */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
        {MACRO_PARAMS.map((macro) => (
          <div key={macro} style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: "0.25rem" }}>
              {macro}
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={macroState[macro]}
              onChange={(e) => setMacroState({ [macro]: Number(e.target.value) })}
              style={{ writingMode: "vertical-lr", direction: "rtl", height: 120 }}
            />
            <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
              {macroState[macro].toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Macro mappings */}
      <h4>Macro → Parameter Mappings ({mappings.length})</h4>
      <button
        onClick={() => {
          const id = `mm-${crypto.randomUUID()}`;
          addMapping({ id, macro: "intensity", param: "volume", weight: 0.5 });
        }}
        style={{ marginBottom: "0.5rem" }}
      >
        + New Mapping
      </button>

      {mappings.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Macro</th>
              <th style={{ textAlign: "left" }}>Parameter</th>
              <th>Weight</th>
              <th>Invert</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.id}>
                <td>
                  <select
                    value={m.macro}
                    onChange={(e) => updateMapping(m.id, { macro: e.target.value as MacroParam })}
                  >
                    {MACRO_PARAMS.map((mp) => <option key={mp} value={mp}>{mp}</option>)}
                  </select>
                </td>
                <td>
                  <select
                    value={m.param}
                    onChange={(e) => updateMapping(m.id, { param: e.target.value as AutomationParam })}
                  >
                    {PARAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={m.weight}
                    onChange={(e) => updateMapping(m.id, { weight: Number(e.target.value) })}
                    style={{ width: 60 }}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={m.invert ?? false}
                    onChange={(e) => updateMapping(m.id, { invert: e.target.checked })}
                  />
                </td>
                <td>
                  <button onClick={() => deleteMapping(m.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Section Envelopes Panel ──

function EnvelopesPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const addEnvelope = useStudioStore((s) => s.addSectionEnvelope);
  const updateEnvelope = useStudioStore((s) => s.updateSectionEnvelope);
  const deleteEnvelope = useStudioStore((s) => s.deleteSectionEnvelope);
  const envelopes = pack.sectionEnvelopes ?? [];
  const scenes = pack.scenes;
  const [selectedId, setSelectedId] = useState("");

  const envelope = envelopes.find((e) => e.id === selectedId);

  const handleCreate = () => {
    const id = `env-${crypto.randomUUID()}`;
    addEnvelope({
      id,
      targetId: scenes[0]?.id ?? "",
      shape: "fade-in",
      durationMs: 2000,
      position: "entry",
    });
    setSelectedId(id);
  };

  return (
    <div>
      <h3>Section Envelopes</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Shape entry/exit behaviour: fades, swells, ducks, filter rises — make intros, escalations, and recoveries musical.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">Select an envelope…</option>
          {envelopes.map((e) => (
            <option key={e.id} value={e.id}>{e.shape} ({e.position}) → {e.targetId}</option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          disabled={scenes.length === 0}
          title={scenes.length === 0 ? "Add a scene first" : "Create a new section envelope"}
        >
          + New Envelope
        </button>
        {scenes.length === 0 && (
          <span style={{ color: "#888", fontSize: "0.8rem", alignSelf: "center" }}>Add a scene first</span>
        )}
        {envelope && (
          <button onClick={() => { deleteEnvelope(envelope.id); setSelectedId(""); }}>
            Delete
          </button>
        )}
      </div>

      {envelope && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.25rem 1rem", maxWidth: 450 }}>
          <label>Shape</label>
          <select
            value={envelope.shape}
            onChange={(e) => updateEnvelope(envelope.id, { shape: e.target.value as SectionEnvelopeShape })}
          >
            {ENVELOPE_SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label>Position</label>
          <select
            value={envelope.position}
            onChange={(e) => updateEnvelope(envelope.id, { position: e.target.value as "entry" | "exit" })}
          >
            <option value="entry">Entry</option>
            <option value="exit">Exit</option>
          </select>
          <label>Target</label>
          <select
            value={envelope.targetId}
            onChange={(e) => updateEnvelope(envelope.id, { targetId: e.target.value })}
          >
            {scenes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label>Duration (ms)</label>
          <input
            type="number"
            min={1}
            value={envelope.durationMs}
            onChange={(e) => updateEnvelope(envelope.id, { durationMs: Number(e.target.value) })}
          />
          <label>Depth</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={envelope.depth ?? 1}
            onChange={(e) => updateEnvelope(envelope.id, { depth: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  );
}

// ── Performance Capture Panel ──

function CapturePanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const macroState = useStudioStore((s) => s.macroState);
  const addCapture = useStudioStore((s) => s.addAutomationCapture);
  const deleteCapture = useStudioStore((s) => s.deleteAutomationCapture);
  const captures = pack.automationCaptures ?? [];
  const lanes = pack.automationLanes ?? [];
  const updateLane = useStudioStore((s) => s.updateAutomationLane);

  const [recording, setRecording] = useState(false);
  const [recordSource, setRecordSource] = useState<MacroParam>("intensity");
  const [capturePoints, setCapturePoints] = useState<{ timeMs: number; value: number }[]>([]);
  const [startTime, setStartTime] = useState(0);

  const handleStartRecord = () => {
    setRecording(true);
    setStartTime(Date.now());
    setCapturePoints([]);
  };

  const handleRecordTick = () => {
    if (!recording) return;
    const timeMs = Date.now() - startTime;
    const value = macroState[recordSource];
    setCapturePoints((prev) => [...prev, { timeMs, value }]);
  };

  const handleStopRecord = () => {
    setRecording(false);
    if (capturePoints.length > 0) {
      const id = `cap-${crypto.randomUUID()}`;
      addCapture({
        id,
        name: `${recordSource} capture`,
        recordedAt: new Date().toISOString(),
        source: recordSource,
        points: capturePoints,
      });
    }
  };

  const handleApplyToLane = (captureId: string, laneId: string) => {
    const capture = captures.find((c) => c.id === captureId);
    if (!capture) return;
    updateLane(laneId, { points: [...capture.points] });
  };

  return (
    <div>
      <h3>Performance Capture</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Perform macro moves live and capture them into automation lanes.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
        <select
          value={recordSource}
          onChange={(e) => setRecordSource(e.target.value as MacroParam)}
          disabled={recording}
        >
          {MACRO_PARAMS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        {!recording ? (
          <button onClick={handleStartRecord} style={{ color: "#f44" }}>
            ⏺ Record
          </button>
        ) : (
          <>
            <button onClick={handleRecordTick}>Tick ({capturePoints.length} pts)</button>
            <button onClick={handleStopRecord}>⏹ Stop</button>
          </>
        )}
      </div>

      <h4>Captures ({captures.length})</h4>
      {captures.length === 0 ? (
        <p style={{ color: "#666" }}>No captures yet. Record a macro performance to create one.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Name</th>
              <th>Source</th>
              <th>Points</th>
              <th>Apply to Lane</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {captures.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ textAlign: "center" }}>{c.source}</td>
                <td style={{ textAlign: "center" }}>{c.points.length}</td>
                <td>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleApplyToLane(c.id, e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Apply to…</option>
                    {lanes.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </td>
                <td>
                  <button onClick={() => deleteCapture(c.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Mixer View Panel ──

function MixerPanel() {
  const pack = useStudioStore((s) => s.pack)!;
  const lanes = pack.automationLanes ?? [];
  const mappings = pack.macroMappings ?? [];
  const envelopes = pack.sectionEnvelopes ?? [];
  const scenes = pack.scenes;

  return (
    <div>
      <h3>Mixer View</h3>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Overview of automatable parameters, current values, and active automation.
      </p>

      {scenes.map((scene) => {
        const sceneLanes = lanes.filter((l) => l.target.targetId === scene.id);
        const sceneEnvelopes = envelopes.filter((e) => e.targetId === scene.id);
        const sceneMappings = mappings.filter((m) => !m.targetId || m.targetId === scene.id);

        return (
          <div key={scene.id} style={{ marginBottom: "1rem", padding: "0.5rem", background: "#1a1a1a", borderRadius: 4 }}>
            <strong>{scene.name}</strong>
            <span style={{ color: "#888", fontSize: "0.8rem", marginLeft: "0.5rem" }}>
              {sceneLanes.length} lanes · {sceneEnvelopes.length} envelopes · {sceneMappings.length} macro links
            </span>

            {/* Parameter row */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {PARAMS.map((param) => {
                const lane = sceneLanes.find((l) => l.param === param);
                const macroLinks = sceneMappings.filter((m) => m.param === param);
                const hasAutomation = !!lane && lane.points.length > 0;
                const hasMacro = macroLinks.length > 0;

                return (
                  <div
                    key={param}
                    style={{
                      padding: "0.3rem 0.5rem",
                      borderRadius: 4,
                      background: hasAutomation ? "#2a3" : hasMacro ? "#25a" : "#333",
                      fontSize: "0.8rem",
                      minWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{param}</div>
                    {hasAutomation && <div>{lane!.points.length} pts</div>}
                    {hasMacro && <div>🎛 {macroLinks.map((m) => m.macro).join(", ")}</div>}
                    {!hasAutomation && !hasMacro && <div style={{ color: "#888" }}>—</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
