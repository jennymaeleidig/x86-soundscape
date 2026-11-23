# Coding standards

## system.css

`@sakun/system.css` is the source of truth for OS chrome; Tailwind is for layout and spacing. Reach for the
library first; a bespoke look is the last resort.

Import it at the top of the component CSS that uses it, never in `src/styles.css`. Build the markup the
library documents: padding and hover live on specific elements, so structure is the styling. A dropdown row
is `<li role="menu-item"><a>` — the anchor carries the padding — and rows that must line up get the same
elements, not a margin imitating one.

Overrides live in the component's CSS, target as narrowly as the change allows, and carry a comment naming
the library rule and why the app differs. `::ng-deep` is only for reaching third-party internals, next to
the component that owns the markup, with a comment. Use the library's spacing tokens from `src/styles.css`
rather than new numbers.

A readout row keeps the documented `<a>` for padding with `aria-disabled="true"` and drops the hover invert
in one scoped rule: the library ships no disabled menu row. Dividers are the library's own —
`class="divider"` on the row it closes, an empty `[role="menu-item"].divider` row between rows, or `<hr>`
for a solid rule.

## Angular

Standalone components only, one per folder as `src/app/components/<name>/<name>.component.{ts,html,css}`
with its spec beside it. Services are one module per domain under `src/app/services/<domain>/`, with plain
domain modules beside the `@Injectable`. Static data lives in TypeScript next to its consumer; `assets/` is
only for files a browser fetches and the applet definitions.

Shared state is one published signal owned by the module whose state it is: a private signal with
`readonly state = ...asReadonly()`. Consumers derive with `computed`, never a getter or method the template
re-derives.

Strict TypeScript and templates are on: reach for `unknown` and narrow. Constructor injection, including
`@Inject` for tokens. `useDefineForClassFields` is false, so parameter properties are assigned before field
initializers.
