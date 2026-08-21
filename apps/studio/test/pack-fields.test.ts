import { describe, it, expect } from "vitest";
import type { SoundtrackPack } from "@motif-studio/schema";
import { libraryPackId } from "@motif-studio/score-map";
import { resolveScene } from "@motif-studio/scene-mapper";
import {
  BUILT_IN_STATE_FIELDS,
  derivedPackFields,
  singleAxisMenuField,
} from "../src/app/pack-fields";
import { examplePacks, minimalPack, starterPack } from "../src/app/seed-data";

const FLAGSHIP = "fantasy-jrpg-core";

function example(id: string): SoundtrackPack {
  const entry = examplePacks.find((p) => p.id === id);
  if (!entry) throw new Error(`example pack ${id} missing`);
  return entry.pack;
}

const flagship = example(libraryPackId(FLAGSHIP));
const grounded = example("star-freight-grounded");

/** A pack shaped only by the conditions under test. */
function packWith(conditions: SoundtrackPack["bindings"][number]["conditions"][]): SoundtrackPack {
  return {
    ...minimalPack,
    bindings: conditions.map((c, i) => ({
      id: `b-${i}`,
      name: `Binding ${i}`,
      sceneId: "scene-ambient",
      conditions: c,
      priority: i,
    })),
  };
}

describe("derivedPackFields", () => {
  it("returns nothing for a pack the built-in controls already drive", () => {
    expect(derivedPackFields(starterPack)).toEqual([]);
    expect(derivedPackFields(minimalPack)).toEqual([]);
  });

  it("derives a library pack's cue menu, in catalog order", () => {
    const fields = derivedPackFields(flagship);
    expect(fields).toHaveLength(1);
    expect(fields[0].field).toBe("cue");
    expect(fields[0].control).toBe("enum");
    expect(fields[0].options.slice(0, 3)).toEqual(["town", "village-festival", "castle"]);
    expect(fields[0].options).toHaveLength(flagship.bindings.length);
  });

  it("derives Grounded's whole binding vocabulary", () => {
    const fields = derivedPackFields(grounded);
    const byField = new Map(fields.map((f) => [f.field, f]));

    expect(byField.get("location")?.control).toBe("enum");
    expect(byField.get("location")?.options).toContain("ardent");
    expect(byField.get("combat_active")?.control).toBe("boolean");
    // alert_level is only ever compared (`gt 0.2`), so it's a magnitude.
    expect(byField.get("alert_level")?.control).toBe("number");
    expect(byField.get("alert_level")?.options).toEqual([]);
  });

  it("never derives a field the built-in controls already cover", () => {
    for (const field of BUILT_IN_STATE_FIELDS) {
      const pack = packWith([[{ field, op: "eq", value: "x" }]]);
      expect(derivedPackFields(pack)).toEqual([]);
    }
  });

  it("de-duplicates repeated eq values across bindings", () => {
    const pack = packWith([
      [{ field: "location", op: "eq", value: "ardent" }],
      [{ field: "location", op: "eq", value: "ardent" }],
      [{ field: "location", op: "eq", value: "freeport" }],
    ]);
    expect(derivedPackFields(pack)[0].options).toEqual(["ardent", "freeport"]);
  });

  it("treats a compared field as a magnitude even when another binding uses eq", () => {
    const pack = packWith([
      [{ field: "heat", op: "eq", value: 3 }],
      [{ field: "heat", op: "gte", value: 5 }],
    ]);
    expect(derivedPackFields(pack)[0].control).toBe("number");
  });

  it("falls back to a text control for a field with no enumerable values", () => {
    const pack = packWith([[{ field: "questLine", op: "includes", value: "siege" }]]);
    expect(derivedPackFields(pack)[0]).toEqual({
      field: "questLine",
      control: "text",
      options: [],
    });
  });
});

describe("singleAxisMenuField", () => {
  it("identifies a library pack as a cue menu", () => {
    expect(singleAxisMenuField(flagship)?.field).toBe("cue");
  });

  it("rejects a multi-axis game pack", () => {
    expect(singleAxisMenuField(grounded)).toBeNull();
    expect(singleAxisMenuField(starterPack)).toBeNull();
  });

  it("rejects a single-axis menu on a field the built-ins already drive", () => {
    // minimal-pack is one `mode eq exploration` binding — already resolvable.
    expect(singleAxisMenuField(minimalPack)).toBeNull();
  });

  it("rejects a pack whose bindings key on two different fields", () => {
    const pack = packWith([
      [{ field: "cue", op: "eq", value: "town" }],
      [{ field: "location", op: "eq", value: "ardent" }],
    ]);
    expect(singleAxisMenuField(pack)).toBeNull();
  });

  it("rejects a pack whose bindings carry more than one condition", () => {
    const pack = packWith([
      [
        { field: "cue", op: "eq", value: "town" },
        { field: "cue", op: "neq", value: "castle" },
      ],
    ]);
    expect(singleAxisMenuField(pack)).toBeNull();
  });

  it("rejects a pack with no bindings", () => {
    expect(singleAxisMenuField({ ...minimalPack, bindings: [] })).toBeNull();
  });
});

describe("derived fields cover every rejected binding", () => {
  it("resolves each library cue when its derived field is set", () => {
    const menu = singleAxisMenuField(flagship)!;
    for (const cue of menu.options) {
      const resolution = resolveScene(flagship, { [menu.field]: cue });
      expect(resolution.sceneId, `cue ${String(cue)} did not resolve`).toBeDefined();
      expect(resolution.rejectedBindingIds).toHaveLength(flagship.bindings.length - 1);
    }
  });

  it("leaves no example pack with an unsettable binding field", () => {
    for (const entry of examplePacks) {
      const settable = new Set([
        ...BUILT_IN_STATE_FIELDS,
        ...derivedPackFields(entry.pack).map((f) => f.field),
      ]);
      const bound = entry.pack.bindings.flatMap((b) => b.conditions.map((c) => c.field));
      expect(
        bound.filter((f) => !settable.has(f)),
        `${entry.id} binds on fields the simulator cannot set`,
      ).toEqual([]);
    }
  });
});
