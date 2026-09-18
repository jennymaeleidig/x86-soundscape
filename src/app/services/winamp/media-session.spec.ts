import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NowPlaying } from '../now-playing/parsers';
import { PlaybackState } from './playback-state';
import { MEDIA_SESSION, wireMediaSession } from './media-session';
import type { MediaSessionSurface } from './media-session';
import { FakeMediaSession } from '../../../testing/fake-media-session';
import { withNavigator } from '../../../testing/navigator';

/** The player's transport, as the widget's buttons reach it. */
class RecordingCommands {
  calls: string[] = [];
  play(): void {
    this.calls.push('play');
  }
  pause(): void {
    this.calls.push('pause');
  }
  prev(): void {
    this.calls.push('prev');
  }
  next(): void {
    this.calls.push('next');
  }
}

const track: NowPlaying = { artist: 'Artist', title: 'Title' };

describe('the Media Session has one writer', () => {
  let session: FakeMediaSession;
  let commands: RecordingCommands;
  let readings: Subject<NowPlaying | undefined>;
  let states: Subject<PlaybackState>;

  beforeEach(() => {
    session = new FakeMediaSession();
    commands = new RecordingCommands();
    readings = new Subject();
    states = new Subject();
    wireMediaSession(readings, states, commands, session);
  });

  it('playing announces playing with the Now Playing as the widget’s metadata', () => {
    readings.next(track);
    states.next('playing');
    expect(session.playbackState).toBe('playing');
    expect(session.metadata).toEqual({ title: 'Title', artist: 'Artist' });
  });

  it('paused announces paused and the same metadata stands', () => {
    readings.next(track);
    states.next('playing');
    states.next('paused');
    expect(session.playbackState).toBe('paused');
    expect(session.metadata).toEqual({ title: 'Title', artist: 'Artist' });
  });

  it('none announces none and clears the metadata', () => {
    readings.next(track);
    states.next('playing');
    states.next('none');
    expect(session.playbackState).toBe('none');
    expect(session.metadata).toBeNull();
  });

  it('an untuned player announces no metadata, so the widget never shows an Ambience sound', () => {
    readings.next(undefined);
    states.next('playing');
    expect(session.playbackState).toBe('playing');
    expect(session.metadata).toBeNull();
  });

  it('a fresh reading replaces the metadata the widget shows', () => {
    readings.next(track);
    states.next('playing');
    readings.next({ artist: 'Next', title: 'Station' });
    expect(session.metadata).toEqual({ title: 'Station', artist: 'Next' });
  });

  it('installs play, pause, previous and next — and no seek handler', () => {
    expect([...session.handlers.keys()].sort()).toEqual([
      'nexttrack',
      'pause',
      'play',
      'previoustrack',
    ]);
  });

  it('the widget’s buttons drive the player’s guarded transport', () => {
    session.handlers.get('play')!();
    session.handlers.get('pause')!();
    session.handlers.get('previoustrack')!();
    session.handlers.get('nexttrack')!();
    expect(commands.calls).toEqual(['play', 'pause', 'prev', 'next']);
  });

  it('a browser without the API: the adapter does nothing and the app still works', () => {
    const stillWorks = wireMediaSession(readings, states, commands);
    expect(() => {
      readings.next(track);
      states.next('playing');
      stillWorks.unsubscribe();
    }).not.toThrow();
    expect(commands.calls).toEqual([]);
  });

  it('releasing the adapter unsubscribes and removes the handlers', () => {
    const fresh = new FakeMediaSession();
    const handle = wireMediaSession(readings, states, commands, fresh);
    handle.unsubscribe();
    expect(fresh.handlers.size).toBe(0);
    expect(() => {
      readings.next({ artist: 'After', title: 'Release' });
      states.next('playing');
    }).not.toThrow();
    expect(fresh.playbackState).toBe('none');
    expect(fresh.metadata).toBeNull();
  });
});

describe('the Media Session token', () => {
  it('hands over the browser’s session when the API is there', () => {
    const fake = new FakeMediaSession();
    withNavigator({ mediaSession: fake }, () => {
      TestBed.configureTestingModule({});
      expect(TestBed.inject(MEDIA_SESSION)).toBe(fake as MediaSessionSurface);
    });
  });

  it('declines when the API is missing', () => {
    withNavigator({}, () => {
      TestBed.configureTestingModule({});
      expect(TestBed.inject(MEDIA_SESSION)).toBeUndefined();
    });
  });
});
