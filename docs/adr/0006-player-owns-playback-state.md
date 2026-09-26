# The player owns playback state, and the tune is contingent on it

Webamp is the only authority on whether audio is running, and it offers that authority by *pull* alone:
`getMediaStatus()` answers `PLAYING` / `PAUSED` / `STOPPED` and `getPlayerMediaStatus()` distinguishes
`ENDED` and `CLOSED`, while its four hooks cannot report a pause at all — `onTrackDidChange` subscribes to
the playing *track id*, so it fires `null` on PLAYING→PAUSED and on PLAYING→STOPPED and cannot tell them
apart. So the player module — the one that holds the Webamp instance and wraps its transport — publishes
`playbackState$: Observable<'playing' | 'paused' | 'none'>` as a cache over that authority: it is the only
module that asks Webamp, and the only writer of `navigator.mediaSession`, which leaves both Now Playing and
the transport seam free of the browser. `STOPPED`, `ENDED` and `CLOSED` all collapse into `'none'`, which is
the browser's own word for the same thing, because "stopped" and "untuned" are one state rather than two to
keep in sync — which gives the rule that makes this record worth reading: **a Station is tuned iff playback
is playing or paused**. The tune is contingent on the transport. `stop()` releases it and so does `close()`
(Webamp's close is STOP + hide); `pause()` keeps it and only suspends the metadata poller, so the bar keeps
the Station it was on while nothing is fetched, and resume re-tunes so the fresh tick lands at once.
`pause()` also stops being Webamp's toggle — it means *ensure paused* and `play()` means *ensure playing* —
because the toggle is why both the Menu bar's Pause item and Webamp's own Media Session handler start
playback on a second press, and a toggle publishes two states under one name.

Media Session follows from the same rule: one adapter in its own module, subscribing to `nowPlaying$` and
`playbackState$`, installing `play` / `pause` / `previoustrack` / `nexttrack` and dropping the two seek
handlers — a live stream has no position to seek — with `enableMediaSession: false`, so ours is the only
writer of `metadata` and `playbackState`. Rejected: publishing from the transport wrappers plus the four
hooks, which is public-API-only but blind to paused→stopped — a gesture the player's own skin performs,
leaving a transport stuck on "paused" and its poller alive after a stop; a timer poll of `getMediaStatus()`,
a perpetual cost for a signal that changes on gesture; and a third `'stopped'` value, a state to reconcile
against the tune for no reader that needs it. Also rejected: polling while paused, which `11` measured at
≈5.8 MB/hour per Station for a panel nobody is reading. The surprise this record exists to explain is
therefore twofold: why the store is subscribed to at all, given that Webamp's source marks it
`// TODO: Make this _private` (the four hooks cannot do the job, the store is where the element's own events
land, and the subscription is quarantined to one line with a `getMediaStatus()` poll as the fallback), and
why a paused Station still shows on the bar while nothing is being fetched. ADR-0001 stands unamended: no
lever Webamp exposes releases the icecast connection, so "stop releases the connection" was withdrawn rather
than implemented, and the connection staying open while paused or stopped is a cost `12` already owns.
