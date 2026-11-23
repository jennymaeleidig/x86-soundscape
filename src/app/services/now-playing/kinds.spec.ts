import { MetadataParser, resolveKind } from './kinds';
import type { Station } from '../../data/stations';
import { icyPayload } from '../../../testing/icy';

/** A Station descriptor carrying only what a Kind's derivation reads. */
function station(
  overrides: { url?: string; metadataParser?: MetadataParser } = {},
): Station {
  return {
    metaData: { artist: 'Artist', title: 'Title' },
    url: overrides.url ?? 'https://ice.example/stream',
    duration: 5999,
    ...(overrides.metadataParser
      ? { metadataParser: overrides.metadataParser }
      : {}),
  };
}

describe('resolveKind', () => {
  it('a Station naming no parser reads icy from its own URL', () => {
    const resolved = resolveKind(station())!;
    expect(resolved.source).toEqual({
      via: 'library',
      url: 'https://ice.example/stream',
      source: 'icy',
    });
    expect(resolved.read(icyPayload('Artist - Title'))).toEqual({
      artist: 'Artist',
      title: 'Title',
    });
    expect(resolved.read(icyPayload('No separator'))).toEqual({
      artist: '',
      title: 'No separator',
    });
    expect(resolved.read({ nothing: 'here' })).toBeUndefined();
  });

  it('icestats reads the source at the declared index, with its title and artist fields', () => {
    const resolved = resolveKind(
      station({
        metadataParser: {
          kind: 'icestats',
          sourceIndex: 1,
          titleField: 'title',
          artistField: 'artist',
        },
      }),
    )!;
    expect(resolved.source).toEqual({
      via: 'library',
      url: 'https://ice.example/stream',
      source: 'icestats',
    });
    expect(
      resolved.read({
        icestats: {
          source: [{ title: 'Wrong' }, { title: 'Right', artist: 'Person' }],
        },
      }),
    ).toEqual({ artist: 'Person', title: 'Right' });
    expect(
      resolved.read({ icestats: { source: [{ title: '' }] } }),
    ).toBeUndefined();
  });

  it('icestats without an index reads the source object', () => {
    const resolved = resolveKind(
      station({
        metadataParser: { kind: 'icestats', titleField: 'song' },
      }),
    )!;
    expect(
      resolved.read({ icestats: { source: { song: 'Object Song' } } }),
    ).toEqual({ artist: '', title: 'Object Song' });
  });

  it('azuracast fetches its shortcode from the Station origin', () => {
    const resolved = resolveKind(
      station({
        url: 'https://radio.example/listen/a/radio.mp3',
        metadataParser: { kind: 'azuracast', shortcode: 'a' },
      }),
    )!;
    expect(resolved.source).toEqual({
      via: 'fetch',
      endpoint: 'https://radio.example/api/nowplaying/a',
    });
    expect(
      resolved.read({ now_playing: { song: { artist: 'A', title: 'T' } } }),
    ).toEqual({ artist: 'A', title: 'T' });
    expect(resolved.read({ now_playing: {} })).toBeUndefined();
  });

  it('an unparseable Station URL leaves the azuracast endpoint unprefixed', () => {
    const resolved = resolveKind(
      station({
        url: 'not a url',
        metadataParser: { kind: 'azuracast', shortcode: 'a' },
      }),
    )!;
    expect(resolved.source).toEqual({
      via: 'fetch',
      endpoint: '/api/nowplaying/a',
    });
  });

  it('none never resolves, so there is no source and no read', () => {
    expect(
      resolveKind(station({ metadataParser: { kind: 'none' } })),
    ).toBeUndefined();
  });
});
