import { describe, it, expect, beforeEach } from "vitest";
import type {
  SoundtrackPack,
  Stinger,
  RuntimeMusicState,
} from "@motif-studio/schema";
import {
  evaluateStinger,
  resolveStingers,
  StingerCooldownTracker,
} from "../src/stingers.js";

// ── Helpers ──

function buildPack(stingers: Stinger[]): SoundtrackPack {
  return {
    meta: {
      id: "stinger-test",
      name: "Stinger Test",
      version: "1.0.0",
      schemaVersion: "1",
    },
    assets: [
      {
        id: "sfx-discovery",
        name: "Discovery",
        src: "discovery.ogg",
        kind: "stinger",
        durationMs: 2000,
      },
      {
        id: "sfx-danger",
        name: "Danger",
        src: "danger.ogg",
        kind: "stinger",
        durationMs: 1500,
      },
      {
        id: "sfx-keth",
        name: "Keth Contact",
        src: "keth.ogg",
        kind: "stinger",
        durationMs: 3000,
      },
    ],
    stems: [],
    scenes: [],
    bindings: [],
    transitions: [],
    stingers,
  } as SoundtrackPack;
}

const discoveryStinger: Stinger = {
  id: "st-discovery",
  name: "Discovery Reveal",
  assetId: "sfx-discovery",
  conditions: [{ field: "investigation_active", op: "eq", value: true }],
  priority: 10,
  duckDb: -6,
  fadeInMs: 50,
  fadeOutMs: 200,
};

const dangerStinger: Stinger = {
  id: "st-danger",
  name: "Danger Warning",
  assetId: "sfx-danger",
  conditions: [{ field: "alert_level", op: "gt", value: 0.7 }],
  priority: 20,
  duckDb: -3,
};

const kethStinger: Stinger = {
  id: "st-keth",
  name: "Keth First Contact",
  assetId: "sfx-keth",
  conditions: [
    { field: "location", op: "eq", value: "communion_relay" },
    { field: "first_contact", op: "eq", value: true },
  ],
  priority: 30,
  duckDb: -8,
  fadeInMs: 100,
  fadeOutMs: 500,
  cooldownMs: 10000,
};

// ── evaluateStinger ──

describe("evaluateStinger", () => {
  it("matches when all conditions met", () => {
    const ev = evaluateStinger(discoveryStinger, {
      investigation_active: true,
    } as RuntimeMusicState);
    expect(ev.matched).toBe(true);
    expect(ev.stingerId).toBe("st-discovery");
    expect(ev.assetId).toBe("sfx-discovery");
    expect(ev.duckDb).toBe(-6);
  });

  it("rejects when conditions not met", () => {
    const ev = evaluateStinger(discoveryStinger, {
      investigation_active: false,
    } as RuntimeMusicState);
    expect(ev.matched).toBe(false);
  });

  it("requires ALL conditions to match", () => {
    const ev = evaluateStinger(kethStinger, {
      location: "communion_relay",
      first_contact: false,
    } as RuntimeMusicState);
    expect(ev.matched).toBe(false);
  });

  it("matches multi-condition stinger when all pass", () => {
    const ev = evaluateStinger(kethStinger, {
      location: "communion_relay",
      first_contact: true,
    } as RuntimeMusicState);
    expect(ev.matched).toBe(true);
  });

  it("defaults priority to 0", () => {
    const noPriority: Stinger = {
      ...discoveryStinger,
      priority: undefined,
    };
    const ev = evaluateStinger(noPriority, {
      investigation_active: true,
    } as RuntimeMusicState);
    expect(ev.priority).toBe(0);
  });

  it("defaults fade/duck to 0", () => {
    const minimal: Stinger = {
      id: "st-min",
      name: "Minimal",
      assetId: "sfx-discovery",
      conditions: [{ field: "x", op: "eq", value: true }],
    };
    const ev = evaluateStinger(minimal, { x: true } as RuntimeMusicState);
    expect(ev.duckDb).toBe(0);
    expect(ev.fadeInMs).toBe(0);
    expect(ev.fadeOutMs).toBe(0);
  });
});

// ── resolveStingers ──

