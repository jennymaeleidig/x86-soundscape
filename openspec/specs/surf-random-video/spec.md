# Surf Random Video

## Purpose

Select and play a random video from archive.org collections in the browser, driven by a client-side channel→collection allowlist and playable-format filter, with no backend dependency. Replaces the former `x86-ad-agent` (LangChain/OpenAI) backend with direct browser-to-archive.org calls.

## Requirements

### Requirement: Random video from a channel

The system SHALL allow the surfer to select a random playable video from archive.org, scoped to a channel. A channel maps to one or more collections. The system SHALL select a random collection from the channel and fetch a random item from that collection, returning `{url, title, uploader, duration}` with a browser-playable video URL.

#### Scenario: Surf selects a random video

- **WHEN** the surfer invokes a video for channel `"Somewhat Commercial"`
- **THEN** the system returns a video object with non-empty `url`, `title`, and `uploader`, and a numeric `duration`
- **AND** the `url` points to `archive.org/download/<identifier>/<encodedFileName>` for a file whose format is browser-playable

#### Scenario: Each channel maps to its curated collections

- **WHEN** the system resolves the channel `"Kids Korner"`
- **THEN** it selects from the collections `["vhskids", "vhsinstructionals", "saturdaymorningcartoons"]`
- **AND** the complete five-channel allowlist (`somewhat_commercial`, `vhs_vault`, `anime_all_access`, `gamer_nation`, `kids_korner`) is preserved verbatim from `x86-ad-agent`'s `channels.py`

### Requirement: Randomness is per-invocation

The system SHALL produce a different random video across successive invocations for the same channel. Randomness SHALL be derived from a client-side random page selection over archive.org's `page` pagination parameter.

#### Scenario: Successive surfs return different videos

