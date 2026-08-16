# x86 Soundscape

A retro Macintosh-style desktop in the browser that hosts internet radio stations, ambience sounds, a weather widget, and a video surfer.

## Language

**Station**:
An internet radio stream a listener tunes into, identified by a static descriptor (artist + title) and optionally a parser for its live metadata.
_Avoid_: Song, Track, Stream, Radio

**Now Playing**:
The live artist + title currently airing on a Station, derived from stream metadata.
_Avoid_: Song, Track, current track

**Station descriptor**:
A Station's static identity — its artist and title (e.g. "soma fm / Groove Salad") — shown in the menu bar when no Now Playing is available.
_Avoid_: fallback metadata, track metadata

**Feature**:
An actionable unit in the system. A Feature may have a desktop Applet, open a Window, and/or trigger an Action.
_Avoid_: Applet type, selector kind

**Applet**:
A desktop icon that represents a Feature. Has a title, icon, and position on the Desktop.
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
A draggable OS-style container opened by a Feature. Each Feature has at most one Window open at a time. Windows cascade (offset by open count) and constrain to the Desktop bounds.
_Avoid_: Dialog, frame, box

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
