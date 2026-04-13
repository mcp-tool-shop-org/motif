"use client";

import { useRef, useCallback } from "react";
import { useStudioStore } from "../store";
import { usePlaybackStore } from "../playback-store";
import type { Clip, ClipLane } from "@motif/schema";
import { FACTORY_PRESETS } from "@motif/instrument-rack";
import { NoteGrid } from "../components/NoteGrid";
import {
  clipKey,
  clipTranspose,
  clipTransposeInKey,
  clipInvert,
  clipReverse,
  clipOctaveShift,
  clipRhythmScale,
  clipDuplicateWithVariation,
  clipSnapToScale,
  clipFindOutOfScale,
  clipRhythmicVariation,
  clipMelodicVariation,
  clipThinNotes,
  clipDensifyNotes,
  clipAccentEveryN,
  clipAddGhostHits,
  clipRemoveGhostHits,
  clipDeriveIntensity,
  clipAddTension,
  clipBrighten,
  clipPadVoicing,
  clipBassLine,
  clipArpeggiate,
  createTransformedVariant,
  chordPalette,
  progressionFromDegrees,
  getDrumPatterns,
} from "@motif/clip-engine";
import {
  SCALE_NAMES,
  NOTE_NAMES,
  type Key,
  type Chord,
  type ChordMarker,
  type IntensityTier,
} from "@motif/music-theory";

const CLIP_LANES: ClipLane[] = ["drums", "bass", "harmony", "motif", "accent"];
const EMPTY_CLIPS: never[] = [];
const EMPTY_VARIANTS: never[] = [];
const INTENSITY_TIERS: IntensityTier[] = ["low", "mid", "high"];

function newClip(n: number, globalBpm?: number): Clip {
  return {
    id: `clip-${n}`,
    name: `New Clip ${n}`,
    lane: "motif",
    instrumentId: "lead-pluck",
    bpm: globalBpm ?? 120,
    lengthBeats: 4,
    notes: [],
    loop: true,
  };
}

