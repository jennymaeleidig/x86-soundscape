# Warden scope

Warden's audit walks tracked source files. The project's exclusions live in `.pi/pi-warden.json`, which is
gitignored and local to each checkout; each developer also decides which extensions count as source in the
user config, because that list widens what the audit sends to the model.

## Per-developer setup

Create the local `.pi/pi-warden.json` with the project exclusions:

```json
{
  "rules": {
    "exclude": ["src/assets/**", "src/favicon.ico", "package-lock.json"],
    "skip": ["docs/adr/**", "docs/agents/**", "CITATION.cff"]
  }
}
```

Then add the source extensions the built-in set does not cover to `rules.auditExtensions` in
`~/.pi/agent/pi-warden/config.json`:

```json
"auditExtensions": ["md", "css", "html", "json"]
```

The built-in set already covers `ts` and `mjs`. The repositories' TypeScript, harness scripts, styles,
Angular templates, and JSON configuration are audited once these entries are present. Warden reads both
config files at session start, so restart the session (or `/new`) after editing them.

## Excluded paths

`rules.exclude` stops a path before it is sent, in the audit and in the live per-edit guard.

| Path | Why |
| --- | --- |
| `src/assets/**` | Bundled media, images, cursors, animated icons, font, and Winamp skin; binary assets, not source. |
| `src/favicon.ico` | Browser icon, binary. |
| `package-lock.json` | Generated lockfile; not hand-edited. |

## Skipped paths

`rules.skip` leaves a path out of judging but still lets a live edit reach the guard unless the extension is
also binary. These are records and docs a code rule should not read as new code.

| Path | Why |
| --- | --- |
| `docs/adr/**` | Architecture decision records; the reasoning those rules ask code to cite. |
| `docs/agents/**` | Agent-facing setup documents, including this file. |
| `CITATION.cff` | Citation metadata, not source. |

## Paths the walk cannot see

Warden never discovers a dot-path or an extensionless file. They are not missing from the audit by accident;
they are judged only when named. The repository has:

- Dot-paths: `.editorconfig`, `.gitignore`, `.husky/pre-commit`, `.husky/pre-push`, `.postcssrc.json`,
  `.tool-versions`, `src/assets/.gitkeep`
- Extensionless: `CNAME`

Live edits to these paths are judged like any other path. To audit one explicitly, name it:

```text
/warden rules audit .postcssrc.json .husky/pre-commit .husky/pre-push CNAME
```

`src/assets/.gitkeep` is also covered by `src/assets/**`, so naming it selects nothing.

## Verification

```text
/warden rules
/warden status
/warden rules audit . --max 200
```

With the local project file in place, the audit counts 112 files: 77 `.ts`, 12 `.html`, 11 `.css`, 6
`.json`, 4 `.md`, and 3 `.mjs`. An untracked source file such as `harness/jsconfig.json` adds one, so this
working tree counts 113.
`--max 200` sits above both, so the dialog count is not truncated.
