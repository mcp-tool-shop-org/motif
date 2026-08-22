import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AudioAsset } from "@motif-studio/schema";
import {
  combatEscalationPack,
  examplePacks,
  minimalPack,
  starterPack,
} from "../src/app/seed-data";

// ── Regression net: every referenced audio file actually exists ──
// The generated WAVs under public/audio/library/ are gitignored (rebuilt from
// the library-day1 FLAC artifacts via `pnpm --filter @motif-studio/sample-lab
// populate:demo-packs`), so this suite skips cleanly where they are absent (CI).

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
const libraryDir = join(publicDir, "audio", "library");

const grounded = examplePacks.find((p) => p.id === "star-freight-grounded")!.pack;
const groundedStingers = grounded.assets.filter(
  (a) => a.kind === "stinger" && a.id.startsWith("sfx-"),
);

const cases: Array<{ label: string; assets: AudioAsset[] }> = [
  { label: "minimal-pack", assets: minimalPack.assets },
  { label: "starter-pack", assets: starterPack.assets },
  { label: "combat-escalation-pack", assets: combatEscalationPack.assets },
  { label: "star-freight-grounded stingers", assets: groundedStingers },
];

function isRemote(src: string): boolean {
  return /^(https?:|data:)/i.test(src);
}

/** Root-relative and relative srcs both resolve against the Next public dir. */
function toPublicPath(src: string): string {
  return join(publicDir, src.replace(/^\//, ""));
}

const libraryPresent = existsSync(libraryDir);
if (!libraryPresent) {
  console.warn(
    `[asset-files] generated audio missing at ${libraryDir} — skipping file-existence checks. ` +
      "Run `pnpm --filter @motif-studio/sample-lab populate:demo-packs` to rebuild.",
  );
}

describe.skipIf(!libraryPresent)("seeded pack asset files", () => {
  it("grounded pack still exposes all 8 stinger assets", () => {
    expect(groundedStingers).toHaveLength(8);
  });

  for (const c of cases) {
    it(`${c.label}: every asset src resolves to a file under public/`, () => {
      expect(c.assets.length).toBeGreaterThan(0);
      for (const asset of c.assets) {
        if (isRemote(asset.src)) continue;
        const filePath = toPublicPath(asset.src);
        expect(
          existsSync(filePath),
          `${c.label} asset ${asset.id} → ${asset.src} missing at ${filePath}`,
        ).toBe(true);
      }
    });
  }
});
