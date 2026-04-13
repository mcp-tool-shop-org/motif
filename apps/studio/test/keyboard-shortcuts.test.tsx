import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Studio from "../src/app/Studio";
import { useStudioStore } from "../src/app/store";
import { usePlaybackStore } from "../src/app/playback-store";
import { starterPack } from "../src/app/seed-data";
import type { SoundtrackPack } from "@motif-studio/schema";

beforeEach(() => {
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack,
    section: "project",
    selectedId: null,
  });
  usePlaybackStore.setState({ previewingClipId: null });
});

afterEach(() => {
  cleanup();
});

describe("Keyboard shortcuts — screen switching", () => {
  it("pressing 1 switches to arrangement screen", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "1" });
    expect(useStudioStore.getState().section).toBe("arrangement");
  });

  it("pressing 2 switches to clips screen", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "2" });
    expect(useStudioStore.getState().section).toBe("clips");
  });

  it("pressing 3 switches to scenes screen", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "3" });
    expect(useStudioStore.getState().section).toBe("scenes");
  });

  it("pressing 4 switches to mixer screen", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "4" });
    expect(useStudioStore.getState().section).toBe("mixer");
  });

  it("pressing 5 switches to project screen", () => {
    render(<Studio />);
    // First switch away
    useStudioStore.setState({ section: "clips" });
    fireEvent.keyDown(window, { key: "5" });
    expect(useStudioStore.getState().section).toBe("project");
  });
});

describe("Keyboard shortcuts — ? toggle", () => {
  it("pressing ? shows the shortcuts overlay", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("pressing ? again hides the overlay", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.queryByText("Keyboard Shortcuts")).toBeNull();
  });

  it("pressing Escape closes the overlay", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Keyboard Shortcuts")).toBeNull();
  });
});

describe("Keyboard shortcuts — Escape stops playback", () => {
  it("calls stop and stopPreview on Escape", () => {
    const stopSpy = vi.fn();
    const stopPreviewSpy = vi.fn();
    usePlaybackStore.setState({
      stop: stopSpy,
      stopPreview: stopPreviewSpy,
      transportState: "playing",
    });

    render(<Studio />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(stopSpy).toHaveBeenCalled();
    expect(stopPreviewSpy).toHaveBeenCalled();
  });
});

describe("Keyboard shortcuts — input guard", () => {
  it("does not fire shortcuts when typing in an input", () => {
    render(<Studio />);
    // Switch to assets screen where there's an input
    fireEvent.click(screen.getByRole("button", { name: /Assets/ }));
    fireEvent.click(screen.getByRole("button", { name: /Exploration Base/ }));
    const nameInput = screen.getByDisplayValue("Exploration Base");
    fireEvent.keyDown(nameInput, { key: "2" });
    // Should NOT have switched to clips
    expect(useStudioStore.getState().section).toBe("assets");
  });
});

describe("Keyboard shortcuts — Delete", () => {
  it("pressing Delete removes selected asset", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Assets/ }));
    fireEvent.click(screen.getByRole("button", { name: /Exploration Base/ }));
    expect(useStudioStore.getState().selectedId).toBe("asset-explore-base");
    // Focus somewhere that isn't an input
    const heading = screen.getByText("Assets", { selector: "h2" });
    fireEvent.keyDown(heading, { key: "Delete" });
    // Confirm the delete dialog (exact match to avoid "Delete Asset" button)
    const dialogButtons = screen.getAllByRole("button", { name: /Delete/ });
    const confirmBtn = dialogButtons.find((b) => b.textContent === "Delete");
    fireEvent.click(confirmBtn!);
    expect(useStudioStore.getState().pack.assets).toHaveLength(7);
  });
});

describe("KeyboardShortcutsOverlay", () => {
  it("lists all shortcuts in the overlay", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByText("Space")).toBeInTheDocument();
    expect(screen.getByText("Escape")).toBeInTheDocument();
    expect(screen.getByText("1 - 9")).toBeInTheDocument();
    expect(screen.getByText(/Delete/)).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("closes when clicking the close button", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "?" });
    fireEvent.click(screen.getByText("Close (Esc)"));
    expect(screen.queryByText("Keyboard Shortcuts")).toBeNull();
  });

  it("closes when clicking the backdrop", () => {
    render(<Studio />);
    fireEvent.keyDown(window, { key: "?" });
    const backdrop = document.querySelector(".shortcuts-overlay-backdrop")!;
    fireEvent.click(backdrop);
    expect(screen.queryByText("Keyboard Shortcuts")).toBeNull();
  });
});
