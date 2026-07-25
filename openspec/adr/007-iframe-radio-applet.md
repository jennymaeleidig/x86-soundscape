---
status: accepted
date: 2026-07-24
decision-makers: project team
---

# ADR-007: Use YouTube IFrame Player API as the Radio Engine

## Context and Problem Statement

The site needs a radio station driven by a YouTube playlist. YouTube's server-side extraction is bot-walled, and every alternative path to YouTube audio bytes from a browser is CORS-blocked. Public proxy instances (Piped, Invidious, cobalt) are effectively dead or auth-gated as of July 2026. Self-hosting a proxy, running a local daemon, hosting files externally, and browser extensions were all rejected by project constraints (no additional services, no external hosting, no visitor installation). The only path that requires zero infrastructure and cannot be blocked is YouTube's own sanctioned IFrame Player API.

## Decision Drivers

- No hosted service, no external dependencies, no API keys
- Must work for any visitor from their own IP without installation
- YouTube playlist edits must go live without redeployment
- Must integrate with the site's existing CRT-window applet pattern

## Considered Options

1. Server-side yt-dlp + ffmpeg + Icecast stream (status quo ante)
2. Public proxy instances (Piped/Invidious/cobalt) with client-side assembly
3. Service Worker virtual Icecast with mp4box AAC transmux
4. Local daemon uploading MP3s to external file hosting
5. Browser extension bypassing CORS
6. YouTube IFrame Player API embed

## Decision Outcome

Chosen option: "YouTube IFrame Player API embed", because it is the only approach that satisfies every stated constraint: zero infrastructure, unblockable from any visitor's IP, playlist edits propagate on page load, and it integrates cleanly with the existing window/applet architecture.

### Consequences

- Good, because no server, no keys, no hosted files, no instances, no maintenance
- Good, because YouTube's own player handles all playback, shuffle, and error recovery
- Good, because each visitor gets an independent shuffled session natively
- Good, because the CRT-styled window fits the site's retro desktop aesthetic
- Bad, because the YouTube video is visible in the window (embed ToS requires visible playback)
- Bad, because audio bytes are inaccessible — this station cannot play inside Webamp
- Bad, because the IFrame API is a runtime dependency on YouTube's embed infrastructure

## Pros and Cons of the Options

### Server-side yt-dlp (status quo ante)

- Good, because it worked when IPs were not blocked
- Bad, because YouTube bot-walls server-side extraction; requires cookies and still fails
- Bad, because it requires a running server

### Public proxy instances

- Good, because they had CORS and proxied streams
- Bad, because the instance ecosystem has collapsed (verified July 2026)
- Bad, because they are unreliable and subject to the same blocking as servers

### Service Worker virtual Icecast

- Good, because it would serve a real ICY stream URL with Webamp integration
- Good, because the mp4box AAC transmux was byte-validated in a spike
- Bad, because it still requires a CORS-enabled audio source (proxy instances are dead)
- Bad, because the transmux and ICY interleaving add substantial complexity

### Local daemon + external hosting

- Good, because the daemon uses yt-dlp from a home IP (proven working path)
- Bad, because it requires external file hosting (rejected as a dependency)
- Bad, because hosting copyrighted audio publicly invites DMCA action

### Browser extension

- Good, because it bypasses CORS and uses the visitor's own IP
- Bad, because every listener must install it — impractical for a public site

### YouTube IFrame Player API

- Good, because zero infrastructure, unblockable, playlist-live, native shuffle
- Good, because the CRT window pattern already exists (WeatherStar)
- Bad, because video is visible (ToS requirement) and audio is inaccessible to JS
- Bad, because the entire playback experience depends on YouTube's embed API

## More Information

The playlist ID (`PLG0tzOFulhHE`, "x86 Soundscape") is a single constant in `YtRadioService`. The IFrame API script loads from `youtube.com/iframe_api` at runtime — no build-time dependency. The WeatherStar applet (ADR-006) established the CRT-window + iframe pattern that this station follows.
