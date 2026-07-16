import { Injectable } from '@angular/core';
import IcecastMetadataStats from 'icecast-metadata-stats';
import type { TrackWithMeta } from '../../../assets/audio/songs';
import { BehaviorSubject } from 'rxjs';

type NowPlaying = { artist: string; title: string };

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private static readonly POLL_INTERVAL_MS = 15_000;
  private static readonly STOPPED_TRACK: NowPlaying = {
    artist: 'N / A',
    title: '',
  };

  private statsListener: IcecastMetadataStats | undefined;
  private azuracastTimer: ReturnType<typeof setInterval> | undefined;
  private trackToListen: TrackWithMeta | undefined;

  private readonly currentTrackSource = new BehaviorSubject<NowPlaying>(
    MetadataService.STOPPED_TRACK,
  );
  currentTrack$ = this.currentTrackSource.asObservable();

  constructor() {
    this.statsListener = undefined;
    this.trackToListen = undefined;
  }

  start(track: TrackWithMeta, statsCallback: Function) {
    this.trackToListen = track;
    const kind = track.metadataParser?.kind ?? 'icy';

    if (kind === 'none') {
      this.announceTrackUpdate(undefined);
      return;
    }
    if (kind === 'azuracast') {
      this.startAzuracast(track, statsCallback);
      return;
    }

    this.statsListener = new IcecastMetadataStats(
      this.trackToListen.url.toString(),
      {
        interval: 15,
        sources: [kind],
        onStats: statsCallback,
      },
    );
    this.statsListener.start();
  }

  private startAzuracast(track: TrackWithMeta, statsCallback: Function) {
    const shortcode =
      track.metadataParser?.kind === 'azuracast'
        ? track.metadataParser.shortcode
        : '';
    const origin = this.deriveOrigin(track.url.toString());
    const endpoint = `${origin}/api/nowplaying/${shortcode}`;
    const poll = async () => {
      try {
        const response = await fetch(endpoint);
        const metadata = response.ok ? await response.json() : undefined;
        statsCallback(metadata);
      } catch {
        statsCallback(undefined);
      }
    };
    poll();
    this.azuracastTimer = setInterval(poll, MetadataService.POLL_INTERVAL_MS);
  }

  private deriveOrigin(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return '';
    }
  }

  stop() {
    if (this.statsListener) {
      this.statsListener.stop();
    }
    this.statsListener = undefined;
    if (this.azuracastTimer) {
      clearInterval(this.azuracastTimer);
    }
    this.azuracastTimer = undefined;
    this.trackToListen = undefined;
    this.currentTrackSource.next(MetadataService.STOPPED_TRACK);
    this.updateMediaSession();
  }

  getNowPlaying(metadata: any): NowPlaying {
    const track = this.trackToListen;
    if (!track || !metadata) {
      return this.stationDescriptor(track);
    }
    try {
      const parser = track.metadataParser;
      const kind = parser?.kind ?? 'icy';
      switch (kind) {
        case 'icy':
          return this.parseIcy(metadata, track);
        case 'icestats':
          return this.parseIcestats(metadata, track);
        case 'azuracast':
          return this.parseAzuracast(metadata, track);
        case 'stats':
          return this.stationDescriptor(track);
        case 'none':
          return this.stationDescriptor(track);
        default:
          return this.stationDescriptor(track);
      }
    } catch {
      return this.stationDescriptor(track);
    }
  }

  private parseIcy(metadata: any, track: TrackWithMeta): NowPlaying {
    const streamTitle: string | undefined = metadata?.icy?.StreamTitle;
    if (streamTitle) {
      const idx = streamTitle.indexOf(' - ');
      if (idx >= 0) {
        return {
          artist: streamTitle.slice(0, idx),
          title: streamTitle.slice(idx + 3),
        };
      }
      return {
        title: streamTitle,
        artist: this.stationDescriptor(track).artist,
      };
    }
    return this.stationDescriptor(track);
  }

  private parseIcestats(metadata: any, track: TrackWithMeta): NowPlaying {
    const parser = track.metadataParser;
    if (!parser || parser.kind !== 'icestats') {
      return this.stationDescriptor(track);
    }
    const source = metadata?.icestats?.source;
    if (!source) {
      return this.stationDescriptor(track);
    }
    const entry =
      parser.sourceIndex != null ? source[parser.sourceIndex] : source;
    const title: string | undefined = entry?.[parser.titleField];
    if (!title) {
      return this.stationDescriptor(track);
    }
    const artist: string | undefined =
      parser.artistField != null ? entry?.[parser.artistField] : undefined;
    return { title, artist: artist ?? this.stationDescriptor(track).artist };
  }

  private parseAzuracast(metadata: any, track: TrackWithMeta): NowPlaying {
    const song = metadata?.now_playing?.song;
    const title: string | undefined = song?.title;
    const artist: string | undefined = song?.artist;
    if (!title) {
      return this.stationDescriptor(track);
    }
    return { title, artist: artist ?? this.stationDescriptor(track).artist };
  }

  private stationDescriptor(track?: TrackWithMeta): NowPlaying {
    if (track?.metaData) {
      return {
        artist: track.metaData.artist,
        title: track.metaData.title,
      };
    }
    return MetadataService.STOPPED_TRACK;
  }

  announceTrackUpdate(metadata: any) {
    const pair = this.getNowPlaying(metadata);
    this.currentTrackSource.next(pair);
    this.updateMediaSession(pair);
  }

  private updateMediaSession(pair?: NowPlaying) {
    if (!('mediaSession' in navigator)) {
      return;
    }
    navigator.mediaSession.metadata = pair
      ? new MediaMetadata({ title: pair.title, artist: pair.artist })
      : new MediaMetadata();
    navigator.mediaSession.playbackState = pair ? 'playing' : 'none';
  }
}
