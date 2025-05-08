import { Track } from 'webamp';

export type TrackWithMeta = Track & {
  metaDataSource: string;
};

export default class Songs {
  static songs: TrackWithMeta[] = [
    {
      metaData: {
        artist: 'x86 Soundscape',
        title: 'live',
      },
      url: 'https://radio.barb.date/x86-soundscape',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'WRIR 97.3FM',
        title: 'Richmond, VA',
      },
      url: 'https://live.wrir.org/',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Groove Salad',
      },
      url: 'https://ice2.somafm.com/groovesalad-128-mp3',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Groove Salad Classic',
      },
      url: 'https://ice4.somafm.com/gsclassic-128-mp3',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'Echoes of Bluemars',
        title: 'live',
      },
      url: 'http://streams.echoesofbluemars.org:8000/bluemars',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Echoes of Bluemars',
        title: 'Cryosleep',
      },
      url: 'http://streams.echoesofbluemars.org:8000/cryosleep',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Echoes of Bluemars',
        title: 'Voices From Within',
      },
      url: 'http://streams.echoesofbluemars.org:8000/voicesfromwithin',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'LOCAFM',
        title: 'Ambient',
      },
      url: 'https://s2.we4stream.com/listen/loca_ambient/live',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Vaporwaves',
      },
      url: 'https://ice2.somafm.com/vaporwaves-128-mp3',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'Nightwave Plaza',
        title: 'Online Vaporwave Radio',
      },
      url: 'https://radio.plaza.one/ogg',
      duration: 5999,
      metaDataSource: 'ogg',
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'live',
      },
      url: 'https://public.isekoi-radio.com/listen/isekoi/radio.mp3',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'Non Stop Ambient',
      },
      url: 'https://public.isekoi-radio.com/listen/ambient/ambientradio.mp3',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'Chill Zone',
      },
      url: 'https://public.isekoi-radio.com/listen/chill/radio.mp3',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'NTS Mixtapes',
        title: 'Labrynth',
      },
      url: 'https://stream-mixtape-geo.ntslive.net/mixtape31',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'NTS Mixtapes',
        title: 'Field Recordings',
      },
      url: 'https://stream-mixtape-geo.ntslive.net/mixtape23',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'NTS 1',
        title: 'live',
      },
      url: 'https://176.9.48.145:8000/nts_b',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: '9128',
        title: 'live',
      },
      url: 'https://streams.radio.co/s0aa1e6f4a/listen',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'dinamo.fm',
        title: 'locodyno',
      },
      url: 'https://channels.dinamo.fm/locodyno-mp3',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'dinamo.fm',
        title: 'sleep',
      },
      url: 'https://channels.dinamo.fm/sleep-mp3',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'Underground Kollektiv',
        title: 'live',
      },
      url: 'https://s2.radio.co/s12ef3f65a/listen',
      duration: 5999,
      metaDataSource: 'icy',
    },
    {
      metaData: {
        artist: 'rateau',
        title: 'live',
      },
      url: 'https://ad.rateau.live:8000/radio.mp3',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Krelez',
        title: 'VaporFunk Radio',
      },
      url: 'http://79.120.11.40:8000/vapor.ogg',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Guias Sonoras',
        title: 'Experimental Ambient',
      },
      url: 'https://visual.shoutca.st/stream/guiassonoras',
      duration: 5999,
      metaDataSource: 'stats',
    },
    {
      metaData: {
        artist: 'Guias Sonoras',
        title: 'Dom Fox Is Sleeping',
      },
      url: 'https://visual.shoutca.st/stream/domfoxissleeping',
      duration: 5999,
      metaDataSource: 'stats',
    },
    {
      metaData: {
        artist: 'Radio Caprice',
        title: 'Ambient',
      },
      url: 'http://79.111.119.111:8000/ambient',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Modular Station',
        title: 'live',
      },
      url: 'https://broadcast.modular-station.com/radio/8000/radio.aac',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Luxury Lounge',
        title: 'Level 1',
      },
      url: 'http://188.40.109.122:8000/ices',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'Luxury Lounge',
        title: 'Level 2',
      },
      url: 'http://188.40.109.122:8000/ices2',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'KOSMIK DSTROYER',
        title: 'SOUL MASSAGE',
      },
      url: 'https://kdradio.top/listen/kd_balearic/radio.mp3',
      duration: 5999,
      metaDataSource: 'icestats',
    },
    {
      metaData: {
        artist: 'KOSMIK DSTROYER',
        title: 'DNB / JUNGLE',
      },
      url: 'https://kdradio.top/listen/dnbjungle/radio.mp3',
      duration: 5999,
      metaDataSource: 'icestats',
    },
  ];
}
