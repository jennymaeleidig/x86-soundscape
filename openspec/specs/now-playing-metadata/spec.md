# now-playing-metadata

> Capability: data-driven, per-track live-metadata parsing and fetching for radio stations.

## Purpose

Defines how the embedded player resolves live now-playing metadata for each radio station: a single `metadataParser` config field travels with each `TrackWithMeta` in `songs.ts`, its `kind` drives both the fetch strategy and the extraction rule, and a unified `getNowPlaying` returns a structured `{ artist, title }` pair that feeds the menu-bar display and the Media Session bridge from one source of truth. Per-station field paths and protocol choices are validated by spikes against live station responses.

## Requirements

### Requirement: Per-track parser config drives fetch and extraction

Each track in `songs.ts` SHALL carry an optional `metadataParser` field on `TrackWithMeta` whose `kind` drives both how live metadata is fetched and how it is extracted from the response. Adding or removing a station in `songs.ts` SHALL NOT require editing any fetch or parser code in `MetadataService`. The `metadataSource` enum and field SHALL be removed; `kind` is the single source of truth.

#### Scenario: Adding a new station requires no parser-code edits

- **WHEN** a developer adds a new station to `songs.ts` with a `metadataParser` config
- **THEN** no code in `MetadataService` is edited
- **AND** the station's live metadata is resolved by the fetch path and extraction rule selected by the track's `kind`

#### Scenario: Removing a station leaves no dead parser code

- **WHEN** a developer removes a track from `songs.ts`
- **THEN** no orphaned parser branch or fetch path remains in `MetadataService`

#### Scenario: Renaming a station does not break parsing

- **WHEN** a developer renames a station's `metaData.artist` or `metaData.title` in `songs.ts`
- **THEN** live metadata parsing continues to work
- **AND** parsing is not dependent on string-matching the station display name

#### Scenario: No `metadataSource` enum remains

- **WHEN** the change is applied
- **THEN** the `MetadataSource` enum and the `metadataSource` field on `TrackWithMeta` are absent
- **AND** station protocol is expressed solely via `metadataParser.kind`

### Requirement: Discriminated-union config shape by station protocol

The `metadataParser` config SHALL be a discriminated union keyed by `kind`. The `'icy'` kind SHALL be the built-in default (usable when omitted) that reads `metadata.icy.StreamTitle`. The `'icestats'` kind SHALL declare `sourceIndex?` (present = array case, absent = object case), `titleField: string`, and `artistField?: string`. The `'stats'` kind SHALL select the SHOUTcast v2 fetch source. The `'azuracast'` kind SHALL declare `shortcode: string` and fetch the station's AzuraCast REST now-playing endpoint. The config SHALL be typed so typo'd field names are caught at compile time.

#### Scenario: Icy track with no explicit config

- **WHEN** an Icy track omits `metadataParser` from its `TrackWithMeta`
- **THEN** the parser applies the built-in Icy default (read `StreamTitle`, split on first `' - '`)

#### Scenario: IceStats track with array-source config

- **WHEN** an IceStats track declares `{ kind: 'icestats', sourceIndex: 0, titleField: 'yp_currently_playing' }`
- **THEN** the parser reads `metadata.icestats.source[0].yp_currently_playing` as the title

#### Scenario: IceStats track with object-source config

- **WHEN** an IceStats track declares `{ kind: 'icestats', titleField: 'yp_currently_playing' }` (no `sourceIndex`)
- **THEN** the parser reads `metadata.icestats.source.yp_currently_playing` as the title

#### Scenario: IceStats track with optional artist field

- **WHEN** an IceStats track declares `{ kind: 'icestats', sourceIndex: 0, titleField: 'yp_currently_playing', artistField: 'artist' }`
- **THEN** the parser reads both the title and artist from the source
- **WHEN** `artistField` is omitted
- **THEN** the parser falls back to the station descriptor as the artist

#### Scenario: AzuraCast track config

- **WHEN** an AzuraCast station declares `{ kind: 'azuracast', shortcode: 'isekoi' }`
- **THEN** the fetch layer calls `GET {origin}/api/nowplaying/isekoi` at the shared poll interval
- **AND** the parser reads `now_playing.song.artist` and `now_playing.song.title` as separate fields

#### Scenario: STATS track config

- **WHEN** a SHOUTcast v2 station declares `{ kind: 'stats' }`
- **THEN** the fetch layer uses the `stats` source via `icecast-metadata-stats`
- **AND** the extract path is determined by a spike (falling back to the station descriptor if none is parseable)

### Requirement: Fetch layer dispatches on kind, not on a protocol enum

`MetadataService.start(track)` SHALL select the fetch strategy from `track.metadataParser.kind`. Kinds `'icy'`, `'icestats'`, and `'stats'` SHALL fetch via `icecast-metadata-stats` with the matching source. Kind `'azuracast'` SHALL bypass `icecast-metadata-stats` and fetch `GET {origin}/api/nowplaying/{shortcode}` directly at the shared 15 s interval. All kinds SHALL expose the same `start(track)` / `stop()` / onStats-callback handshake so `WinampService.onTrackDidChange` is unchanged.

#### Scenario: Icecast-protocol station fetches via icecast-metadata-stats

- **WHEN** `start` is called for a track with `kind: 'icestats'`
- **THEN** the fetch uses `icecast-metadata-stats` configured with `sources: ['icestats']`

