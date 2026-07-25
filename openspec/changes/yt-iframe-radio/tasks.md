## 1. Setup and Types

- [ ] 1.1 Create hand-rolled `yt.d.ts` type declarations for the YouTube IFrame Player API (`YT.Player`, `YT.PlayerEvent`, `YT.OnStateChangeEvent`, `YT.OnErrorEvent`, player options). Follow the existing `icecast-metadata-stats.d.ts` convention.
- [ ] 1.2 Add `AppletTypes.Stream` to the window switch case in `window.component.ts` and `window.component.html`, mirroring the WeatherStar pattern (window chrome, drag handle, `<app-yt-radio>` host). Covers: "Play Radio opens the radio window", "CRT effect applied to the player".

## 2. YtRadioService

- [ ] 2.1 Create `services/yt-radio/yt-radio.service.ts` with IFrame API script injection (once, promise-cached), player creation targeting a provided DOM element, `loadPlaylist({listType:'playlist', list: PLAYLIST_ID})` + `setShuffle(true)` on ready. Covers: "Player shuffles and begins playback", "Playlist edits appear on page load".
- [ ] 2.2 Implement `currentTrack$` observable (same `{artist, title}` shape as `MetadataService`): on `PLAYING` state change, call `player.getVideoData()` and push `{artist: author, title}`. Implement MediaSession metadata + playbackState updates. Covers: "Marquee updates on track change".
- [ ] 2.3 Implement `onError` handler: `nextVideo()` on any error (deleted, embed-disabled, etc.). Add consecutive-failure guard (5 strikes → offline state via `isOffline$` signal/observable; reset on successful playback). Covers: "Embedding-disabled video is skipped", "Deleted video is skipped", "Offline state after consecutive failures", "Recovery from offline state".
- [ ] 2.4 Implement transport API: `play()`, `pause()`, `next()`, `prev()`, `stop()` delegating to player methods. Covers: all five menubar transport scenarios.
- [ ] 2.5 Implement `start(element)` and `destroy()` lifecycle methods. `start` creates the player; `destroy` tears it down (player.destroy, script cleanup).

## 3. YtRadioComponent

- [ ] 3.1 Create `components/yt-radio/yt-radio.component.ts` + `.html` + `.css`. Host a player `<div>` inside a `<div appCrt>` wrapper (reuse `CrtComponent`). Show `offline.gif` as loading placeholder until player ready. Covers: "CRT effect applied to the player", "Loading placeholder shown during player boot", "Offline state after consecutive failures".
- [ ] 3.2 Wire component to `YtRadioService`: on init, call `svc.start(playerDiv)`. On destroy, call `svc.destroy()`. Subscribe to `svc.isOffline$` to toggle placeholder visibility.

## 4. Applet and Window Integration

- [ ] 4.1 In `applet.component.ts`, change `playRadio()` to open the Stream window via `WindowService.open({selector: AppletTypes.Stream})` and call `ytRadioService.start()` instead of `winampService.playRadio()`. Covers: "Play Radio opens the radio window".

## 5. Menubar Rewiring

- [ ] 5.1 In `menu.component.ts`: replace `WinampService` and `MetadataService` imports/injections with `YtRadioService`. Rewire `play()`, `pause()`, `prev()`, `stop()`, `next()` to `ytRadioService`. Subscribe `currentTrack$` from `ytRadioService`. Covers: all five menubar transport scenarios, "Marquee updates on track change".
- [ ] 5.2 In `winamp.service.ts`: delete the six dead methods (`play`, `pause`, `prev`, `stop`, `next`, `playRadio`). Keep `webamp` instance, `onTrackDidChange`, `setWinampRootElement`, `renderWinamp`, `closeWinamp`, `reopenWinamp`.

## 6. Spec Validation

- [ ] 6.1 Run `openspec validate yt-iframe-radio --type change --strict` to confirm all artifacts pass.
- [ ] 6.2 Manual browser verification: open site → dblclick Play Radio → window appears with CRT, player loads playlist, shuffles, plays. Menubar transport works. Now Playing marquee updates. Kill 5 videos in playlist → offline state shows. Refresh → recovery. Verify in Chrome + Safari.
