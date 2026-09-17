import Stations from '../assets/audio/stations';

/** An ICY-shaped metadata payload, the shape the plain-icy parser reads. */
export const icyPayload = (streamTitle: string) => ({
  icy: { StreamTitle: streamTitle },
});

/** The plain-icy Station most poll specs tune. */
export const plainStation = () =>
  Stations.stations.find((candidate) => !candidate.metadataParser)!;
