# x86 Soundscape

A retro Macintosh-style desktop in the browser that hosts internet radio stations, ambience sounds, a weather widget, and a video surfer.

## Language

**Station**:
An internet radio stream a listener tunes into, identified by a static descriptor (artist + title) and optionally a parser for its live metadata.
_Avoid_: Song, Track, Stream, Radio

**Now Playing**:
The live artist + title currently airing on a Station, derived from stream metadata while that Station is tuned.
_Avoid_: Song, Track, current track

**Gesture**:
A listener action on a real control — a playlist row, a transport button, the Media Session — as opposed to
anything the wiring does on its own. Tuning happens on a gesture; constructing, rendering and filling the
playlist never tune, and no stream is opened before one.
_Avoid_: event, trigger, action

**Station descriptor**:
A Station's static identity — its artist and title (e.g. "soma fm / Groove Salad") — shown in the menu bar when no Now Playing is available.
_Avoid_: fallback metadata, track metadata

**Tune** / **tuned**:
The Station the player is streaming. A Station that is merely listed in the playlist is not tuned. A Station
stays tuned while playback is paused, and stops being tuned when playback stops. A player that has never been
tuned holds no source, so Play on it tunes rather than plays.
_Avoid_: play, select, load, current track

**Playback state**:
Whether audio is running: playing, paused, or none. Distinct from Tune — a paused player is still tuned, and a
player that has stopped is not tuned at all.
_Avoid_: transport state, media status, player status

**Media Session**:
The browser's OS media widget (`navigator.mediaSession`): its metadata and playback state, and the play,
pause, previous and next controls it offers. One adapter writes both properties, following Now Playing and
the Playback state; seek controls are not offered, because a live stream has no position to seek to.
_Avoid_: OS widget (say Media Session), media controls

**Suspend / Resume** (Now Playing):
Parking the metadata poll chain while a tuned Station keeps streaming: `suspend` stops further attempts and
keeps the last published Now Playing; `resume` restarts only a parked chain, with an immediate attempt — a
chain that is already running is left alone. Distinct from Playback state — suspending follows the player's
gate, not the audio.
_Avoid_: pause (that's Playback state), sleep

**Tune gate**:
The one wiring by which the player drives Now Playing: the track-change hook tunes the Station it carries,
and the playback state gates the tune — playing resumes, pausing suspends, none stops. The gate is
suspend/resume and nothing else; Now Playing holds no reference to the player.
_Avoid_: sync, binding, observer

**Feature**:
An actionable unit in the system. A Feature may have a desktop Applet, open a Window, and/or trigger an Action.
_Avoid_: Applet type, selector kind

**Applet**:
A desktop icon that represents a Feature, taking its title and icon from it. Has a position on the Desktop.
_Avoid_: (none — this is the narrowed definition)

**Action**:
A Feature that triggers a side-effect without opening a Window (Play Radio, reopen Webamp, toggle Ambience).
_Avoid_: (none new)

**Weather**:
The Feature whose Applet opens a Window that hosts a weather display.
_Avoid_: WeatherStar (that's one source, not the Feature)

**Weather source**:
A third-party weather display embeddable as an iframe. Current sources: WS4KP (WeatherStar 4000+) and RetroCast.
_Avoid_: Weather app, weather widget

**Desktop**:
The retro desktop surface that hosts Applets, Windows, and the Menu bar. Applets can be dragged and multi-selected; Windows are drag-constrained to the Desktop bounds.
_Avoid_: Background, workspace

**Window**:
A draggable OS-style container opened by a Feature. Each Feature has at most one Window open at a time, and a Window exists only while it is open: closing it destroys it, and activating the Feature again opens a new one. Activating a Feature whose Window is already open raises it. Windows cascade (offset by open count) and constrain to the Desktop bounds.
_Avoid_: Dialog, frame, box

**Chrome**:
A Window's non-content furniture: its title bar, close button, resize affordance and separator.
_Avoid_: Trim, shell

**Pane**:
The area inside a Window's chrome, where the Feature's content is shown.
_Avoid_: Canvas, viewport

**Active Window**:
The Window the user last opened or raised. At most one is active — the frontmost — and closing it makes the most recently used surviving Window active.
_Avoid_: focused Window, selected Window, current Window

**Pop-up**:
A modal dialog shown from the Menu bar (About, Announcements). Not an Applet; distinct from a Window.
_Avoid_: Alert, modal, dialog box

**Menu** / **Menu bar**:
The fixed top bar that displays Now Playing (or Station descriptor) and provides transport, ambience, and utility controls.
_Avoid_: Nav, toolbar, header

**Channel**:
A themed video category in the Surfer, backed by one or more archive.org collections.
_Avoid_: Category, genre, playlist

**Surfer**:
The video-browsing Feature (labeled "Visualizer" on the Desktop). Loads random archive.org videos from the selected Channel.
_Avoid_: Video player, viewer, browser

**Ambience**:
An Action that plays a randomly selected looping background sound from a library of vintage-computer recordings.
_Avoid_: Background audio, sound effect, ambient (that's a Station title, not this concept)

**Held** (the held Sound):
The Sound Ambience keeps for the listener — what resumes after Stop, a refused load, or the mute being released. Ambience holds one Sound at a time, and only a Shuffle replaces it.
_Avoid_: current sound, last played, selection

**Sound**:
One recording in Ambience's library, with an asset path and the name shown to the listener.
_Avoid_: Track (that's a Station's), clip, sample
