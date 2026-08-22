import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LIBRARY_PACKS,
  libraryTakes,
  type FoldableGenerated,
  type LibraryArtifactRootId,
  type LibraryTake,
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
 * A take whose artifact is present but MALFORMED halts the whole run by default
 * — bad audio must never reach the manifest. `--skip-defective` narrows that
 * andon from the run to the take: the defect is still refused and never folded,
 * but the remaining packs finish, every failure is listed at the end, and the
 * process exits non-zero so a run that dropped something cannot read as clean.
 *
 * Ingest is INCREMENTAL twice over. Across packs: only the named packs are
 * rewritten in the folded manifest, so a pack ingested earlier keeps its
 * entries. Within a pack: a take whose input FLACs still hash to what the
 * previous ingest recorded, and whose masters are all still on disk, is served
 * from that ingest instead of being decoded and rewritten. A full-library
 * re-run is therefore seconds, not hours — pass `--force` to re-decode
 * everything anyway and prove the pipeline still reproduces its own output.
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
  force: boolean;
  skipDefective: boolean;
}

function parseArgs(argv: string[]): Args {
  const named: string[] = [];
  const tiers: string[] = [];
  let force = false;
  let skipDefective = false;
  const roots: Record<LibraryArtifactRootId, string> = { ...LIBRARY_ARTIFACT_ROOTS };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--pack") named.push(argv[++i]!);
    else if (arg === "--force") force = true;
    else if (arg === "--skip-defective") skipDefective = true;
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
    force,
    skipDefective,
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

const { packIds, roots, force, skipDefective } = parseArgs(process.argv.slice(2));
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
let reused = 0;
const failures: Array<{ packId: string; folder: string; message: string }> = [];
const startedAt = Date.now();

for (const packId of packIds) {
  mkdirSync(join(publicAudioRoot, libraryPublicDir(packId)), { recursive: true });
  const items = await ingestLibraryPack(packId, {
    publicAudioRoot,
    roots,
    plan,
    force,
    onCacheHit: () => {
      reused++;
    },
    ...(skipDefective
      ? {
          onFailure: (take: LibraryTake, error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            failures.push({ packId, folder: take.folder, message });
            process.stdout.write(`${packId}/${take.folder}  DEFECTIVE — ${message}\n`);
          },
        }
      : {}),
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
  `ingested ${ingested} take(s) — ${ingested - reused} freshly decoded, ${reused} reused ` +
    `from a previous ingest — skipped ${skipped}, across ${packIds.length} pack(s) in ` +
    `${((Date.now() - startedAt) / 1000).toFixed(1)}s; ` +
    `manifest now holds ${total} takes over ${Object.keys(manifest.packs).length} pack(s) → ${manifestPath}\n`,
);

// A dropped take is still a defect. Report every one and exit non-zero, so a
// run that skipped something can never be mistaken for a clean one.
if (failures.length > 0) {
  process.stdout.write(
    `\n${failures.length} DEFECTIVE take(s) left out of the manifest — each needs a re-roll or a re-collect:\n`,
  );
  for (const f of failures) {
    process.stdout.write(`  ${f.packId}/${f.folder}: ${f.message}\n`);
  }
  process.exitCode = 1;
}
