# ADR Review Manifest

- Status: completed
- Review date: 2026-07-24

## Review Summary

ADR review completed for this change. One durable architectural decision was identified: the commitment to the YouTube IFrame Player API as the radio engine.

## In-Force ADRs Reviewed

- ADR-001: Embed Webamp Inside Desktop Bounds — windows belong inside `desktop-bounds`; the new radio window follows this pattern
- ADR-002: Data-Driven Per-Track Metadata Pipeline — menubar/MediaSession fed from one source of truth; `YtRadioService` follows the same pattern with `currentTrack$`
- ADR-003: Client-Side Archive.org Direct Fetch — zero-backend philosophy aligned; the IFrame approach shares the "no hosted service" principle
- ADR-004: Container-Relative Window Cascade — new window follows the existing cascade pattern
- ADR-005: Responsive Menubar with Layout CSS — menubar rewiring is scoped to service injection, not layout changes
- ADR-006: Weather Source Registry — WeatherStar established the CRT-window + iframe pattern that this station mirrors

## New Durable ADRs Created

- `openspec/adr/007-iframe-radio-applet.md` — Use YouTube IFrame Player API as the Radio Engine. Commits the project to the IFrame approach over all other YouTube audio paths, given that every byte-fetching alternative is blocked.
