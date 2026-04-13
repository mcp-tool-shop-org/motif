// ────────────────────────────────────────────
// @motif-studio/clip-engine — MIDI import/export
// Standard MIDI File (SMF) parser and serializer
// ────────────────────────────────────────────

import type { ClipNote } from "@motif-studio/schema";
import type { MidiFile, MidiTrack, MidiEvent } from "./midi-types.js";
import { TICKS_PER_BEAT } from "./types.js";

// ── Variable-length quantity encoding/decoding ──

/**
 * Read a MIDI variable-length quantity from a DataView.
 * Returns [value, bytesConsumed].
 */
export function readVLQ(view: DataView, offset: number): [number, number] {
  let value = 0;
  let bytesRead = 0;

  for (let i = 0; i < 4; i++) {
    if (offset + i >= view.byteLength) throw new Error('Truncated MIDI: unexpected end of VLQ data');
    const byte = view.getUint8(offset + i);
    bytesRead++;
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) return [value, bytesRead];
  }

  throw new Error('Invalid VLQ: exceeded maximum length of 4 bytes');
}

/**
 * Encode a number as a MIDI variable-length quantity.
 * Returns the bytes as a Uint8Array.
 */
export function writeVLQ(value: number): Uint8Array {
  if (value < 0) throw new Error("VLQ value must be non-negative");

  if (value === 0) return new Uint8Array([0]);

  const bytes: number[] = [];
  let v = value;

  // Build bytes from least significant to most significant
  bytes.unshift(v & 0x7f);
  v >>= 7;

  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }

  return new Uint8Array(bytes);
}

// ── MIDI parsing ──

/**
 * Parse a Standard MIDI File from an ArrayBuffer.
 * Supports format 0 (single track) and format 1 (multi-track).
 */
export function parseMidi(buffer: ArrayBuffer): MidiFile {
  const view = new DataView(buffer);
  let pos = 0;

  // ── Header chunk: "MThd" ──
  const headerTag = String.fromCharCode(
    view.getUint8(pos),
    view.getUint8(pos + 1),
    view.getUint8(pos + 2),
    view.getUint8(pos + 3),
  );
  if (headerTag !== "MThd") {
    throw new Error("Invalid MIDI file: missing MThd header");
  }
  pos += 4;

  const headerLength = view.getUint32(pos);
  pos += 4;

  const format = view.getUint16(pos);
  pos += 2;
  const numTracks = view.getUint16(pos);
  pos += 2;
  const division = view.getUint16(pos);
  pos += 2;

  // Skip any extra header bytes
  pos += headerLength - 6;

  // We only support ticks-per-beat timing (bit 15 = 0)
  if (division & 0x8000) {
    throw new Error("SMPTE time division is not supported");
  }
  const ticksPerBeat = division;

  // ── Track chunks ──
  const tracks: MidiTrack[] = [];

  for (let t = 0; t < numTracks && pos < view.byteLength; t++) {
    const trackTag = String.fromCharCode(
      view.getUint8(pos),
      view.getUint8(pos + 1),
      view.getUint8(pos + 2),
      view.getUint8(pos + 3),
    );
    pos += 4;

    if (trackTag !== "MTrk") {
      throw new Error(`Invalid track chunk: expected MTrk, got ${trackTag}`);
    }

    const trackLength = view.getUint32(pos);
    pos += 4;

    const trackEnd = pos + trackLength;
    const track = parseTrack(view, pos, trackEnd);
    tracks.push(track);
    pos = trackEnd;
  }

  return { format, ticksPerBeat, tracks };
}

