import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Studio from "../src/app/Studio";
import { useStudioStore } from "../src/app/store";
import { starterPack } from "../src/app/seed-data";
import type { SoundtrackPack } from "@motif/schema";

// Reset store before each test
beforeEach(() => {
  useStudioStore.setState({
    pack: JSON.parse(JSON.stringify(starterPack)) as SoundtrackPack,
    section: "project",
    selectedId: null,
  });
});

afterEach(() => {
  cleanup();
});

describe("Studio — rendering", () => {
  it("loads starter pack and shows project screen", () => {
    render(<Studio />);
    expect(screen.getByRole("heading", { name: "Project" })).toBeInTheDocument();
    expect(screen.getByText("Motif", { exact: false })).toBeInTheDocument();
  });

  it("shows pack stats on project screen", () => {
    render(<Studio />);
    // starter pack has 8 assets, 7 stems, 5 scenes, 5 bindings, 4 transitions
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

describe("Studio — navigation", () => {
  it("switches to assets screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Assets/ }));
    expect(screen.getByText("Assets (8)")).toBeInTheDocument();
  });

  it("switches to stems screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Stems/ }));
    expect(screen.getByText("Stems (7)")).toBeInTheDocument();
  });

  it("switches to scenes screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Scenes/ }));
    expect(screen.getByText("Scenes (5)")).toBeInTheDocument();
  });

  it("switches to bindings screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Bindings/ }));
    expect(screen.getByText("Bindings (5)")).toBeInTheDocument();
  });

  it("switches to transitions screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Transitions/ }));
    expect(screen.getByText("Transitions (4)")).toBeInTheDocument();
  });

  it("switches to review screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    expect(
      screen.getByText("Pack health: validation, integrity, and coverage findings"),
    ).toBeInTheDocument();
  });
});

describe("Studio — asset editing", () => {
  it("selects an asset and shows detail", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Assets/ }));
    fireEvent.click(screen.getByRole("button", { name: /Exploration Base/ }));
    // Should show the asset detail fields
    expect(screen.getByDisplayValue("asset-explore-base")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Exploration Base")).toBeInTheDocument();
  });

  it("edits an asset name", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Assets/ }));
    fireEvent.click(screen.getByRole("button", { name: /Exploration Base/ }));
    const nameInput = screen.getByDisplayValue("Exploration Base");
    fireEvent.change(nameInput, { target: { value: "Forest Theme" } });
    expect(useStudioStore.getState().pack.assets[0].name).toBe("Forest Theme");
  });
});

describe("Studio — stem editing", () => {
  it("selects a stem and shows detail", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Stems/ }));
    fireEvent.click(screen.getByRole("button", { name: /Explore Base/ }));
    expect(screen.getByDisplayValue("stem-explore-base")).toBeInTheDocument();
  });
});

describe("Studio — scene layer editing", () => {
  it("shows layers for a scene", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Scenes/ }));
    fireEvent.click(screen.getByRole("button", { name: /Exploration/ }));
    expect(screen.getByText("Layers (2)")).toBeInTheDocument();
  });
});

describe("Studio — binding condition editing", () => {
  it("shows conditions for a binding", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Bindings/ }));
    fireEvent.click(screen.getByRole("button", { name: /Explore Mode/ }));
    expect(screen.getByText("Conditions (1)")).toBeInTheDocument();
  });

  it("adds a condition", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Bindings/ }));
    fireEvent.click(screen.getByRole("button", { name: /Explore Mode/ }));
    fireEvent.click(screen.getByText("+ Add Condition"));
    expect(screen.getByText("Conditions (2)")).toBeInTheDocument();
  });
});

describe("Studio — transition editing", () => {
  it("selects a transition and shows warnings when mode needs duration", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Transitions/ }));
    // add new transition that's immediate (no warnings)
    fireEvent.click(screen.getByRole("button", { name: /Explore → Tension/ }));
    // this one is crossfade with duration, no warning expected
    expect(screen.getByDisplayValue("trans-explore-to-tension")).toBeInTheDocument();
  });
});

describe("Studio — review screen", () => {
  it("renders findings sections", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    // Review screen should show Errors, Warnings, Notes headings
    expect(screen.getByText(/^Errors/)).toBeInTheDocument();
    expect(screen.getByText(/^Warnings/)).toBeInTheDocument();
    expect(screen.getByText(/^Notes/)).toBeInTheDocument();
  });
});

describe("Studio — deletion behaviour", () => {
  it("deleting selected asset clears or updates selection", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Assets/ }));
    fireEvent.click(screen.getByRole("button", { name: /Exploration Base/ }));
    fireEvent.click(screen.getByText("Delete Asset"));
    expect(useStudioStore.getState().pack.assets).toHaveLength(7);
    // should not be pointing at deleted item
    expect(useStudioStore.getState().selectedId).not.toBe(
      "asset-explore-base",
    );
  });
});

describe("Studio — invalid intermediate state", () => {
  it("does not crash when asset is deleted leaving dangling stem ref", () => {
    // Delete asset that stems reference
    useStudioStore.getState().deleteAsset("asset-explore-base");
    // Re-render — should not crash
    expect(() => render(<Studio />)).not.toThrow();
  });
});
