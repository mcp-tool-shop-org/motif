# motif: how it works

Mapped at 2026-09-30 from commit 2b08099 by Atlas 1.24.0.

## What this is

23 parts, mostly TypeScript (277 files), CSS (3), JavaScript (3) and Astro (1). Work enters through 19 doors; CI and Release each reach 17 parts, and CI is followed because a pull request goes through it. It publishes @motif-studio/asset-index (packages/asset-index), @motif-studio/audio-engine (packages/audio-engine), @motif-studio/automation (packages/automation), @motif-studio/clip-engine (packages/clip-engine), @motif-studio/instrument-rack (packages/instrument-rack), @motif-studio/library (packages/library), @motif-studio/music-theory (packages/music-theory), @motif-studio/playback-engine (packages/playback-engine), @motif-studio/review (packages/review), @motif-studio/runtime-pack (packages/runtime-pack), @motif-studio/sample-lab (packages/sample-lab), @motif-studio/scene-mapper (packages/scene-mapper), @motif-studio/schema (packages/schema), @motif-studio/score-map (packages/score-map), @motif-studio/test-kit (packages/test-kit) and @motif-studio/ui (packages/ui) to npm. It deploys a site to GitHub Pages. People import @motif-studio/asset-index, @motif-studio/audio-engine, @motif-studio/automation, @motif-studio/clip-engine, @motif-studio/instrument-rack, @motif-studio/library, @motif-studio/music-theory, @motif-studio/playback-engine, @motif-studio/review, @motif-studio/runtime-pack and 6 more.

## What changed since 2026-09-25 (bed8634)

- CI's pull request trigger now also names `codecov.yml`.
- CI's push trigger now also names `codecov.yml`.
- CI now also runs apps/studio/next.config.js, apps/studio/src/app/, apps/studio/test/asset-files.test.ts and 32 more.
- And 21 more changes to doors.
- apps/studio/public/audio is now written by packages/sample-lab/src/generation/run-ingest-grounded.ts and packages/sample-lab/src/generation/run-ingest-library.ts.
- 1 file added and 1 changed content, across 2 parts.

## What comes in

1. **CI.** On a pull request touching 10 paths; on a push to main touching 10 paths; or by hand. Runs apps/studio/next.config.js, apps/studio/src/app/, apps/studio/test/asset-files.test.ts and 73 more; builds packages/asset-index/src/, packages/audio-engine/src/, packages/automation/src/ and 121 more; checks apps/studio/next-env.d.ts and apps/studio/src/.
2. **Release.** When a release is published. Runs apps/studio/next.config.js, apps/studio/src/app/, apps/studio/test/asset-files.test.ts and 73 more; builds packages/asset-index/src/, packages/audio-engine/src/, packages/automation/src/ and 121 more; checks apps/studio/next-env.d.ts.
3. **Deploy site to GitHub Pages.** On a push to main touching 2 paths; or by hand. Runs site/astro.config.mjs and site/src/.
4. **@motif-studio/playback-engine** (the package people import). Loads packages/playback-engine/src/index.ts.
5. **@motif-studio/audio-engine** (the package people import). Loads packages/audio-engine/src/index.ts.
6. **@motif-studio/clip-engine** (the package people import). Loads packages/clip-engine/src/index.ts.
7. **@motif-studio/review** (the package people import). Loads packages/review/src/index.ts.
8. **@motif-studio/runtime-pack** (the package people import). Loads packages/runtime-pack/src/index.ts.
9. **@motif-studio/sample-lab** (the package people import). Loads packages/sample-lab/src/index.ts.
10. **@motif-studio/scene-mapper** (the package people import). Loads packages/scene-mapper/src/index.ts.
11. **@motif-studio/asset-index** (the package people import). Loads packages/asset-index/src/index.ts.
12. **@motif-studio/automation** (the package people import). Loads packages/automation/src/index.ts.
13. **@motif-studio/instrument-rack** (the package people import). Loads packages/instrument-rack/src/index.ts.
14. **@motif-studio/library** (the package people import). Loads packages/library/src/index.ts.
15. **@motif-studio/score-map** (the package people import). Loads packages/score-map/src/index.ts.
16. **@motif-studio/music-theory** (the package people import). Loads packages/music-theory/src/index.ts.
17. **@motif-studio/schema** (the package people import). Loads packages/schema/src/index.ts.
18. **@motif-studio/test-kit** (the package people import). Loads packages/test-kit/src/index.ts.
19. **@motif-studio/ui** (the package people import). Loads packages/ui/src/index.ts.

## What happens through CI

1. The workflow runs packages/asset-index/test/ in asset-index, packages/audio-engine/test/ in audio-engine, packages/automation/test/ in automation, packages/clip-engine/test/ in clip-engine, packages/instrument-rack/test/ in instrument-rack, and 97 files in 12 more parts; it builds packages/asset-index/src/ in asset-index, packages/audio-engine/src/ in audio-engine, packages/automation/src/ in automation, packages/clip-engine/src/ in clip-engine, packages/instrument-rack/src/ in instrument-rack, and 101 files in 11 more parts; it checks apps/studio/next-env.d.ts and apps/studio/src/ in studio.
2. It uploads coverage to Codecov.

## Who reads the results

CI writes nothing this map can see.

## The other doors

