import type { NowPlayingRequest } from './transport';

/** The live artist + title a payload yields, or the Station descriptor. */
export type NowPlaying = { artist: string; title: string };

/** The config a Station declares for a Kind; `{}` for the default kind. */
type NoConfig = Record<never, never>;

type IcestatsConfig = {
  sourceIndex?: number;
  titleField: string;
  artistField?: string;
};

type AzuracastConfig = { shortcode: string };

/**
 * One Kind: its Station config, the source derivation built from that config,
 * and the read of one payload. A row is the whole of a Kind; nothing outside
 * this module names its source or parses its payload.
 */
type Kind<C> = {
  source(url: string, config: C): NowPlayingRequest;
  read(raw: unknown, config: C): NowPlaying | undefined;
};

/**
 * The table. `icy` is the row a Station naming no Kind falls back to; the
 * `stats` kind left the union (a dead branch nothing read). `none` is not a
 * row: it means *never polls*, so it has no source to derive and no payload
 * to read, and `resolveKind` answers `undefined` for it.
 */
const kinds = {
  icy: {
    source: (url: string, _config: NoConfig) => ({
      via: 'library',
      url,
      source: 'icy',
    }),
    read: (raw: unknown, _config: NoConfig) => readIcy(raw),
  } satisfies Kind<NoConfig>,
  icestats: {
    source: (url: string, _config: IcestatsConfig) => ({
      via: 'library',
      url,
      source: 'icestats',
    }),
    read: (raw: unknown, config: IcestatsConfig) => readIcestats(raw, config),
  } satisfies Kind<IcestatsConfig>,
  azuracast: {
    source: (url: string, config: AzuracastConfig) => ({
      via: 'fetch',
      endpoint: `${originOf(url)}/api/nowplaying/${config.shortcode}`,
    }),
    read: (raw: unknown, config: AzuracastConfig) => readAzuracast(raw, config),
  } satisfies Kind<AzuracastConfig>,
};

type KindName = keyof typeof kinds;

/** The config one row declares, read from its own functions' second parameter. */
type ConfigOf<K extends KindName> = Parameters<(typeof kinds)[K]['read']>[1];

/** The kind union, built from the rows; `none` is the never-polls arm. */
export type MetadataKind =
  { [K in KindName]: { kind: K } & ConfigOf<K> }[KindName] | { kind: 'none' };

type DeclaredKind = Exclude<MetadataKind, { kind: 'none' }>;

/** The one resolved kind for a Station, ready to fetch and read. */
export type ResolvedKind = {
  source: NowPlayingRequest;
  read: (raw: unknown) => NowPlaying | undefined;
};

/**
 * Resolves a Station's descriptor to its Kind. A Station naming no Kind gets
 * `icy`; `none` resolves to `undefined`, meaning the Station is never polled.
 * The row's functions are bound to the Station's own config here, so the
 * returned source and read need no further kind knowledge.
 */
export function resolveKind(station: {
  url: string;
  metadataKind?: MetadataKind;
}): ResolvedKind | undefined {
  const declared = station.metadataKind;
  if (declared?.kind === 'none') {
    return undefined;
  }
  const config: DeclaredKind = declared ?? { kind: 'icy' };
  const row = kinds[config.kind] as Kind<DeclaredKind>;
  return {
    source: row.source(station.url, config),
    read: (raw) => row.read(raw, config),
  };
}

function originOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** The library's own read, one object keyed by source: `{ icy: {...} }`. */
function readIcy(raw: unknown): NowPlaying | undefined {
  const streamTitle = asString(
    asRecord(asRecord(raw)?.['icy'])?.['StreamTitle'],
  );
  if (!streamTitle) {
    return undefined;
  }
  const separator = streamTitle.indexOf(STREAM_TITLE_SEPARATOR);
  if (separator < 0) {
    // No artist in the stream title; Now Playing fills it from the descriptor.
    return { artist: '', title: streamTitle };
  }
  return {
    artist: streamTitle.slice(0, separator),
    title: streamTitle.slice(separator + STREAM_TITLE_SEPARATOR.length),
  };
}

/** The library's icestats read: `{ icestats: { source: ... } }`. */
function readIcestats(
  raw: unknown,
  config: IcestatsConfig,
): NowPlaying | undefined {
  const source = asRecord(asRecord(raw)?.['icestats'])?.['source'];
  let entry: Record<string, unknown> | undefined;
  if (config.sourceIndex != null) {
    entry = Array.isArray(source)
      ? asRecord(source[config.sourceIndex])
      : undefined;
  } else {
    entry = asRecord(source);
  }
  const title = asString(entry?.[config.titleField]);
  if (!title) {
    return undefined;
  }
  const artist =
    config.artistField != null
      ? asString(entry?.[config.artistField])
      : undefined;
  return { artist: artist ?? '', title };
}

/** Azuracast's own JSON, fetched directly: `{ now_playing: { song: {...} } }`. */
function readAzuracast(
  raw: unknown,
  _config: AzuracastConfig,
): NowPlaying | undefined {
  const song = asRecord(asRecord(asRecord(raw)?.['now_playing'])?.['song']);
  const title = asString(song?.['title']);
  if (!title) {
    return undefined;
  }
  return { artist: asString(song?.['artist']) ?? '', title };
}

/** How a stream title carries its artist and its title. */
const STREAM_TITLE_SEPARATOR = ' - ';
