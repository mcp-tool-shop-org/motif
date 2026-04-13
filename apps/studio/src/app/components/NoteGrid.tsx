"use client";

import React from "react";
import type { Clip, ClipNote } from "@motif/schema";
import { auditionNote } from "../playback-store";

/** Number of pitch rows to show (MIDI notes) */
const TOTAL_ROWS = 25;
const BASE_PITCH = 48; // C3

const DRUM_LABELS: Record<number, string> = {
  36: "Kick",
  38: "Snare",
  42: "C.Hat",
  46: "OHat",
  39: "Clap",
  45: "Tom",
  37: "Rim",
  56: "Cowb",
};

function isDrum(clip: Clip): boolean {
  return clip.lane === "drums";
}

function getPitchRows(clip: Clip): { pitch: number; label: string }[] {
  if (isDrum(clip)) {
    return [36, 38, 42, 46, 39, 45, 37, 56].map((p) => ({
      pitch: p,
      label: DRUM_LABELS[p] ?? `${p}`,
    }));
  }
  const rows: { pitch: number; label: string }[] = [];
  for (let i = TOTAL_ROWS - 1; i >= 0; i--) {
    const pitch = BASE_PITCH + i;
    rows.push({ pitch, label: midiNoteName(pitch) });
  }
  return rows;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]}${octave}`;
}

interface NoteGridProps {
  clip: Clip;
  onAddNote: (note: ClipNote) => void;
  onRemoveNote: (index: number) => void;
}

export function NoteGrid({ clip, onAddNote, onRemoveNote }: NoteGridProps) {
  const quantize = clip.quantize ?? 120;
  const totalTicks = clip.lengthBeats * 480;
  const columns = Math.floor(totalTicks / quantize);
  const rows = getPitchRows(clip);

  function handleCellClick(pitch: number, col: number) {
    const startTick = col * quantize;
    // Check if note exists at this position
    const existingIndex = clip.notes.findIndex(
      (n) => n.pitch === pitch && n.startTick === startTick,
    );
    if (existingIndex >= 0) {
      onRemoveNote(existingIndex);
    } else {
      onAddNote({
        pitch,
        startTick,
        durationTicks: quantize,
        velocity: 100,
      });
      // Audition the note so the musician hears what they placed
      auditionNote(clip.instrumentId, pitch, 100, 0.2);
    }
  }

  function hasNote(pitch: number, col: number): boolean {
    const startTick = col * quantize;
    return clip.notes.some(
      (n) => n.pitch === pitch && n.startTick === startTick,
    );
  }

  return (
    <div className="note-grid-wrapper" style={{ overflowX: "auto" }}>
      <div
        className="note-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `60px repeat(${columns}, 1fr)`,
          gap: 0,
          minWidth: columns * 24 + 60,
        }}
      >
        {/* Header row — beat markers */}
        <div className="note-grid-corner" />
        {Array.from({ length: columns }, (_, col) => {
          const isBeatStart = (col * quantize) % 480 === 0;
          return (
            <div
              key={col}
              className={`note-grid-header ${isBeatStart ? "beat-start" : ""}`}
              style={{
                fontSize: 9,
                textAlign: "center",
                borderLeft: isBeatStart ? "1px solid var(--border-strong)" : "1px solid var(--border)",
                padding: "2px 0",
              }}
            >
              {isBeatStart ? `${(col * quantize) / 480 + 1}` : ""}
            </div>
          );
        })}

        {/* Pitch rows */}
        {rows.map(({ pitch, label }) => (
          <React.Fragment key={pitch}>
            <div
              className="note-grid-label"
              style={{
                fontSize: 10,
                padding: "2px 4px",
                borderBottom: "1px solid var(--border)",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
            {Array.from({ length: columns }, (_, col) => {
              const active = hasNote(pitch, col);
              const isBeatStart = (col * quantize) % 480 === 0;
              return (
                <div
                  key={`${pitch}-${col}`}
                  className={`note-grid-cell ${active ? "active" : ""}`}
                  onClick={() => handleCellClick(pitch, col)}
                  style={{
                    minHeight: 18,
                    borderBottom: "1px solid var(--border)",
                    borderLeft: isBeatStart
                      ? "1px solid var(--border-strong)"
                      : "1px solid var(--border)",
                    background: active
                      ? "var(--accent)"
                      : "var(--surface)",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
