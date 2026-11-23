import type { AmbienceState } from '../ambience/ambience';
import type { NowPlaying } from '../now-playing/kinds';
import {
  appletLabel,
  creditedName,
  nowPlayingLine,
  playbackActionLabel,
} from './wording';

/** The published Ambience state holding one Sound, silent and audible. */
const holding = (playing: boolean): AmbienceState => ({
  sound: { name: 'Rain', creator: 'someone', path: 'x' },
  volume: 0.5,
  muted: false,
  playing,
});

describe('wording', () => {
  describe('nowPlayingLine', () => {
    it('reads a track as artist, separator, title', () => {
      const track: NowPlaying = { artist: 'soma fm', title: 'Groove Salad' };

      expect(nowPlayingLine(track)).toBe('soma fm - Groove Salad');
    });

    it('reads a Station descriptor the same way when no track has arrived', () => {
      const descriptor: NowPlaying = { artist: 'Isekoi Radio', title: 'live' };

      expect(nowPlayingLine(descriptor)).toBe('Isekoi Radio - live');
    });

    it('says the shared sentence when nothing is tuned', () => {
      expect(nowPlayingLine(undefined)).toBe('Nothing playing');
    });

    it('drops the separator when there is no artist to precede it', () => {
      expect(nowPlayingLine({ artist: '', title: 'live' })).toBe('live');
    });
  });

  describe('the Ambience credit join', () => {
    it('says the shared sentence when nothing is held', () => {
      expect(
        creditedName({
          sound: null,
          volume: 0.5,
          muted: false,
          playing: false,
        }),
      ).toBe('Nothing playing');
    });

    it('joins the held Sound and its creator with the shared separator', () => {
      expect(creditedName(holding(true))).toBe('Rain - someone');
    });

    it('adds the mute when the Sound is latched quiet', () => {
      expect(appletLabel({ ...holding(true), muted: true })).toBe(
        'Muted — Rain - someone',
      );
    });
  });

  it('labels the one playback control with the action pressing it performs', () => {
    expect(playbackActionLabel(holding(true))).toBe('Stop');
    expect(playbackActionLabel(holding(false))).toBe('Play');
  });
});
