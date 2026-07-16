import type { URLTrack } from 'webamp';

export type MetadataParser =
  | { kind: 'icy' }
  | {
      kind: 'icestats';
      sourceIndex?: number;
      titleField: string;
      artistField?: string;
    }
  | { kind: 'stats' }
  | { kind: 'azuracast'; shortcode: string }
  | { kind: 'none' };

export type TrackWithMeta = URLTrack & {
  metadataParser?: MetadataParser;
};

const DEFAULT_DURATION: number = 5999;

export default class Songs {
  static songs: TrackWithMeta[] = [
    {
      metaData: {
        artist: 'WRIR 97.3FM',
        title: 'Richmond, VA',
      },
      url: 'https://live.wrir.org/',
      duration: DEFAULT_DURATION,
    },
    // TODO: need to sort out CORS on deployment to allow access via webamp
    // {
    // 	metaData: {
    // 		artist: "222.5FM Ghostwave Pirate Radio",
    // 		title: "Nightleek タマネギ",
    // 	},
    // url: "https://radio.ghostwave.soy/",
    // 	duration: DEFAULT_DURATION,
    // },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Groove Salad',
      },
      url: 'https://ice2.somafm.com/groovesalad-128-mp3',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Groove Salad Classic',
      },
      url: 'https://ice4.somafm.com/gsclassic-128-mp3',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'LOCAFM',
        title: 'Ambient',
      },
      url: 'https://s2.we4stream.com/listen/loca_ambient/live',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'soma fm',
        title: 'Vaporwaves',
      },
      url: 'https://ice2.somafm.com/vaporwaves-128-mp3',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'Nightwave Plaza',
        title: 'Online Vaporwave Radio',
      },
      url: 'https://radio.plaza.one/ogg',
      duration: DEFAULT_DURATION,
      metadataParser: {
        kind: 'icestats',
        sourceIndex: 0,
        titleField: 'yp_currently_playing',
        artistField: 'artist',
      },
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'live',
      },
      url: 'https://public.isekoi-radio.com/listen/isekoi/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataParser: { kind: 'azuracast', shortcode: 'isekoi' },
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'Non Stop Ambient',
      },
      url: 'https://public.isekoi-radio.com/listen/ambient/ambientradio.mp3',
      duration: DEFAULT_DURATION,
      metadataParser: { kind: 'azuracast', shortcode: 'ambient' },
    },
    {
      metaData: {
        artist: 'Isekoi Radio',
        title: 'Chill Zone',
      },
      url: 'https://public.isekoi-radio.com/listen/chill/radio.mp3',
      duration: DEFAULT_DURATION,
      metadataParser: { kind: 'azuracast', shortcode: 'chill' },
    },
    {
      metaData: {
        artist: 'NTS Mixtapes',
        title: 'Labrynth',
      },
      url: 'https://audio-edge-vqwx4.yyz.g.radiomast.io/51a1ebc2-ca46-43e4-9567-943551b956ce',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'NTS Mixtapes',
        title: 'Field Recordings',
      },
      url: 'https://audio-edge-n9hx8.yul.o.radiomast.io/86a296fc-a231-4328-bba0-754fa3eb28e7',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'NTS 1',
        title: 'live',
      },
      url: 'https://audio-edge-vqwx4.yyz.g.radiomast.io/nts1',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'NTS 2',
        title: 'live',
      },
      url: 'https://audio-edge-vqwx4.yyz.g.radiomast.io/nts2',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: '9128',
        title: 'live',
      },
      url: 'https://streams.radio.co/s0aa1e6f4a/listen',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'dinamo.fm',
        title: 'locodyno',
      },
      url: 'https://channels.dinamo.fm/locodyno-mp3',
      duration: DEFAULT_DURATION,
      metadataParser: {
        kind: 'icestats',
        sourceIndex: 17,
        titleField: 'title',
      },
    },
    {
      metaData: {
        artist: 'dinamo.fm',
        title: 'sleep',
      },
      url: 'https://channels.dinamo.fm/sleep-mp3',
      duration: DEFAULT_DURATION,
      metadataParser: {
        kind: 'icestats',
        sourceIndex: 23,
        titleField: 'title',
      },
    },
    {
      metaData: {
        artist: 'Underground Kollektiv',
        title: 'live',
      },
      url: 'https://s2.radio.co/s12ef3f65a/listen',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'Guias Sonoras',
        title: 'Experimental Ambient',
      },
      url: 'https://visual.shoutca.st/stream/guiassonoras',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'Guias Sonoras',
        title: 'Dom Fox Is Sleeping',
      },
      url: 'https://visual.shoutca.st/stream/domfoxissleeping',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'Modular Station',
        title: 'live',
      },
      url: 'https://broadcast.modular-station.com/radio/8000/radio.aac',
      duration: DEFAULT_DURATION,
      metadataParser: { kind: 'azuracast', shortcode: '1' },
    },
    {
      metaData: {
        artist: 'KOSMIK DSTROYER',
        title: 'SOUL MASSAGE',
      },
      url: 'https://kdradio.top/listen/kd_balearic/radio.mp3',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'KOSMIK DSTROYER',
        title: 'DNB / JUNGLE',
      },
      url: 'https://kdradio.top/listen/dnbjungle/radio.mp3',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: 'trip radio',
        title: 'live',
      },
      url: 'https://a13.asurahosting.com/listen/trip-radio/radio.mp3',
      duration: DEFAULT_DURATION,
    },
    {
      metaData: {
        artist: '鳥家',
        title: 'BirdHause',
      },
      url: 'https://ec2.yesstreaming.net:3195/stream',
      duration: DEFAULT_DURATION,
    },
  ];
}