#### Scenario: AzuraCast station fetches via direct REST

- **WHEN** `start` is called for a track with `kind: 'azuracast'` and `shortcode: 'chill'`
- **THEN** the fetch layer issues `GET {origin}/api/nowplaying/chill` every 15 s
- **AND** `icecast-metadata-stats` is not used for that track

#### Scenario: Stop clears the active fetch regardless of kind

- **WHEN** `stop()` is called
- **THEN** the active fetcher (IcecastStats listener or AzuraCast poller) is stopped and dereferenced

### Requirement: Unified parser returns structured `{ artist, title }`

`MetadataService` SHALL expose `getNowPlaying(metadata): { artist: string; title: string }` that replaces the string-returning `getTitleFromMetadata`. The method SHALL return a structured pair derived from the track's `metadataParser` config (or the built-in Icy default). The pair SHALL be the single source of truth for both the menu-bar display and the Media Session bridge.

#### Scenario: Live metadata resolves structured pair

- **WHEN** a poll delivers metadata and the track has a matching `metadataParser` config
- **THEN** `getNowPlaying` returns `{ artist, title }` with the live values per the config
- **AND** no separate artist-derivation code path exists

#### Scenario: Phase-1 / fallback returns station descriptor

- **WHEN** no poll has arrived yet, or parsing fails, or a track lacks a `metadataParser` config
- **THEN** `getNowPlaying` returns `{ artist: track.metaData.artist, title: track.metaData.title }`
- **AND** the lock-screen display shows the station descriptor (not doubled)

### Requirement: Icy parser splits StreamTitle on first `' - '`

For Icy tracks, the parser SHALL read `metadata.icy.StreamTitle` and split on the first occurrence of `' - '` (space-hyphen-space). If found: `{ artist: substring before, title: substring after }`. If not found: `{ title: the whole StreamTitle, artist: the station descriptor }`. The split SHALL occur only at the first match so titles containing `' - '` after the artist separator are preserved.

#### Scenario: Splittable StreamTitle

- **WHEN** `StreamTitle` is `"Brian Eno - Music for Airports"`
- **THEN** the parser returns `{ artist: "Brian Eno", title: "Music for Airports" }`

#### Scenario: StreamTitle with no separator

- **WHEN** `StreamTitle` is `"Groove Salad: [Ambient]"`
- **THEN** the parser returns `{ title: "Groove Salad: [Ambient]", artist: <station descriptor> }`

#### Scenario: Title contains additional hyphens

- **WHEN** `StreamTitle` is `"Various - Ambient - Volume 2"`
- **THEN** the parser returns `{ artist: "Various", title: "Ambient - Volume 2" }`

### Requirement: AzuraCast parser uses the REST now-playing fields

For AzuraCast tracks, the parser SHALL extract `artist` from `now_playing.song.artist` and `title` from `now_playing.song.title` (separate, un-truncated fields). The parser SHALL NOT use the freeform `now_playing.song.text` field. The fetch SHALL target `/api/nowplaying/{shortcode}` (not `status-json.xsl`, which 404s on AzuraCast).

#### Scenario: AzuraCast station resolves live artist and title

- **WHEN** the AzuraCast REST poll returns `{ now_playing: { song: { artist: "LTJ Bukem", title: "Journey Inwards" } } }`
- **THEN** `getNowPlaying` returns `{ artist: "LTJ Bukem", title: "Journey Inwards" }`

### Requirement: Menu bar displays the structured pair

The menu bar SHALL consume `currentTrack$` as a `BehaviorSubject<{ artist, title }>` and format the pair as `"Artist - Title"` for display. The format SHALL replace the previous raw-string binding through `decodeHtmlString`.

#### Scenario: Menu shows formatted pair

- **WHEN** `getNowPlaying` returns `{ artist: "Brian Eno", title: "Music for Airports" }`
- **THEN** the menu bar displays `"Brian Eno - Music for Airports"`

#### Scenario: Menu shows station descriptor during loading

- **WHEN** the parser returns the Phase-1 fallback `{ artist: "soma fm", title: "Groove Salad" }`
- **THEN** the menu bar displays `"soma fm - Groove Salad"`

### Requirement: Station field paths are validated by a spike

Before implementation, spikes SHALL validate the field paths for the `icestats`, `stats`, and `azuracast` kinds against live station responses. The IceStats + AzuraCast spikes are already complete; the `stats` spike for `visual.shoutca.st` SHALL be performed during implementation. All magic array indices SHALL be removed from `MetadataService` code and lifted into per-track config.

#### Scenario: IceStats field paths validated by spike

- **WHEN** the spike inspects Nightwave Plaza's `status-json.xsl` response
- **THEN** the `metadataParser` config declares the validated `sourceIndex` and `titleField`
- **AND** no hardcoded `source[0]` index exists in `MetadataService`

#### Scenario: AzuraCast field paths validated by spike

- **WHEN** the spike inspects Isekoi's `/api/nowplaying/{shortcode}` response
- **THEN** the config declares `shortcode` and the parser reads `now_playing.song.{artist,title}`

#### Scenario: STATS field paths validated by spike

- **WHEN** the spike inspects a `visual.shoutca.st` station's now-playing response
- **THEN** the extract path is recorded
- **OR** if no parseable now-playing exists, the station falls back to the station descriptor (its current behavior)
