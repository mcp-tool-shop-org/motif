import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { populateDemoPacks } from "./populate-demo-packs.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const publicAudioRoot = join(repoRoot, "apps/studio/public/audio");

const written = await populateDemoPacks({ publicAudioRoot });

for (const w of written) {
  const flags = w.peakLimited
    ? `  peak-limited (${w.peakBefore.toFixed(3)} → -1 dBFS)`
    : "";
  process.stdout.write(
    `${w.relPath}  ${w.durationMs} ms  ${(w.bytes / 1024).toFixed(0)} KiB${flags}\n`,
  );
}
process.stdout.write(
  `wrote ${written.length} WAVs → ${join(publicAudioRoot, "library").replace(/\\/g, "/")}\n`,
);
