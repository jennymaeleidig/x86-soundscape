## Agent skills

### Issue tracker

Issues live in GitHub Issues, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, each with a label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `GLOSSARY.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.

### Coding standards

Read `CODING_STANDARDS.md` before writing or reviewing code — formatting, the system.css markup rules, and
the Angular and test conventions.

### Language servers

Editor diagnostics come from pi-lens language servers. See `docs/agents/lsp.md`.

### Warden scope

Audit scope and exclusions live in the local, gitignored `.pi/pi-warden.json`; each developer adds the extra
source extensions to their user config. See `docs/agents/warden.md`.
