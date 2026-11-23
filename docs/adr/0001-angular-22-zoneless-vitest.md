# 1. Run the suite on Vitest and the app on Angular 22, zoneless

Date: 2026-11-22

## Status

Accepted

## Context

The framework and toolchain were a major behind: Angular 20 with zone-based change
detection, Jest through the `@angular-devkit/build-angular:jest` builder, and runtimes
pinned in `.tool-versions`. Angular 22 removed that Jest builder outright, is zoneless
by default, and requires Node >= 24.15 and TypeScript >= 6.0. The marquee library
(`@omnedia/ngx-marquee`) only supports Angular in its 4.x line, and that line pins its
peer range to Angular `^21.0.0`.

## Decision

- Run the app on Angular 22, zoneless: no `zone.js`, no `provideZoneChangeDetection`.
  Code that must trigger change detection signals it (a component input driven by a
  signal, as the mount spec now shows).
- Stay on TypeScript 6.0, not 7: Angular 22 supports `>=6.0.0 <6.1.0` only, so
  TypeScript 7 is out until Angular supports it.
- Run the tests on Angular's `@angular/build:unit-test` builder with Vitest, in jsdom
  with globals on. The suite keeps `describe`/`it`/`expect` global; `vi` replaces every
  Jest API. Fake timers fake the standard timers plus `queueMicrotask` — Vitest's
  default leaves `queueMicrotask` real, and the coalesced-source read rides on it.
- Pin runtimes in `mise.toml` (Node 24.22.3), replacing `.tool-versions`.
- Set `legacy-peer-deps=true` in `.npmrc`, repo-wide, until ngx-marquee lifts its
  Angular `^21` peer range. This is the one deliberate loosening: npm otherwise
  refuses every install of Angular 22 alongside ngx-marquee 4.

## Consequences

- Installs need no flags, but npm no longer enforces ngx-marquee's peer range; a
  broken marquee would surface at build or runtime, not at install. Watch
  ngx-marquee releases and drop the `.npmrc` line when its peers include Angular 22.
- Zoneless shifts the contract: mutating state that no signal covers is no longer
  picked up by a tick. The suite's mount spec pins this with a signal-driven binding.
- `tsc -p tsconfig.json` now also typechecks the specs (types `vitest/globals`), while
  `tsconfig.app.json` and `tsconfig.spec.json` keep their own `types`, so the app build
  never sees test globals.
- The select container's `selectOnClick` is set imperatively in the Desktop's
  `ngAfterViewInit` rather than by a template binding: the two-way `[(selectedItems)]`
  binding desynchronizes the binding slots of the inputs after it, so Angular 22
  silently drops a `[selectOnClick]` binding. If a framework update fixes that slot
  accounting, move the value back into the template.
