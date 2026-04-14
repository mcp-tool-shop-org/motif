import { describe, it, expect } from "vitest";
import {
  GROUNDED_PROFILES,
  GROUNDED_SCORE_MAP,
  getGroundedProfile,
  isTempoInRange,
  isIntensityInRange,
  mergeProfiles,
  resolveProfile,
} from "@motif-studio/score-map";
import { SCIFI_PRESETS } from "@motif-studio/instrument-rack";

// ── Profile inventory ──

describe("GROUNDED_PROFILES", () => {
  it("contains exactly 5 profiles", () => {
    expect(GROUNDED_PROFILES).toHaveLength(5);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_PROFILES.map((p) => p.id);
    expect(new Set(ids).size).toBe(5);
  });

  it("all IDs use sp- prefix", () => {
    for (const p of GROUNDED_PROFILES) {
      expect(p.id).toMatch(/^sp-/);
    }
  });

  it("all profiles have name, tags, and notes", () => {
    for (const p of GROUNDED_PROFILES) {
      expect(p.name).toBeTruthy();
      expect(p.tags).toBeDefined();
      expect(p.tags!.length).toBeGreaterThan(0);
      expect(p.notes).toBeTruthy();
    }
  });

  it("all profiles are tagged 'grounded'", () => {
    for (const p of GROUNDED_PROFILES) {
      expect(p.tags).toContain("grounded");
    }
  });
});

// ── Tempo and intensity ranges ──

describe("tempo ranges", () => {
  it("all profiles with tempo bounds have min < max", () => {
    for (const p of GROUNDED_PROFILES) {
      if (p.tempoMin != null && p.tempoMax != null) {
        expect(p.tempoMin).toBeLessThan(p.tempoMax);
      }
    }
  });

  it("Ardent is 90-110 BPM", () => {
    const p = getGroundedProfile("sp-ardent")!;
    expect(isTempoInRange(p, 100)).toBe(true);
    expect(isTempoInRange(p, 80)).toBe(false);
    expect(isTempoInRange(p, 120)).toBe(false);
  });

  it("Freeport is 85-105 BPM", () => {
    const p = getGroundedProfile("sp-freeport")!;
    expect(isTempoInRange(p, 95)).toBe(true);
    expect(isTempoInRange(p, 70)).toBe(false);
  });

  it("Communion is 70-90 BPM (slowest world)", () => {
    const p = getGroundedProfile("sp-communion")!;
    expect(isTempoInRange(p, 80)).toBe(true);
    expect(isTempoInRange(p, 120)).toBe(false);
  });

  it("Combat is 120-140 BPM (fastest)", () => {
    const p = getGroundedProfile("sp-combat")!;
    expect(isTempoInRange(p, 130)).toBe(true);
    expect(isTempoInRange(p, 100)).toBe(false);
  });

  it("Investigation is 80-95 BPM", () => {
    const p = getGroundedProfile("sp-investigation")!;
    expect(isTempoInRange(p, 88)).toBe(true);
    expect(isTempoInRange(p, 120)).toBe(false);
  });
});

describe("intensity ranges", () => {
  it("all profiles have min < max", () => {
    for (const p of GROUNDED_PROFILES) {
      if (p.intensityMin != null && p.intensityMax != null) {
        expect(p.intensityMin).toBeLessThan(p.intensityMax);
      }
    }
  });

  it("combat has highest intensity floor (0.6)", () => {
    const combat = getGroundedProfile("sp-combat")!;
    expect(combat.intensityMin).toBe(0.6);
    expect(isIntensityInRange(combat, 0.3)).toBe(false);
    expect(isIntensityInRange(combat, 0.8)).toBe(true);
  });

  it("freeport has lowest intensity ceiling (0.6)", () => {
    const fp = getGroundedProfile("sp-freeport")!;
    expect(fp.intensityMax).toBe(0.6);
    expect(isIntensityInRange(fp, 0.9)).toBe(false);
  });
});

// ── Scale and key assignments ──

