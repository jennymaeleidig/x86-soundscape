# Language servers

pi-lens launches the language servers itself; there is no separate LSP client to install or point at
the repo. Verification ran with Node 24.3.0, `typescript-language-server` 6.1.0, and Marksman
2026-02-08.

## Install

Run `npm install` first so the TypeScript server can resolve Angular dependencies from
`node_modules`. Install the pinned servers with mise from the repo root:

```bash
mise install
```

`.tool-versions` owns all three tools: Node, `npm:typescript-language-server`, and `marksman`. No
server is a package dependency, and there is no project `.pi-lens.json`: the host's defaults select
the servers, and its gitignore-backed ignore set covers `node_modules/`, `dist/`, `tmp/`, and
`.scratch/`.

## Project roots

| Files | Root marker | Notes |
| --- | --- | --- |
| Application TypeScript | `tsconfig.json` | Excludes `node_modules`, `dist`, and `tmp` |
| Markdown | `.git` | No `.marksman.toml`; Marksman skips gitignored paths |
| CSS, HTML, JSON | file's directory | Host-managed servers |

## Verified buckets

Attribution came from the probe's finding tag, or from `documentSymbol` where the server reports no
error.

| Bucket | Server | Probe | Result |
| --- | --- | --- | --- |
| TypeScript | `typescript` | `export const n: number = "s";` | `[typescript]` 2322 |
| CSS | `css` | `a { color: ; }` | `[css]` `css-propertyvalueexpected` |
| HTML | `html` | `documentSymbol` on a `<div><span>` probe | Both symbols returned by the HTML server |
| JSON | `json` | `{"a":1,}` | `[json]` 519 |
| Markdown | `Marksman` | `[broken](no-such-file.md)` | `[Marksman]` warning 2 |

## Not covered

- `.husky/pre-commit` and `.husky/pre-push` are extensionless POSIX shell hooks.
  `bash-language-server` covers only `.sh` and `.bash`, so no server selects them.
- `src/assets/**` (images, audio, cursors, fonts), `src/favicon.ico`, `CNAME`, `CITATION.cff`,
  `.editorconfig`, and `.tool-versions` are assets and metadata, not source languages.

## Re-probing

Write a one-error probe in a tracked path, query it, read the outcome line and the finding's tag,
then delete the probe. Marksman ignores gitignored paths, so `tmp/` probes never reach it.

```json
lens_diagnostics { "source": "lsp", "scope": "paths", "paths": ["path/to/probe.ts"],
                   "severity": "all", "waitMs": 20000 }
```

Use `lsp_navigation` with `operation: "documentSymbol"` for HTML. A probe is a pass only when the
outcome says `findings` or `clean` and the tag names the intended server.

Check the project directly as well:

```bash
npx tsc -p tsconfig.json --noEmit
```

A warm server keeps its old root and initialization options. Restart the pi session after changing
a root marker or server config before re-probing.