describe("resolveStingers", () => {
  const pack = buildPack([discoveryStinger, dangerStinger, kethStinger]);

  it("returns empty when no stingers match", () => {
    const r = resolveStingers(pack, { investigation_active: false });
    expect(r.triggered).toHaveLength(0);
    expect(r.rejected).toHaveLength(3);
  });

  it("triggers matching stingers", () => {
    const r = resolveStingers(pack, {
      investigation_active: true,
    } as RuntimeMusicState);
    expect(r.triggered).toHaveLength(1);
    expect(r.triggered[0].stingerId).toBe("st-discovery");
    expect(r.rejected).toHaveLength(2);
  });

  it("triggers multiple stingers simultaneously", () => {
    const r = resolveStingers(pack, {
      investigation_active: true,
      alert_level: 0.9,
    } as RuntimeMusicState);
    expect(r.triggered).toHaveLength(2);
    // Sorted by priority: danger (20) > discovery (10)
    expect(r.triggered[0].stingerId).toBe("st-danger");
    expect(r.triggered[1].stingerId).toBe("st-discovery");
  });

  it("sorts triggered by priority descending", () => {
    const r = resolveStingers(pack, {
      investigation_active: true,
      alert_level: 0.8,
      location: "communion_relay",
      first_contact: true,
    } as RuntimeMusicState);
    expect(r.triggered).toHaveLength(3);
    expect(r.triggered[0].stingerId).toBe("st-keth"); // 30
    expect(r.triggered[1].stingerId).toBe("st-danger"); // 20
    expect(r.triggered[2].stingerId).toBe("st-discovery"); // 10
  });

  it("handles pack with no stingers", () => {
    const emptyPack = buildPack([]);
    const r = resolveStingers(emptyPack, { anything: true } as RuntimeMusicState);
    expect(r.triggered).toHaveLength(0);
    expect(r.rejected).toHaveLength(0);
  });

  it("handles pack without stingers field", () => {
    const noField = {
      ...buildPack([]),
      stingers: undefined,
    } as SoundtrackPack;
    const r = resolveStingers(noField, { anything: true } as RuntimeMusicState);
    expect(r.triggered).toHaveLength(0);
  });
});

// ── StingerCooldownTracker ──

describe("StingerCooldownTracker", () => {
  let tracker: StingerCooldownTracker;

  beforeEach(() => {
    tracker = new StingerCooldownTracker();
  });

  it("allows first fire", () => {
    expect(tracker.canFire(kethStinger, 0)).toBe(true);
  });

  it("blocks during cooldown", () => {
    tracker.recordFire("st-keth", 1000);
    // kethStinger.cooldownMs = 10000
    expect(tracker.canFire(kethStinger, 5000)).toBe(false);
  });

  it("allows after cooldown expires", () => {
    tracker.recordFire("st-keth", 1000);
    expect(tracker.canFire(kethStinger, 12000)).toBe(true);
  });

  it("allows stingers with no cooldown", () => {
    tracker.recordFire("st-discovery", 0);
    expect(tracker.canFire(discoveryStinger, 1)).toBe(true);
  });

  it("filterByCooldown removes cooled-down stingers", () => {
    const pack = buildPack([discoveryStinger, kethStinger]);
    tracker.recordFire("st-keth", 1000);

    const triggered = [
      {
        stingerId: "st-discovery",
        stingerName: "Discovery",
        assetId: "sfx-discovery",
        matched: true,
        priority: 10,
        duckDb: -6,
        fadeInMs: 50,
        fadeOutMs: 200,
      },
      {
        stingerId: "st-keth",
        stingerName: "Keth",
        assetId: "sfx-keth",
        matched: true,
        priority: 30,
        duckDb: -8,
        fadeInMs: 100,
        fadeOutMs: 500,
      },
    ];

    const filtered = tracker.filterByCooldown(pack, triggered, 5000);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].stingerId).toBe("st-discovery");
  });

  it("reset clears cooldown state", () => {
    tracker.recordFire("st-keth", 1000);
    expect(tracker.canFire(kethStinger, 2000)).toBe(false);
    tracker.reset();
    expect(tracker.canFire(kethStinger, 2000)).toBe(true);
  });
});
