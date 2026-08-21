import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUNDED_TAKES, type GroundedWave } from "@motif-studio/score-map";
import { groundedPublicDir, ingestAllGrounded } from "./ingest-grounded.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const publicAudioRoot = join(repoRoot, "apps/studio/public/audio");
const manifestPath = join(repoRoot, "apps/studio/src/app/grounded-folded.json");

const waves: GroundedWave[] = [2, 3];
for (const wave of waves) {
  mkdirSync(join(publicAudioRoot, groundedPublicDir(wave)), { recursive: true });
}

const items = await ingestAllGrounded({ publicAudioRoot });
writeFileSync(manifestPath, `${JSON.stringify({ items }, null, 2)}\n`, "utf-8");

for (const wave of waves) {
  const waveItems = items.filter((i) =>
    i.record.mix?.masterSrc.startsWith(`/audio/${groundedPublicDir(wave)}/`),
  );
  writeFileSync(
    join(publicAudioRoot, groundedPublicDir(wave), "manifest.json"),
    `${JSON.stringify(
      { takeCount: waveItems.length, ids: waveItems.map((i) => i.record.id) },
      null,
      2,
    )}\n`,
    "utf-8",
  );
}

for (const item of items) {
  const r = item.record;
  const flags = [
    r.peakLimited ? "peakLimited" : null,
    r.boostCapped ? "boostCapped" : null,
    item.playbackDefault ? "DEFAULT" : null,
  ]
    .filter(Boolean)
    .join(" ");
  process.stdout.write(
    `${r.id}  requested ${r.gainDb.toFixed(2)} dB → actual ${r.actualGainDb.toFixed(2)} dB  ${flags}\n`,
  );
}
process.stdout.write(
  `ingested ${items.length} grounded takes (${GROUNDED_TAKES.length} authored) → ${publicAudioRoot}\n`,
);