describe("tonal palette", () => {
  it("Ardent is G minor (military)", () => {
    const p = getGroundedProfile("sp-ardent")!;
    expect(p.key).toBe("G");
    expect(p.scale).toBe("minor");
  });

  it("Freeport is D minor (frontier)", () => {
    const p = getGroundedProfile("sp-freeport")!;
    expect(p.key).toBe("D");
    expect(p.scale).toBe("minor");
  });

  it("Communion is F phrygian (alien)", () => {
    const p = getGroundedProfile("sp-communion")!;
    expect(p.key).toBe("F");
    expect(p.scale).toBe("phrygian");
  });

  it("Investigation is Db chromatic (conspiracy)", () => {
    const p = getGroundedProfile("sp-investigation")!;
    expect(p.key).toBe("Db");
    expect(p.scale).toBe("chromatic");
  });

  it("Combat has no fixed key (inherits from world)", () => {
    const p = getGroundedProfile("sp-combat")!;
    expect(p.key).toBeUndefined();
  });
});

// ── Instrument preset linkage ──

describe("preferred instruments", () => {
  const presetIds = new Set(SCIFI_PRESETS.map((p) => p.id));

  it("all preferredInstrumentIds reference real sci-fi presets", () => {
    for (const profile of GROUNDED_PROFILES) {
      for (const id of profile.preferredInstrumentIds ?? []) {
        expect(presetIds.has(id)).toBe(true);
      }
    }
  });

  it("Ardent uses military presets", () => {
    const p = getGroundedProfile("sp-ardent")!;
    expect(p.preferredInstrumentIds).toContain("scifi-brass-synth");
    expect(p.preferredInstrumentIds).toContain("scifi-march-drum");
    expect(p.samplePaletteTags).toContain("scifi-military");
  });

  it("Freeport uses industrial presets", () => {
    const p = getGroundedProfile("sp-freeport")!;
    expect(p.preferredInstrumentIds).toContain("scifi-drone-station");
    expect(p.preferredInstrumentIds).toContain("scifi-hull-rumble");
    expect(p.samplePaletteTags).toContain("scifi-industrial");
  });

  it("Communion uses Keth/alien presets", () => {
    const p = getGroundedProfile("sp-communion")!;
    expect(p.preferredInstrumentIds).toContain("scifi-keth-voice");
    expect(p.preferredInstrumentIds).toContain("scifi-keth-bell");
    expect(p.samplePaletteTags).toContain("scifi-alien");
  });

  it("Investigation uses investigation presets", () => {
    const p = getGroundedProfile("sp-investigation")!;
    expect(p.preferredInstrumentIds).toContain("scifi-clue-pluck");
    expect(p.preferredInstrumentIds).toContain("scifi-mystery-pad");
    expect(p.samplePaletteTags).toContain("scifi-investigation");
  });

  it("Combat pulls from military + industrial", () => {
    const p = getGroundedProfile("sp-combat")!;
    expect(p.samplePaletteTags).toContain("scifi-military");
    expect(p.samplePaletteTags).toContain("scifi-industrial");
  });
});

// ── Macro defaults ──

describe("macro defaults", () => {
  it("all profiles have macro defaults in 0-1 range", () => {
    for (const p of GROUNDED_PROFILES) {
      expect(p.defaultIntensity).toBeGreaterThanOrEqual(0);
      expect(p.defaultIntensity).toBeLessThanOrEqual(1);
      expect(p.defaultBrightness).toBeGreaterThanOrEqual(0);
      expect(p.defaultBrightness).toBeLessThanOrEqual(1);
      expect(p.defaultSpace).toBeGreaterThanOrEqual(0);
      expect(p.defaultSpace).toBeLessThanOrEqual(1);
    }
  });

  it("combat has highest default intensity", () => {
    const combat = getGroundedProfile("sp-combat")!;
    for (const p of GROUNDED_PROFILES) {
      if (p.id !== "sp-combat") {
        expect(combat.defaultIntensity).toBeGreaterThan(p.defaultIntensity!);
      }
    }
  });

  it("communion has highest default space (reverb)", () => {
    const communion = getGroundedProfile("sp-communion")!;
    for (const p of GROUNDED_PROFILES) {
      if (p.id !== "sp-communion") {
        expect(communion.defaultSpace).toBeGreaterThan(p.defaultSpace!);
      }
    }
  });

  it("combat has lowest default space (tight, close)", () => {
    const combat = getGroundedProfile("sp-combat")!;
    for (const p of GROUNDED_PROFILES) {
      if (p.id !== "sp-combat") {
        expect(combat.defaultSpace).toBeLessThan(p.defaultSpace!);
      }
    }
  });
});

// ── Score map entries ──

