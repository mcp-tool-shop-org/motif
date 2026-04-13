"use client";

import { useState } from "react";
import { useStudioStore } from "../store";
import { usePlaybackStore } from "../playback-store";
import { TransportStrip } from "../components/TransportStrip";
import type { IntensityLevel, QuantizeMode } from "@motif-studio/schema";
import { clipKey } from "@motif-studio/clip-engine";
import { NOTE_NAMES } from "@motif-studio/music-theory";

const EMPTY_CLIPS: never[] = [];
const QUANTIZE_MODES: QuantizeMode[] = ["none", "beat", "bar"];
const INTENSITY_LEVELS: IntensityLevel[] = ["low", "mid", "high"];

export function PerformanceScreen() {
  const pack = useStudioStore((s) => s.pack);
  const scenes = pack.scenes;
  const clips = pack.clips ?? EMPTY_CLIPS;
  const playScene = usePlaybackStore((s) => s.playScene);
  const currentSceneId = usePlaybackStore((s) => s.currentSceneId);
  const transportState = usePlaybackStore((s) => s.transportState);
  const stop = usePlaybackStore((s) => s.stop);

  // TODO: quantize and intensity are display-only filters; not yet wired to playback engine
  const [quantize, setQuantize] = useState<QuantizeMode>("bar");
  const [intensity, setIntensity] = useState<IntensityLevel>("mid");

  const activeScene = scenes.find((s) => s.id === currentSceneId) ?? null;
  const activeClipLayers = activeScene?.clipLayers ?? [];

  // Group clip layers by section role
  const introClips = activeClipLayers.filter((r) => r.sectionRole === "intro");
  const loopClips = activeClipLayers.filter(
    (r) => !r.sectionRole || r.sectionRole === "loop",
  );
  const outroClips = activeClipLayers.filter((r) => r.sectionRole === "outro");

  return (
    <>
      <div className="screen-header">
        <h2>Performance</h2>
        <p>Live scene launching with quantized timing and intensity control</p>
      </div>
      <div className="screen-body">
        {/* Controls bar */}
        <div className="field-row" style={{ marginBottom: 16 }}>
          <div className="field-group">
            <label className="field-label">Quantize</label>
            <select
              className="field-input"
              value={quantize}
              onChange={(e) => setQuantize(e.target.value as QuantizeMode)}
            >
              {QUANTIZE_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Intensity</label>
            <div style={{ display: "flex", gap: 4 }}>
              {INTENSITY_LEVELS.map((l) => (
                <button
                  key={l}
                  className={`btn btn-sm ${intensity === l ? "btn-primary" : ""}`}
                  onClick={() => setIntensity(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="field-group" style={{ flex: 1 }} />
          <div className="field-group">
            <label className="field-label">Tempo</label>
            <span className="text-dim" style={{ lineHeight: "32px" }}>
              {clips.length > 0 ? clips[0].bpm : "\u2014"}
            </span>
            {clips.length > 0 && (
              <span style={{ fontSize: "0.7rem", color: "#666", marginLeft: 4 }}>(from first clip)</span>
            )}
          </div>
        </div>

        {/* Scene launch grid */}
        <div className="sub-list">
          <div className="sub-list-header">
            <h4>Scenes ({scenes.length})</h4>
            {transportState !== "stopped" && (
              <button className="btn btn-sm btn-danger" onClick={stop}>
                ■ Stop All
              </button>
            )}
          </div>
          {scenes.length === 0 && (
            <div className="empty-state">
              <p>No scenes — create scenes first</p>
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 8,
              padding: "8px 0",
            }}
          >
            {scenes.map((scene) => {
              const isActive = currentSceneId === scene.id;
              const clipCount = (scene.clipLayers ?? []).length;
              return (
                <button
                  key={scene.id}
                  className={`btn ${isActive ? "btn-primary" : ""}`}
                  style={{
                    padding: "12px 8px",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                  onClick={() => playScene(pack, scene.id)}
                >
                  <span style={{ fontWeight: 600 }}>{scene.name || scene.id}</span>
                  <span className="text-dim" style={{ fontSize: 11 }}>
                    {scene.category} · {scene.layers.length} stems · {clipCount} clips
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active scene detail */}
        {activeScene && (
          <div className="sub-list" style={{ marginTop: 16 }}>
            <div className="sub-list-header">
              <h4>Now Playing: {activeScene.name}</h4>
            </div>

            {/* Section flow overview */}
            <div style={{ display: "flex", gap: 16, padding: "8px 0" }}>
              <div>
                <span className="badge badge-category">Intro</span>
                <span className="text-dim" style={{ marginLeft: 4 }}>
                  {introClips.length} clips
                </span>
              </div>
              <div>
                <span className="badge badge-category">Loop</span>
                <span className="text-dim" style={{ marginLeft: 4 }}>
                  {loopClips.length} clips
                </span>
              </div>
              <div>
                <span className="badge badge-category">Outro</span>
                <span className="text-dim" style={{ marginLeft: 4 }}>
                  {outroClips.length} clips
                </span>
              </div>
            </div>

            {/* Intensity breakdown */}
            <div style={{ padding: "4px 0 8px" }}>
              <span className="text-dim" style={{ fontSize: 12 }}>
                Intensity: {intensity} — {
                  activeClipLayers.filter((r) => {
                    if (!r.intensity) return true;
                    const order = ["low", "mid", "high"];
                    return order.indexOf(r.intensity) <= order.indexOf(intensity);
                  }).length
                } / {activeClipLayers.length} clips active
              </span>
            </div>

            {/* Clip list */}
            {activeClipLayers
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((ref, i) => {
                const clip = clips.find((c) => c.id === ref.clipId);
                if (!clip) return null;
                const intensityOrder = ["low", "mid", "high"];
                const isActive =
                  !ref.intensity ||
                  intensityOrder.indexOf(ref.intensity) <=
                    intensityOrder.indexOf(intensity);
                return (
                  <div
                    key={i}
                    className="sub-list-item"
                    style={{ opacity: isActive ? 1 : 0.4 }}
                  >
                    <span style={{ fontSize: 11, width: 24 }}>{ref.order ?? i}</span>
                    <span style={{ flex: 1 }}>{clip.name}</span>
                    <span className="badge badge-category">{ref.sectionRole ?? "loop"}</span>
                    <span className="badge" style={{ marginLeft: 4 }}>
                      {ref.intensity ?? "—"}
                    </span>
                    {ref.variantId && (
                      <span className="text-dim" style={{ marginLeft: 4, fontSize: 11 }}>
                        var: {ref.variantId}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Clip Family View — shows how clips relate across the soundtrack */}
        {clips.length > 0 && (
          <div className="sub-list" style={{ marginTop: 16 }}>
            <div className="sub-list-header">
              <h4>Clip Families</h4>
            </div>
            <div style={{ padding: "8px 0" }}>
              <span className="text-dim" style={{ fontSize: 12 }}>
                Clips grouped by key — see how one musical idea evolves across scenes
              </span>
            </div>
            {(() => {
              const families = new Map<string, typeof clips>();
              for (const clip of clips) {
                const k = clipKey(clip);
                const label = k ? `${NOTE_NAMES[k.root]} ${k.scale}` : "No key";
                if (!families.has(label)) families.set(label, []);
                families.get(label)!.push(clip);
              }
              return [...families.entries()].map(([label, group]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <span className="badge badge-category">{label}</span>
                  <span className="text-dim" style={{ marginLeft: 4, fontSize: 11 }}>
                    {group.length} clip{group.length > 1 ? "s" : ""}
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                    {group.map((c) => (
                      <span key={c.id} className="badge" style={{ fontSize: 11 }}>
                        {c.name} ({c.lane}) {(c.variants ?? []).length > 0 ? `· ${(c.variants ?? []).length} var` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        <TransportStrip />
      </div>
    </>
  );
}
