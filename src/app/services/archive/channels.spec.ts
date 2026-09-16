import { CHANNELS } from './channels';

// Invariants of the CHANNELS list — the facts the old name-keyed record could
// not express.

/** Every Channel has at least one collection. */
it('gives every Channel at least one collection', () => {
  for (const channel of CHANNELS) {
    expect(channel.collections.length).toBeGreaterThan(0);
  }
});

/** No two Channels share a collection, so a collection identifies its Channel. */
it('shares no collection between two Channels', () => {
  const seen = new Set<string>();
  for (const channel of CHANNELS) {
    for (const collection of channel.collections) {
      expect(seen.has(collection)).toBe(false);
      seen.add(collection);
    }
  }
});
