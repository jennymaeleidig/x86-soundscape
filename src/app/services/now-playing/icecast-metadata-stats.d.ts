/**
 * The pieces of icecast-metadata-stats the Now Playing transport uses: one
 * instance, one read (`fetch`), then the instance's own `stop`. Its `start`
 * — the only site of the library's own interval — is never called.
 */
declare module 'icecast-metadata-stats' {
  export default class IcecastMetadataStats {
    constructor(
      endpoint: string,
      options?: { sources?: string[]; [option: string]: unknown },
    );
    /** One read of the configured sources; rejects when the read fails. */
    fetch(): Promise<unknown>;
    /** Stops the instance and cancels any in-progress read. */
    stop(): void;
  }
}
