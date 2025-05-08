import { Injectable } from '@angular/core';
import IcecastMetadataStats from 'icecast-metadata-stats';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  statsListener: IcecastMetadataStats;
  constructor() {
    this.statsListener = new IcecastMetadataStats('https://radio.barb.date/', {
      interval: 5,
      sources: ['icestats'],
      onStats: (stats: any) => {
        console.log(stats);
      },
    });
    this.statsListener.start();
  }
}
