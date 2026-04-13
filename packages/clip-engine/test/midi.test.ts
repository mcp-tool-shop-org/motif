import { describe, it, expect } from "vitest";
import {
  readVLQ,
  writeVLQ,
  parseMidi,
  midiToClipNotes,
  clipNotesToMidi,
} from "../src/midi";
import type { MidiFile, MidiTrack } from "../src/midi-types";
import type { ClipNote } from "@motif/schema";
import { TICKS_PER_BEAT } from "../src/types";

// ── Variable-length quantity tests ──

describe("readVLQ", () => {
  it("reads single-byte value (0)", () => {
    const buf = new ArrayBuffer(1);
    new Uint8Array(buf)[0] = 0x00;
    const [value, bytes] = readVLQ(new DataView(buf), 0);
    expect(value).toBe(0);
    expect(bytes).toBe(1);
  });

  it("reads single-byte value (127)", () => {
    const buf = new ArrayBuffer(1);
    new Uint8Array(buf)[0] = 0x7f;
    const [value, bytes] = readVLQ(new DataView(buf), 0);
    expect(value).toBe(127);
    expect(bytes).toBe(1);
  });

  it("reads two-byte value (128)", () => {
    const buf = new ArrayBuffer(2);
    const arr = new Uint8Array(buf);
    arr[0] = 0x81; // 1 with continuation bit
    arr[1] = 0x00; // 0
    const [value, bytes] = readVLQ(new DataView(buf), 0);
    expect(value).toBe(128);
    expect(bytes).toBe(2);
  });

  it("reads two-byte value (480 = standard ticks per beat)", () => {
    // 480 = 0x1E0 = 0b0000001_1100000
    // VLQ: 10000011 01100000
    const buf = new ArrayBuffer(2);
    const arr = new Uint8Array(buf);
    arr[0] = 0x83;
    arr[1] = 0x60;
    const [value, bytes] = readVLQ(new DataView(buf), 0);
    expect(value).toBe(480);
    expect(bytes).toBe(2);
  });

  it("reads at a non-zero offset", () => {
    const buf = new ArrayBuffer(4);
    const arr = new Uint8Array(buf);
    arr[2] = 0x7f;
    const [value, bytes] = readVLQ(new DataView(buf), 2);
    expect(value).toBe(127);
    expect(bytes).toBe(1);
  });
});

describe("writeVLQ", () => {
  it("encodes 0", () => {
    const result = writeVLQ(0);
    expect(Array.from(result)).toEqual([0x00]);
  });

  it("encodes 127", () => {
    const result = writeVLQ(127);
    expect(Array.from(result)).toEqual([0x7f]);
  });

  it("encodes 128", () => {
    const result = writeVLQ(128);
    expect(Array.from(result)).toEqual([0x81, 0x00]);
  });

  it("encodes 480", () => {
    const result = writeVLQ(480);
    expect(Array.from(result)).toEqual([0x83, 0x60]);
  });

  it("throws for negative value", () => {
    expect(() => writeVLQ(-1)).toThrow("VLQ value must be non-negative");
  });

  it("round-trips through readVLQ", () => {
    const testValues = [0, 1, 127, 128, 255, 480, 960, 16383, 16384, 100000];
    for (const value of testValues) {
      const encoded = writeVLQ(value);
      const buf = new ArrayBuffer(encoded.length);
      new Uint8Array(buf).set(encoded);
      const [decoded] = readVLQ(new DataView(buf), 0);
      expect(decoded).toBe(value);
    }
  });
});

// ── Helper: build a minimal MIDI file ArrayBuffer ──

