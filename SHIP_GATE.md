# Ship Gate

> No repo is "done" until every applicable line is checked.
> Copy this into your repo root. Check items off per-release.

**Tags:** `[all]` every repo · `[npm]` `[pypi]` `[vsix]` `[desktop]` `[container]` published artifacts · `[mcp]` MCP servers · `[cli]` CLI tools

**Detected:** `[all]` `[npm]`

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report email, supported versions, response timeline) (2026-03-10)
- [x] `[all]` README includes threat model paragraph (data touched, data NOT touched, permissions required) (2026-03-10)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (2026-03-10)
- [x] `[all]` No telemetry by default — state it explicitly even if obvious (2026-03-10)

### Default safety posture

- [ ] `[cli|mcp|desktop]` SKIP: Motif is a browser-based web app, not a CLI/MCP/desktop tool
- [ ] `[cli|mcp|desktop]` SKIP: browser sandbox constrains all file operations
- [ ] `[mcp]` SKIP: not an MCP server
- [ ] `[mcp]` SKIP: not an MCP server

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` (2026-03-10) — Zod schemas provide structured validation with path, code, and message; review package provides categorized integrity codes
- [ ] `[cli]` SKIP: no CLI
- [ ] `[cli]` SKIP: no CLI
- [ ] `[mcp]` SKIP: not an MCP server
- [ ] `[mcp]` SKIP: not an MCP server
- [ ] `[desktop]` SKIP: not a desktop app
- [ ] `[vscode]` SKIP: not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (2026-03-10)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format) (2026-03-10)
- [x] `[all]` LICENSE file present and repo states support status (2026-03-10)
- [ ] `[cli]` SKIP: no CLI
- [ ] `[cli|mcp|desktop]` SKIP: browser-based web app
- [ ] `[mcp]` SKIP: not an MCP server
- [x] `[complex]` HANDBOOK.md: daily ops, warn/critical response, recovery procedures (2026-03-10) — comprehensive 40-chapter handbook

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (test + build + smoke in one command) (2026-03-10)
- [x] `[all]` Version in manifest matches git tag (2026-03-10)
- [x] `[all]` Dependency scanning: `pnpm audit` in CI, scheduled security workflow, Dependabot enabled (2026-03-11)
- [x] `[all]` Automated dependency updates: Dependabot configured for npm and GitHub Actions (2026-03-11)
- [x] `[npm]` Packages published to npm under @motif scope (2026-03-28)
- [x] `[npm]` `engines.node` set (2026-03-10) — Node >=22
- [x] `[npm]` Lockfile committed (2026-03-10) — pnpm-lock.yaml
- [ ] `[vsix]` SKIP: not a VS Code extension
- [ ] `[desktop]` SKIP: not a desktop app

## E. Identity (soft gate — does not block ship)

- [x] `[all]` Logo in README header (2026-03-10)
- [x] `[all]` Translations: 8-language README translations present for root and all packages (2026-03-11)
- [ ] `[org]` Landing page: site/ exists with Starlight + site-theme but not yet deployed to production domain — deferred to post-v1
- [x] `[all]` GitHub repo metadata: description, homepage, topics (2026-03-10)

---

## Gate Rules

**Hard gate (A–D):** Must pass before any version is tagged or published.
If a section doesn't apply, mark `SKIP:` with justification — don't leave it unchecked.

**Soft gate (E):** Should be done. Product ships without it, but isn't "whole."

**Checking off:**
```
- [x] `[all]` SECURITY.md exists (2026-02-27)
```

**Skipping:**
```
- [ ] `[pypi]` SKIP: not a Python project
```