function parseTrack(view: DataView, start: number, end: number): MidiTrack {
  const events: MidiEvent[] = [];
  let pos = start;
  let runningStatus = 0;
  let trackName: string | undefined;

  while (pos < end) {
    // Read delta time
    const [deltaTicks, vlqBytes] = readVLQ(view, pos);
    pos += vlqBytes;

    if (pos >= end) break;

    let statusByte = view.getUint8(pos);

    // Handle running status: if high bit is not set, reuse previous status
    if (statusByte < 0x80) {
      statusByte = runningStatus;
      // Don't advance pos — this byte is a data byte
    } else {
      pos++;
      runningStatus = statusByte;
    }

    const type = statusByte & 0xf0;
    const channel = statusByte & 0x0f;

    if (type === 0x90) {
      // Note On
      const pitch = view.getUint8(pos++);
      const velocity = view.getUint8(pos++);

      if (velocity === 0) {
        // Note-on with velocity 0 is treated as note-off
        events.push({ deltaTicks, type: "note-off", channel, pitch, velocity: 0 });
      } else {
        events.push({ deltaTicks, type: "note-on", channel, pitch, velocity });
      }
    } else if (type === 0x80) {
      // Note Off
      const pitch = view.getUint8(pos++);
      const velocity = view.getUint8(pos++);
      events.push({ deltaTicks, type: "note-off", channel, pitch, velocity });
    } else if (type === 0xa0 || type === 0xb0 || type === 0xe0) {
      // Polyphonic aftertouch, Control Change, Pitch Bend — 2 data bytes
      pos += 2;
      events.push({ deltaTicks, type: "other" });
    } else if (type === 0xc0 || type === 0xd0) {
      // Program Change, Channel Aftertouch — 1 data byte
      pos += 1;
      events.push({ deltaTicks, type: "other" });
    } else if (statusByte === 0xff) {
      // Meta event
      const metaType = view.getUint8(pos++);
      const [metaLength, metaVlqBytes] = readVLQ(view, pos);
      pos += metaVlqBytes;

      if (metaType === 0x51 && metaLength === 3) {
        // Tempo: 3 bytes = microseconds per beat
        const tempo =
          (view.getUint8(pos) << 16) |
          (view.getUint8(pos + 1) << 8) |
          view.getUint8(pos + 2);
        events.push({ deltaTicks, type: "tempo", tempo });
      } else if (metaType === 0x03) {
        // Track name
        const nameBytes: number[] = [];
        for (let i = 0; i < metaLength; i++) {
          nameBytes.push(view.getUint8(pos + i));
        }
        trackName = String.fromCharCode(...nameBytes);
        events.push({ deltaTicks, type: "other" });
      } else {
        events.push({ deltaTicks, type: "other" });
      }

      pos += metaLength;
      // Meta events do not affect running status
      runningStatus = 0;
    } else if (statusByte === 0xf0 || statusByte === 0xf7) {
      // SysEx
      const [sysexLength, sysexVlqBytes] = readVLQ(view, pos);
      pos += sysexVlqBytes + sysexLength;
      events.push({ deltaTicks, type: "other" });
      runningStatus = 0;
    } else {
      // Unknown — skip (shouldn't happen in valid MIDI)
      events.push({ deltaTicks, type: "other" });
    }
  }

  const track: MidiTrack = { events };
  if (trackName) track.name = trackName;
  return track;
}

// ── MIDI track to ClipNote conversion ──

/**
 * Convert a parsed MIDI track's events into ClipNote[] suitable for Motif clips.
 * Matches note-on/note-off pairs by channel and pitch.
 * Converts tick positions to Motif ticks (using TICKS_PER_BEAT = 480).
 */
export function midiToClipNotes(
  track: MidiTrack,
  ticksPerBeat: number,
): ClipNote[] {
  const notes: ClipNote[] = [];

  // Track absolute tick positions
  let absTick = 0;

  // Open notes: key = `${channel}-${pitch}`, value = { startTick, velocity }
  const openNotes = new Map<string, { startTick: number; velocity: number }>();

  const scale = TICKS_PER_BEAT / ticksPerBeat;

  for (const event of track.events) {
    absTick += event.deltaTicks;

    if (event.type === "note-on" && event.pitch != null && event.channel != null) {
      const key = `${event.channel}-${event.pitch}`;
      openNotes.set(key, {
        startTick: Math.round(absTick * scale),
        velocity: event.velocity ?? 100,
      });
    } else if (event.type === "note-off" && event.pitch != null && event.channel != null) {
      const key = `${event.channel}-${event.pitch}`;
      const open = openNotes.get(key);
      if (open) {
        const endTick = Math.round(absTick * scale);
        const durationTicks = Math.max(1, endTick - open.startTick);
        notes.push({
          pitch: event.pitch,
          startTick: open.startTick,
          durationTicks,
          velocity: open.velocity,
        });
        openNotes.delete(key);
      }
    }
  }

  // Sort by startTick, then pitch for deterministic ordering
  notes.sort((a, b) => a.startTick - b.startTick || a.pitch - b.pitch);

  return notes;
}

// ── ClipNote to MIDI serialization ──

