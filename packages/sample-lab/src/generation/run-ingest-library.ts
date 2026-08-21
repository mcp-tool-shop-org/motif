import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIBRARY_PACKS,
  libraryTakes,
  type FoldableGenerated,
} from "@motif-studio/score-map";
import {
  LIBRARY_TIER1_ARTIFACT_ROOT,
  ingestLibraryPack,
  libraryPublicDir,
  loadLibraryCollectionPlan,
} from "./ingest-library.js";

/**
 * Materialize library packs into the studio.
 *
 *   node dist/generation/run-ingest-library.js --pack fantasy-jrpg-core
 *
 * `--pack` is repeatable and defaults to every catalog pack. Ingest is
 * INCREMENTAL: only the named packs are rewritten in the folded manifest, so
 * a pack ingested earlier keeps its entries.
 *
 * Budget ~86 MB of 24-bit WAV per take (mix + 4 stems at 60 s): ~2.6 GB for
 * the 30-take flagship, ~18 GB for all ten Tier-1 packs. Name the packs you
 * want — the no-filter default writes the whole tier.
 */

interface FoldedManifest {
  packs: Record<string, { items: FoldableGenerated[] }>;
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const publicAudioRoot = join(repoRoot, "apps/studio/public/audio");
const manifestPath = join(repoRoot, "apps/studio/src/app/library-folded.json");

function parseArgs(argv: string[]): { packIds: string[]; artifactRoot: string } {
  const packIds: string[] = [];
  let artifactRoot = LIBRARY_TIER1_ARTIFACT_ROOT;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--pack") packIds.push(argv[++i]!);
    else if (arg === "--artifact-root") artifactRoot = argv[++i]!;
    else throw new Error(`Unknown argument ${arg}`);
  }
  const known = new Set(LIBRARY_PACKS.map((p) => p.id));
  for (const id of packIds) {
    if (!known.has(id)) throw new Error(`Unknown library pack ${id}`);
  }
  return {
    packIds: packIds.length > 0 ? packIds : LIBRARY_PACKS.map((p) => p.id),
    artifactRoot,
  };
}

function readManifest(): FoldedManifest {
  if (!existsSync(manifestPath)) return { packs: {} };
  return JSON.parse(readFileSync(manifestPath, "utf-8")) as FoldedManifest;
}

/** Merge in the freshly ingested packs; every other pack survives untouched. */
function writeManifest(manifest: FoldedManifest): void {
  const packs: FoldedManifest["packs"] = {};
  for (const id of Object.keys(manifest.packs).sort()) {
    packs[id] = manifest.packs[id]!;
  }
  writeFileSync(manifestPath, `${JSON.stringify({ packs }, null, 2)}\n`, "utf-8");
}

const { packIds, artifactRoot } = parseArgs(process.argv.slice(2));
const plan = loadLibraryCollectionPlan(artifactRoot);
const manifest = readManifest();

const plannedTakes = packIds.reduce((n, id) => n + libraryTakes(id).length, 0);
process.stdout.write(
  `ingesting ${packIds.length} pack(s), ${plannedTakes} takes from ${artifactRoot}\n`,
);

for (const packId of packIds) {
  mkdirSync(join(publicAudioRoot, libraryPublicDir(packId)), { recursive: true });
  const items = await ingestLibraryPack(packId, { publicAudioRoot, artifactRoot, plan });
  manifest.packs[packId] = { items };

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
      `${packId}/${r.id}  requested ${r.gainDb.toFixed(2)} dB → actual ${r.actualGainDb.toFixed(2)} dB  ${flags}\n`,
    );
  }

  writeFileSync(
    join(publicAudioRoot, libraryPublicDir(packId), "manifest.json"),
    `${JSON.stringify(
      {
        takeCount: items.length,
        playbackDefaults: items.filter((i) => i.playbackDefault).length,
        ids: items.map((i) => i.record.id),
      },
      null,
      2,
    )}\n`,
    "utf-8",
  );
  writeManifest(manifest);
}

const total = Object.values(manifest.packs).reduce((n, p) => n + p.items.length, 0);
process.stdout.write(
  `ingested ${plannedTakes} takes across ${packIds.length} pack(s); manifest now holds ` +
    `${total} takes over ${Object.keys(manifest.packs).length} pack(s) → ${manifestPath}\n`,
);