describe("GROUNDED_SCORE_MAP", () => {
  it("contains exactly 5 entries", () => {
    expect(GROUNDED_SCORE_MAP).toHaveLength(5);
  });

  it("has unique IDs", () => {
    const ids = GROUNDED_SCORE_MAP.map((e) => e.id);
    expect(new Set(ids).size).toBe(5);
  });

  it("all entries use sme- prefix", () => {
    for (const e of GROUNDED_SCORE_MAP) {
      expect(e.id).toMatch(/^sme-/);
    }
  });

  it("each entry links to a valid profile ID", () => {
    const profileIds = new Set(GROUNDED_PROFILES.map((p) => p.id));
    for (const e of GROUNDED_SCORE_MAP) {
      expect(profileIds.has(e.scoreProfileId!)).toBe(true);
    }
  });

  it("region entries map to world profiles", () => {
    const regions = GROUNDED_SCORE_MAP.filter((e) => e.contextType === "region");
    expect(regions).toHaveLength(3); // Ardent, Freeport, Communion
    const regionProfileIds = regions.map((r) => r.scoreProfileId);
    expect(regionProfileIds).toContain("sp-ardent");
    expect(regionProfileIds).toContain("sp-freeport");
    expect(regionProfileIds).toContain("sp-communion");
  });

  it("encounter entries map to cross-cutting profiles", () => {
    const encounters = GROUNDED_SCORE_MAP.filter((e) => e.contextType === "encounter");
    expect(encounters).toHaveLength(2); // Combat, Investigation
    const encounterProfileIds = encounters.map((e) => e.scoreProfileId);
    expect(encounterProfileIds).toContain("sp-combat");
    expect(encounterProfileIds).toContain("sp-investigation");
  });

  it("resolveProfile returns correct profile for each entry", () => {
    for (const entry of GROUNDED_SCORE_MAP) {
      const profile = resolveProfile(entry, GROUNDED_PROFILES);
      expect(profile).toBeDefined();
      expect(profile!.id).toBe(entry.scoreProfileId);
    }
  });
});

// ── Lookup ──

describe("getGroundedProfile", () => {
  it("finds each profile by ID", () => {
    expect(getGroundedProfile("sp-ardent")?.name).toBe("TCS Ardent");
    expect(getGroundedProfile("sp-freeport")?.name).toBe("Freeport");
    expect(getGroundedProfile("sp-communion")?.name).toBe("Communion Relay");
    expect(getGroundedProfile("sp-combat")?.name).toBe("Ground Combat");
    expect(getGroundedProfile("sp-investigation")?.name).toBe("Investigation");
  });

  it("returns undefined for unknown ID", () => {
    expect(getGroundedProfile("sp-nonexistent")).toBeUndefined();
  });
});

// ── Composability via mergeProfiles ──

describe("combat overlay composability", () => {
  it("combat overlaying Freeport inherits key/scale, overrides tempo", () => {
    const fp = getGroundedProfile("sp-freeport")!;
    const combat = getGroundedProfile("sp-combat")!;
    const merged = mergeProfiles(fp, combat);

    // Combat has no key — Freeport's D survives
    expect(merged.key).toBe("D");
    // Combat overrides tempo
    expect(merged.tempoMin).toBe(120);
    expect(merged.tempoMax).toBe(140);
    // Combat overrides intensity
    expect(merged.intensityMin).toBe(0.6);
    expect(merged.defaultIntensity).toBe(0.8);
  });

  it("combat overlaying Communion inherits Phrygian scale", () => {
    const comm = getGroundedProfile("sp-communion")!;
    const combat = getGroundedProfile("sp-combat")!;
    const merged = mergeProfiles(comm, combat);

    // Combat has no key — Communion's F survives
    expect(merged.key).toBe("F");
    // Combat overrides scale to minor (not phrygian)
    expect(merged.scale).toBe("minor");
    // Combat overrides space down
    expect(merged.defaultSpace).toBe(0.2);
  });

  it("investigation overlaying Freeport keeps Db key, chromatic scale", () => {
    const fp = getGroundedProfile("sp-freeport")!;
    const inv = getGroundedProfile("sp-investigation")!;
    const merged = mergeProfiles(fp, inv);

    expect(merged.key).toBe("Db");
    expect(merged.scale).toBe("chromatic");
    expect(merged.tempoMin).toBe(80);
  });
});
