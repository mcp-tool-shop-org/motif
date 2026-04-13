"use client";

import { useState, useCallback, useEffect } from "react";
import { useStudioStore } from "../store";
import { usePlaybackStore } from "../playback-store";
import { FACTORY_PRESETS } from "@motif-studio/instrument-rack";
import { NoteGrid } from "../components/NoteGrid";
import type { Clip, ClipNote, ClipLane, Scene, SceneClipRef } from "@motif-studio/schema";
import {
  clipKey,
  clipDensifyNotes,
  clipMelodicVariation,
  clipRhythmicVariation,
  clipAddGhostHits,
  clipBassLine,
  clipPadVoicing,
  clipArpeggiate,
} from "@motif-studio/clip-engine";
import {
  NOTE_NAMES,
  chordPalette,
  progressionFromDegrees,
} from "@motif-studio/music-theory";

const CLIP_LANES: ClipLane[] = ["drums", "bass", "harmony", "motif", "accent"];
const EMPTY_CLIPS: Clip[] = [];

// ── AI Enhance suggestions ──

interface AiSuggestion {
  id: string;
  label: string;
  description: string;
  icon: string;
  apply: () => void;
}

function generateSuggestions(
  scene: Scene,
  clips: Clip[],
  addClip: (clip: Clip) => void,
  addSceneClipLayer: (sceneId: string, ref: SceneClipRef) => void,
  updateClip: (id: string, partial: Partial<Clip>) => void,
): AiSuggestion[] {
  const suggestions: AiSuggestion[] = [];
  const clipLayers = scene.clipLayers ?? [];
  const sceneClips = clipLayers
    .map((l) => clips.find((c) => c.id === l.clipId))
    .filter((c): c is Clip => !!c);

  const lanes = new Set(sceneClips.map((c) => c.lane));
  const hasDrums = lanes.has("drums");
  const hasBass = lanes.has("bass");
  const hasHarmony = lanes.has("harmony");
  const hasMotif = lanes.has("motif");

  // Find a clip with a key for chord-based suggestions
  const keyedClip = sceneClips.find((c) => clipKey(c) !== null);
  const key = keyedClip ? clipKey(keyedClip) : null;

  // Suggest adding bass line if missing
  if (!hasBass && key) {
    suggestions.push({
      id: "add-bass",
      label: "Add Bass Line",
      description: "Generate a bass line from the chord progression",
      icon: "🎸",
      apply: () => {
        const refClip = keyedClip!;
        const prog = progressionFromDegrees(key, [0, 3, 4, 0], 0, 480 * (refClip.lengthBeats / 4));
        const bassNotes = clipBassLine(prog, 2, 480 * (refClip.lengthBeats / 4));
        const newId = `clip-ai-bass-${crypto.randomUUID()}`;
        const newClip: Clip = {
          id: newId,
          name: "AI Bass",
          lane: "bass",
          instrumentId: "bass-sub",
          bpm: refClip.bpm,
          lengthBeats: refClip.lengthBeats,
          notes: bassNotes,
          loop: true,
          keyRoot: refClip.keyRoot,
          keyScale: refClip.keyScale,
        };
        addClip(newClip);
        addSceneClipLayer(scene.id, { clipId: newId });
      },
    });
  }

  // Suggest adding drums if missing
  if (!hasDrums) {
    const refClip = sceneClips[0];
    if (refClip) {
      suggestions.push({
        id: "add-drums",
        label: "Add Drum Pattern",
        description: "Generate a basic kick/snare/hat pattern",
        icon: "🥁",
        apply: () => {
          const newId = `clip-ai-drums-${crypto.randomUUID()}`;
          const beats = refClip.lengthBeats;
          const notes: ClipNote[] = [];
          // Kick on beats 1, 3
          for (let b = 0; b < beats; b += 2) {
            notes.push({ pitch: 36, startTick: b * 480, durationTicks: 120, velocity: 100 });
          }
          // Snare on beats 2, 4
          for (let b = 1; b < beats; b += 2) {
            notes.push({ pitch: 38, startTick: b * 480, durationTicks: 120, velocity: 90 });
          }
          // Closed hat on every 8th
          for (let i = 0; i < beats * 2; i++) {
            notes.push({ pitch: 42, startTick: i * 240, durationTicks: 120, velocity: 60 });
          }
          const newClip: Clip = {
            id: newId,
            name: "AI Drums",
            lane: "drums",
            instrumentId: "drums-standard",
            bpm: refClip.bpm,
            lengthBeats: beats,
            notes,
            loop: true,
          };
          addClip(newClip);
          addSceneClipLayer(scene.id, { clipId: newId });
        },
      });
    }
  }

  // Suggest adding harmony pad if missing
  if (!hasHarmony && key) {
    suggestions.push({
      id: "add-harmony",
      label: "Add Harmony Pad",
      description: "Generate warm chord pads in the current key",
      icon: "🎹",
      apply: () => {
        const refClip = keyedClip!;
        const prog = progressionFromDegrees(key, [0, 5, 3, 4], 0, 480 * (refClip.lengthBeats / 4));
        const padNotes = clipPadVoicing(prog, 4, 480 * (refClip.lengthBeats / 4));
        const newId = `clip-ai-pad-${crypto.randomUUID()}`;
        const newClip: Clip = {
          id: newId,
          name: "AI Harmony",
          lane: "harmony",
          instrumentId: "pad-warm",
          bpm: refClip.bpm,
          lengthBeats: refClip.lengthBeats,
          notes: padNotes,
          loop: true,
          keyRoot: refClip.keyRoot,
          keyScale: refClip.keyScale,
        };
        addClip(newClip);
        addSceneClipLayer(scene.id, { clipId: newId });
      },
    });
  }

  // Suggest adding arpeggio if no motif
  if (!hasMotif && key) {
    suggestions.push({
      id: "add-arp",
      label: "Add Arpeggio",
      description: "Generate an arpeggiated motif pattern",
      icon: "✨",
      apply: () => {
        const refClip = keyedClip!;
        const palette = chordPalette(key);
        const chord = palette[0]?.chord ?? { root: key.root, quality: "major" as const };
        const arpNotes = clipArpeggiate(chord, 4, 0, 120, 480 * refClip.lengthBeats);
        const newId = `clip-ai-arp-${crypto.randomUUID()}`;
        const newClip: Clip = {
          id: newId,
          name: "AI Arpeggio",
          lane: "motif",
          instrumentId: "pulse-arp",
          bpm: refClip.bpm,
          lengthBeats: refClip.lengthBeats,
          notes: arpNotes,
          loop: true,
          keyRoot: refClip.keyRoot,
          keyScale: refClip.keyScale,
        };
        addClip(newClip);
        addSceneClipLayer(scene.id, { clipId: newId });
      },
    });
  }

  // Suggest densifying sparse clips
  for (const clip of sceneClips) {
    if (clip.notes.length > 0 && clip.notes.length < 6 && clip.lane !== "drums") {
      suggestions.push({
        id: `densify-${clip.id}`,
        label: `Fill Out: ${clip.name}`,
        description: "Add subdivisions to make this pattern busier",
        icon: "📈",
        apply: () => {
          updateClip(clip.id, { notes: clipDensifyNotes(clip.notes, 2, 120) });
        },
      });
    }
  }

  // Suggest adding ghost hits to drums
  for (const clip of sceneClips) {
    if (clip.lane === "drums" && clip.notes.length > 0) {
      suggestions.push({
        id: `ghost-${clip.id}`,
        label: `Add Ghost Hits: ${clip.name}`,
        description: "Add subtle ghost notes for groove",
        icon: "👻",
        apply: () => {
          updateClip(clip.id, { notes: clipAddGhostHits(clip.notes, 30, 60) });
        },
      });
    }
  }

  // Suggest variation of existing clip
  for (const clip of sceneClips) {
    if (clip.notes.length >= 4 && clip.lane !== "drums") {
      suggestions.push({
        id: `vary-${clip.id}`,
        label: `Create Variation: ${clip.name}`,
        description: "Generate a melodic/rhythmic variation",
        icon: "🔀",
        apply: () => {
          const cKey = clipKey(clip);
          const varied = clipMelodicVariation(
            clipRhythmicVariation(clip.notes, 60),
            2,
            cKey ?? undefined,
          );
          const newId = `clip-ai-var-${crypto.randomUUID()}`;
          const newClip: Clip = {
            ...clip,
            id: newId,
            name: `${clip.name} (Variation)`,
            notes: varied,
          };
          addClip(newClip);
          addSceneClipLayer(scene.id, { clipId: newId });
        },
      });
      break; // Only suggest one variation
    }
  }

  return suggestions;
}

