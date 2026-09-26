# A failed poll is not a value, and the poller never gives up

Now Playing owns the polling policy and the transport seam beneath it performs one attempt, `fetch(source)`
plus `cancel()`, rather than `04`'s repeating `poll(source, onPayload)`; the cadence is a chain — attempt,
settle, wait the interval, attempt — so two requests can never be in flight, which is also why the library's
own `setInterval` is never started. Each attempt carries a deadline the transport enforces itself
(`AbortSignal.timeout` where we own the fetch, and the library instance's `stop()` at the deadline where we
do not), because the library's agreement to abort is not an agreement to settle: an abort landing mid-read
leaves its promise pending forever. A failure publishes nothing at all — the last value stands — and
"rejected" and "empty" are one outcome, since they arrive indistinguishable and no reader acts differently.

There is deliberately no back-off and no give-up path, and this is the part a future reader will otherwise
"fix": a Station is declarative data and a dead one may return, while `tune` is called when a listener
*chooses* a Station rather than when they return to it, so a give-up would freeze the panel on a stale track
after recovery — a worse lie than a bounded retry. The bound is the in-flight rule plus the deadline: one
socket, four attempts a minute, nothing while paused (`11` measured 21.8–24 KB per poll and `13` gated the
poller on playback state). The consequence worth pinning down is that "gave up" never becomes a value, so
`nowPlaying$` stays `NowPlaying | undefined` with no third state to reconcile.