function buildMidiBuffer(options: {
  format?: number;
  ticksPerBeat?: number;
  tracks: Uint8Array[];
}): ArrayBuffer {
  const { format = 0, ticksPerBeat = 480, tracks } = options;

  // Calculate total size
  let size = 14; // MThd header
  for (const track of tracks) {
    size += 8 + track.length; // MTrk + length + data
  }

  const buf = new ArrayBuffer(size);
  const view = new DataView(buf);
  const arr = new Uint8Array(buf);
  let pos = 0;

  // Header: MThd
  arr.set([0x4d, 0x54, 0x68, 0x64], pos);
  pos += 4;
  view.setUint32(pos, 6);
  pos += 4;
  view.setUint16(pos, format);
  pos += 2;
  view.setUint16(pos, tracks.length);
  pos += 2;
  view.setUint16(pos, ticksPerBeat);
  pos += 2;

  // Tracks
  for (const track of tracks) {
    arr.set([0x4d, 0x54, 0x72, 0x6b], pos);
    pos += 4;
    view.setUint32(pos, track.length);
    pos += 4;
    arr.set(track, pos);
    pos += track.length;
  }

  return buf;
}

// ── parseMidi tests ──

describe("parseMidi", () => {
  it("rejects buffer without MThd header", () => {
    const buf = new ArrayBuffer(14);
    expect(() => parseMidi(buf)).toThrow("Invalid MIDI file");
  });

  it("parses a minimal format-0 file with no events", () => {
    // Track with just end-of-track: 00 FF 2F 00
    const trackData = new Uint8Array([0x00, 0xff, 0x2f, 0x00]);
    const buf = buildMidiBuffer({ format: 0, ticksPerBeat: 480, tracks: [trackData] });

    const midi = parseMidi(buf);
    expect(midi.format).toBe(0);
    expect(midi.ticksPerBeat).toBe(480);
    expect(midi.tracks).toHaveLength(1);
  });

  it("parses note-on and note-off events", () => {
    // Single note: C4 (60), velocity 100, duration 480 ticks
    const trackData = new Uint8Array([
      // delta=0, note-on channel 0, pitch 60, velocity 100
      0x00, 0x90, 0x3c, 0x64,
      // delta=480 (VLQ: 0x83 0x60), note-off channel 0, pitch 60, velocity 0
      0x83, 0x60, 0x80, 0x3c, 0x00,
      // End of track
      0x00, 0xff, 0x2f, 0x00,
    ]);
    const buf = buildMidiBuffer({ tracks: [trackData] });

    const midi = parseMidi(buf);
    const events = midi.tracks[0].events;

    const noteOn = events.find((e) => e.type === "note-on");
    expect(noteOn).toBeDefined();
    expect(noteOn!.pitch).toBe(60);
    expect(noteOn!.velocity).toBe(100);
    expect(noteOn!.channel).toBe(0);

    const noteOff = events.find((e) => e.type === "note-off");
    expect(noteOff).toBeDefined();
    expect(noteOff!.pitch).toBe(60);
    expect(noteOff!.deltaTicks).toBe(480);
  });

  it("treats note-on with velocity 0 as note-off", () => {
    const trackData = new Uint8Array([
      0x00, 0x90, 0x3c, 0x64, // note-on C4 vel 100
      0x83, 0x60, 0x90, 0x3c, 0x00, // note-on C4 vel 0 = note-off
      0x00, 0xff, 0x2f, 0x00,
    ]);
    const buf = buildMidiBuffer({ tracks: [trackData] });

    const midi = parseMidi(buf);
    const events = midi.tracks[0].events;

    const noteOffs = events.filter((e) => e.type === "note-off");
    expect(noteOffs).toHaveLength(1);
    expect(noteOffs[0].pitch).toBe(60);
  });

  it("handles running status", () => {
    const trackData = new Uint8Array([
      0x00, 0x90, 0x3c, 0x64, // note-on C4 vel 100
      0x00, 0x3e, 0x64, // running status: note-on D4 vel 100
      0x83, 0x60, 0x80, 0x3c, 0x00, // note-off C4
      0x00, 0x3e, 0x00, // running status: note-off D4
      0x00, 0xff, 0x2f, 0x00,
    ]);
    const buf = buildMidiBuffer({ tracks: [trackData] });

    const midi = parseMidi(buf);
    const events = midi.tracks[0].events;

    const noteOns = events.filter((e) => e.type === "note-on");
    expect(noteOns).toHaveLength(2);
    expect(noteOns[0].pitch).toBe(60);
    expect(noteOns[1].pitch).toBe(62);
  });

  it("parses tempo meta event", () => {
    // Tempo 120 BPM = 500000 microseconds per beat
    const trackData = new Uint8Array([
      // delta=0, tempo meta event
      0x00, 0xff, 0x51, 0x03,
      0x07, 0xa1, 0x20, // 500000 = 0x07A120
      // End of track
      0x00, 0xff, 0x2f, 0x00,
    ]);
    const buf = buildMidiBuffer({ tracks: [trackData] });

    const midi = parseMidi(buf);
    const tempoEvent = midi.tracks[0].events.find((e) => e.type === "tempo");
    expect(tempoEvent).toBeDefined();
    expect(tempoEvent!.tempo).toBe(500000);
  });

  it("parses track name meta event", () => {
    // Track name "Hi"
    const trackData = new Uint8Array([
      0x00, 0xff, 0x03, 0x02, 0x48, 0x69, // "Hi"
      0x00, 0xff, 0x2f, 0x00,
    ]);
    const buf = buildMidiBuffer({ tracks: [trackData] });

    const midi = parseMidi(buf);
    expect(midi.tracks[0].name).toBe("Hi");
  });

  it("parses multi-track format-1 file", () => {
    const track1 = new Uint8Array([0x00, 0xff, 0x2f, 0x00]);
    const track2 = new Uint8Array([
      0x00, 0x90, 0x3c, 0x64,
      0x83, 0x60, 0x80, 0x3c, 0x00,
      0x00, 0xff, 0x2f, 0x00,
    ]);
    const buf = buildMidiBuffer({ format: 1, tracks: [track1, track2] });

    const midi = parseMidi(buf);
    expect(midi.format).toBe(1);
    expect(midi.tracks).toHaveLength(2);
  });
});

