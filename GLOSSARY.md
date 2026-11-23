# x86 Soundscape

A retro Macintosh-style desktop in the browser hosting internet radio, ambience sounds, a weather display, and a video surfer.

## Player

**Station**:
An internet radio stream a listener tunes into, with a static descriptor — artist + title, e.g. "soma fm / Groove Salad" — shown when no Now Playing is available, and optionally a live-metadata parser.
_Avoid_: Song, Track, Stream, Radio, fallback metadata

**Now Playing**:
The live artist + title currently airing on a tuned Station, derived from stream metadata.
_Avoid_: Song, Track, current track

**Kind**:
The metadata flavor a Station's descriptor declares — which live parser and source derivation its Now Playing uses.
_Avoid_: metadata type, format

**Tune** / **tuned**:
The Station the player is streaming. A Station merely listed in the playlist is not tuned; a paused player is still tuned; a stopped one is not.
_Avoid_: play, select, load, current track

**Playback state**:
Whether audio is running — playing, paused, or none. Distinct from Tune.
_Avoid_: transport state, media status, player status

**Gesture**:
A listener action on a real control (playlist row, transport button, Media Session). Only a gesture tunes; the wiring never does.
_Avoid_: event, trigger, action

**Suspend / Resume** (Now Playing):
Parking the metadata poll chain: suspend stops attempts and keeps the last published Now Playing; resume restarts only a parked chain. Follows the player's gate, not the audio.
_Avoid_: pause, sleep

**Media Session**:
The browser's OS media widget (`navigator.mediaSession`): metadata, playback state, and play/pause/previous/next controls.
_Avoid_: OS widget, media controls

## Desktop

**Desktop**:
The retro desktop surface hosting Applets, Windows, and the Menu bar.
_Avoid_: Background, workspace

**Applet**:
A desktop icon representing a Feature, taking its title and icon from it.

**Window**:
A draggable OS-style container opened by a Feature; at most one per Feature. Closing destroys it; activating the Feature again opens a new one, or raises the existing one.
_Avoid_: Dialog, frame, box

**Active Window**:
The frontmost Window — the one last opened or raised. At most one.
_Avoid_: focused, selected, current Window

**Chrome**:
A Window's non-content furniture: title bar, close button, resize affordance, separator.
_Avoid_: Trim, shell

**Pane**:
The area inside a Window's chrome where the Feature's content is shown.
_Avoid_: Canvas, viewport

**Pop-up**:
A modal dialog shown from the Menu bar. Not an Applet; not a Window.
_Avoid_: Alert, modal, dialog box

**Menu** / **Menu bar**:
The fixed top bar: Now Playing (or the Station's descriptor), transport, ambience, and utility controls.
_Avoid_: Nav, toolbar, header

## Features

**Feature**:
An actionable unit in the system: it may have a desktop Applet, open a Window, and/or trigger an Action.
_Avoid_: Applet type, selector kind

**Action**:
A Feature that triggers a side-effect without opening a Window (Play Radio, toggle Ambience).

**Weather source**:
A third-party weather display embeddable as an iframe. Current: WS4KP and RetroCast.
_Avoid_: Weather app, weather widget, WeatherStar (that's one source)

**Surfer**:
The video-browsing Feature (labeled "Visualizer" on the Desktop): random archive.org videos from the selected Channel.
_Avoid_: Video player, viewer, browser

**Channel**:
A themed video category in the Surfer, backed by archive.org collections.
_Avoid_: Category, genre, playlist

## Ambience

**Ambience**:
An Action that plays a randomly selected looping vintage-computer recording.
_Avoid_: Background audio, ambient (that's a Station title)

**Sound**:
One recording in Ambience's library, with an asset path and a listener-facing name.
_Avoid_: Track, clip, sample

**Held**:
The Sound Ambience keeps for the listener — what resumes after Stop, a refused load, or unmute. One Sound at a time; only a Shuffle replaces it.
_Avoid_: current sound, last played
