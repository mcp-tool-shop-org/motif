// ────────────────────────────────────────────
// Regression net for the silent-scene bug:
// InstrumentRack.getVoice once fell back to FACTORY_PRESETS instead of
// ALL_PRESETS, so every scifi-* voice silently returned null and any
// Grounded scene built on clip layers played nothing. This suite walks
// the full chain — scene.clipLayers → pack.clips → clip.instrumentId →
// bare InstrumentRack — so a preset that drops out of the rack's
// fallback table fails loudly here.
// ────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { buildGroundedPack } from "@motif-studio/scene-mapper";
import { InstrumentRack, ALL_PRESETS } from "@motif-studio/instrument-rack";

const pack = buildGroundedPack();

describe("Grounded pack instrument resolution (silent-scene regression net)", () => {
  const clipsById = new Map((pack.clips ?? []).map((c) => [c.id, c]));

  it("pack has scenes with clip layers to exercise", () => {
    const scenesWithClips = pack.scenes.filter(
      (s) => (s.clipLayers?.length ?? 0) > 0,
    );
    expect(scenesWithClips.length).toBeGreaterThan(0);
  });

  it("every scene clipLayers[].clipId resolves to a clip in pack.clips", () => {
    const missing: string[] = [];
    for (const scene of pack.scenes) {
      for (const ref of scene.clipLayers ?? []) {
        if (!clipsById.has(ref.clipId)) {
          missing.push(`${scene.id} → ${ref.clipId}`);
        }
      }
    }
    expect(missing, `dangling clip refs: ${missing.join(", ")}`).toEqual([]);
  });

  it("every referenced clip's instrumentId exists in ALL_PRESETS", () => {
    const presetIds = new Set(ALL_PRESETS.map((p) => p.id));
    const missing: string[] = [];
    for (const scene of pack.scenes) {
      for (const ref of scene.clipLayers ?? []) {
        const clip = clipsById.get(ref.clipId);
        if (!clip) continue; // covered by the previous assertion
        if (!presetIds.has(clip.instrumentId)) {
          missing.push(`${scene.id} → ${clip.id} → ${clip.instrumentId}`);
        }
      }
    }
    expect(
      missing,
      `instrument ids missing from ALL_PRESETS (silent scene!): ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("every referenced clip's instrumentId yields a voice from a bare InstrumentRack", () => {
    // Voice construction is context-free (SynthVoice/DrumVoice take no
    // AudioContext until playNote), so getVoice must return non-null in Node.
    const rack = new InstrumentRack();
    const silent: string[] = [];
    for (const scene of pack.scenes) {
      for (const ref of scene.clipLayers ?? []) {
        const clip = clipsById.get(ref.clipId);
        if (!clip) continue;
        const voice = rack.getVoice(clip.instrumentId);
        if (voice == null) {
          silent.push(`${scene.id} → ${clip.id} → ${clip.instrumentId}`);
        }
      }
    }
    expect(
      silent,
      `getVoice returned null (scene would play silence): ${silent.join(", ")}`,
    ).toEqual([]);
    rack.dispose();
  });
});