- **WHEN** the surfer invokes a video for the same channel twice in succession
- **THEN** the two invocations select from random pages and return different identifiers (to the extent the collection's result set permits)

#### Scenario: Random page is within the valid range

- **WHEN** a channel's collection search reports `numFound` results
- **THEN** the system selects a random page in `[1, min(ceil(numFound / 20), 500)]` for the `rows=20` page-fetch request
- **AND** the page is clamped to at most `500` (offset ≤ 10000) to stay within archive.org's deep-paging limit, because responses beyond 10000 results return a `[DEEP_PAGING]` error JSON that omits the CORS `Access-Control-Allow-Origin` header (the browser then blocks it as a CORS failure)
- **AND** the system does not rely on `sort[]=random` (a fixed Solr permutation that returns the same ordering on every call) or the `start` parameter (silently ignored by `advancedsearch.php`)

### Requirement: Only browser-playable video formats are selected

The system SHALL select only video files whose format the browser `<video>` element can play. The accepted formats SHALL be `["h.264", "h.264 IA", "h.264 720P", "MPEG4", "WebM"]`. The system SHALL apply this filter at both the item level (prefiltering search-result candidates) and the file level (picking the playable file from an item's metadata).

#### Scenario: Item-level format prefilter selects only playable candidates

- **WHEN** the system fetches a page of search results with `fl[]=identifier&fl[]=format`
- **THEN** it filters candidates to those whose item-level `format` array intersects the accepted-formats set
- **AND** selects the first such candidate before fetching its item metadata

#### Scenario: File-level format filter picks a playable file

- **WHEN** the system fetches an item's metadata (`/metadata/<identifier>`)
- **THEN** it selects the first file in `files[]` whose `format` is in the accepted-formats set
- **AND** builds the video URL as `https://archive.org/download/<identifier>/<encodeURIComponent(file.name)>`

#### Scenario: Non-playable formats are excluded

- **WHEN** an item's files include only formats outside the accepted set (e.g. `Matroska`, `Windows Media`, `Cinepack`)
- **THEN** the item yields no video file and counts as a degenerate candidate

### Requirement: Video object field mapping

The system SHALL return a video object with fields mapped faithfully from archive.org metadata. `title` SHALL come from `metadata.title`; `uploader` SHALL come from `metadata.uploader` with a default of `"Unknown uploader"` when absent; `duration` SHALL be parsed as a float from the file's `length` field; `url` SHALL be the constructed download URL.

#### Scenario: Fields map from archive.org metadata

- **WHEN** the system builds a video object from an item's metadata and selected file
- **THEN** `title` equals the item `metadata.title`
- **AND** `uploader` equals the item `metadata.uploader`, or `"Unknown uploader"` if `metadata.uploader` is absent
- **AND** `duration` equals `parseFloat(file.length)`
- **AND** `url` equals `https://archive.org/download/<identifier>/<encodeURIComponent(file.name)>`

#### Scenario: Filenames with special characters are encoded

- **WHEN** a playable file's name contains spaces, parentheses, or ampersands (e.g. `"Nick Toons UK Adverts & Continuity (2009).mp4"`)
- **THEN** the `url` percent-encodes the filename via `encodeURIComponent` so the `<video>` element can fetch it

### Requirement: Page-level retry on degenerate candidates

The system SHALL retry page selection up to 3 times per video request when a page yields no candidate that passes the format prefilter or whose metadata yields no playable file. The system SHALL fetch the result count once per request (not per retry attempt) and emit an error only after all 3 attempts are exhausted.

The retry contract SHALL be verified by a runnable unit test (`archive.service.spec.ts`) that stubs the archive.org HTTP responses via `HttpTestingController` and asserts: a playable candidate on the first page returns a video with correct field mapping (exactly 3 network calls); a degenerate page triggers a re-roll up to 3 attempts; all 3 attempts exhausted emits an error; and the count fetch occurs exactly once per subscribe across retries. The test SHALL execute under the jest builder (Node + jsdom) without a browser.

#### Scenario: Playable candidate on first page

- **WHEN** the first random page yields a candidate that passes the format prefilter and whose metadata contains a playable file
- **THEN** the system returns the video without additional page fetches
- **AND** makes exactly 3 network calls (count, page, metadata)
- **AND** the `archive.service.spec.ts` `HttpTestingController` stubs verify this outcome under jest

#### Scenario: Degenerate page triggers a re-roll

- **WHEN** a random page yields no candidate passing the format prefilter
- **THEN** the system selects a new random page and retries, up to 3 attempts total
- **AND** the spec asserts the re-roll occurs by flushing a second page after a degenerate first page

#### Scenario: All attempts exhausted emits an error

- **WHEN** all 3 page attempts yield no playable file
- **THEN** the system emits an error observable
- **AND** the count fetch occurred exactly once across the 3 attempts
- **AND** the spec asserts the error is emitted and that the count request occurred exactly once (`httpMock.verify()` catches any second count)

#### Scenario: Spec is jasmine-free and jest-runnable

- **WHEN** the `archive.service.spec.ts` is compiled and run under the jest builder
- **THEN** it contains no `fail(...)` calls (a jasmine global absent in jest)
- **AND** error paths use jest-idiomatic `done(e)` or `throw new Error(...)` to fail the `jest.DoneCallback` callback
- **AND** the spec type-checks and passes under `ng test`

### Requirement: Network-level retry at the component

The surfer component SHALL apply a network retry of 5 on the video observable returned by the archive service. This retry SHALL handle transient network failures (not degenerate-page errors, which the service absorbs internally).

#### Scenario: Transient network failure retries

- **WHEN** an archive.org fetch fails transiently (e.g. a network blip)
- **THEN** the component's `retry(5)` re-subscribes to the service observable
- **AND** each re-subscribe fetches a fresh count (the service does not cache counts)

### Requirement: No backend dependency

The system SHALL fetch videos directly from archive.org in the browser with no backend service. The system SHALL NOT require the `x86-ad-agent` Northflank service, an OpenAI API key, or any Internet Archive credentials (the read APIs are public and CORS-enabled).

#### Scenario: Direct browser-to-archive.org calls

- **WHEN** the surfer requests a video
- **THEN** the archive service calls `archive.org/advancedsearch.php` and `archive.org/metadata/<id>` directly from the browser
- **AND** no request is made to any `x86-agent` host
- **AND** no credentials or API keys are required or present in the client

### Requirement: X86_AGENT_ROOT plumbing removed

The system SHALL remove the `X86_AGENT_ROOT` injection token, the `X86_AGENT_ROOT` environment field, and its provider in `app.config.ts`. The `VideoData` shape (`url`, `title`, `uploader`, `duration`) consumed by the surfer component template SHALL be preserved so the template is unchanged.

#### Scenario: Surfer component uses ArchiveService

- **WHEN** the surfer component requests a video
- **THEN** it injects `ArchiveService` and calls its `randomVideo(channel)` method
- **AND** does not inject or reference the `X86_AGENT_ROOT` token

#### Scenario: Template data shape preserved

- **WHEN** the archive service returns a video object
- **THEN** it exposes `url`, `title`, `uploader`, and `duration` properties
- **AND** the surfer component template binds to them unchanged

### Requirement: Unit tests run under jest without a browser

The project's test suite SHALL execute under the `@angular-devkit/build-angular:jest` builder (Node + jsdom), with no browser binary required. The test target SHALL NOT depend on karma, karma-chrome-launcher, a Chrome/Chromium binary, or `CHROME_BIN`. `ng test` SHALL exit 0 when the kept spec passes.

#### Scenario: ng test runs green in Node + jsdom

- **WHEN** a developer runs `ng test`
- **THEN** the jest builder executes the suite in Node + jsdom
- **AND** no browser process is launched
- **AND** no browser binary or `CHROME_BIN` is required
- **AND** `ng test` exits 0 when the kept `archive.service.spec.ts` passes

#### Scenario: global styles do not break the test build

- **WHEN** `src/styles.css` contains `@import "tailwindcss"` and `url("assets/images/*.png")` cursor references
- **THEN** the test build does not attempt to resolve those `url()`s against `node_modules`
- **AND** the jest builder's configuration carries no `styles` or `assets` options (so global CSS is never loaded into a render engine)

#### Scenario: karma devDependencies are absent

- **WHEN** a developer inspects `package.json` after the migration
- **THEN** none of `karma`, `karma-chrome-launcher`, `karma-coverage`, `karma-jasmine`, `karma-jasmine-html-reporter`, `jasmine-core`, `@types/jasmine` are listed in `devDependencies`
- **AND** `jest`, `jest-environment-jsdom`, and `@types/jest` are listed in `devDependencies`

#### Scenario: spec types resolve to jest

- **WHEN** the TypeScript compiler resolves global test types
- **THEN** `tsconfig.spec.json` declares `"types": ["jest"]`
- **AND** test globals (`describe`, `it`, `expect`, `beforeEach`, `afterEach`, `jest.DoneCallback`) resolve against `@types/jest`

### Requirement: Surf overlays track the macintosh image coordinate system

The surf overlays — the video container, the surf button, and the surf-info marquee — SHALL be expressed in container-relative units relative to `#surfer`, which SHALL be a container query context (`container-type: inline-size`). The surf-info font SHALL NOT use viewport-relative units (`vw`); it and the surf-button label SHALL scale with the container (e.g. `cqw`). The macintosh image SHALL shrink on narrow viewports via `max-w` + `object-contain` so the whole visualizer fits without `transform: scale()`. This replaces the current `#surf-info { font-size: 1vw }`, which drifts relative to the image at every viewport except one.

#### Scenario: Overlays align with the macintosh bezel at intrinsic size

- **WHEN** `#surfer` renders at the macintosh image's intrinsic size (wide viewport)
- **THEN** the video, surf button, and surf-info align with the image's bezel cutouts
- **AND** the surf-info font is container-relative (not `1vw`)

#### Scenario: Overlays stay aligned when the visualizer shrinks

- **WHEN** `#surfer` is constrained below its intrinsic size (narrow viewport)
- **THEN** the macintosh image shrinks via `object-contain` under a `max-w` constraint
- **AND** the video, surf button, and surf-info remain aligned with the image's bezel
- **AND** the surf-info text and surf-button label scale with the container (via `cqw` or equivalent), not with the viewport
- **AND** no `transform: scale()` is applied to `#surfer` or the visualizer window
