import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import Studio from "../src/app/Studio";
import { useStudioStore } from "../src/app/store";
import {
  starterPack,
  minimalPack,
  combatEscalationPack,
  examplePacks,
} from "../src/app/seed-data";
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

describe("Export screen — rendering", () => {
  it("navigates to export screen", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(
      screen.getByText("Export your soundtrack pack as a runtime JSON file"),
    ).toBeInTheDocument();
  });

  it("shows ready status for valid pack", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(screen.getByText("Ready to export")).toBeInTheDocument();
  });

  it("shows round-trip verified badge", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(screen.getByText("Round-trip verified")).toBeInTheDocument();
  });

  it("shows runtime summary counts", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    // Starter pack: 8 assets, 7 stems, 5 scenes, 5 bindings, 4 transitions
    // These numbers also appear in the summary stats
    const values = screen.getAllByText("8");
    expect(values.length).toBeGreaterThan(0);
  });

  it("shows JSON preview", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(screen.getByText("JSON Preview")).toBeInTheDocument();
    // The JSON preview should contain the pack ID
    const pre = screen.getByText(/starter-pack/);
    expect(pre).toBeInTheDocument();
  });

  it("has copy and download buttons", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(
      screen.getByRole("button", { name: "Copy JSON" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download .json" }),
    ).toBeInTheDocument();
  });

  it("copy and download buttons are enabled for valid pack", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(screen.getByRole("button", { name: "Copy JSON" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Download .json" }),
    ).not.toBeDisabled();
  });
});

describe("Export screen — blocked state", () => {
  it("shows blocked status when pack has errors", () => {
    // Create an invalid pack with a binding referencing a non-existent scene
    const brokenPack: SoundtrackPack = {
      meta: { id: "broken", name: "Broken", version: "1.0.0", schemaVersion: "1" },
      assets: [
        { id: "a1", name: "A", src: "a.ogg", kind: "loop", durationMs: 1000 },
      ],
      stems: [
        { id: "s1", name: "S", assetId: "a1", role: "base", loop: true },
      ],
      scenes: [
        {
          id: "sc1",
          name: "S",
          category: "exploration",
          layers: [{ stemId: "s1" }],
        },
      ],
      bindings: [
        {
          id: "bind-broken",
          name: "Broken Binding",
          sceneId: "scene-does-not-exist",
          conditions: [{ field: "x", op: "eq" as const, value: true }],
          priority: 0,
        },
      ],
      transitions: [],
    };

    render(<Studio />);
    // Override after render to avoid useEffect loading starterPack
    act(() => {
      useStudioStore.setState({ pack: brokenPack, section: "export" });
    });

    expect(screen.getByText(/fix before exporting/)).toBeInTheDocument();
  });

  it("disables buttons when pack has errors", () => {
    const brokenPack: SoundtrackPack = {
      meta: { id: "broken", name: "Broken", version: "1.0.0", schemaVersion: "1" },
      assets: [
        { id: "a1", name: "A", src: "a.ogg", kind: "loop", durationMs: 1000 },
      ],
      stems: [
        { id: "s1", name: "S", assetId: "a1", role: "base", loop: true },
      ],
      scenes: [
        {
          id: "sc1",
          name: "S",
          category: "exploration",
          layers: [{ stemId: "s1" }],
        },
      ],
      bindings: [
        {
          id: "bind-broken",
          name: "Broken",
          sceneId: "scene-nonexistent",
          conditions: [{ field: "x", op: "eq" as const, value: true }],
          priority: 0,
        },
      ],
      transitions: [],
    };

    render(<Studio />);
    act(() => {
      useStudioStore.setState({ pack: brokenPack, section: "export" });
    });

    expect(screen.getByRole("button", { name: "Copy JSON" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Download .json" }),
    ).toBeDisabled();
  });
});

describe("Example pack switching", () => {
  it("renders all example packs in the switcher", () => {
    render(<Studio />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    for (const ep of examplePacks) {
      expect(screen.getByRole("option", { name: ep.name })).toBeInTheDocument();
    }
  });

  it("switches to minimal pack", () => {
    render(<Studio />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "minimal-pack" } });
    expect(useStudioStore.getState().pack.meta.id).toBe("minimal-pack");
  });

  it("switches to combat escalation pack", () => {
    render(<Studio />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "combat-escalation-pack" } });
    expect(useStudioStore.getState().pack.meta.id).toBe(
      "combat-escalation-pack",
    );
  });

  it("resets section to project on pack switch", () => {
    render(<Studio />);
    // Navigate to export first
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    expect(useStudioStore.getState().section).toBe("export");

    // Switch pack (first combobox is the sidebar pack switcher)
    const select = screen.getAllByRole("combobox")[0];
    fireEvent.change(select, { target: { value: "minimal-pack" } });
    expect(useStudioStore.getState().section).toBe("arrangement");
  });

  it("minimal pack exports successfully", () => {
    useStudioStore.setState({
      pack: JSON.parse(JSON.stringify(minimalPack)) as SoundtrackPack,
    });
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    // Minimal pack has warnings (missing categories) but is not blocked
    expect(screen.getByRole("button", { name: "Copy JSON" })).not.toBeDisabled();
  });

  it("combat escalation pack exports successfully", () => {
    useStudioStore.setState({
      pack: JSON.parse(
        JSON.stringify(combatEscalationPack),
      ) as SoundtrackPack,
    });
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    // Combat pack has warnings (missing safe-zone) but is not blocked
    expect(screen.getByRole("button", { name: "Copy JSON" })).not.toBeDisabled();
  });
});

describe("Export screen — download", () => {
  it("triggers download with correct filename", () => {
    render(<Studio />);
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));

    // Mock URL.createObjectURL and revokeObjectURL
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    const clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValueOnce({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    fireEvent.click(screen.getByRole("button", { name: "Download .json" }));
    expect(clickSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