// ── Compact step grid (channel rack overview) ──

function StepOverview({ clip }: { clip: Clip }) {
  const totalBeats = clip.lengthBeats;
  const stepsPerBeat = 4;
  const totalSteps = totalBeats * stepsPerBeat;
  const ticksPerStep = 120; // 16th note

  // Build a boolean grid: which steps have notes
  const activeSteps = new Set<number>();
  for (const n of clip.notes) {
    const step = Math.floor(n.startTick / ticksPerStep);
    if (step >= 0 && step < totalSteps) activeSteps.add(step);
  }

  return (
    <div className="step-overview">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`step-cell ${activeSteps.has(i) ? "active" : ""} ${i % stepsPerBeat === 0 ? "beat-start" : ""}`}
        />
      ))}
    </div>
  );
}

// ── Channel Strip (inline mixer) ──

function ChannelMixer({
  clipRef,
  sceneId,
  layerIndex,
}: {
  clipRef: SceneClipRef;
  sceneId: string;
  layerIndex: number;
}) {
  const updateSceneClipLayer = useStudioStore((s) => s.updateSceneClipLayer);
  const isMuted = clipRef.mutedByDefault ?? false;
  const gainDb = clipRef.gainDb ?? 0;

  return (
    <div className="channel-mixer-strip">
      <button
        className={`btn-xs ${isMuted ? "btn-muted" : ""}`}
        onClick={() => updateSceneClipLayer(sceneId, layerIndex, { mutedByDefault: !isMuted })}
        title={isMuted ? "Unmute" : "Mute"}
      >
        M
      </button>
      <input
        type="range"
        className="channel-fader"
        min={-24}
        max={6}
        step={0.5}
        value={gainDb}
        onChange={(e) => updateSceneClipLayer(sceneId, layerIndex, { gainDb: Number(e.target.value) })}
        title={`${gainDb}dB`}
      />
      <span className="channel-db">{gainDb > 0 ? `+${gainDb}` : gainDb}dB</span>
    </div>
  );
}

