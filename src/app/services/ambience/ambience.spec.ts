import { TestBed } from '@angular/core/testing';

import { AmbienceService } from './ambience';

/**
 * Stands in for the audio element the module builds: jsdom has no media
 * playback, and the module is a property — not a promise — because it derives
 * the element from its state rather than reading it back.
 */
class FakeAudio {
  static built: FakeAudio[] = [];
  static refusePlay = false;

  readonly src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;
  playCount = 0;
  onerror: (() => void) | null = null;
  readonly pause = jest.fn(() => {
    this.paused = true;
  });

  constructor(src: string) {
    this.src = src;
    FakeAudio.built.push(this);
  }

  play(): Promise<void> {
    this.playCount += 1;
    if (FakeAudio.refusePlay) {
      return Promise.reject(new Error('playback refused'));
    }
    this.paused = false;
    return Promise.resolve();
  }
}

const audioGlobal = globalThis as unknown as { Audio: unknown };
const realAudio = audioGlobal.Audio;

/** The element the module built last. */
const lastElement = (): FakeAudio =>
  FakeAudio.built[FakeAudio.built.length - 1];

/** Lets a settled play() rejection reach the module's handler. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('AmbienceService', () => {
  let service: AmbienceService;

  beforeEach(() => {
    FakeAudio.built = [];
    FakeAudio.refusePlay = false;
    audioGlobal.Audio = FakeAudio;

    TestBed.configureTestingModule({ providers: [AmbienceService] });
    service = TestBed.inject(AmbienceService);
  });

  afterEach(() => {
    audioGlobal.Audio = realAudio;
  });

  it('1. starts at { null, 0.50, false, false }', () => {
    expect(service.state()).toEqual({
      sound: null,
      volume: 0.5,
      muted: false,
      playing: false,
    });
  });

  it('2. five presses of Volume − leave 0.10, a further press changes nothing, and Volume + clamps at 1.00', () => {
    for (let press = 0; press < 5; press++) {
      service.volumeDown();
    }
    expect(service.state().volume).toBe(0.1);
    // The floor is the floor, not a mute: silence stays the flag's business.
    expect(service.state().muted).toBe(false);

    service.volumeDown();
    expect(service.state().volume).toBe(0.1);

    for (let press = 0; press < 20; press++) {
      service.volumeUp();
    }
    expect(service.state().volume).toBe(1.0);
  });

  it('3. mute sits beside the remembered level, and survives shuffle, stop, play and a refused load', async () => {
    service.shuffle();
    expect(lastElement().volume).toBe(0.5);

    service.toggle(); // audible → muted
    expect(service.state()).toMatchObject({
      muted: true,
      volume: 0.5,
      playing: true,
    });
    expect(lastElement().volume).toBe(0);

    service.shuffle();
    expect(service.state().muted).toBe(true);
    expect(lastElement().volume).toBe(0);

    service.stop();
    expect(service.state()).toMatchObject({ muted: true, playing: false });
    service.play();
    expect(service.state()).toMatchObject({ muted: true, playing: true });
    expect(lastElement().volume).toBe(0);

    FakeAudio.refusePlay = true;
    service.shuffle();
    await settle();
    expect(service.state()).toMatchObject({
      muted: true,
      volume: 0.5,
      playing: false,
    });
    expect(lastElement().volume).toBe(0);
  });

  it('4. Volume + clears the mute and raises one step (0.50 → 0.60); Volume − while muted lowers and stays silent', () => {
    service.shuffle();
    service.toggle(); // muted at 0.50

    service.volumeUp();
    expect(service.state()).toMatchObject({ muted: false, volume: 0.6 });
    expect(lastElement().volume).toBe(0.6);

    service.toggle(); // muted at 0.60
    service.volumeDown();
    expect(service.state()).toMatchObject({ muted: true, volume: 0.5 });
    expect(lastElement().volume).toBe(0);
  });

  it('5. the level is settable while nothing is held, and the next Sound adopts it', () => {
    service.volumeDown();
    service.volumeDown();
    expect(service.state()).toMatchObject({ sound: null, volume: 0.3 });

    service.play(); // nothing held → a random Sound
    expect(service.state().volume).toBe(0.3);
    expect(lastElement().volume).toBe(0.3);
  });

  it('6. toggle is the audibility toggle, and resumes the held Sound instead of drawing a new one', () => {
    service.shuffle();
    const held = service.state().sound;
    expect(held).not.toBeNull();

    service.toggle();
    expect(service.state()).toMatchObject({
      muted: true,
      playing: true,
      sound: held,
    });

    service.stop(); // silent from here, and still holding
    service.toggle();
    expect(service.state()).toMatchObject({
      muted: false,
      playing: true,
      sound: held,
    });
    expect(lastElement().src).toBe(held?.path);
    expect(lastElement().playCount).toBe(1);
  });

  it('7. stop keeps the Sound, play resumes it from the beginning, and shuffle is the only thing that replaces it', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999);

    service.shuffle();
    const held = service.state().sound;
    expect(held).not.toBeNull();
    lastElement().currentTime = 42;

    service.stop();
    expect(service.state()).toMatchObject({ sound: held, playing: false });

    service.play();
    expect(service.state()).toMatchObject({ sound: held, playing: true });
    const resumed = lastElement();
    expect(resumed.src).toBe(held?.path);
    expect(resumed.currentTime).toBe(0);

    service.shuffle();
    expect(service.state().sound).not.toBe(held);

    jest.restoreAllMocks();
  });

  it('8. a refused play is an ordinary state on both play paths, and no rejection escapes', async () => {
    // An escaping rejection fails this suite; the assertions below are the
    // state it would leave behind.
    FakeAudio.refusePlay = true;

    service.play(); // nothing held → a random Sound
    await settle();
    const held = service.state().sound;
    expect(held).not.toBeNull();
    expect(service.state()).toMatchObject({ playing: false });

    service.play(); // the held Sound
    await settle();
    expect(service.state()).toMatchObject({ sound: held, playing: false });
  });
});
