import Stations from '../app/data/stations';

/** An ICY-shaped metadata payload, the shape the icy Kind reads. */
export const icyPayload = (streamTitle: string) => ({
  icy: { StreamTitle: streamTitle },
});

/** The plain-icy Station most poll specs tune. */
export const plainStation = () => {
  const station = Stations.stations.find(
    (candidate) => !candidate.metadataKind,
  );
  if (!station) {
    throw new Error('No Station without a metadata kind exists');
  }
  return station;
};
