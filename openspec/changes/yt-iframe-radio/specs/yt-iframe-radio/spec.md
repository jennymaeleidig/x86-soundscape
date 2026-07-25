## ADDED Requirements

### Requirement: YouTube playlist playback

Feature: YouTube IFrame radio station
  The Play Radio applet opens a CRT-styled window that plays a configured YouTube
  playlist using the YouTube IFrame Player API. Each visitor session is independent
  and shuffled.

#### Scenario: Play Radio opens the radio window
- **GIVEN** the desktop is visible
- **WHEN** the visitor double-clicks the Play Radio applet icon
- **THEN** a draggable window appears containing a YouTube player
- **AND** the player begins loading the configured playlist

#### Scenario: Player shuffles and begins playback
- **GIVEN** the radio window has opened
- **WHEN** the YouTube player finishes loading
- **THEN** the playlist is shuffled
- **AND** playback begins from a random position in the shuffled order

#### Scenario: Playlist edits appear on page load
- **GIVEN** a new video has been added to the YouTube playlist since the last visit
- **WHEN** a visitor loads the page and opens the radio window
- **THEN** the new video is included in the shuffled playlist

### Requirement: Unique visitor sessions

Rule: Each visitor's shuffle order is independent.

#### Scenario: Two visitors hear different orders
- **GIVEN** two visitors load the page independently
- **WHEN** each opens the radio window
- **THEN** they play the same set of videos but in different shuffled orders

### Requirement: Menubar transport controls

Rule: The Edit menu controls the radio player, not Webamp.

#### Scenario: Play from menubar
- **GIVEN** the radio window is open and the player is paused
- **WHEN** the visitor selects Edit > Play from the menubar
- **THEN** the radio player resumes playback

#### Scenario: Next track from menubar
- **GIVEN** the radio window is open and a video is playing
- **WHEN** the visitor selects Edit > Next from the menubar
- **THEN** the player skips to the next video in the shuffled order

#### Scenario: Pause from menubar
- **GIVEN** the radio window is open and a video is playing
- **WHEN** the visitor selects Edit > Pause from the menubar
- **THEN** the radio player pauses

#### Scenario: Stop from menubar
- **GIVEN** the radio window is open and a video is playing
- **WHEN** the visitor selects Edit > Stop from the menubar
- **THEN** the radio player stops playback

#### Scenario: Previous from menubar
- **GIVEN** the radio window is open and a video is playing
- **WHEN** the visitor selects Edit > Previous from the menubar
- **THEN** the player returns to the previous video in the shuffled order

### Requirement: Now-playing display

Rule: The menubar marquee shows the title and artist of the currently playing video.

#### Scenario: Marquee updates on track change
- **GIVEN** the radio window is open and a video is playing
- **WHEN** the next video begins playback
- **THEN** the Now Playing marquee in the menubar updates to show the new video's title and artist
- **AND** the MediaSession metadata updates so the OS lock screen shows the current track

### Requirement: Error handling and skip

Rule: Unplayable videos are skipped automatically.

#### Scenario: Embedding-disabled video is skipped
- **GIVEN** the next video in the playlist has embedding disabled
- **WHEN** the player attempts to load it
- **THEN** the player skips to the following video without manual intervention

#### Scenario: Deleted video is skipped
- **GIVEN** a video in the playlist has been deleted from YouTube
- **WHEN** the player attempts to load it
- **THEN** the player skips to the following video without manual intervention

### Requirement: Offline state

Rule: After repeated failures, the radio shows an offline state instead of dead air.

#### Scenario: Offline state after consecutive failures
- **GIVEN** five or more consecutive videos fail to load
- **WHEN** the fifth failure occurs
- **THEN** the radio window displays an offline placeholder image
- **AND** the Now Playing marquee shows an offline indicator

#### Scenario: Recovery from offline state
- **GIVEN** the radio is in offline state
- **WHEN** a video loads successfully (e.g. after a page refresh)
- **THEN** playback resumes normally
- **AND** the offline state clears

### Requirement: CRT window presentation

Rule: The radio window follows the same CRT-styled pattern as the WeatherStar applet.

#### Scenario: CRT effect applied to the player
- **GIVEN** the radio window has opened
- **WHEN** the YouTube player is visible
- **THEN** the CRT overlay effect is applied to the player area

#### Scenario: Loading placeholder shown during player boot
- **GIVEN** the radio window has opened but the YouTube player has not finished loading
- **WHEN** the player is still initializing
- **THEN** the window displays the offline placeholder image until the player is ready

### Requirement: Playlist ID configuration

Rule: The YouTube playlist ID is a single constant in the service.

#### Scenario: Changing the playlist source
- **GIVEN** the playlist ID constant is updated in the service source
- **WHEN** the site is rebuilt and deployed
- **THEN** the radio window plays from the new playlist