// ── midiToClipNotes tests ──

describe("midiToClipNotes", () => {
  it("converts a single note to ClipNote", () => {
    const track: MidiTrack = {
      events: [
        { deltaTicks: 0, type: "note-on", channel: 0, pitch: 60, velocity: 100 },
        { deltaTicks: 480, type: "note-off", channel: 0, pitch: 60, velocity: 0 },
      ],
    };

    const notes = midiToClipNotes(track, 480);
    expect(notes).toHaveLength(1);
    expect(notes[0].pitch).toBe(60);
    expect(notes[0].startTick).toBe(0);
    expect(notes[0].durationTicks).toBe(480);
    expect(notes[0].velocity).toBe(100);
  });

  it("scales ticks when MIDI ticksPerBeat differs from Motif", () => {
    // MIDI file at 96 ticks/beat, Motif uses 480
    const track: MidiTrack = {
      events: [
        { deltaTicks: 0, type: "note-on", channel: 0, pitch: 60, velocity: 80 },
        { deltaTicks: 96, type: "note-off", channel: 0, pitch: 60, velocity: 0 },
      ],
    };

    const notes = midiToClipNotes(track, 96);
    expect(notes).toHaveLength(1);
    expect(notes[0].startTick).toBe(0);
    expect(notes[0].durationTicks).toBe(TICKS_PER_BEAT); // 480
  });

  it("handles multiple simultaneous notes (chord)", () => {
    const track: MidiTrack = {
      events: [
        { deltaTicks: 0, type: "note-on", channel: 0, pitch: 60, velocity: 100 },
        { deltaTicks: 0, type: "note-on", channel: 0, pitch: 64, velocity: 100 },
        { deltaTicks: 0, type: "note-on", channel: 0, pitch: 67, velocity: 100 },
        { deltaTicks: 480, type: "note-off", channel: 0, pitch: 60, velocity: 0 },
        { deltaTicks: 0, type: "note-off", channel: 0, pitch: 64, velocity: 0 },
        { deltaTicks: 0, type: "note-off", channel: 0, pitch: 67, velocity: 0 },
      ],
    };

    const notes = midiToClipNotes(track, 480);
    expect(notes).toHaveLength(3);
    // Sorted by pitch at same startTick
    expect(notes[0].pitch).toBe(60);
    expect(notes[1].pitch).toBe(64);
    expect(notes[2].pitch).toBe(67);
  });

  it("handles sequential notes (melody)", () => {
    // C major scale: C4 D4 E4 F4 G4 A4 B4 C5
    const pitches = [60, 62, 64, 65, 67, 69, 71, 72];
    const events: MidiTrack["events"] = [];

    for (let i = 0; i < pitches.length; i++) {
      events.push({
        deltaTicks: i === 0 ? 0 : 0,
        type: "note-on",
        channel: 0,
        pitch: pitches[i],
        velocity: 100,
      });
      events.push({
        deltaTicks: 240, // eighth note
        type: "note-off",
        channel: 0,
        pitch: pitches[i],
        velocity: 0,
      });
    }

    const track: MidiTrack = { events };
    const notes = midiToClipNotes(track, 480);
    expect(notes).toHaveLength(8);

    // Each note starts 240 ticks after the previous note's start
    for (let i = 0; i < notes.length; i++) {
      expect(notes[i].pitch).toBe(pitches[i]);
      expect(notes[i].startTick).toBe(i * 240);
      expect(notes[i].durationTicks).toBe(240);
    }
  });

  it("ignores unmatched note-off events", () => {
    const track: MidiTrack = {
      events: [
        { deltaTicks: 0, type: "note-off", channel: 0, pitch: 60, velocity: 0 },
      ],
    };

    const notes = midiToClipNotes(track, 480);
    expect(notes).toHaveLength(0);
  });

  it("matches note-on/off by channel", () => {
    const track: MidiTrack = {
      events: [
        { deltaTicks: 0, type: "note-on", channel: 0, pitch: 60, velocity: 100 },
        { deltaTicks: 0, type: "note-on", channel: 1, pitch: 60, velocity: 80 },
        { deltaTicks: 480, type: "note-off", channel: 0, pitch: 60, velocity: 0 },
        { deltaTicks: 480, type: "note-off", channel: 1, pitch: 60, velocity: 0 },
      ],
    };

    const notes = midiToClipNotes(track, 480);
    expect(notes).toHaveLength(2);
    // Channel 0 note ends at tick 480, channel 1 at tick 960
    expect(notes[0].startTick).toBe(0);
    expect(notes[0].durationTicks).toBe(480);
    expect(notes[1].startTick).toBe(0);
    expect(notes[1].durationTicks).toBe(960);
  });
});

