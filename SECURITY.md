# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.2.x   | Yes       |
| 1.1.x   | Yes       |
| 1.0.x   | Yes       |

## Reporting a Vulnerability

Email: **64996768+mcp-tool-shop@users.noreply.github.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Version affected
- Potential impact

### Response timeline

| Action | Target |
|--------|--------|
| Acknowledge report | 48 hours |
| Assess severity | 7 days |
| Release fix | 30 days |

## Scope

Motif is a **local-only** adaptive soundtrack authoring studio.

- **Data touched:** User-created soundtrack pack files (JSON), audio asset references, project metadata stored in browser local storage
- **Data NOT touched:** No server-side storage, no cloud sync, no file system access beyond browser sandbox
- **No network egress** — all authoring and playback happens client-side
- **No secrets handling** — does not read, store, or transmit credentials
- **No telemetry** is collected or sent
- **Permissions required:** None beyond standard browser APIs (Web Audio API)
