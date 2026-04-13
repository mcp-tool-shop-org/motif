import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ClipPlayer, resolveClipNotes } from "../src/clip-player";
import type { Clip } from "@motif-studio/schema";
import type { InstrumentRack } from "@motif-studio/instrument-rack";
import type { InstrumentVoice, Voice } from "@motif-studio/instrument-rack";

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

  describe("loop scheduling", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const loopClip: Clip = {
      id: "loop-clip",
      name: "Loop Test",
      lane: "motif",
      instrumentId: "lead-pluck",
      bpm: 120,
      lengthBeats: 4, // = 2 seconds at 120 BPM
      notes: [
        { pitch: 60, startTick: 0, durationTicks: 480, velocity: 100 },
      ],
      loop: true,
    };

    it("schedules loop re-fire that plays correct notes on second iteration", () => {
      const voice = mockVoice();
      const rack = mockRack(voice);
      const ctx = mockAudioContext();
      const output = ctx.createGain();

      player.play(ctx, loopClip, rack, output, 0);

      // First iteration: 1 note scheduled immediately
      expect(voice.playNote).toHaveBeenCalledTimes(1);

      // Advance timers past loop duration (2s = 2000ms, timer fires at ~1900ms)
      vi.advanceTimersByTime(2000);

      // Second iteration should have scheduled another note
      expect(voice.playNote).toHaveBeenCalledTimes(2);

      // Verify the second call used the correct start time (2.0s for second loop)
      expect(voice.playNote).toHaveBeenNthCalledWith(
        2,
        ctx, 60, 100, 2.0, expect.any(Number), output,
      );
    });

    it("stop() during loop cancels the loop timer", () => {
      const voice = mockVoice();
      const rack = mockRack(voice);
      const ctx = mockAudioContext();
      const output = ctx.createGain();

      player.play(ctx, loopClip, rack, output, 0);
      expect(voice.playNote).toHaveBeenCalledTimes(1);

      // Stop before loop timer fires
      player.stop();
      expect(player.state).toBe("stopped");

      // Advance past when the loop would have fired
      vi.advanceTimersByTime(5000);

      // No additional notes should have been scheduled
      expect(voice.playNote).toHaveBeenCalledTimes(1);
    });

    it("non-looping clip does not re-schedule", () => {
      const voice = mockVoice();
      const rack = mockRack(voice);
      const ctx = mockAudioContext();
      const output = ctx.createGain();

      // testClip has loop: false
      player.play(ctx, testClip, rack, output, 0);
      expect(voice.playNote).toHaveBeenCalledTimes(3);

      // Advance well past clip duration
      vi.advanceTimersByTime(10000);

      // No additional calls
      expect(voice.playNote).toHaveBeenCalledTimes(3);
    });

    it("loop fires multiple iterations when timers advance far enough", () => {
      const voice = mockVoice();
      const rack = mockRack(voice);
      const ctx = mockAudioContext();
      const output = ctx.createGain();

      player.play(ctx, loopClip, rack, output, 0);
      expect(voice.playNote).toHaveBeenCalledTimes(1);

      // The loop timer uses (loopStartTime + clipDuration - ctx.currentTime) * 1000 - 100ms lookahead.
      // With ctx.currentTime stuck at 0 and clipDuration=2s:
      //   1st timer fires at: (0+2-0)*1000 - 100 = 1900ms
      //   2nd timer fires at: 1900 + (2+2-0)*1000 - 100 = 1900 + 3900 = 5800ms
      //   3rd timer fires at: 5800 + (4+2-0)*1000 - 100 = 5800 + 5900 = 11700ms
      // These grow because ctx.currentTime remains 0 (mock).

      vi.advanceTimersByTime(1900); // iteration 2 fires
      expect(voice.playNote).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(3900); // iteration 3 fires (total 5800ms)
      expect(voice.playNote).toHaveBeenCalledTimes(3);

      vi.advanceTimersByTime(5900); // iteration 4 fires (total 11700ms)
      expect(voice.playNote).toHaveBeenCalledTimes(4);
    });

    it("loop preserves variant selection across iterations", () => {
      const variantNotes = [
        { pitch: 72, startTick: 0, durationTicks: 480, velocity: 110 },
      ];
      const loopClipWithVariants: Clip = {
        ...loopClip,
        variants: [{ id: "var-loop", name: "Loop Var", notes: variantNotes }],
      };

      const voice = mockVoice();
      const rack = mockRack(voice);
      const ctx = mockAudioContext();
      const output = ctx.createGain();

      player.play(ctx, loopClipWithVariants, rack, output, 0, "var-loop");

      // First iteration plays variant note (pitch 72)
      expect(voice.playNote).toHaveBeenCalledTimes(1);
      expect(voice.playNote).toHaveBeenCalledWith(
        ctx, 72, 110, expect.any(Number), expect.any(Number), output,
      );

      // Advance to second iteration
      vi.advanceTimersByTime(2000);

      // Second iteration should also play variant note
      expect(voice.playNote).toHaveBeenCalledTimes(2);
      expect(voice.playNote).toHaveBeenNthCalledWith(
        2,
        ctx, 72, 110, expect.any(Number), expect.any(Number), output,
      );
    });
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