// ── Main ArrangementScreen ──

export function ArrangementScreen() {
  const pack = useStudioStore((s) => s.pack);
  const scenes = pack.scenes;
  const allClips = pack.clips ?? EMPTY_CLIPS;
  const addClip = useStudioStore((s) => s.addClip);
  const updateClip = useStudioStore((s) => s.updateClip);
  const addClipNote = useStudioStore((s) => s.addClipNote);
  const removeClipNote = useStudioStore((s) => s.removeClipNote);
  const addSceneClipLayer = useStudioStore((s) => s.addSceneClipLayer);
  const removeSceneClipLayer = useStudioStore((s) => s.removeSceneClipLayer);

  const playScene = usePlaybackStore((s) => s.playScene);
  const stop = usePlaybackStore((s) => s.stop);
  const transportState = usePlaybackStore((s) => s.transportState);

  // Local state
  const [activeSceneId, setActiveSceneId] = useState<string>(() => scenes[0]?.id ?? "");
  const [expandedClipId, setExpandedClipId] = useState<string | null>(null);

  // Sync active scene when pack changes
  useEffect(() => {
    if (scenes.length > 0 && !scenes.some((s) => s.id === activeSceneId)) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelInstrument, setNewChannelInstrument] = useState("lead-pluck");
  const [newChannelLane, setNewChannelLane] = useState<ClipLane>("motif");
  const [newChannelName, setNewChannelName] = useState("");

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? null;
  const clipLayers = activeScene?.clipLayers ?? [];

  // Resolve clips for this scene
  const channelData = clipLayers.map((ref, index) => ({
    ref,
    index,
    clip: allClips.find((c) => c.id === ref.clipId) ?? null,
  }));

  // Get BPM from first clip in scene
  const sceneBpm = channelData.find((d) => d.clip)?.clip?.bpm ?? 120;

  // Get key from first keyed clip
  const keyedClip = channelData.find((d) => d.clip && clipKey(d.clip!))?.clip;
  const sceneKey = keyedClip ? clipKey(keyedClip) : null;

  const isPlaying = transportState === "playing";

  // AI suggestions
  const suggestions = activeScene
    ? generateSuggestions(activeScene, allClips, addClip, addSceneClipLayer, updateClip)
    : [];

  const handlePlay = useCallback(() => {
    if (!activeScene) return;
    if (isPlaying) {
      stop();
    } else {
      playScene(pack, activeScene.id);
    }
  }, [activeScene, isPlaying, pack, playScene, stop]);

  const handleAddChannel = () => {
    if (!activeScene) return;
    const name = newChannelName || `New ${newChannelLane}`;
    const id = `clip-${crypto.randomUUID()}`;
    const refClip = channelData.find((d) => d.clip)?.clip;
    const newClip: Clip = {
      id,
      name,
      lane: newChannelLane,
      instrumentId: newChannelInstrument,
      bpm: refClip?.bpm ?? 120,
      lengthBeats: refClip?.lengthBeats ?? 4,
      notes: [],
      loop: true,
      keyRoot: refClip?.keyRoot,
      keyScale: refClip?.keyScale,
    };
    addClip(newClip);
    addSceneClipLayer(activeScene.id, { clipId: id });
    setShowAddChannel(false);
    setNewChannelName("");
  };

  const handleRemoveChannel = (sceneId: string, layerIndex: number) => {
    removeSceneClipLayer(sceneId, layerIndex);
  };

  return (
    <div className="arrangement-screen">
      {/* ── Transport Bar ── */}
      <div className="transport-bar">
        <div className="transport-left">
          <button
            className={`transport-play-btn ${isPlaying ? "playing" : ""}`}
            onClick={handlePlay}
            title={isPlaying ? "Stop" : "Play"}
          >
            {isPlaying ? "■" : "▶"}
          </button>
          <div className="transport-info">
            <span className="transport-bpm">{sceneBpm} BPM</span>
            {sceneKey && (
              <span className="transport-key">
                {NOTE_NAMES[sceneKey.root]} {sceneKey.scale}
              </span>
            )}
          </div>
        </div>
        <div className="transport-center">
          <select
            className="scene-selector"
            value={activeSceneId}
            onChange={(e) => setActiveSceneId(e.target.value)}
          >
            {scenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.id}
              </option>
            ))}
          </select>
        </div>
        <div className="transport-right">
          <button
            className={`ai-enhance-btn ${showAiPanel ? "active" : ""}`}
            onClick={() => setShowAiPanel(!showAiPanel)}
            title="AI Enhance"
          >
            AI Enhance {suggestions.length > 0 && <span className="ai-badge">{suggestions.length}</span>}
          </button>
        </div>
      </div>

      {/* ── AI Enhance Panel ── */}
      {showAiPanel && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <h3>AI Enhance</h3>
            <span className="text-dim">Suggestions based on your current arrangement</span>
          </div>
          {suggestions.length === 0 ? (
            <div className="ai-panel-empty">
              Your arrangement looks complete! Try adding clips to get suggestions.
            </div>
          ) : (
            <div className="ai-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  className="ai-suggestion-card"
                  onClick={() => {
                    s.apply();
                    setShowAiPanel(false);
                  }}
                >
                  <span className="ai-suggestion-icon">{s.icon}</span>
                  <div className="ai-suggestion-text">
                    <span className="ai-suggestion-label">{s.label}</span>
                    <span className="ai-suggestion-desc">{s.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Channel Rack ── */}
      <div className="channel-rack">
        <div className="channel-rack-header">
          <span className="channel-rack-title">Channel Rack</span>
          <span className="text-dim">{channelData.length} channels</span>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowAddChannel(!showAddChannel)}
            style={{ marginLeft: "auto" }}
          >
            + Channel
          </button>
        </div>

        {/* Add channel form */}
        {showAddChannel && (
          <div className="add-channel-form">
            <input
              className="field-input"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="field-input"
              value={newChannelLane}
              onChange={(e) => setNewChannelLane(e.target.value as ClipLane)}
              style={{ width: 100 }}
            >
              {CLIP_LANES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select
              className="field-input"
              value={newChannelInstrument}
              onChange={(e) => setNewChannelInstrument(e.target.value)}
              style={{ width: 160 }}
            >
              {FACTORY_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-primary" onClick={handleAddChannel}>Add</button>
            <button className="btn btn-sm" onClick={() => setShowAddChannel(false)}>Cancel</button>
          </div>
        )}

        {!activeScene ? (
          <div className="empty-state">
            <p>No scenes — create a scene first</p>
          </div>
        ) : channelData.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>No channels in this scene</p>
            <p className="text-dim" style={{ fontSize: 12 }}>Click "+ Channel" to add an instrument, or use AI Enhance</p>
          </div>
        ) : (
          <div className="channel-list">
            {channelData.map(({ ref, index, clip }) => {
              if (!clip) return null;
              const isExpanded = expandedClipId === clip.id;
              const isMuted = ref.mutedByDefault ?? false;
              const laneColor = laneToColor(clip.lane);

              return (
                <div key={`${ref.clipId}-${index}`} className={`channel-row ${isMuted ? "muted" : ""}`}>
                  {/* Channel header */}
                  <div className="channel-header">
                    <div
                      className="channel-lane-indicator"
                      style={{ background: laneColor }}
                      title={clip.lane}
                    />
                    <button
                      className="channel-expand-btn"
                      onClick={() => setExpandedClipId(isExpanded ? null : clip.id)}
                      title={isExpanded ? "Collapse" : "Expand piano roll"}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                    <div className="channel-info">
                      <span className="channel-name">{clip.name}</span>
                      <span className="channel-instrument">
                        {FACTORY_PRESETS.find((p) => p.id === clip.instrumentId)?.name ?? clip.instrumentId}
                      </span>
                    </div>
                    <StepOverview clip={clip} />
                    <ChannelMixer
                      clipRef={ref}
                      sceneId={activeScene.id}
                      layerIndex={index}
                    />
                    <button
                      className="btn-xs channel-remove"
                      onClick={() => handleRemoveChannel(activeScene.id, index)}
                      title="Remove from scene"
                    >
                      ×
                    </button>
                  </div>

                  {/* Expanded piano roll */}
                  {isExpanded && (
                    <div className="channel-piano-roll">
                      <div className="piano-roll-toolbar">
                        <span className="text-dim" style={{ fontSize: 11 }}>
                          {clip.notes.length} notes · {clip.lengthBeats} beats · {clip.bpm} BPM
                        </span>
                        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                          <select
                            className="field-input"
                            value={clip.instrumentId}
                            onChange={(e) => updateClip(clip.id, { instrumentId: e.target.value })}
                            style={{ padding: "2px 6px", fontSize: 11, width: 140 }}
                          >
                            {FACTORY_PRESETS.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <select
                            className="field-input"
                            value={clip.lengthBeats}
                            onChange={(e) => updateClip(clip.id, { lengthBeats: Number(e.target.value) })}
                            style={{ padding: "2px 6px", fontSize: 11, width: 80 }}
                          >
                            {[2, 4, 8, 16, 32].map((b) => (
                              <option key={b} value={b}>{b} beats</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <NoteGrid
                        clip={clip}
                        onAddNote={(note) => addClipNote(clip.id, note)}
                        onRemoveNote={(idx) => removeClipNote(clip.id, idx)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function laneToColor(lane: ClipLane): string {
  switch (lane) {
    case "drums": return "#ff6b6b";
    case "bass": return "#6bffb3";
    case "harmony": return "#6c8aff";
    case "motif": return "#ffb347";
    case "accent": return "#d699ff";
    default: return "#8890a8";
  }
}
