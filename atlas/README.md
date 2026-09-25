# motif: how it works

Mapped at 2026-09-25 from commit bed8634.

## What this is

23 parts, mostly TypeScript (277 files) and JavaScript (3). Work enters through 3 doors; the busiest is Deploy site to GitHub Pages, which reaches 1 part. It publishes a package to npm, chosen at run time.

## What changed since the last map

This is the first map.

## What comes in

1. **Deploy site to GitHub Pages.** On a push to main touching 2 paths; or by hand. Runs site/astro.config.mjs and site/src/.
2. **CI.** On a pull request touching 9 paths; on a push to main touching 9 paths; or by hand. Runs no file this map can see.
3. **Release.** When a release is published. Runs no file this map can see.

## What happens through Deploy site to GitHub Pages

1. The workflow runs site/astro.config.mjs and site/src/ in the site.
2. It deploys the site.

## Who reads the results

Deploy site to GitHub Pages writes nothing this map can see.

## The other doors

**CI** runs no file this map can see.

**Release** runs no file this map can see and publishes a package to npm, chosen at run time.

## What breaks what

- **schema** is imported by 13 parts (asset-index, audio-engine, automation, clip-engine, instrument-rack, library, playback-engine, review, runtime-pack, sample-lab, scene-mapper, score-map, studio) and sits on the path of no door.
- **instrument-rack** is imported by 3 parts (clip-engine, playback-engine, studio), and by 2 more only from tests; it sits on the path of no door.
- **score-map** is imported by 3 parts (sample-lab, scene-mapper, studio) and sits on the path of no door.
- **clip-engine** is imported by 2 parts (playback-engine, studio), and by 1 more only from tests; it sits on the path of no door.
- **asset-index** is imported by 2 parts (review, runtime-pack) and sits on the path of no door.
- **audio-engine** is imported by 2 parts (playback-engine, studio) and sits on the path of no door.
- **music-theory** is imported by 2 parts (clip-engine, studio) and sits on the path of no door.
- **scene-mapper** is imported by 2 parts (audio-engine, studio) and sits on the path of no door.

## What tends to change together

- **packages/schema/src/schemas.ts** and **packages/schema/src/types.ts** changed together in 9 of 9 commits, inside the schema part.
- **apps/studio/src/app/seed-data.ts** and **packages/sample-lab/src/generation/index.ts** changed together in 5 of 8 commits, though neither part imports the other.
- **packages/sample-lab/src/generation/index.ts** and **packages/sample-lab/test/generation.test.ts** changed together in 5 of 8 commits, inside the sample-lab part.

Confidence is low: fewer than 20 source files reach 10 revisions in the window.

Window: 180 days; a pair counts from 3 shared commits, since 0 source files reach 10 revisions; the floor rises to 10 when 25 do.

## What no test touches

Every code part is imported by at least one test.

## Written but never read

Every written place has a reader.

## Helpers that look duplicated

No two parts export a helper that looks alike.

## Generated, never hand-edited

- **apps/studio/src/app/grounded-folded.json** is written by packages/sample-lab/src/generation/run-ingest-grounded.ts.
- **apps/studio/src/app/library-folded.json** has a block written by packages/sample-lab/src/generation/run-ingest-library.ts.

## Hand-authored

People write .claude/, .github/, examples/, handbook/, the repository root and site/. Nothing in this repository writes to them.

## Where to start

.github/workflows/pages.yml → site/src/content.config.ts

Read those in order to follow one push end to end.

## What this map cannot see

- 1 import site could not be resolved.
- 8 reads use paths built at run time and are not named here.
- 2 writes go to places this repository does not track, so they are not listed as generated.
- 12 writes and 46 reads go to a path their caller passes, not to this repository.
- Statistics confidence is low: fewer than 20 source files reach 10 revisions in the window.

Regenerate with `npx --yes @dogfood-lab/atlas map`.
