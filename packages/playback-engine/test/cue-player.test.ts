// ────────────────────────────────────────────
// CuePlayer section-launch semantics:
// - first launched section always starts fresh
// - consecutive sections with the SAME sceneId keep the bed running
//   (regression: every boundary used to restart the scene audibly)
// - authored section transitionMode is passed through as modeOverride
// ────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SoundtrackPack, Cue } from "@motif-studio/schema";
import { CuePlayer } from "../src/cue-player.js";
import type { ScenePlayer } from "../src/scene-player.js";
import type { TransitionPlayer } from "../src/transition-player.js";

function makeStubPlayers() {
  const state = { sceneId: null as string | null };
  const playScene = vi.fn(async (_pack: SoundtrackPack, sceneId: string) => {
    state.sceneId = sceneId;
  });
  const switchScene = vi.fn(
    async (_pack: SoundtrackPack, sceneId: string, _options?: unknown) => {
      state.sceneId = sceneId;
    },
  );
  const scenePlayer = {
    playScene,
    get sceneId() {
      return state.sceneId;
    },
  } as unknown as ScenePlayer;
  const transitionPlayer = { switchScene } as unknown as TransitionPlayer;
  return { scenePlayer, transitionPlayer, playScene, switchScene };
}

const pack = {} as SoundtrackPack;

// bpm 240, 4 beats per bar → exactly 1000ms per bar
const cue: Cue = {
  id: "cue-test",
  name: "Test Cue",
  bpm: 240,
  beatsPerBar: 4,
  sections: [
    {
      id: "s1",
      name: "intro",
      role: "intro",
      durationBars: 1,
      sceneId: "sc-a",
    },
    {
      id: "s2",
      name: "body",
      role: "body",
      durationBars: 1,
      sceneId: "sc-a", // SAME scene — must not restart the bed
    },
    {
      id: "s3",
      name: "climax",
      role: "climax",
      durationBars: 1,
      sceneId: "sc-b",
      transitionMode: "crossfade", // authored mode must reach the transition player
    },
  ],
};

describe("CuePlayer — section launch semantics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not restart the scene when consecutive sections share a sceneId", async () => {
    const { scenePlayer, transitionPlayer, playScene, switchScene } =
      makeStubPlayers();
    const cp = new CuePlayer(scenePlayer, transitionPlayer);

    const done = cp.playCue(pack, cue);
    await vi.advanceTimersByTimeAsync(3500);
    await done;

    // First section: fresh playScene, exactly once
    expect(playScene).toHaveBeenCalledTimes(1);
    expect(playScene).toHaveBeenCalledWith(pack, "sc-a");

    // s2 shares sc-a — no switch; only s3 (sc-a → sc-b) switches
    expect(switchScene).toHaveBeenCalledTimes(1);
    expect(switchScene.mock.calls[0]![1]).toBe("sc-b");
  });

  it("passes authored section transitionMode as modeOverride", async () => {
    const { scenePlayer, transitionPlayer, switchScene } = makeStubPlayers();
    const cp = new CuePlayer(scenePlayer, transitionPlayer);

    const done = cp.playCue(pack, cue);
    await vi.advanceTimersByTimeAsync(3500);
    await done;

    expect(switchScene).toHaveBeenCalledWith(pack, "sc-b", {
      modeOverride: "crossfade",
    });
  });

  it("omits options when the section has no authored transitionMode (pack rules apply)", async () => {
    const { scenePlayer, transitionPlayer, switchScene } = makeStubPlayers();
    const cp = new CuePlayer(scenePlayer, transitionPlayer);

    const plainCue: Cue = {
      ...cue,
      sections: [
        { id: "p1", name: "a", role: "intro", durationBars: 1, sceneId: "sc-a" },
        { id: "p2", name: "b", role: "body", durationBars: 1, sceneId: "sc-b" },
      ],
    };

    const done = cp.playCue(pack, plainCue);
    await vi.advanceTimersByTimeAsync(2500);
    await done;

    expect(switchScene).toHaveBeenCalledTimes(1);
    expect(switchScene.mock.calls[0]![2]).toBeUndefined();
  });

  it("restarts fresh when jumping directly to a later section (first launch is always playScene)", async () => {
    const { scenePlayer, transitionPlayer, playScene, switchScene } =
      makeStubPlayers();
    const cp = new CuePlayer(scenePlayer, transitionPlayer);

    const done = cp.playCue(pack, cue, 2);
    await vi.advanceTimersByTimeAsync(1500);
    await done;

    expect(playScene).toHaveBeenCalledTimes(1);
    expect(playScene).toHaveBeenCalledWith(pack, "sc-b");
    expect(switchScene).not.toHaveBeenCalled();
  });
});
