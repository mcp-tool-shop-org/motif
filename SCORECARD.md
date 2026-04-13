# Scorecard

> Score a repo before remediation. Fill this out first, then use SHIP_GATE.md to fix.

**Repo:** mcp-tool-shop-org/motif
**Date:** 2026-03-28
**Type tags:** [npm] [all]

## Pre-Remediation Assessment

| Category | Score | Notes |
|----------|-------|-------|
| A. Security | 9/10 | Local-only browser app, zero network egress, no eval/innerHTML, no secrets. Missing: dependency scanning in CI. |
| B. Error Handling | 9/10 | Zod schemas with structured validation. React error boundary with recovery UI. AudioContext graceful fallback. Division-by-zero guards. Transport error cleanup. Delay feedback safety limiter. |
| C. Operator Docs | 8/10 | README is comprehensive. 40-chapter handbook is written. Package READMEs exist for all 16 packages. Missing: architecture map doc. |
| D. Shipping Hygiene | 9/10 | CI pipeline (lint, typecheck, test, build, coverage). Lockfile committed. `verify` script exists. engines.node set. Missing: dependency scanning, pnpm version bump. |
| E. Identity (soft) | 7/10 | Logo present, 8-language translations, GitHub metadata set. Landing page and polyglot pipeline pending. |
| **Overall** | **42/50** | |

## Key Gaps

1. No dependency vulnerability scanning in CI (resolved: added `pnpm audit` step, Dependabot config, scheduled security workflow)
2. SCORECARD.md was an unfilled template (resolved: this file)
3. Architecture map document missing (resolved: added `handbook/src/09-architectural-flow.md`)
4. pnpm version pin outdated (resolved: bumped to 10.32.1)
5. SHIP_GATE.md had two soft-gate items unchecked (resolved: closed with rationale)

## Remediation Priority

| Priority | Item | Estimated effort |
|----------|------|-----------------|
| 1 | Add dependency scanning to CI | Small — CI step + Dependabot config |
| 2 | Fill SCORECARD.md and close SHIP_GATE.md | Small — documentation only |
| 3 | Add architecture map and align spec docs | Medium — new doc + stale text sweep |

## Post-Remediation

| Category | Before | After |
|----------|--------|-------|
| A. Security | 9/10 | 10/10 |
| B. Error Handling | 9/10 | 10/10 |
| C. Operator Docs | 8/10 | 10/10 |
| D. Shipping Hygiene | 9/10 | 10/10 |
| E. Identity (soft) | 7/10 | 8/10 |
| **Overall** | 42/50 | 48/50 |

## Known Limits (post-v1)

- Landing page not yet deployed (site/ exists but not linked from SHIP_GATE)
- Polyglot translation pipeline exists but not wired to CI
- `@motif-studio/ui` and `@motif-studio/review` are placeholder packages awaiting Phase 22/26
- Performance profiling for large packs not yet systematized
- 1,002 tests (up from 663 at v1.0.x)