/**
 * Serialize ClipNote[] into a Standard MIDI File (format 0, single track).
 * @param notes ClipNote array to serialize
 * @param bpm Tempo in beats per minute
 * @param ticksPerBeat MIDI ticks per beat (default: 480)
 * @returns ArrayBuffer containing the MIDI file
 */
export function clipNotesToMidi(
  notes: ClipNote[],
  bpm: number,
  ticksPerBeat = 480,
): ArrayBuffer {
  // Build the track data
  const trackBytes = buildTrackData(notes, bpm, ticksPerBeat);

  // Header chunk: MThd + length(6) + format(0) + numTracks(1) + division
  const headerSize = 14;
  // Track chunk: MTrk + length + data
  const trackChunkSize = 8 + trackBytes.length;

  const buffer = new ArrayBuffer(headerSize + trackChunkSize);
  const view = new DataView(buffer);
  let pos = 0;

  // ── Header ──
  // "MThd"
  view.setUint8(pos++, 0x4d); // M
  view.setUint8(pos++, 0x54); // T
  view.setUint8(pos++, 0x68); // h
  view.setUint8(pos++, 0x64); // d
  // Header length: 6
  view.setUint32(pos, 6);
  pos += 4;
  // Format: 0
  view.setUint16(pos, 0);
  pos += 2;
  // Number of tracks: 1
  view.setUint16(pos, 1);
  pos += 2;
  // Division (ticks per beat)
  view.setUint16(pos, ticksPerBeat);
  pos += 2;

  // ── Track chunk ──
  // "MTrk"
  view.setUint8(pos++, 0x4d); // M
  view.setUint8(pos++, 0x54); // T
  view.setUint8(pos++, 0x72); // r
  view.setUint8(pos++, 0x6b); // k
  // Track length
  view.setUint32(pos, trackBytes.length);
  pos += 4;
  // Track data
  const out = new Uint8Array(buffer);
  out.set(trackBytes, pos);

  return buffer;
}

function buildTrackData(
  notes: ClipNote[],
  bpm: number,
  ticksPerBeat: number,
): Uint8Array {
  const chunks: Uint8Array[] = [];

  // Tempo meta event: FF 51 03 tt tt tt
  const microsecondsPerBeat = Math.round(60_000_000 / bpm);
  const tempoVlq = writeVLQ(0); // delta = 0
  chunks.push(tempoVlq);
  chunks.push(
    new Uint8Array([
      0xff,
      0x51,
      0x03,
      (microsecondsPerBeat >> 16) & 0xff,
      (microsecondsPerBeat >> 8) & 0xff,
      microsecondsPerBeat & 0xff,
    ]),
  );

  // Scale from Motif ticks (480/beat) to target ticks
  const scale = ticksPerBeat / TICKS_PER_BEAT;

  // Collect all note-on and note-off events with absolute ticks
  interface NoteEvent {
    absTick: number;
    isOn: boolean;
    pitch: number;
    velocity: number;
  }

  const events: NoteEvent[] = [];
  for (const note of notes) {
    const startTick = Math.round(note.startTick * scale);
    const endTick = Math.round((note.startTick + note.durationTicks) * scale);
    events.push({
      absTick: startTick,
      isOn: true,
      pitch: note.pitch,
      velocity: note.velocity,
    });
    events.push({
      absTick: endTick,
      isOn: false,
      pitch: note.pitch,
      velocity: 0,
    });
  }

  // Sort: by tick, then note-off before note-on at same tick (avoid hanging notes)
  events.sort((a, b) => {
    if (a.absTick !== b.absTick) return a.absTick - b.absTick;
    if (a.isOn !== b.isOn) return a.isOn ? 1 : -1; // off first
    return a.pitch - b.pitch;
  });

  // Write events with delta times
  let lastTick = 0;
  for (const evt of events) {
    const delta = evt.absTick - lastTick;
    lastTick = evt.absTick;

    const deltaVlq = writeVLQ(delta);
    chunks.push(deltaVlq);

    const status = evt.isOn ? 0x90 : 0x80;
    chunks.push(new Uint8Array([status, evt.pitch, evt.velocity]));
  }

  // End of track meta event: FF 2F 00
  const endDelta = writeVLQ(0);
  chunks.push(endDelta);
  chunks.push(new Uint8Array([0xff, 0x2f, 0x00]));

  // Concatenate all chunks
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