**Release** runs apps/studio/next.config.js, apps/studio/src/app/, apps/studio/test/asset-files.test.ts and 73 more, builds packages/asset-index/src/, packages/audio-engine/src/, packages/automation/src/ and 121 more, checks apps/studio/next-env.d.ts, and publishes @motif-studio/asset-index (packages/asset-index), @motif-studio/audio-engine (packages/audio-engine), @motif-studio/automation (packages/automation), @motif-studio/clip-engine (packages/clip-engine), @motif-studio/instrument-rack (packages/instrument-rack), @motif-studio/library (packages/library), @motif-studio/music-theory (packages/music-theory), @motif-studio/playback-engine (packages/playback-engine), @motif-studio/review (packages/review), @motif-studio/runtime-pack (packages/runtime-pack), @motif-studio/sample-lab (packages/sample-lab), @motif-studio/scene-mapper (packages/scene-mapper), @motif-studio/schema (packages/schema), @motif-studio/score-map (packages/score-map), @motif-studio/test-kit (packages/test-kit) and @motif-studio/ui (packages/ui) to npm.

**Deploy site to GitHub Pages** runs site/astro.config.mjs and site/src/, and deploys the site.

**@motif-studio/playback-engine** (the package people import) loads packages/playback-engine/src/index.ts and reaches audio-engine, clip-engine, instrument-rack, music-theory, scene-mapper, schema and score-map.

**@motif-studio/audio-engine** (the package people import) loads packages/audio-engine/src/index.ts and reaches scene-mapper, schema and score-map.

**@motif-studio/clip-engine** (the package people import) loads packages/clip-engine/src/index.ts and reaches instrument-rack, music-theory and schema.

**@motif-studio/review** (the package people import) loads packages/review/src/index.ts and reaches asset-index and schema.

**@motif-studio/runtime-pack** (the package people import) loads packages/runtime-pack/src/index.ts and reaches asset-index and schema.

**@motif-studio/sample-lab** (the package people import) loads packages/sample-lab/src/index.ts and reaches schema and score-map.

**@motif-studio/scene-mapper** (the package people import) loads packages/scene-mapper/src/index.ts and reaches schema and score-map.

**@motif-studio/asset-index** (the package people import) loads packages/asset-index/src/index.ts and reaches schema.

**@motif-studio/automation** (the package people import) loads packages/automation/src/index.ts and reaches schema.

**@motif-studio/instrument-rack** (the package people import) loads packages/instrument-rack/src/index.ts and reaches schema.

**@motif-studio/library** (the package people import) loads packages/library/src/index.ts and reaches schema.

**@motif-studio/score-map** (the package people import) loads packages/score-map/src/index.ts and reaches schema.

**@motif-studio/music-theory** (the package people import) loads packages/music-theory/src/index.ts.

**@motif-studio/schema** (the package people import) loads packages/schema/src/index.ts.

**@motif-studio/test-kit** (the package people import) loads packages/test-kit/src/index.ts.

**@motif-studio/ui** (the package people import) loads packages/ui/src/index.ts.

## What breaks what

- **schema** is imported by 13 parts (asset-index, audio-engine, automation, clip-engine, instrument-rack, library, playback-engine, review, runtime-pack, sample-lab, scene-mapper, score-map, studio) and sits on the path of 15 doors.
- **score-map** is imported by 3 parts (sample-lab, scene-mapper, studio) and sits on the path of 7 doors.
- **instrument-rack** is imported by 3 parts (clip-engine, playback-engine, studio), and by 2 more only from tests; it sits on the path of 5 doors.
- **asset-index** is imported by 2 parts (review, runtime-pack) and sits on the path of 5 doors.
- **music-theory** is imported by 2 parts (clip-engine, studio) and sits on the path of 5 doors.
- **scene-mapper** is imported by 2 parts (audio-engine, studio) and sits on the path of 5 doors.
- **clip-engine** is imported by 2 parts (playback-engine, studio), and by 1 more only from tests; it sits on the path of 4 doors.
- **audio-engine** is imported by 2 parts (playback-engine, studio) and sits on the path of 4 doors.

## What tends to change together

- **packages/schema/src/schemas.ts** and **packages/schema/src/types.ts** changed together in 9 of 9 commits, inside the schema part.
- **apps/studio/src/app/seed-data.ts** and **packages/sample-lab/src/generation/index.ts** changed together in 5 of 8 commits, though neither part imports the other.
- **packages/sample-lab/src/generation/index.ts** and **packages/sample-lab/test/generation.test.ts** changed together in 5 of 8 commits, inside the sample-lab part.

Confidence is low: fewer than 25 source files reach 10 revisions in the window.

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

.github/workflows/ci.yml → packages/asset-index/src/index.ts → packages/asset-index/src/index-pack.ts → packages/schema/src/errors.ts → packages/schema/src/types.ts

Read those in order to follow one pull request end to end.

## What this map cannot see

- 1 import could not be resolved: `apps/studio/next-env.d.ts` imports `./.next/types/routes.d.ts`, which a build generates.
- 8 reads use paths built at run time and are not named here.
- 4 writes go to places this repository does not track, so they are not listed as generated.
- 12 writes and 46 reads go to a path their caller passes, not to this repository.
- Statistics confidence is low: fewer than 25 source files reach 10 revisions in the window.

Regenerate with `npx --yes @dogfood-lab/atlas map`.
