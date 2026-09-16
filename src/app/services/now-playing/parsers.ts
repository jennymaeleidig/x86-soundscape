import type { MetadataParser, Station } from '../../../assets/audio/stations';

/**
 * The per-kind read of a Now Playing payload. Each adapter is table-driven,
 * receives the unwrapped source value and its own narrowed parser config, and
 * never throws: a payload that yields no track is `undefined`, which is already
 * the "nothing arrived" value, so a malformed payload needs no rule of its own.
 */
export type NowPlaying = { artist: string; title: string };

/** The adapter one kind of Station's parser: `read(raw, config)`. */
type Reader<C> = (raw: unknown, config: C) => NowPlaying | undefined;

/** The parser config the ICY adapter reads. */
type IcyConfig = Extract<MetadataParser, { kind: 'icy' }>;
/** The parser config the Icestats adapter reads. */
type IcestatsConfig = Extract<MetadataParser, { kind: 'icestats' }>;
/** The parser config the Azuracast adapter reads. */
type AzuracastConfig = Extract<MetadataParser, { kind: 'azuracast' }>;

/**
 * The registry, keyed by kind. The `stats` kind left the union (a dead branch
 * nothing read); `none` is absent — it means *never polls*, so it has no
 * payload to read and the lookup answers `undefined` for it.
 */
const adapters: {
  icy: Reader<IcyConfig>;
  icestats: Reader<IcestatsConfig>;
  azuracast: Reader<AzuracastConfig>;
} = {
  icy: (raw) => readIcy(raw),
  icestats: (raw, config) => readIcestats(raw, config),
  azuracast: (raw, config) => readAzuracast(raw, config),
};

/** The one resolved parser for a Station, ready to read a payload. */
export type ResolvedParser = {
  /** The kind that was resolved, so the transport knows which source to read. */
  kind: Exclude<MetadataParser['kind'], 'none'>;
  read: (raw: unknown) => NowPlaying | undefined;
};

/**
 * The lookup. The `?? 'icy'` default for a Station that names no parser is
 * named here and nowhere else; `none` resolves to `undefined`, meaning the
 * Station is never polled.
 */
export function parserFor(
  config: MetadataParser | undefined,
): ResolvedParser | undefined {
  switch (config?.kind) {
    case undefined:
    case 'icy':
      return {
        kind: 'icy',
        read: (raw) => adapters.icy(raw, config ?? { kind: 'icy' }),
      };
    case 'icestats':
      return {
        kind: 'icestats',
        read: (raw) => adapters.icestats(raw, config),
      };
    case 'azuracast':
      return {
        kind: 'azuracast',
        read: (raw) => adapters.azuracast(raw, config),
      };
    case 'none':
      return undefined;
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
  const separator = streamTitle.indexOf(' - ');
  if (separator < 0) {
    // No artist in the stream title; Now Playing fills it from the descriptor.
    return { artist: '', title: streamTitle };
  }
  return {
    artist: streamTitle.slice(0, separator),
    title: streamTitle.slice(separator + 3),
  };
}

/** The library's icestats read: `{ icestats: { source: ... } }`. */
function readIcestats(
  raw: unknown,
  config: IcestatsConfig,
): NowPlaying | undefined {
  const source = asRecord(asRecord(raw)?.['icestats'])?.['source'];
  const entry =
    config.sourceIndex != null
      ? Array.isArray(source)
        ? asRecord(source[config.sourceIndex])
        : undefined
      : asRecord(source);
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

/** The source one attempt reads, built from the Station and its parser. */
export function sourceFor(
  station: Station,
  kind: ResolvedParser['kind'],
): NowPlayingSource {
  const parser = station.metadataParser;
  if (parser?.kind === 'azuracast') {
    return {
      via: 'fetch',
      endpoint: `${originOf(station.url)}/api/nowplaying/${parser.shortcode}`,
    };
  }
  return { via: 'library', url: station.url, source: kind };
}

function originOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

/** Where one attempt reads from: the dependency's own read, or our own fetch. */
export type NowPlayingSource =
  | { via: 'library'; url: string; source: string }
  | { via: 'fetch'; endpoint: string };
