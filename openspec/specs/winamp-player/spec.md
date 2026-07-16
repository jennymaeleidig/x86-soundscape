# winamp-player

> Capability: the embedded Webamp music player on the x86-soundscape desktop.

## Purpose

Defines the behavior of the Webamp-based music player embedded in the desktop shell: how it renders inside the desktop bounds, loads its bundled tracks and skins, drives live metadata on track change, exposes surface controls to the desktop, stacks above other windows, and (currently) is gated off on mobile viewports pending a dedicated mobile surface.

## Requirements

### Requirement: Player renders inside the desktop bounds

The player SHALL render as a child of the `desktop-bounds` container so that its position and drag bounds are constrained to the desktop area (below the menu bar, within screen edges). The render SHALL use Webamp 2.3.1's `renderInto(host)` instance API. The `#winamp` host element SHALL be positioned relative to `desktop-bounds` (via `relative` on the parent) and sized to fill it (`h-full`).

#### Scenario: Player appears inside the desktop area

- **WHEN** the `WinampComponent` view initializes inside `desktop-bounds`
- **THEN** the player renders as a DOM descendant of `desktop-bounds`
- **AND** the player is positioned within the desktop area rather than appended to `<body>`

#### Scenario: Drag floor reaches the full desktop area

- **WHEN** the user drags the Webamp window
- **THEN** the window can reach the bottom edge of the desktop area (not clipped to 75% viewport height)
- **AND** the window's containing block is `desktop-bounds` (so absolute positioning resolves against the desktop area, not the full viewport)

#### Scenario: Windows past the desktop edge are visually clipped

- **WHEN** the user drags a Webamp window past an edge of `desktop-bounds`
- **THEN** the window is visually clipped by `overflow: hidden` (it is not painted outside the desktop area)
- **AND** the window is NOT prevented from being dragged past the edge (Webamp has no drag-boundary API; `overflow: hidden` is visual-only, not a drag constraint)
- **AND** the window remains draggable and can be dragged back into view

#### Scenario: Browser support is checked before render

- **WHEN** the component initializes in an unsupported browser
- **THEN** `Webamp.browserIsSupported()` returns false
- **AND** the player does not attempt to render

### Requirement: Bundled track list and skins load on startup

The player SHALL load the project's bundled track list and the `classic_mac_v1.wsz` initial skin at construction time, with the `MacOS` skin available as an alternate.

#### Scenario: Initial skin and tracks are configured

- **WHEN** the `WinampService` constructs the `Webamp` instance
- **THEN** `initialTracks` is set to the bundled song list
- **AND** `initialSkin.url` points to the `classic_mac_v1.wsz` asset
- **AND** `availableSkins` includes the `MacOS` alternate skin

### Requirement: Track-change drives metadata announcement

When a new track starts loading, the player SHALL notify the `MetadataService` with the track's URL so live now-playing metadata is fetched per the track's `metadataParser.kind` and announced to the desktop. When no track is active, the `MetadataService` SHALL be stopped. The fetch strategy (Icecast transport via `icecast-metadata-stats`, or direct AzuraCast REST) is selected by `kind`, not by a protocol enum on the track.

#### Scenario: Track change announces metadata

- **WHEN** a new track starts loading
- **THEN** the `onTrackDidChange` callback is invoked with the track object
- **AND** the `MetadataService` is started for the matching bundled track (fetch path selected by `kind`)

#### Scenario: No active track stops metadata

- **WHEN** the `onTrackDidChange` callback is invoked with `null`
- **THEN** `MetadataService.stop()` is called

### Requirement: Media Session surfaces the live now-playing on the lock screen

The `Webamp` constructor SHALL enable the browser Media Session API (`enableMediaSession: true`). Webamp writes the station descriptor from the track's static `metaData` on station change (Phase-1). The `MetadataService` SHALL bridge the unified parser's live `{ artist, title }` pair into `navigator.mediaSession.metadata = new MediaMetadata({ title, artist })` from `announceTrackUpdate` on each successful poll (Phase-2), overwriting the descriptor. The bridge SHALL be feature-guarded on `'mediaSession' in navigator` and SHALL clear the metadata (empty `MediaMetadata({})`) on `stop()`. The bridge SHALL also assert `navigator.mediaSession.playbackState` — `'playing'` when a pair is written on poll, `'none'` when cleared on `stop()` — because webamp's `enableMediaSession` (verified against `webamp@2.3.1` and `master` at `github.com/captbaritone/webamp`) never sets `playbackState`, and Firefox treats a session with no asserted `playbackState` as inactive and does not promote it to the OS Now Playing surface.