// ── clipNotesToMidi tests ──

describe("clipNotesToMidi", () => {
  it("produces a valid MIDI file header", () => {
    const notes: ClipNote[] = [];
    const buf = clipNotesToMidi(notes, 120);
    const view = new DataView(buf);

    // Check MThd
    expect(String.fromCharCode(
      view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3),
    )).toBe("MThd");

    // Header length
    expect(view.getUint32(4)).toBe(6);
    // Format 0
    expect(view.getUint16(8)).toBe(0);
    // 1 track
    expect(view.getUint16(10)).toBe(1);
    // Default ticks per beat = 480
    expect(view.getUint16(12)).toBe(480);
  });

  it("includes a tempo meta event", () => {
    const notes: ClipNote[] = [];
    const buf = clipNotesToMidi(notes, 120);

    // The output should be parseable
    const midi = parseMidi(buf);
    const tempoEvent = midi.tracks[0].events.find((e) => e.type === "tempo");
    expect(tempoEvent).toBeDefined();
    // 120 BPM = 500000 microseconds/beat
    expect(tempoEvent!.tempo).toBe(500000);
  });

  it("serializes a single note correctly", () => {
    const notes: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
    ];

    const buf = clipNotesToMidi(notes, 120);
    const midi = parseMidi(buf);
    const clipNotes = midiToClipNotes(midi.tracks[0], midi.ticksPerBeat);

    expect(clipNotes).toHaveLength(1);
    expect(clipNotes[0].pitch).toBe(60);
    expect(clipNotes[0].velocity).toBe(100);
    expect(clipNotes[0].startTick).toBe(0);
    expect(clipNotes[0].durationTicks).toBe(480);
  });

  it("uses custom ticksPerBeat", () => {
    const notes: ClipNote[] = [];
    const buf = clipNotesToMidi(notes, 120, 96);
    const view = new DataView(buf);

    expect(view.getUint16(12)).toBe(96);
  });
});

