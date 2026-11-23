import Stations from '../app/data/stations';

/** An ICY-shaped metadata payload, the shape the icy Kind reads. */
export const icyPayload = (streamTitle: string) => ({
  icy: { StreamTitle: streamTitle },
});

/** The plain-icy Station most poll specs tune. */
export const plainStation = () =>
  Stations.stations.find((candidate) => !candidate.metadataKind)!;
