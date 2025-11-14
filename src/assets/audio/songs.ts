import { URLTrack } from 'webamp';

export type TrackWithMeta = URLTrack & {
  metadataSource: MetadataSource;
};

export enum MetadataSource {
  Icy = 'icy',
  Ogg = 'ogg',
  IceStats = 'icestats',
  ShoutV2 = 'stats',
  ShoutV1 = 'sevenhtml',
  NextSongs = 'nextsongs',
}

const DEFAULT_DURATION: number = 5999;

export default class Songs {
  static songs: TrackWithMeta[] = [
    {
      metaData: {
        artist: 'x86 Soundscape',
        title: 'live',
      },
      url: 'https://radio.barb.date/listen/x86_soundscape/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'WRIR 97.3FM',
        title: 'Richmond, VA',
      },
      url: 'https://live.wrir.org/',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: '222.5FM Ghostwave Pirate Radio',
        title: 'Nightleek タマネギ',
      },
      url: 'https://radio.barb.date/listen/222.5fm_ghostwave/ghostwave',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Groove Salad',
      },
      url: 'https://ice2.somafm.com/groovesalad-128-mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Groove Salad Classic',
      },
      url: 'https://ice4.somafm.com/gsclassic-128-mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Echoes of Bluemars',
        title: 'live',
      },
      url: 'https://radio.barb.date/listen/echoes_of_bluemars/bluemars',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Echoes of Bluemars',
        title: 'Cryosleep',
      },
      url: 'https://radio.barb.date/listen/echoes_of_bluemars/cryosleep',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Echoes of Bluemars',
        title: 'Voices From Within',
      },
      url: 'https://radio.barb.date/listen/echoes_of_bluemars/voicesfromwithin',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'LOCAFM',
        title: 'Ambient',
      },
      url: 'https://s2.we4stream.com/listen/loca_ambient/live',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Vaporwaves',
      },
      url: 'https://ice2.somafm.com/vaporwaves-128-mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Nightwave Plaza',
        title: 'Online Vaporwave Radio',
      },
      url: 'https://radio.plaza.one/ogg',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'live',
      },
      url: 'https://public.isekoi-radio.com/listen/isekoi/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'Non Stop Ambient',
      },
      url: 'https://public.isekoi-radio.com/listen/ambient/ambientradio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'Chill Zone',
      },
      url: 'https://public.isekoi-radio.com/listen/chill/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'NTS Mixtapes',
        title: 'Labrynth',
      },
      url: 'https://stream-mixtape-geo.ntslive.net/mixtape31',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'NTS Mixtapes',
        title: 'Field Recordings',
      },
      url: 'https://stream-mixtape-geo.ntslive.net/mixtape23',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'NTS 1',
        title: 'live',
      },
      url: 'https://stream-relay-geo.ntslive.net/stream',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'NTS 2',
        title: 'live',
      },
      url: 'https://stream-relay-geo.ntslive.net/stream2',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: '9128',
        title: 'live',
      },
      url: 'https://streams.radio.co/s0aa1e6f4a/listen',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'dinamo.fm',
        title: 'locodyno',
      },
      url: 'https://channels.dinamo.fm/locodyno-mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'dinamo.fm',
        title: 'sleep',
      },
      url: 'https://channels.dinamo.fm/sleep-mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'Underground Kollektiv',
        title: 'live',
      },
      url: 'https://s2.radio.co/s12ef3f65a/listen',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'rateau',
        title: 'live',
      },
      url: 'https://ad.rateau.live:8000/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'Krelez',
        title: 'VaporFunk Radio',
      },
      url: 'https://radio.barb.date/listen/krelez/vapor',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Guias Sonoras',
        title: 'Experimental Ambient',
      },
      url: 'https://visual.shoutca.st/stream/guiassonoras',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.ShoutV2,
    },
    {
      metaData: {
        artist: 'Guias Sonoras',
        title: 'Dom Fox Is Sleeping',
      },
      url: 'https://visual.shoutca.st/stream/domfoxissleeping',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.ShoutV2,
    },
    {
      metaData: {
        artist: 'Radio Caprice',
        title: 'Ambient',
      },
      url: 'https://radio.barb.date/listen/radio_caprice/ambient',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Modular Station',
        title: 'live',
      },
      url: 'https://broadcast.modular-station.com/radio/8000/radio.aac',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.IceStats,
    },
    {
      metaData: {
        artist: 'Luxury Lounge',
        title: 'Level 1',
      },
      url: 'http://radio.barb.date/listen/luxury_lounge/level-1',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'Luxury Lounge',
        title: 'Level 2',
      },
      url: 'http://radio.barb.date/listen/luxury_lounge/level-2',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'KOSMIK DSTROYER',
        title: 'SOUL MASSAGE',
      },
      url: 'https://kdradio.top/listen/kd_balearic/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
    {
      metaData: {
        artist: 'KOSMIK DSTROYER',
        title: 'DNB / JUNGLE',
      },
      url: 'https://kdradio.top/listen/dnbjungle/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataSource: MetadataSource.Icy,
    },
  ];
}