#### Scenario: Media Session is enabled on construction

- **WHEN** the `WinampService` constructs the `Webamp` instance
- **THEN** the `enableMediaSession: true` option is set

#### Scenario: Phase-1 lock-screen shows the station descriptor on station change

- **WHEN** the user switches to a new station
- **THEN** Webamp's `enableMediaSession` writes `MediaMetadata` from the track's static `metaData`
- **AND** the lock screen shows `"Station Artist — Station Title"` (the station descriptor, not doubled)

#### Scenario: Phase-2 lock-screen shows the live title after the first poll

- **WHEN** the first metadata poll resolves a live `{ artist, title }` pair (within ~15 s of station change)
- **THEN** `announceTrackUpdate` writes `navigator.mediaSession.metadata = new MediaMetadata({ title, artist })`
- **AND** the lock screen updates to the live title
- **AND** subsequent polls refresh the live title

#### Scenario: Bridge asserts playbackState alongside metadata on poll

- **WHEN** `announceTrackUpdate` resolves a live `{ artist, title }` pair and writes `navigator.mediaSession.metadata`
- **THEN** the bridge also sets `navigator.mediaSession.playbackState = 'playing'`
- **AND** the session is considered active by the browser, so Firefox/Safari promote it to the OS Now Playing surface (lock screen / Control Center)

#### Scenario: Stopping playback clears the lock screen

- **WHEN** `MetadataService.stop()` is called
- **THEN** `navigator.mediaSession.metadata` is set to an empty `MediaMetadata({})`
- **AND** `navigator.mediaSession.playbackState` is set to `'none'`
- **AND** the lock-screen now-playing is cleared

#### Scenario: Feature is absent in unsupported browsers

- **WHEN** `'mediaSession' in navigator` is false
- **THEN** the bridge is a no-op (neither `metadata` nor `playbackState` is touched)
- **AND** no error is thrown
### Requirement: Surface controls are available to the desktop shell

The player service SHALL expose methods for play, pause, stop, previous track, next track, close, reopen, and play-radio.

#### Scenario: Play-radio resets and plays

- **WHEN** the desktop shell calls the play-radio method
- **THEN** the player reopens if closed
- **AND** the bundled track list is set as the playlist
- **AND** playback begins

### Requirement: Window stacking respects a configured z-index

The player window SHALL render at or above a configured `zIndex` so it stacks correctly relative to other desktop windows and applets.

#### Scenario: Configured z-index is applied

- **WHEN** the `Webamp` instance is constructed
- **THEN** the `zIndex` constructor option is set so the player window is not occluded by lower-stacked desktop elements

### Requirement: Player renders on every viewport

The player SHALL render on every viewport width, inside `desktop-bounds`, because `desktop-bounds` MUST NOT be gated out of the DOM on any viewport. The implementation MUST NOT use user-agent-based mobile detection and MUST NOT apply a DOM-removal gate. The player MUST keep its native (unscaled) size; on narrow viewports it sits centered in the host and partially overlaps the right-edge applet column, and the user drags it aside at native size. No `transform: scale()` SHALL be applied to the Webamp host, so Webamp's own drag and slider pointer math remains correct. The applet column's existing `rtl flex-col flex-wrap max-h-full` reflow adapts the surrounding desktop on short viewports without altering Webamp's positioning.

#### Scenario: Player renders on a narrow viewport

- **WHEN** the viewport is narrow (sub-`md`)
- **THEN** `desktop-bounds` remains in the DOM
- **AND** the `<winamp>` child renders
- **AND** the player is rendered at its native size (not CSS-scaled) so its internal drag and slider pointer math is correct

#### Scenario: Player partially overlaps applet column on narrow viewport

- **WHEN** the viewport is narrow and the player is centered in its host (~275px wide, z-index 15)
- **THEN** the player may partly cover the leftmost applet icons of the right-edge column
- **AND** the player is draggable aside by the user at native size

#### Scenario: Player renders on desktop as before

- **WHEN** the viewport is wide (desktop-width)
- **THEN** behavior is byte-identical to before this change (skin loads, draggable to the desktop bottom edge, plays, metadata announces, skin switch)
- **AND** no gating or detection logic is present