export function ClipsScreen() {
  const clips = useStudioStore((s) => s.pack.clips ?? EMPTY_CLIPS);
  const selectedId = useStudioStore((s) => s.selectedId);
  const setSelectedId = useStudioStore((s) => s.setSelectedId);
  const addClip = useStudioStore((s) => s.addClip);
  const updateClip = useStudioStore((s) => s.updateClip);
  const deleteClip = useStudioStore((s) => s.deleteClip);
  const addClipNote = useStudioStore((s) => s.addClipNote);
  const removeClipNote = useStudioStore((s) => s.removeClipNote);
  const removeClipVariant = useStudioStore((s) => s.removeClipVariant);
  const duplicateClipAsVariant = useStudioStore((s) => s.duplicateClipAsVariant);
  const addClipVariant = useStudioStore((s) => s.addClipVariant);
  const globalBpm = useStudioStore((s) => s.globalBpm);
  const searchQuery = useStudioStore((s) => s.clipSearchQuery);
  const setClipSearch = useStudioStore((s) => s.setClipSearch);

  // Clip preview
  const previewClip = usePlaybackStore((s) => s.previewClip);
  const previewingClipId = usePlaybackStore((s) => s.previewingClipId);

  const bpmRef = useRef<HTMLInputElement>(null);
  const beatsRef = useRef<HTMLInputElement>(null);

  const flashBorder = useCallback((el: HTMLInputElement | null) => {
    if (!el) return;
    el.style.borderColor = "#d4a017";
    setTimeout(() => { el.style.borderColor = ""; }, 600);
  }, []);

  const filteredClips = clips
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (c.name || c.id).toLowerCase().includes(q);
    })
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

  const selected = clips.find((c) => c.id === selectedId) ?? null;
  const key: Key | null = selected ? clipKey(selected) : null;
  const outOfScale = selected && key ? clipFindOutOfScale(selected.notes, key) : [];
  const palette = key ? chordPalette(key) : [];

  function handleAdd() {
    let n = clips.length + 1;
    while (clips.some((c) => c.id === `clip-${n}`)) n++;
    addClip(newClip(n, globalBpm));
  }

  return (
    <>
      <div className="screen-header">
        <h2>Clips</h2>
        <p>Compose musical patterns with the built-in instrument rack</p>
      </div>
      <div className="screen-body">
        <div className="list-detail">
          {/* List */}
          <div className="entity-list">
            <div className="entity-list-header">
              <span>Clips ({filteredClips.length})</span>
              <button className="btn btn-sm btn-primary" onClick={handleAdd}>
                + Add
              </button>
            </div>
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setClipSearch(e.target.value)}
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
              {filteredClips.length === 0 && (
                <div className="empty-state">
                  <p>{clips.length === 0 ? "No clips yet. Create your first clip to start composing." : "No clips match your search."}</p>
                  {clips.length === 0 && (
                    <button className="btn btn-primary" onClick={handleAdd}>
                      Add first clip
                    </button>
                  )}
                </div>
              )}
              {filteredClips.map((c) => (
                <button
                  key={c.id}
                  className={`entity-list-item ${selectedId === c.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span>{c.name || c.id}</span>
                  <span className="badge badge-category">{c.lane}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="detail-pane">
            {!selected ? (
              <div className="empty-state">
                <p>Select a clip to edit</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ flex: 1, margin: 0 }}>{selected.name || selected.id}</h3>
                  {selected.notes.length > 0 && (
                    <button
                      className={`btn btn-sm ${previewingClipId === selected.id ? "btn-danger" : "btn-primary"}`}
                      onClick={() => previewClip(selected)}
                      title={previewingClipId === selected.id ? "Stop preview" : "Play clip preview"}
                      style={previewingClipId === selected.id ? { animation: "pulse 1s infinite" } : undefined}
                    >
                      {previewingClipId === selected.id ? "■ Stop" : "▶ Play"}
                    </button>
                  )}
                </div>

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
                        updateClip(selected.id, { name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Lane</label>
                    <select
                      className="field-input"
                      value={selected.lane}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          lane: e.target.value as ClipLane,
                        })
                      }
                    >
                      {CLIP_LANES.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Instrument</label>
                    <select
                      className="field-input"
                      value={selected.instrumentId}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          instrumentId: e.target.value,
                        })
                      }
                    >
                      {FACTORY_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">BPM</label>
                    <input
                      ref={bpmRef}
                      className="field-input"
                      type="number"
                      min={20}
                      max={999}
                      value={selected.bpm}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          bpm: Number(e.target.value) || 120,
                        })
                      }
                      onBlur={() => {
                        const raw = selected.bpm;
                        const clamped = Math.max(20, Math.min(999, raw));
                        if (clamped !== raw) {
                          updateClip(selected.id, { bpm: clamped });
                          flashBorder(bpmRef.current);
                        }
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Length (beats)</label>
                    <input
                      ref={beatsRef}
                      className="field-input"
                      type="number"
                      min={1}
                      max={999}
                      value={selected.lengthBeats}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          lengthBeats: Number(e.target.value) || 4,
                        })
                      }
                      onBlur={() => {
                        const raw = selected.lengthBeats;
                        const clamped = Math.max(1, Math.min(999, raw));
                        if (clamped !== raw) {
                          updateClip(selected.id, { lengthBeats: clamped });
                          flashBorder(beatsRef.current);
                        }
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Quantize</label>
                    <select
                      className="field-input"
                      value={selected.quantize ?? 120}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          quantize: Number(e.target.value),
                        })
                      }
                    >
                      <option value={480}>Quarter</option>
                      <option value={240}>8th</option>
                      <option value={120}>16th</option>
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <label className="field-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.loop}
                      onChange={(e) =>
                        updateClip(selected.id, { loop: e.target.checked })
                      }
                    />
                    Loop
                  </label>
                </div>

                {/* Key / Scale */}
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Key Root</label>
                    <select
                      className="field-input"
                      value={selected.keyRoot ?? ""}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          keyRoot: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    >
                      <option value="">— none —</option>
                      {NOTE_NAMES.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Scale</label>
                    <select
                      className="field-input"
                      value={selected.keyScale ?? ""}
                      onChange={(e) =>
                        updateClip(selected.id, {
                          keyScale: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">— none —</option>
                      {SCALE_NAMES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {key && outOfScale.length > 0 && (
                    <div className="field-group">
                      <label className="field-label">Scale Check</label>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <span className="text-dim" style={{ fontSize: 12 }}>
                          {outOfScale.length} out-of-scale note{outOfScale.length > 1 ? "s" : ""}
                        </span>
                        <button
                          className="btn btn-sm"
                          onClick={() => updateClip(selected.id, { notes: clipSnapToScale(selected.notes, key) })}
                        >
                          Snap All
                        </button>
                      </div>
                    </div>
                  )}
                  {key && outOfScale.length === 0 && selected.notes.length > 0 && (
                    <div className="field-group">
                      <label className="field-label">Scale Check</label>
                      <span className="text-dim" style={{ fontSize: 12, lineHeight: "32px" }}>✓ All in scale</span>
                    </div>
                  )}
                </div>

                {/* Note grid editor */}
                <div className="sub-list">
                  <div className="sub-list-header">
                    <h4>Notes ({selected.notes.length})</h4>
                    {selected.lane === "drums" && (
                      <select
                        className="field-input"
                        style={{ width: "auto", fontSize: 12, padding: "2px 6px" }}
                        value=""
                        onChange={(e) => {
                          const patterns = getDrumPatterns();
                          const pat = patterns.find((p) => p.name === e.target.value);
                          if (pat) updateClip(selected.id, { notes: pat.notes });
                        }}
                      >
                        <option value="" disabled>Load Pattern...</option>
                        {getDrumPatterns().map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <NoteGrid
                    clip={selected}
                    onAddNote={(note) => addClipNote(selected.id, note)}
                    onRemoveNote={(index) => removeClipNote(selected.id, index)}
                  />
                </div>

                {/* Motif Transforms */}
                {selected.notes.length > 0 && (
                  <div className="sub-list">
                    <div className="sub-list-header">
                      <h4>Motif Transforms</h4>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 0" }}>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipTranspose(selected.notes, 1) })}>+1 semi</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipTranspose(selected.notes, -1) })}>−1 semi</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipOctaveShift(selected.notes, 1) })}>+octave</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipOctaveShift(selected.notes, -1) })}>−octave</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipInvert(selected.notes) })}>Invert</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipReverse(selected.notes) })}>Reverse</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipRhythmScale(selected.notes, 2) })}>×2 stretch</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipRhythmScale(selected.notes, 0.5) })}>×½ compress</button>
                      {key && (
                        <>
                          <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipTransposeInKey(selected.notes, 1, key) })}>+1 degree</button>
                          <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipTransposeInKey(selected.notes, -1, key) })}>−1 degree</button>
                        </>
                      )}
                    </div>
                    <div style={{ padding: "0 0 8px" }}>
                      <span className="text-dim" style={{ fontSize: 11 }}>
                        Derive as variant:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        <button className="btn btn-sm" onClick={() => addClipVariant(selected.id, createTransformedVariant(selected, "Inverted", clipInvert(selected.notes)))}>+ Inverted</button>
                        <button className="btn btn-sm" onClick={() => addClipVariant(selected.id, createTransformedVariant(selected, "Reversed", clipReverse(selected.notes)))}>+ Reversed</button>
                        <button className="btn btn-sm" onClick={() => addClipVariant(selected.id, createTransformedVariant(selected, "Octave Up", clipOctaveShift(selected.notes, 1)))}>+ Octave Up</button>
                        <button className="btn btn-sm" onClick={() => addClipVariant(selected.id, createTransformedVariant(selected, "Varied", clipDuplicateWithVariation(selected.notes)))}>+ Varied</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variation Tools */}
                {selected.notes.length > 0 && (
                  <div className="sub-list">
                    <div className="sub-list-header">
                      <h4>Variation Tools</h4>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 0" }}>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipRhythmicVariation(selected.notes, 60) })}>Rhythmic Var</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipMelodicVariation(selected.notes, 2, key ?? undefined) })}>Melodic Var</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipThinNotes(selected.notes, 2) })}>Thin (½)</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipDensifyNotes(selected.notes, 2, 120) })}>Densify</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipAccentEveryN(selected.notes, 4, 20) })}>Accent ×4</button>
                      {selected.lane === "drums" && (
                        <>
                          <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipAddGhostHits(selected.notes, 30, 60) })}>+ Ghost Hits</button>
                          <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipRemoveGhostHits(selected.notes, 50) })}>− Ghost Hits</button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Intensity Transforms */}
                {selected.notes.length > 0 && (
                  <div className="sub-list">
                    <div className="sub-list-header">
                      <h4>Intensity Variants</h4>
                    </div>
                    <div style={{ display: "flex", gap: 4, padding: "8px 0" }}>
                      {INTENSITY_TIERS.map((tier) => (
                        <button
                          key={tier}
                          className="btn btn-sm"
                          onClick={() =>
                            addClipVariant(
                              selected.id,
                              createTransformedVariant(
                                selected,
                                `${tier[0].toUpperCase()}${tier.slice(1)} Intensity`,
                                clipDeriveIntensity(selected.notes, tier, key ?? undefined),
                              ),
                            )
                          }
                        >
                          + {tier}
                        </button>
                      ))}
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipAddTension(selected.notes, 1) })}>+ Tension</button>
                      <button className="btn btn-sm" onClick={() => updateClip(selected.id, { notes: clipBrighten(selected.notes, 15) })}>Brighten</button>
                    </div>
                  </div>
                )}

                {/* Chord / Bass Helpers */}
                {key && (
                  <div className="sub-list">
                    <div className="sub-list-header">
                      <h4>Chord &amp; Bass Helpers</h4>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                      <span className="text-dim" style={{ fontSize: 12 }}>Diatonic chords in key:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        {palette.map((p) => (
                          <button
                            key={p.degree}
                            className="btn btn-sm"
                            title={`${NOTE_NAMES[p.chord.root]} ${p.chord.quality}`}
                            onClick={() => {
                              const markers: ChordMarker[] = [{ tick: 0, chord: p.chord }];
                              const padNotes = clipPadVoicing(markers, 4, 480 * selected.lengthBeats);
                              updateClip(selected.id, { notes: [...selected.notes, ...padNotes] });
                            }}
                          >
                            {p.numeral}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                        <button className="btn btn-sm" onClick={() => {
                          const prog = progressionFromDegrees(key, [0, 3, 4, 0], 0, 480 * (selected.lengthBeats / 4));
                          addClipVariant(selected.id, createTransformedVariant(selected, "I-IV-V-I Pad", clipPadVoicing(prog, 4, 480 * (selected.lengthBeats / 4))));
                        }}>+ I-IV-V-I Pad</button>
                        <button className="btn btn-sm" onClick={() => {
                          const prog = progressionFromDegrees(key, [0, 5, 3, 4], 0, 480 * (selected.lengthBeats / 4));
                          addClipVariant(selected.id, createTransformedVariant(selected, "I-vi-IV-V Pad", clipPadVoicing(prog, 4, 480 * (selected.lengthBeats / 4))));
                        }}>+ I-vi-IV-V Pad</button>
                        <button className="btn btn-sm" onClick={() => {
                          const prog = progressionFromDegrees(key, [0, 3, 4, 0], 0, 480 * (selected.lengthBeats / 4));
                          addClipVariant(selected.id, createTransformedVariant(selected, "Bass Line", clipBassLine(prog, 2, 480 * (selected.lengthBeats / 4))));
                        }}>+ Bass Line</button>
                        <button className="btn btn-sm" onClick={() => {
                          const chord: Chord = palette[0]?.chord ?? { root: key.root, quality: "major" as const };
                          addClipVariant(selected.id, createTransformedVariant(selected, "Arpeggio", clipArpeggiate(chord, 4, 0, 120, 480 * selected.lengthBeats)));
                        }}>+ Arpeggio</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants */}
                <div className="sub-list">
                  <div className="sub-list-header">
                    <h4>Variants ({(selected.variants ?? EMPTY_VARIANTS).length})</h4>
                    <button
                      className="btn btn-sm"
                      onClick={() =>
                        duplicateClipAsVariant(
                          selected.id,
                          `Variant ${(selected.variants ?? []).length + 1}`,
                        )
                      }
                    >
                      + Duplicate as Variant
                    </button>
                  </div>
                  {(selected.variants ?? EMPTY_VARIANTS).length === 0 && (
                    <div className="empty-state" style={{ padding: "8px 0" }}>
                      <p style={{ fontSize: 13 }}>
                        No variants — duplicate the clip to create A/B patterns
                      </p>
                    </div>
                  )}
                  {(selected.variants ?? EMPTY_VARIANTS).map((v) => (
                    <div key={v.id} className="sub-list-item">
                      <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ flex: 1 }}>
                          {v.name} ({v.notes.length} notes)
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeClipVariant(selected.id, v.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="field-group" style={{ marginTop: 12 }}>
                  <label className="field-label">Tags (comma-separated)</label>
                  <input
                    className="field-input"
                    value={(selected.tags ?? []).join(", ")}
                    onChange={(e) =>
                      updateClip(selected.id, {
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
                    onClick={() => deleteClip(selected.id)}
                  >
                    Delete Clip
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
