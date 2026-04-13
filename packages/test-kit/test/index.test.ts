import { describe, it, expect } from "vitest";
import { FIXTURES, loadFixture, fixturePath } from "../src/index.js";

describe("@motif-studio/test-kit", () => {
  it("exports fixture names", () => {
    expect(FIXTURES.MINIMAL_PACK).toBe("minimal-pack.json");
    expect(FIXTURES.STARTER_PACK).toBe("starter-pack.json");
  });

  it("loads a fixture file", () => {
    const data = loadFixture(FIXTURES.MINIMAL_PACK);
    expect(data).toHaveProperty("meta");
  });

  it("resolves fixture paths", () => {
    const p = fixturePath(FIXTURES.MINIMAL_PACK);
    expect(p).toContain("minimal-pack.json");
  });

  it("throws when loading a nonexistent fixture", () => {
    expect(() => loadFixture("nonexistent.json")).toThrow();
  });
});
