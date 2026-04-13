import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import type { SoundtrackPack } from "@motif/schema";
import { loadFixture, FIXTURES } from "@motif/test-kit";

// Mock AudioContext globally for jsdom
function createMockAudioContext() {
  return {
    currentTime: 0,
    state: "running",
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    createGain: vi.fn(() => ({
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      loop: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
      playbackRate: { value: 1 },
    })),
    decodeAudioData: vi.fn(() =>
      Promise.resolve({
        duration: 2,
        length: 88200,
        numberOfChannels: 2,
        sampleRate: 44100,
        getChannelData: vi.fn(),
        copyFromChannel: vi.fn(),
        copyToChannel: vi.fn(),
      }),
    ),
  };
}

vi.stubGlobal("AudioContext", vi.fn(() => createMockAudioContext()));
vi.stubGlobal("fetch", vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
  }),
));

describe("Playback UI", () => {
  let pack: SoundtrackPack;

  beforeEach(async () => {
    cleanup();
    pack = loadFixture(FIXTURES.STARTER_PACK) as SoundtrackPack;

    // Reset stores
    const { useStudioStore } = await import("../src/app/store");
    act(() => {
      useStudioStore.setState({
        pack,
        section: "preview",
        selectedId: null,
      });
    });
  });

  it("ManualPreview renders Play Scene button", async () => {
    const { ManualPreview } = await import(
      "../src/app/screens/ManualPreview"
    );

    render(<ManualPreview />);

    const playButton = screen.getByRole("button", { name: /play scene/i });
    expect(playButton).toBeInTheDocument();
  });

  it("ManualPreview renders Stop button", async () => {
    const { ManualPreview } = await import(
      "../src/app/screens/ManualPreview"
    );

    render(<ManualPreview />);

    const stopButtons = screen.getAllByRole("button", { name: /stop/i });
    expect(stopButtons.length).toBeGreaterThanOrEqual(1);
    // The one in playback controls should be disabled when stopped
    expect(stopButtons[0]).toBeDisabled();
  });

  it("SequencePreview renders Play All button", async () => {
    const { SequencePreview } = await import(
      "../src/app/screens/SequencePreview"
    );

    render(<SequencePreview />);

    const playButton = screen.getByRole("button", { name: /play all/i });
    expect(playButton).toBeInTheDocument();
  });

  it("TransportStrip renders in stopped state", async () => {
    const { TransportStrip } = await import(
      "../src/app/components/TransportStrip"
    );

    render(<TransportStrip />);

    expect(screen.getByText("Stopped")).toBeInTheDocument();

    const stopButton = screen.getByTitle("Stop (Escape)");
    expect(stopButton).toBeDisabled();
  });

  it("PreviewScreen includes TransportStrip", async () => {
    const { PreviewScreen } = await import(
      "../src/app/screens/PreviewScreen"
    );

    render(<PreviewScreen />);

    // TransportStrip should be present (at least one toolbar)
    const toolbars = screen.getAllByRole("toolbar", { name: /playback transport/i });
    expect(toolbars.length).toBeGreaterThanOrEqual(1);
  });

  it("TransportStrip shows error banner when errorMessage is set", async () => {
    const { usePlaybackStore } = await import("../src/app/playback-store");
    const { TransportStrip } = await import(
      "../src/app/components/TransportStrip"
    );

    act(() => {
      usePlaybackStore.setState({ errorMessage: 'Could not play scene "forest": decode failed' });
    });

    render(<TransportStrip />);

    const banner = screen.getByRole("alert");
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain("Could not play scene");
  });

  it("TransportStrip dismiss button clears error", async () => {
    const { usePlaybackStore } = await import("../src/app/playback-store");
    const { TransportStrip } = await import(
      "../src/app/components/TransportStrip"
    );

    act(() => {
      usePlaybackStore.setState({ errorMessage: "Test error" });
    });

    render(<TransportStrip />);

    const dismissBtn = screen.getByLabelText("Dismiss error");
    fireEvent.click(dismissBtn);

    expect(usePlaybackStore.getState().errorMessage).toBeNull();
  });

  it("TransportStrip hides banner when no error", async () => {
    const { usePlaybackStore } = await import("../src/app/playback-store");
    const { TransportStrip } = await import(
      "../src/app/components/TransportStrip"
    );

    act(() => {
      usePlaybackStore.setState({ errorMessage: null });
    });

    render(<TransportStrip />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
