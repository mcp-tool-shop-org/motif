import { describe, it, expect } from "vitest";
import { PACKAGE } from "../src/index.js";

describe("@motif-studio/ui", () => {
  it("exports package identifier", () => {
    expect(PACKAGE).toBe("@motif-studio/ui");
  });
});
