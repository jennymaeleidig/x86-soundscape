import { Injectable } from '@angular/core';
import IcecastMetadataStats from 'icecast-metadata-stats';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  statsListener: IcecastMetadataStats;
  constructor() {
    console.log('hi');
    this.statsListener = new IcecastMetadataStats('https://radio.barb.date/', {
      interval: 30,
      sources: ['icestats'],
      onStats: (stats: any) => {
        console.log(stats);
      },
    });
    console.log(this.statsListener.getIcestats());
  }
}