// ── Round-trip tests ──

describe("MIDI round-trip", () => {
  it("round-trips a C major scale", () => {
    const pitches = [60, 62, 64, 65, 67, 69, 71, 72];
    const original: ClipNote[] = pitches.map((pitch, i) => ({
      pitch,
      startTick: i * 480,
      durationTicks: 480,
      velocity: 100,
    }));

    const buf = clipNotesToMidi(original, 120);
    const midi = parseMidi(buf);
    const result = midiToClipNotes(midi.tracks[0], midi.ticksPerBeat);

    expect(result).toHaveLength(original.length);
    for (let i = 0; i < original.length; i++) {
      expect(result[i].pitch).toBe(original[i].pitch);
      expect(result[i].startTick).toBe(original[i].startTick);
      expect(result[i].durationTicks).toBe(original[i].durationTicks);
      expect(result[i].velocity).toBe(original[i].velocity);
    }
  });

  it("round-trips a chord", () => {
    const original: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 960, velocity: 80 },
      { pitch: 64, startTick: 0, durationTicks: 960, velocity: 80 },
      { pitch: 67, startTick: 0, durationTicks: 960, velocity: 80 },
    ];

    const buf = clipNotesToMidi(original, 120);
    const midi = parseMidi(buf);
    const result = midiToClipNotes(midi.tracks[0], midi.ticksPerBeat);

    expect(result).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(result[i].pitch).toBe(original[i].pitch);
      expect(result[i].durationTicks).toBe(original[i].durationTicks);
    }
  });

  it("round-trips notes with varying velocities", () => {
    const original: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 480, velocity: 40 },
      { pitch: 62, startTick: 480, durationTicks: 480, velocity: 80 },
      { pitch: 64, startTick: 960, durationTicks: 480, velocity: 127 },
    ];

    const buf = clipNotesToMidi(original, 120);
    const midi = parseMidi(buf);
    const result = midiToClipNotes(midi.tracks[0], midi.ticksPerBeat);

    expect(result).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(result[i].velocity).toBe(original[i].velocity);
    }
  });

  it("round-trips with non-standard ticksPerBeat", () => {
    const original: ClipNote[] = [
      { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
      { pitch: 64, startTick: 480, durationTicks: 240, velocity: 90 },
    ];

    const buf = clipNotesToMidi(original, 140, 96);
    const midi = parseMidi(buf);
    const result = midiToClipNotes(midi.tracks[0], midi.ticksPerBeat);

    expect(result).toHaveLength(2);
    expect(result[0].pitch).toBe(60);
    expect(result[0].startTick).toBe(0);
    expect(result[0].durationTicks).toBe(480);
    expect(result[1].pitch).toBe(64);
    expect(result[1].startTick).toBe(480);
    expect(result[1].durationTicks).toBe(240);
  });

  it("round-trips empty note array", () => {
    const buf = clipNotesToMidi([], 120);
    const midi = parseMidi(buf);
    const result = midiToClipNotes(midi.tracks[0], midi.ticksPerBeat);
    expect(result).toHaveLength(0);
  });
});
