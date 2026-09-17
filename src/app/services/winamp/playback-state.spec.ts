import { FakeAudio } from '../../../testing/fake-audio';
import { flush } from '../../../testing/flush';
import { DrivenSource } from '../../../testing/driven-source';
import {
  EnginePlaybackStatus,
  PlaybackState,
  playbackState$,
} from './playback-state';

/** Two microtasks: the coalesced read and the publish both land. */

const FIVE_STATUSES: EnginePlaybackStatus[] = [
  'PLAYING',
  'PAUSED',
  'STOPPED',
  'ENDED',
  'CLOSED',
];

describe('playbackState$', () => {
  it("maps the engine's five statuses onto three values, with stopped, ended and closed all 'none'", async () => {
    const source = new DrivenSource();
    const seen: PlaybackState[] = [];
    const subscription = playbackState$(source).subscribe((s) => seen.push(s));
    await flush();

    for (const status of FIVE_STATUSES) {
      source.now = status;
      source.notify();
      await flush();
    }
    // The literal pins the mapping for all five; ENDED and CLOSED dedupe
    // against the 'none' STOPPED already published.
    expect(seen).toEqual(['none', 'playing', 'paused', 'none']);
    subscription.unsubscribe();
  });

  it('holds the invariant: tuned if and only if playing or paused, against every engine status', async () => {
    const source = new DrivenSource();
    const seen: PlaybackState[] = [];
    const subscription = playbackState$(source).subscribe((s) => seen.push(s));
    await flush();

    for (const status of FIVE_STATUSES) {
      source.now = status;
      source.notify();
      await flush();
      const tuned = seen.at(-1) !== 'none';
      expect(tuned).toBe(status === 'PLAYING' || status === 'PAUSED');
    }
    subscription.unsubscribe();
  });

  it('coalesces one tune gesture — reopen through set-tracks through play — to a single change', async () => {
    const source = new DrivenSource();
    const seen: PlaybackState[] = [];
    const subscription = playbackState$(source).subscribe((s) => seen.push(s));
    await flush();
    expect(seen).toEqual(['none']);

    // The gesture, synchronously, the way the engine performs it: reopen
    // reports stopped, the tracks are set, play starts the stream — and the
    // store notifies through all of it before a microtask runs.
    source.now = 'STOPPED';
    source.notify(); // reopen
    source.notify(); // setTracksToPlay
    source.now = 'PLAYING';
    source.notify(); // play
    await flush();

    expect(seen).toEqual(['none', 'playing']);
    subscription.unsubscribe();
  });

  it("observes paused → stopped, the transition the engine's hooks cannot see", async () => {
    const source = new DrivenSource();
    const seen: PlaybackState[] = [];
    const subscription = playbackState$(source).subscribe((s) => seen.push(s));
    await flush();

    source.now = 'PAUSED';
    source.notify();
    await flush();
    source.now = 'STOPPED';
    source.notify();
    await flush();

    expect(seen).toEqual(['none', 'paused', 'none']);
    subscription.unsubscribe();
  });

  it('dedupes by value: a notification that reads no change publishes nothing', async () => {
    const source = new DrivenSource();
    const seen: PlaybackState[] = [];
    const subscription = playbackState$(source).subscribe((s) => seen.push(s));
    await flush();

    source.now = 'STOPPED';
    source.notify();
    source.notify();
    await flush();

    expect(seen).toEqual(['none']);
    subscription.unsubscribe();
  });

  it('gives a late subscriber the current value, over one shared publisher', async () => {
    const source = new DrivenSource();
    const state$ = playbackState$(source); // one publisher, held by the player
    const first: PlaybackState[] = [];
    const a = state$.subscribe((s) => first.push(s));
    await flush();

    source.now = 'PAUSED';
    source.notify();
    await flush();

    const second: PlaybackState[] = [];
    expect(source.subscribers).toBe(1); // one store subscription, every reader
    const b = state$.subscribe((s) => second.push(s));
    await flush();
    expect(second).toEqual(['paused']);
    expect(source.subscribers).toBe(1); // still one, not one per reader

    a.unsubscribe();
    b.unsubscribe();
    expect(source.subscribers).toBe(0); // the publisher lives while readers listen
  });

  it('falls back to a short status poll when the store never notifies', async () => {
    const source = new DrivenSource();
    const seen: PlaybackState[] = [];
    const subscription = playbackState$(source, 50).subscribe((s) =>
      seen.push(s),
    );
    await flush();

    source.now = 'PLAYING'; // no notify: only the poll can see it
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(seen).toEqual(['none', 'playing']);
    subscription.unsubscribe();
  });

  it('treats Ambience as no input at all: a playing Sound moves nothing', async () => {
    FakeAudio.install();
    try {
      const sound = new FakeAudio('assets/audio/sounds/SoundLonely/x.mp3');
      await sound.play(); // Ambience is playing

      const source = new DrivenSource();
      const seen: PlaybackState[] = [];
      const subscription = playbackState$(source).subscribe((s) =>
        seen.push(s),
      );
      await flush();

      expect(sound.paused).toBe(false);
      expect(seen).toEqual(['none']); // the engine says stopped; Ambience is not consulted
      subscription.unsubscribe();
    } finally {
      FakeAudio.restore();
    }
  });
});
