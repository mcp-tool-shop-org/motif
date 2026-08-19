import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ingestAllGroundedWave2 } from "./ingest-grounded-wave2.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const destRoot = join(repoRoot, "apps/studio/public/audio/grounded-v2");
const manifestPath = join(repoRoot, "apps/studio/src/app/grounded-wave2-folded.json");

mkdirSync(destRoot, { recursive: true });

const items = await ingestAllGroundedWave2({ destRoot });
writeFileSync(manifestPath, `${JSON.stringify({ items }, null, 2)}\n`, "utf-8");
writeFileSync(
  join(destRoot, "manifest.json"),
  `${JSON.stringify({ takeCount: items.length, ids: items.map((i) => i.record.id) }, null, 2)}\n`,
  "utf-8",
);

process.stdout.write(`ingested ${items.length} wave-2 takes → ${destRoot}\n`);
