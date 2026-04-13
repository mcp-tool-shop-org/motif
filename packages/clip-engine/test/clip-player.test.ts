import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClipPlayer, resolveClipNotes } from "../src/clip-player";
import type { Clip } from "@motif/schema";
import type { InstrumentRack } from "@motif/instrument-rack";
import type { InstrumentVoice, Voice } from "@motif/instrument-rack";

function mockVoice(): InstrumentVoice {
  return {
    category: "lead",
    playNote: vi.fn((): Voice => ({ stop: vi.fn() })),
    dispose: vi.fn(),
  };
}

function mockRack(voice: InstrumentVoice | null): InstrumentRack {
  return {
    getVoice: vi.fn(() => voice),
    listPresets: vi.fn(() => []),
    registerPresets: vi.fn(),
    dispose: vi.fn(),
  } as unknown as InstrumentRack;
}

function mockAudioContext(): AudioContext {
  return {
    currentTime: 0,
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    destination: {},
  } as unknown as AudioContext;
}

const testClip: Clip = {
  id: "test-clip",
  name: "Test",
  lane: "motif",
  instrumentId: "lead-pluck",
  bpm: 120,
  lengthBeats: 4,
  notes: [
    { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
    { pitch: 64, startTick: 480, durationTicks: 480, velocity: 80 },
    { pitch: 67, startTick: 960, durationTicks: 480, velocity: 90 },
  ],
  loop: false,
};

describe("ClipPlayer", () => {
  let player: ClipPlayer;

  beforeEach(() => {
    player = new ClipPlayer();
  });

  it("starts in stopped state", () => {
    expect(player.state).toBe("stopped");
  });

  it("plays a clip and transitions to playing state", () => {
    const voice = mockVoice();
    const rack = mockRack(voice);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    player.play(ctx, testClip, rack, output);
    expect(player.state).toBe("playing");
    expect(voice.playNote).toHaveBeenCalledTimes(3);
  });

  it("does nothing when instrument not found", () => {
    const rack = mockRack(null);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    player.play(ctx, testClip, rack, output);
    expect(player.state).toBe("stopped");
  });

  it("stops cleanly", () => {
    const stopFn = vi.fn();
    const voice: InstrumentVoice = {
      category: "lead",
      playNote: vi.fn((): Voice => ({ stop: stopFn })),
      dispose: vi.fn(),
    };
    const rack = mockRack(voice);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    player.play(ctx, testClip, rack, output);
    player.stop();
    expect(player.state).toBe("stopped");
    expect(stopFn).toHaveBeenCalledTimes(3);
  });

  it("schedules notes with correct timing", () => {
    const voice = mockVoice();
    const rack = mockRack(voice);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    player.play(ctx, testClip, rack, output, 2.0);

    // At 120 BPM, 480 ticks = 0.5s
    expect(voice.playNote).toHaveBeenCalledWith(
      ctx, 60, 100, 2.0, 0.5, output,
    );
    expect(voice.playNote).toHaveBeenCalledWith(
      ctx, 64, 80, 2.5, 0.5, output,
    );
    expect(voice.playNote).toHaveBeenCalledWith(
      ctx, 67, 90, 3.0, 0.5, output,
    );
  });

  it("re-stops voices on replay", () => {
    const stopFn = vi.fn();
    const voice: InstrumentVoice = {
      category: "lead",
      playNote: vi.fn((): Voice => ({ stop: stopFn })),
      dispose: vi.fn(),
    };
    const rack = mockRack(voice);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    // Play once
    player.play(ctx, testClip, rack, output);
    expect(stopFn).not.toHaveBeenCalled();

    // Play again — should stop previous voices
    player.play(ctx, testClip, rack, output);
    expect(stopFn).toHaveBeenCalledTimes(3);
  });

  it("uses variant notes when variantId is provided", () => {
    const variantNotes = [
      { pitch: 72, startTick: 0, durationTicks: 480, velocity: 110 },
    ];
    const clipWithVariants: Clip = {
      ...testClip,
      variants: [
        { id: "var-a", name: "Variant A", notes: variantNotes },
      ],
    };

    const voice = mockVoice();
    const rack = mockRack(voice);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    player.play(ctx, clipWithVariants, rack, output, 0, "var-a");
    expect(voice.playNote).toHaveBeenCalledTimes(1);
    expect(voice.playNote).toHaveBeenCalledWith(
      ctx, 72, 110, expect.any(Number), expect.any(Number), output,
    );
  });

  it("falls back to main notes when variantId not found", () => {
    const voice = mockVoice();
    const rack = mockRack(voice);
    const ctx = mockAudioContext();
    const output = ctx.createGain();

    player.play(ctx, testClip, rack, output, 0, "nonexistent");
    expect(voice.playNote).toHaveBeenCalledTimes(3); // main notes
  });
});

describe("resolveClipNotes", () => {
  const clip: Clip = {
    id: "test",
    name: "Test",
    lane: "motif",
    instrumentId: "lead",
    bpm: 120,
    lengthBeats: 4,
    notes: [
      { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
    ],
    variants: [
      {
        id: "var-b",
        name: "B",
        notes: [
          { pitch: 72, startTick: 0, durationTicks: 240, velocity: 80 },
          { pitch: 74, startTick: 240, durationTicks: 240, velocity: 80 },
        ],
      },
    ],
    loop: false,
  };

  it("returns main notes when no variantId", () => {
    expect(resolveClipNotes(clip)).toBe(clip.notes);
    expect(resolveClipNotes(clip, undefined)).toBe(clip.notes);
  });

  it("returns variant notes when variantId matches", () => {
    const result = resolveClipNotes(clip, "var-b");
    expect(result).toHaveLength(2);
    expect(result[0].pitch).toBe(72);
  });

  it("returns main notes when variantId does not match", () => {
    expect(resolveClipNotes(clip, "no-such")).toBe(clip.notes);
  });

  it("handles clip without variants", () => {
    const plain: Clip = { ...clip, variants: undefined };
    expect(resolveClipNotes(plain, "var-b")).toBe(plain.notes);
  });
});
