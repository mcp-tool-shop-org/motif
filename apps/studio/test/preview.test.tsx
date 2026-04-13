import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import Studio from "../src/app/Studio";
import { useStudioStore } from "../src/app/store";
import { usePreviewStore } from "../src/app/preview-store";
import { starterPack } from "../src/app/seed-data";
import type { SoundtrackPack } from "@motif-studio/schema";

beforeEach(() => {
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack,
    section: "project",
    selectedId: null,
  });
  usePreviewStore.getState().resetSequence();
  usePreviewStore.setState({
    previewMode: "manual",
    manualState: {
      mode: "exploration",
      danger: 0,
      inCombat: false,
      boss: false,
      safeZone: false,
      victory: false,
      region: "",
      faction: "",
    },
    previousManualState: null,
  });
});

afterEach(() => {
  cleanup();
});

function navigateToPreview() {
  render(<Studio />);
  fireEvent.click(screen.getByRole("button", { name: /Preview/ }));
}

describe("Preview — rendering", () => {
  it("shows preview screen with heading", () => {
    navigateToPreview();
    expect(
      screen.getByRole("heading", { name: "Preview" }),
    ).toBeInTheDocument();
  });

  it("shows Manual and Sequence mode buttons", () => {
    navigateToPreview();
    expect(screen.getByRole("button", { name: "Manual" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sequence" }),
    ).toBeInTheDocument();
  });

  it("defaults to manual mode", () => {
    navigateToPreview();
    // manual mode shows "Runtime State" heading
    expect(screen.getByText("Runtime State")).toBeInTheDocument();
  });
});

describe("Preview — manual mode", () => {
  it("shows resolved scene for exploration state", () => {
    navigateToPreview();
    // With mode=exploration, bind-explore should win → scene-exploration
    expect(screen.getByText("scene-exploration")).toBeInTheDocument();
    expect(screen.getByText("Exploration")).toBeInTheDocument();
  });

  it("updates resolved scene when inCombat toggled", () => {
    navigateToPreview();
    // Toggle inCombat checkbox
    const combatCheckbox = screen.getByRole("checkbox", { name: /inCombat/ });
    fireEvent.click(combatCheckbox);
    // bind-combat (priority 20) should now win → scene-combat
    expect(screen.getByText("scene-combat")).toBeInTheDocument();
  });

  it("updates resolved scene when victory toggled", () => {
    navigateToPreview();
    const victoryCheckbox = screen.getByRole("checkbox", { name: /victory/ });
    fireEvent.click(victoryCheckbox);
    // bind-victory (priority 30) should win → scene-victory
    expect(screen.getByText("scene-victory")).toBeInTheDocument();
  });

  it("shows active stems for resolved scene", () => {
    navigateToPreview();
    // scene-exploration has stem-explore-base and stem-explore-accent
    expect(screen.getByText("stem-explore-base")).toBeInTheDocument();
    expect(screen.getByText("stem-explore-accent")).toBeInTheDocument();
  });

  it("shows transition warning when scene changes", () => {
    navigateToPreview();
    // First set inCombat=true to resolve combat
    const combatCheckbox = screen.getByRole("checkbox", { name: /inCombat/ });
    fireEvent.click(combatCheckbox);
    // Previous was exploration, new is combat — no direct transition exists
    // (explore→tension exists, but explore→combat does not)
    expect(
      screen.getByText(/no transition rule from scene-exploration to scene-combat/),
    ).toBeInTheDocument();
  });

  it("shows winning binding", () => {
    navigateToPreview();
    // bind-explore should win, shown as "Explore Mode"
    expect(screen.getAllByText("bind-explore").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Explore Mode")).toBeInTheDocument();
  });
});

describe("Preview — sequence mode", () => {
  it("switches to sequence mode", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    expect(screen.getByText("6 steps")).toBeInTheDocument();
  });

  it("renders trace rows for default sequence", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    // Should have trace rows with scene names from the sequence
    expect(screen.getByText("Exploration")).toBeInTheDocument();
  });

  it("adds a step", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    fireEvent.click(screen.getByRole("button", { name: "+ Add Step" }));
    expect(screen.getByText("7 steps")).toBeInTheDocument();
  });

  it("removes a step", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    // Click first × button
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    fireEvent.click(removeButtons[0]);
    expect(screen.getByText("5 steps")).toBeInTheDocument();
  });

  it("duplicates a step", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    const dupButtons = screen.getAllByRole("button", { name: "Dup" });
    fireEvent.click(dupButtons[0]);
    expect(screen.getByText("7 steps")).toBeInTheDocument();
  });

  it("resets to example sequence", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    // Remove some steps first
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    fireEvent.click(removeButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Reset to Example" }));
    expect(screen.getByText("6 steps")).toBeInTheDocument();
  });

  it("shows missing transition warning in trace", () => {
    navigateToPreview();
    fireEvent.click(screen.getByRole("button", { name: "Sequence" }));
    // Default sequence: step 2 is exploration→tension (danger=0.5, bind-tension wins)
    // step 3 is combat (inCombat=true), from tension→combat has stinger-then-switch transition
    // step 5 is victory, from combat→victory has immediate transition
    // step 6 is safeZone, from victory→safe-zone — no transition rule exists
    expect(
      screen.getByText(/no transition rule/),
    ).toBeInTheDocument();
  });
});

describe("Preview — broken pack handling", () => {
  it("does not crash with empty pack", () => {
    // Pre-set empty pack and preview section before render
    useStudioStore.setState({
      pack: {
        meta: { id: "x", name: "X", version: "1.0.0", schemaVersion: "1" },
        assets: [],
        stems: [],
        scenes: [],
        bindings: [],
        transitions: [],
      },
      section: "preview",
    });
    // Render — useEffect will call loadPack(starterPack),
    // but we immediately override again after
    render(<Studio />);
    act(() => {
      useStudioStore.setState({
        pack: {
          meta: { id: "x", name: "X", version: "1.0.0", schemaVersion: "1" },
          assets: [],
          stems: [],
          scenes: [],
          bindings: [],
          transitions: [],
        },
        section: "preview",
      });
    });
    expect(screen.getByText("No scene resolved")).toBeInTheDocument();
  });

  it("does not crash when binding references missing scene", () => {
    const broken = JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack;
    // Point a binding to a non-existent scene
    broken.bindings[0].sceneId = "scene-gone";
    useStudioStore.setState({ pack: broken });
    expect(() => navigateToPreview()).not.toThrow();
  });
});

describe("Preview — live pack updates", () => {
  it("preview updates when pack binding is edited", () => {
    navigateToPreview();
    // Initially bind-explore wins for mode=exploration
    expect(screen.getByText("Explore Mode")).toBeInTheDocument();
    // Change bind-explore condition to mode=combat (it should no longer match)
    act(() => {
      useStudioStore
        .getState()
        .updateBindingCondition("bind-explore", 0, { value: "combat" });
    });
    // Zustand updates trigger re-render — bind-explore no longer matches mode=exploration
    // bind-safe (safeZone=false) and bind-tension (danger<0.5) also don't match
    // So no binding matches
    expect(screen.getByText("No binding matched")).toBeInTheDocument();
  });
});
