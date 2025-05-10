import { Injectable } from '@angular/core';
import IcecastMetadataStats from 'icecast-metadata-stats';
import { MetadataSource, TrackWithMeta } from '../../../assets/audio/songs';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  statsListener: IcecastMetadataStats | undefined;
  trackToListen: TrackWithMeta | undefined;
  private readonly currentTrackSource = new BehaviorSubject<string>(
    'Not Playing',
  );
  currentTrack$ = this.currentTrackSource.asObservable();

  constructor() {
    this.statsListener = undefined;
    this.trackToListen = undefined;
  }

  start(track: TrackWithMeta, statsCallback: Function) {
    this.trackToListen = track;
    this.statsListener = new IcecastMetadataStats(
      this.trackToListen.url.toString(),
      {
        interval: 15,
        sources: [this.trackToListen.metadataSource],
        onStats: statsCallback,
      },
    );
    this.statsListener.start();
  }

  stop() {
    if (this.statsListener) {
      this.statsListener.stop();
    }
    this.statsListener = undefined;
    this.trackToListen = undefined;
  }

  getTitleFromMetadata(metadata: any): string {
    if (this.trackToListen && metadata) {
      switch (this.trackToListen.metadataSource) {
        case MetadataSource.IceStats:
          if (metadata[MetadataSource.IceStats]) {
            if (this.getTrackName().includes('Nightwave Plaza')) {
              return metadata[MetadataSource.IceStats]['source'][0][
                'yp_currently_playing'
              ];
            }
            if (this.getTrackName().includes('Isekoi Radio')) {
              return metadata[MetadataSource.IceStats]['source'][1][
                'yp_currently_playing'
              ];
            }
            if (this.getTrackName().includes('dinamo.fm - locodyno')) {
              return metadata[MetadataSource.IceStats]['source'][17]['title'];
            }
            if (this.getTrackName().includes('dinamo.fm - sleep')) {
              return metadata[MetadataSource.IceStats]['source'][23]['title'];
            }
            if (
              this.getTrackName().includes('rateau') ||
              this.getTrackName().includes('Modular Station')
            ) {
              return metadata[MetadataSource.IceStats]['source'][
                'yp_currently_playing'
              ];
            }
            if (this.getTrackName().includes('Krelez')) {
              return `${metadata[MetadataSource.IceStats]['source'][1]['artist']} - ${metadata[MetadataSource.IceStats]['source'][1]['title']}`;
            }
            return metadata[MetadataSource.IceStats]['source']['title'];
          }
          return this.getTrackName();
        case MetadataSource.Icy:
          if (metadata[MetadataSource.Icy]) {
            if (metadata[MetadataSource.Icy]['StreamTitle']) {
              return metadata[MetadataSource.Icy]['StreamTitle'];
            }
          }
          return this.getTrackName();
        default:
          return this.getTrackName();
      }
    }
    return 'N/A';
  }

  private getTrackName(): string {
    if (this.trackToListen) {
      return `${this.trackToListen.metaData!.artist} - ${this.trackToListen.metaData!.title}`;
    }
    return 'N/A';
  }

  announceTrackUpdate(metadata: any) {
    this.currentTrackSource.next(this.getTitleFromMetadata(metadata));
  }
}
