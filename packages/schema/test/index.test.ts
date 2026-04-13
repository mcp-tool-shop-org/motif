import { describe, it, expect } from "vitest";
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
  SoundtrackPackSchema,
  normalizeZodIssues,
} from "../src/index.js";

describe("@motif-studio/schema exports", () => {
  it("exports parseSoundtrackPack", () => {
    expect(typeof parseSoundtrackPack).toBe("function");
  });

  it("exports safeParseSoundtrackPack", () => {
    expect(typeof safeParseSoundtrackPack).toBe("function");
  });

  it("exports validateSoundtrackPack", () => {
    expect(typeof validateSoundtrackPack).toBe("function");
  });

  it("exports SoundtrackPackSchema", () => {
    expect(SoundtrackPackSchema).toBeDefined();
  });

  it("exports normalizeZodIssues", () => {
    expect(typeof normalizeZodIssues).toBe("function");
  });
});
