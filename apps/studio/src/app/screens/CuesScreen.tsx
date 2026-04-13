"use client";

import { useState, useMemo } from "react";
import { useStudioStore } from "../store";
import { usePlaybackStore } from "../playback-store";
import { TransportStrip } from "../components/TransportStrip";
import type {
  Cue,
  CueSection,
  CueSectionRole,
  IntensityLevel,
  TransitionMode,
} from "@motif/schema";
import {
  resolveCuePlan,
  createCaptureEvent,
  captureToCue,
} from "@motif/clip-engine";

const SECTION_ROLES: CueSectionRole[] = ["intro", "body", "escalation", "climax", "outro", "transition"];
const INTENSITY_LEVELS: IntensityLevel[] = ["low", "mid", "high"];
const TRANSITION_MODES: TransitionMode[] = ["immediate", "crossfade", "bar-sync", "stinger-then-switch", "cooldown-fade"];
const EMPTY_CUES: Cue[] = [];

function newCue(n: number, globalBpm?: number): Cue {
  return {
    id: `cue-${n}`,
    name: `New Cue ${n}`,
    bpm: globalBpm ?? 120,
    beatsPerBar: 4,
    sections: [
      { id: crypto.randomUUID(), name: "Intro", role: "intro", durationBars: 4 },
      { id: crypto.randomUUID(), name: "Body", role: "body", durationBars: 8 },
      { id: crypto.randomUUID(), name: "Outro", role: "outro", durationBars: 4 },
    ],
  };
}

function newSection(n: number): CueSection {
  return {
    id: `sec-${crypto.randomUUID()}`,
    name: `Section ${n}`,
    role: "body",
    durationBars: 4,
  };
}

