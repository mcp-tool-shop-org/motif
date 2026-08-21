import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIBRARY_PACKS,
  libraryTakes,
  type FoldableGenerated,
  type LibraryArtifactRootId,
} from "@motif-studio/score-map";
import {
  LIBRARY_ARTIFACT_ROOTS,
  ingestLibraryPack,
  libraryPublicDir,
  loadLibraryPlans,
} from "./ingest-library.js";

/**
 * Materialize library packs into the studio.
 *
 *   node dist/generation/run-ingest-library.js --pack fantasy-jrpg-core
 *   node dist/generation/run-ingest-library.js --tier 2 --tier 3
 *
 * `--pack` and `--tier` are both repeatable and combine as a union; with
 * neither, every pack of every tier is ingested. `--root <treeId>=<path>`
 * relocates one artifact tree (tier1 | tier2 | tier3 | regen-cd);
 * `--artifact-root <path>` collapses them all onto one directory.
 *
 * A pack's takes may span several artifact trees — its A/B pair sits under its
 * own tier, C/D re-rolls under the tier-2 revisions tree or the regen tree — so
 * the plans of every tree are merged up front. Takes whose masters have not been
 * collected yet are reported and skipped, never andoned.
 *
 * Ingest is INCREMENTAL: only the named packs are rewritten in the folded
 * manifest, so a pack ingested earlier keeps its entries.
 *
 * Budget ~86 MB of 24-bit WAV per take (mix + 4 stems at 60 s): ~2.6 GB for
 * the 30-take flagship, ~18 GB for all ten Tier-1 packs. Name the packs you
 * want — the no-filter default writes the whole library.
 */

interface FoldedManifest {
  packs: Record<string, { items: FoldableGenerated[] }>;
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const publicAudioRoot = join(repoRoot, "apps/studio/public/audio");
const manifestPath = join(repoRoot, "apps/studio/src/app/library-folded.json");

interface Args {
  packIds: string[];
  roots: Record<LibraryArtifactRootId, string>;
}

function parseArgs(argv: string[]): Args {
  const named: string[] = [];
  const tiers: string[] = [];
  const roots: Record<LibraryArtifactRootId, string> = { ...LIBRARY_ARTIFACT_ROOTS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--pack") named.push(argv[++i]!);
    else if (arg === "--tier") {
      const value = argv[++i];
      if (!value) throw new Error("--tier wants a tier number, e.g. --tier 2");
      tiers.push(`tier${value.replace(/^tier/, "")}`);
    } else if (arg === "--root") {
      const [treeId, ...rest] = (argv[++i] ?? "").split("=");
      if (!treeId || rest.length === 0 || !(treeId in roots)) {
        throw new Error(
          `--root wants <treeId>=<path> where treeId is one of ${Object.keys(roots).join(" | ")}`,
        );
      }
      roots[treeId as LibraryArtifactRootId] = rest.join("=");
    } else if (arg === "--artifact-root") {
      const one = argv[++i]!;
      for (const key of Object.keys(roots) as LibraryArtifactRootId[]) roots[key] = one;
    } else throw new Error(`Unknown argument ${arg}`);
  }

  const known = new Set(LIBRARY_PACKS.map((p) => p.id));
  for (const id of named) {
    if (!known.has(id)) throw new Error(`Unknown library pack ${id}`);
  }
  const knownTiers = new Set(LIBRARY_PACKS.map((p) => p.tier));
  for (const tier of tiers) {
    if (!knownTiers.has(tier)) {
      throw new Error(`Unknown catalog tier ${tier} (have ${[...knownTiers].join(", ")})`);
    }
  }

  // Union of the two filters, in catalog order; no filter means everything.
  const wanted = new Set([
    ...named,
    ...LIBRARY_PACKS.filter((p) => tiers.includes(p.tier)).map((p) => p.id),
  ]);
  return {
    packIds:
      wanted.size > 0
        ? LIBRARY_PACKS.filter((p) => wanted.has(p.id)).map((p) => p.id)
        : LIBRARY_PACKS.map((p) => p.id),
    roots,
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

const { packIds, roots } = parseArgs(process.argv.slice(2));
const plan = loadLibraryPlans(roots);
const manifest = readManifest();

const plannedTakes = packIds.flatMap((id) => libraryTakes(id));
const trees = [...new Set(plannedTakes.map((t) => t.artifact.root))];
process.stdout.write(
  `ingesting ${packIds.length} pack(s), ${plannedTakes.length} planned take(s) from ` +
    `${trees.map((t) => `${t} (${roots[t]})`).join(", ")}\n`,
);

let ingested = 0;
let skipped = 0;

for (const packId of packIds) {
  mkdirSync(join(publicAudioRoot, libraryPublicDir(packId)), { recursive: true });
  const items = await ingestLibraryPack(packId, {
    publicAudioRoot,
    roots,
    plan,
    onSkip: (take, artifactDir) => {
      skipped++;
      process.stdout.write(
        `${packId}/${take.folder}  take ${take.take} SKIPPED — no masters at ${artifactDir}\n`,
      );
    },
  });
  if (items.length === 0) {
    // Every take skipped — almost always a wrong `--root`. Overwriting the
    // manifest entry here would silently un-ship a pack that is already folded.
    process.stdout.write(`${packId}  no takes ingested — manifest entry left unchanged\n`);
    continue;
  }
  manifest.packs[packId] = { items };
  ingested += items.length;

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
  `ingested ${ingested} take(s), skipped ${skipped} across ${packIds.length} pack(s); ` +
    `manifest now holds ${total} takes over ${Object.keys(manifest.packs).length} pack(s) → ${manifestPath}\n`,
);
