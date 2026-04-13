// ────────────────────────────────────────────
// @motif/clip-engine — MIDI types
// ────────────────────────────────────────────

/** Parsed MIDI file structure */
export interface MidiFile {
  /** MIDI format: 0 (single track), 1 (multi-track simultaneous) */
  format: number;
  /** Ticks per quarter note (beat) */
  ticksPerBeat: number;
  /** Parsed tracks */
  tracks: MidiTrack[];
}

/** A single MIDI track containing ordered events */
export interface MidiTrack {
  /** Optional track name from meta event */
  name?: string;
  /** Events in order with delta ticks from previous event */
  events: MidiEvent[];
}

/** MIDI event types we care about */
export type MidiEventType = "note-on" | "note-off" | "tempo" | "other";

/** A single MIDI event */
export interface MidiEvent {
  /** Ticks since previous event in this track */
  deltaTicks: number;
  /** Event type */
  type: MidiEventType;
  /** MIDI channel (0-15), for note events */
  channel?: number;
  /** MIDI note number (0-127), for note events */
  pitch?: number;
  /** Velocity (0-127), for note events */
  velocity?: number;
  /** Tempo in microseconds per beat, for tempo events */
  tempo?: number;
}
