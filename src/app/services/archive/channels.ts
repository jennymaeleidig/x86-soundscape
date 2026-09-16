/**
 * The Channels of the surf feature, in the Surfer's cycle order.
 *
 * A Channel is a display name plus the archive.org collections that back it;
 * the list's order is the Surfer's cycle order. Ported from
 * `x86-ad-agent/src/config/channels.py` — the provenance for the data. The
 * coupling between a name and its collections is recorded by the type.
 */
export interface Channel {
  readonly name: string;
  readonly collections: readonly string[];
}

export const CHANNELS: readonly Channel[] = [
  {
    name: 'Somewhat Commercial',
    collections: [
      'vhscommercials',
      'vhsopenings',
      'vhstrailers',
      'classic_tv_commercials',
      'movie_trailers',
    ],
  },
  {
    name: 'VHS Vault',
    collections: [
      'vhsvault',
      'vhsvault_inbox',
      'flemishdog',
      'video-home-system',
      'vhsanddvdcollector',
      'gorelicktv',
      'vhsmovies',
      'georgesretrochannel',
      'the-vista-group-video',
    ],
  },
  {
    name: 'Anime All Access',
    collections: ['anime_miscellaneous', 'anime', 'animepacks', 'anime-series'],
  },
  {
    name: 'Gamer Nation',
    collections: [
      'game_replays',
      'worldoflongplays',
      'speed_runs',
      'lets-play',
      'gamefootage',
      'videogameprev',
    ],
  },
  {
    name: 'Kids Korner',
    collections: ['vhskids', 'vhsinstructionals', 'saturdaymorningcartoons'],
  },
];
