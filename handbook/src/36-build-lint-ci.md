# Build, Lint, and CI

## Build Pipeline

Turborepo orchestrates all build tasks with `turbo.json`:

- `build` — TypeScript compilation to `dist/` (depends on `^build` for correct ordering)
- `dev` — development servers (parallel, no cache)
- `test` — Vitest test suites (depends on `build`)
- `lint` — ESLint across all source directories
- `typecheck` — `tsc --noEmit` (depends on `^build`)

### Verify Command

```bash
pnpm verify   # runs lint + typecheck + test + build in one pass
```

## TypeScript Configuration

All packages extend `tsconfig.base.json`:

- Target: ES2022
- Module: ESNext with bundler resolution
- Strict mode enabled
- Declaration and source maps generated

## Linting

Single `eslint.config.js` at the root using flat config:

- ESLint recommended rules
- TypeScript-ESLint recommended rules
- Node.js globals
- Ignores: `dist/`, `node_modules/`, `.next/`, `.astro/`

## CI Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. Triggered on push to `main`, PRs, releases, and manual dispatch
2. Concurrency groups with cancel-in-progress
3. Steps: checkout → pnpm setup → Node 22 → frozen install → audit → lint → typecheck → build → test+coverage → Codecov upload
4. Publish job on release tags with npm provenance

## Security Scanning

- `pnpm audit --prod --audit-level=high` in CI
- Scheduled weekly security workflow (`.github/workflows/security.yml`)
- Dependabot configured for npm and GitHub Actions dependencies

## Pages Deployment

Landing site deployed via `.github/workflows/pages.yml` on push to `main` in the `site/` directory.
