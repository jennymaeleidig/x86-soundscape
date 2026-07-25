# Proposal: yt-iframe-radio

## Why

The Play Radio station depends on `yt-playlist-radio`, a Flask + yt-dlp + ffmpeg server that turns a YouTube playlist into an ICY MP3 stream. That path is dead: YouTube bot-walls server-side extraction, and every workaround collapses under the project's own constraints. Live probing in July 2026 confirmed no viable byte path. Public Piped/Invidious instances are dead or walled, cobalt instances require auth or are walled themselves, and browsers cannot fetch YouTube media or API bytes directly (no CORS). Self-hosting was rejected for legroom; external file hosting was rejected as a dependency. The only path left is YouTube's sanctioned IFrame player: it resolves and plays the playlist from the visitor's own IP, cannot be bot-walled, and needs nothing hosted or run by anyone.

## What Changes

- **Play Radio** (desktop applet) now opens a draggable, CRT-styled desktop window containing a small YouTube player that shuffles the station playlist (`PLG0tzOFulhHE`), instead of driving Webamp's station list.
- Each visitor gets an independent shuffled session; playlist edits on YouTube appear on the next page load. No shared broadcast state exists anywhere.
- **Menubar transport** (Play / Pause / Previous / Stop / Next) and the **Now Playing** marquee rewire from `WinampService` / `MetadataService` to a new `YtRadioService`. **BREAKING** for anyone relying on the menubar to control Webamp.
- `WinampService` loses its now-dead transport methods (`play`, `pause`, `prev`, `stop`, `next`, `playRadio`). The Webamp applet itself remains fully functional with its own in-window controls and its own desktop icon.
- Videos that are deleted or embed-blocked are skipped automatically; if failures repeat, the window shows an offline state instead of dead air.
- No new npm dependencies; the YouTube IFrame API loads from YouTube at runtime.

## Capabilities

### New Capabilities

- `yt-iframe-radio`: CRT-window YouTube playlist radio. Shuffled playback from a configured playlist, transport control from the menubar, now-playing display with Media Session bridge, automatic skipping of unplayable videos, and an offline state after repeated failures.

### Modified Capabilities

- (none) — no existing specs on disk; `openspec/specs/` is empty. Menubar and Webamp-service behavior changes are covered by scenarios in the new `yt-iframe-radio` spec.

## Impact

- **New code**: `YtRadioService` (player lifecycle, playlist load + shuffle, now-playing observable, Media Session, error-skip guard, transport API), `YtRadioComponent` (CRT-framed player view, boot/offline placeholder), hand-rolled `YT` typings (follows the `icecast-metadata-stats.d.ts` precedent).
- **Edited code**: `window.component` (new `AppletTypes.Stream` switch case), `applet.component` (`playRadio()` opens the window), `menu.component` (transport + marquee source swap), `winamp.service` (method deletions only).
- **Untouched**: `MetadataService`, `songs.ts`, Webamp wiring; all still serve the Webamp applet.
- **Runtime dependency**: `youtube.com/iframe_api` and YouTube playback itself. No build-time deps, no servers, no storage, no keys.
- **Config**: playlist ID is a single constant (`PLG0tzOFulhHE`).
- **Prior art**: the `yt-playlist-radio` repo stays as-is; this change supersedes its role for the site.
