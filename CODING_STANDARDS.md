# Coding standards

How code is written here. `prettier`, `tsc` and `jest` are the whole toolchain — there is no linter, so
anything a linter would have caught is on review. Cite a rule by name when you flag it.

## Formatting

**Prettier owns the style, and `.editorconfig` configures it.** There is no `.prettierrc`: prettier reads
this repo's `.editorconfig`, so `indent_size = 2`, `insert_final_newline` and `quote_type = single` under
`[*.ts]` are what it enforces — it rewrites double quotes in TypeScript to single. `npm run pretty` writes
that style across `./**/*.{js,jsx,mjs,cjs,ts,tsx,json}`. Never hand-align or hand-wrap that code: run the
formatter and take its output.

**Husky formats for you, so stage after it.** `.husky/pre-commit` and `.husky/pre-push` both run
`npm run pretty`. The hook rewrites files in place, so a commit made from pre-format staging can differ
from the working tree: run `npm run pretty` first, then stage.

**HTML, CSS and Markdown are outside prettier's glob.** The hook never reformats them, so they are kept by
hand to the same style `.editorconfig` describes: UTF-8, two spaces, a final newline, no trailing
whitespace. Markdown is exempt from line length and trailing whitespace.

## The CSS library

`@sakun/system.css` (MIT, 0.1.11) is the source of truth for OS chrome: windows, menus, buttons, dialogs,
form controls, bevels, fonts. Tailwind (v4, via `@import "tailwindcss"` in `src/styles.css`) is for layout
and spacing. Reach for the library first; a bespoke look is the last resort.

**Import the library where you use it.** The first line of a component's CSS is
`@import "@sakun/system.css/dist/system.css";` — that is how `window`, `menu`, `applet`, `pop-up`,
`desktop` and `surfer` each opt in, and it keeps the library scoped to the component that needs it. Do not
add it to `src/styles.css`.

**Build the markup the library documents.** The library's own examples are the reference
(<https://sakofchit.github.io/system.css/>); structure follows from them, because the padding and hover
live on specific elements. A dropdown row is:

```html
<ul role="menu">
  <li role="menu-item"><a href="#menu">Action</a></li>
</ul>
```

The anchor is what carries `padding: 5px 20px` (`ul[role=menu] > [role=menu-item] > a`); a bare-text `li`
sits flush against the menu's left edge. When two rows must line up, give them the same elements — not a
margin that imitates one.

**Overrides are scoped and explained.** An app-specific rule goes in the component's own CSS, targeted as
narrowly as the change allows, with a comment that names the library rule and says why the app must differ.
`src/app/components/window/window.component.css` is the model: it quotes the library's `.window` rule, says
what broke without it, and sets `display: flex`. When an override exists only to make the app's markup
behave as the library expects, say that too — `menu.component.css` re-applies the menu-bar padding after
moving the items into `.menu-group-inner`, and the comment says its purpose is to keep appearance
byte-identical.

**`::ng-deep` only to reach third-party internals.** It pierces a library's component boundary, so it
carries a comment and stays next to the component that owns the markup (`menu.component.css` and
`surfer.component.css` both unsets `ngx-marquee`'s `.om-marquee-content` padding this way).

**Use the library's tokens for spacing**, not new numbers: `--box-shadow`, `--element-spacing`,
`--grouped-element-spacing` and friends are defined in `src/styles.css`.

## Angular

**Standalone components, no NgModules.** One component per folder:
`src/app/components/<name>/<name>.component.{ts,html,css}`, with its `.spec.ts` beside it.

**Services are one module per domain**: `src/app/services/<domain>/`, holding the `@Injectable` in
`<domain>.service.ts` and the plain domain modules beside it — `channels.ts`, `sounds.ts`,
`window.options.ts`, `ambience-labels.ts`. A module named for its domain keeps the short name
(`ambience/ambience.ts` holds the `AmbienceService`) rather than gaining a `.service` suffix.

**Static data lives in TypeScript next to its consumer**, not in `assets/`: `src/app/services/ambience/sounds.ts`
declares the sound library and its type. `assets/` is for what a browser fetches (audio, images, fonts) and
for the applet definitions under `src/assets/applets/`.

**Shared state is one published signal**, owned by the module whose state it is: the service keeps a private
signal and exposes `readonly state = this.currentState.asReadonly()`. Consumers derive from it with
`computed`, never with a getter or a method the template re-derives — that is what keeps two surfaces from
disagreeing about the same state.

**Strict is on, everywhere**: `strict`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`,
`noPropertyAccessFromIndexSignature`, plus `strictTemplates`, `strictInjectionParameters` and
`strictInputAccessModifiers` (`tsconfig.json`). Reach for `unknown` and narrow; `any` is not a tool here.

**Constructor injection, including `@Inject` for tokens** (`applet.component.ts`). `useDefineForClassFields`
is `false`, so parameter properties are assigned before field initializers: `readonly state = this.service.state`
as a field is safe.

**Test-only code lives in `src/testing/`** and is never imported by app code — `tsconfig.app.json` compiles
`files: ["src/main.ts"]`, so it does not ship. Doubles that a spec needs (`FakeAudio`) and global shims
(`jsdom-globals.ts`) belong there rather than copy-pasted per spec.

## Tests

**Jest, through Angular's jest builder** (`@angular-devkit/build-angular:jest`, `tsConfig.spec.json`),
running once — there is no watch mode. Specs sit beside what they test and are named for the behaviour:
`it('keeps Play, Stop, Shuffle and Volume working against the published state, Stop holding the Sound for
Play')`, not `it('should call stop')`.

**Assert what the listener sees.** Where a spec checks user-visible wording, it asserts the literal
`'Nothing playing'` rather than importing the constant that produces it, so changing the wording fails a
test instead of passing tautologically.

**Component specs import `../../../testing/jsdom-globals` first.** The webamp bundle and `ngx-marquee` read
browser globals at module-evaluation time, so the shim must be the first import in the file; the jsdom
environment supplies no media playback, so `FakeAudio` replaces `globalThis.Audio`.

**No probabilistic assertions.** A test that asserts a random draw picked something different must point
`Math.random` at a known value first — otherwise it fails once in thirty runs and teaches nothing.

**Run the suite with the sandbox environment**: `XDG_CONFIG_HOME=/tmp/ng-home/.config
BROWSERSLIST="last 2 chrome versions" CI=1 npx ng test`, and `--include=<path>` for a single spec. `CI=1`
avoids Angular's persistent cache aborting on teardown; the other two keep Angular's config and browserslist
lookups inside allowed paths. `npx ng build` before calling work done.

## Language and commits

**`CONTEXT.md` is the vocabulary.** Use its words in code, comments and UI copy; when a concept arrives
that the glossary lacks, add an entry there (one or two sentences, with an `_Avoid_` line) instead of
letting a second word for the same thing take root. `docs/agents/domain.md` says how.

**Wording shared by two surfaces lives in one module.** `src/app/services/ambience/ambience-labels.ts` is
the model: the Applet and the Menu read the same functions, so they cannot describe one state two ways.

**One change per commit, and only your files.** This checkout is shared, so stage the files your change
touched and nothing else, and let the message say what changed and why.