export function CuesScreen() {
  const cues = useStudioStore((s) => s.pack.cues ?? EMPTY_CUES);
  const scenes = useStudioStore((s) => s.pack.scenes);
  const pack = useStudioStore((s) => s.pack);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addCue = useStudioStore((s) => s.addCue);
  const updateCue = useStudioStore((s) => s.updateCue);
  const addCueSection = useStudioStore((s) => s.addCueSection);
  const updateCueSection = useStudioStore((s) => s.updateCueSection);
  const removeCueSection = useStudioStore((s) => s.removeCueSection);
  const reorderCueSections = useStudioStore((s) => s.reorderCueSections);
  const captures = useStudioStore((s) => s.captures);
  const addCapture = useStudioStore((s) => s.addCapture);
  const deleteCapture = useStudioStore((s) => s.deleteCapture);
  const globalBpm = useStudioStore((s) => s.globalBpm);

  const {
    cueState,
    playCue,
    jumpToSection,
    setLoopSection,
    startCapture,
    recordCaptureEvent,
    stopCapture,
    stop,
  } = usePlaybackStore();

  const [tab, setTab] = useState<"timeline" | "capture" | "captures">("timeline");
  const [captureName, setCaptureName] = useState("Performance 1");

  const selected = cues.find((c) => c.id === selectedId) ?? null;

  const plan = useMemo(() => {
    if (!selected) return null;
    return resolveCuePlan(selected);
  }, [selected]);

  // ── Cue list actions ──

  function handleAddCue() {
    let n = cues.length + 1;
    while (cues.some((c) => c.id === `cue-${n}`)) n++;
    addCue(newCue(n, globalBpm));
  }

  function handleAddSection() {
    if (!selected) return;
    const n = selected.sections.length + 1;
    addCueSection(selected.id, newSection(n));
  }

  function handleMoveSection(sectionId: string, direction: -1 | 1) {
    if (!selected) return;
    const ids = selected.sections.map((s) => s.id);
    const idx = ids.indexOf(sectionId);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    reorderCueSections(selected.id, ids);
  }

  // ── Capture actions ──

  function handleStartCapture() {
    startCapture();
    if (selected) {
      playCue(pack, selected);
    }
  }

  function handleStopCapture() {
    const capture = stopCapture(captureName);
    if (capture) {
      addCapture(capture);
      setCaptureName(`Performance ${captures.length + 2}`);
    }
    stop();
  }

  function handleCaptureSceneLaunch(sceneId: string) {
    const bpm = selected?.bpm ?? 120;
    const beatsPerBar = selected?.beatsPerBar ?? 4;
    const tick = usePlaybackStore.getState().cueState.currentBar * beatsPerBar * 480;
    recordCaptureEvent(createCaptureEvent(tick, bpm, beatsPerBar, "scene-launch", { sceneId }));
  }

  function handleCaptureIntensity(level: IntensityLevel) {
    const bpm = selected?.bpm ?? 120;
    const beatsPerBar = selected?.beatsPerBar ?? 4;
    const tick = usePlaybackStore.getState().cueState.currentBar * beatsPerBar * 480;
    recordCaptureEvent(createCaptureEvent(tick, bpm, beatsPerBar, "intensity-change", { intensity: level }));
  }

  function handleConvertCaptureToCue(capture: typeof captures[number]) {
    const cue = captureToCue(capture);
    addCue(cue);
    setSelectedId(cue.id);
  }

  // ── Render ──

  const barWidth = 48;

  return (
    <>
      <div className="screen-header">
        <h2>Cues</h2>
        <p>Timeline-based cue structures with performance capture</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* ── Cue List ── */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Cues ({cues.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAddCue}>+ Add</button>
            </div>
            <div className="entity-list-items">
              {cues.map((c) => (
                <button
                  key={c.id}
                  className={`entity-list-item ${selectedId === c.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span>{c.name || c.id}</span>
                  <span className="badge">{c.sections.length} sections</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Detail Pane ── */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state"><p>Select a cue to edit, or create a new one</p></div>
            ) : (
              <>
                {/* Cue metadata */}
                <h3>{selected.name}</h3>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Name</label>
                    <input className="field-input" value={selected.name} onChange={(e) => updateCue(selected.id, { name: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">BPM</label>
                    <input className="field-input" type="number" min={30} max={300} value={selected.bpm ?? 120} onChange={(e) => updateCue(selected.id, { bpm: Number(e.target.value) })} style={{ width: 80 }} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Beats/Bar</label>
                    <input className="field-input" type="number" min={1} max={12} value={selected.beatsPerBar ?? 4} onChange={(e) => updateCue(selected.id, { beatsPerBar: Number(e.target.value) })} style={{ width: 60 }} />
                  </div>
                </div>

                {/* Tab bar */}
                <div className="field-row" style={{ gap: 4, marginTop: 16, marginBottom: 8 }}>
                  {(["timeline", "capture", "captures"] as const).map((t) => (
                    <button key={t} className={`btn btn-sm ${tab === t ? "btn-primary" : ""}`} onClick={() => setTab(t)}>
                      {t === "timeline" ? "Timeline" : t === "capture" ? "Perform & Capture" : "Saved Captures"}
                    </button>
                  ))}
                </div>

                {/* ── Timeline Tab ── */}
                {tab === "timeline" && (
                  <>
                    {/* Timeline visualisation */}
                    {plan && (
                      <div className="sub-list" style={{ overflowX: "auto", marginBottom: 12 }}>
                        <div className="sub-list-header">
                          <h4>Timeline ({plan.totalBars} bars · {plan.totalSeconds.toFixed(1)}s)</h4>
                        </div>
                        {/* Bar ruler */}
                        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", paddingBottom: 2, minWidth: plan.totalBars * barWidth }}>
                          {Array.from({ length: plan.totalBars }, (_, i) => (
                            <div key={i} style={{ width: barWidth, textAlign: "center", fontSize: 10, color: "var(--text-dim)" }}>
                              {i + 1}
                            </div>
                          ))}
                        </div>
                        {/* Section blocks */}
                        <div style={{ display: "flex", minWidth: plan.totalBars * barWidth, gap: 2, marginTop: 4 }}>
                          {plan.sections.map((sec, i) => {
                            const isActive = cueState.playing && cueState.currentSectionIndex === i;
                            const isLooping = cueState.loopingSectionIndex === i;
                            return (
                              <div
                                key={sec.sectionId}
                                style={{
                                  width: sec.durationBars * barWidth - 2,
                                  padding: "6px 8px",
                                  borderRadius: 4,
                                  background: isActive ? "var(--accent)" : "var(--surface-2)",
                                  border: isLooping ? "2px solid var(--warning)" : "1px solid var(--border)",
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onClick={() => jumpToSection(pack, selected, i)}
                                title={`Click to jump to ${sec.name}`}
                              >
                                <div style={{ fontWeight: 600 }}>{sec.name}</div>
                                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                                  {sec.role} · {sec.durationBars}b
                                  {sec.sceneId ? ` · ${scenes.find((s) => s.id === sec.sceneId)?.name ?? sec.sceneId}` : ""}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Playhead indicator */}
                        {cueState.playing && (
                          <div style={{ position: "relative", height: 4, marginTop: 2, minWidth: plan.totalBars * barWidth }}>
                            <div
                              style={{
                                position: "absolute",
                                left: cueState.currentBar * barWidth,
                                width: barWidth,
                                height: 4,
                                background: "var(--accent)",
                                borderRadius: 2,
                                transition: "left 0.3s",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Playback controls */}
                    <div className="field-row" style={{ gap: 8, marginBottom: 12 }}>
                      <button
                        className="btn btn-primary"
                        disabled={cueState.playing}
                        onClick={() => playCue(pack, selected)}
                      >
                        ▶ Play Cue
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={!cueState.playing}
                        onClick={stop}
                      >
                        ■ Stop
                      </button>
                      {cueState.playing && cueState.loopingSectionIndex !== null && (
                        <button className="btn btn-sm" onClick={() => setLoopSection(null)}>
                          Unloop
                        </button>
                      )}
                    </div>

                    {/* Section list editor */}
                    <div className="sub-list">
                      <div className="sub-list-header">
                        <h4>Sections ({selected.sections.length})</h4>
                        <button className="btn btn-sm btn-primary" onClick={handleAddSection}>+ Add Section</button>
                      </div>
                      {selected.sections.map((sec, i) => (
                        <div key={sec.id} className="stat-card" style={{ padding: 12, marginBottom: 8 }}>
                          <div className="field-row" style={{ alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, minWidth: 24 }}>{i + 1}</span>
                            <input
                              className="field-input"
                              value={sec.name}
                              onChange={(e) => updateCueSection(selected.id, sec.id, { name: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            <button className="btn btn-sm" onClick={() => handleMoveSection(sec.id, -1)} disabled={i === 0}>↑</button>
                            <button className="btn btn-sm" onClick={() => handleMoveSection(sec.id, 1)} disabled={i === selected.sections.length - 1}>↓</button>
                            <button className="btn btn-sm btn-danger" onClick={() => removeCueSection(selected.id, sec.id)}>×</button>
                          </div>
                          <div className="field-row">
                            <div className="field-group">
                              <label className="field-label">Role</label>
                              <select value={sec.role} onChange={(e) => updateCueSection(selected.id, sec.id, { role: e.target.value as CueSectionRole })}>
                                {SECTION_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            <div className="field-group">
                              <label className="field-label">Bars</label>
                              <input type="number" min={1} max={64} value={sec.durationBars} onChange={(e) => updateCueSection(selected.id, sec.id, { durationBars: Number(e.target.value) })} style={{ width: 60 }} />
                            </div>
                            <div className="field-group">
                              <label className="field-label">Scene</label>
                              <select value={sec.sceneId ?? ""} onChange={(e) => updateCueSection(selected.id, sec.id, { sceneId: e.target.value || undefined })}>
                                <option value="">None</option>
                                {scenes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                            <div className="field-group">
                              <label className="field-label">Intensity</label>
                              <select value={sec.intensity ?? ""} onChange={(e) => updateCueSection(selected.id, sec.id, { intensity: (e.target.value || undefined) as IntensityLevel | undefined })}>
                                <option value="">—</option>
                                {INTENSITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                              </select>
                            </div>
                            <div className="field-group">
                              <label className="field-label">Transition</label>
                              <select value={sec.transitionMode ?? ""} onChange={(e) => updateCueSection(selected.id, sec.id, { transitionMode: (e.target.value || undefined) as TransitionMode | undefined })}>
                                <option value="">default</option>
                                {TRANSITION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                          </div>
                          {/* Loop toggle */}
                          <div className="field-row" style={{ marginTop: 4 }}>
                            <button
                              className={`btn btn-sm ${cueState.loopingSectionIndex === i ? "btn-primary" : ""}`}
                              onClick={() => setLoopSection(cueState.loopingSectionIndex === i ? null : i)}
                            >
                              {cueState.loopingSectionIndex === i ? "🔁 Looping" : "Loop this section"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── Capture Tab ── */}
                {tab === "capture" && (
                  <>
                    <div className="sub-list">
                      <div className="sub-list-header">
                        <h4>Performance Capture</h4>
                      </div>
                      <p className="text-dim" style={{ fontSize: 12, margin: "4px 0 12px" }}>
                        Play back the cue and record scene launches &amp; intensity changes as a performance.
                      </p>

                      <div className="field-row" style={{ marginBottom: 12 }}>
                        <div className="field-group">
                          <label className="field-label">Capture Name</label>
                          <input className="field-input" value={captureName} onChange={(e) => setCaptureName(e.target.value)} />
                        </div>
                      </div>

                      <div className="field-row" style={{ gap: 8, marginBottom: 16 }}>
                        {!cueState.recording ? (
                          <button className="btn btn-primary" onClick={handleStartCapture}>
                            ⏺ Start Capture
                          </button>
                        ) : (
                          <button className="btn btn-danger" onClick={handleStopCapture}>
                            ■ Stop &amp; Save
                          </button>
                        )}
                        {cueState.recording && (
                          <span style={{ fontSize: 12, color: "var(--danger)" }}>● Recording — Bar {cueState.currentBar + 1}</span>
                        )}
                      </div>

                      {/* Scene launch pad (active during capture) */}
                      {cueState.recording && (
                        <>
                          <h4 style={{ marginBottom: 8 }}>Launch Scenes</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
                            {scenes.map((scene) => (
                              <button
                                key={scene.id}
                                className="btn"
                                onClick={() => handleCaptureSceneLaunch(scene.id)}
                              >
                                {scene.name || scene.id}
                              </button>
                            ))}
                          </div>
                          <h4 style={{ marginBottom: 8 }}>Set Intensity</h4>
                          <div className="field-row" style={{ gap: 8 }}>
                            {INTENSITY_LEVELS.map((level) => (
                              <button
                                key={level}
                                className="btn btn-sm"
                                onClick={() => handleCaptureIntensity(level)}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* ── Saved Captures Tab ── */}
                {tab === "captures" && (
                  <div className="sub-list">
                    <div className="sub-list-header">
                      <h4>Saved Captures ({captures.length})</h4>
                    </div>
                    {captures.length === 0 ? (
                      <p className="text-dim" style={{ fontSize: 12 }}>No captures yet. Use the Perform &amp; Capture tab to record one.</p>
                    ) : (
                      captures.map((cap) => (
                        <div key={cap.id} className="stat-card" style={{ padding: 12, marginBottom: 8 }}>
                          <div style={{ fontWeight: 600 }}>{cap.name}</div>
                          <div className="text-dim" style={{ fontSize: 11 }}>
                            {cap.events.length} events · {cap.totalBars} bars · {cap.bpm} BPM · {cap.createdAt.split("T")[0]}
                          </div>
                          <div className="field-row" style={{ gap: 8, marginTop: 8 }}>
                            <button className="btn btn-sm btn-primary" onClick={() => handleConvertCaptureToCue(cap)}>
                              Convert to Cue
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteCapture(cap.id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <TransportStrip />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
