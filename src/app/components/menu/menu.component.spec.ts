import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { NowPlaying } from '../../services/now-playing/parsers';

import { MenuComponent } from './menu.component';
import { AmbienceService } from '../../services/ambience/ambience';
import { ambienceSounds } from '../../services/ambience/sounds';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { WinampService } from '../../services/winamp/winamp.service';
import { type PlaybackState } from '../../services/winamp/playback-state';
import { NowPlayingService } from '../../services/now-playing/now-playing.service';
import { FakeAudio } from '../../../testing/fake-audio';

describe('MenuComponent on Ambience', () => {
  let fixture: ComponentFixture<MenuComponent>;
  let ambience: AmbienceService;
  let nowPlaying$: Subject<object | undefined>;
  let playback$: Subject<PlaybackState>;

  /** The bar's Now Playing readout, the marquee's one line. */
  const bar = (): string =>
    fixture.debugElement
      .query(By.css('#scroll-container .item'))
      .nativeElement.textContent.trim();

  /** The Now Playing row itself, whose dim carries the idle state. */
  const nowPlayingRow = (): DebugElement =>
    fixture.debugElement.query(By.css('#scroll-container'));

  /** The Ambience row itself, whose dim carries the stopped state. */
  const ambienceRow = (): DebugElement =>
    fixture.debugElement.query(By.css('#ambience-container'));

  /** The Ambience submenu, the one place these items live. */
  const submenu = () =>
    fixture.debugElement
      .queryAll(By.css('li[role="menu-item"]'))
      .find((item) =>
        item.nativeElement.textContent.trim().startsWith('Ambience'),
      )!;

  /** The items of that submenu, in the order the listener reads them. */
  const items = () => submenu().queryAll(By.css('li[role="menu-item"]'));

  const reading = (text: string): DebugElement => {
    const found = items().find(
      (item) => item.nativeElement.textContent.trim() === text,
    );
    if (!found) {
      throw new Error(
        `the Ambience menu shows no item reading "${text}"; it shows: ` +
          items()
            .map((item) => item.nativeElement.textContent.trim())
            .join(', '),
      );
    }
    return found;
  };

  /** The level row, which the Menu prints rather than offering as a control. */
  const levelRow = (): DebugElement => {
    const found = items().find((item) =>
      item.nativeElement.textContent.trim().startsWith('Volume:'),
    );
    if (!found) throw new Error('the Ambience menu shows no level');
    return found;
  };

  const level = (): string => levelRow().nativeElement.textContent.trim();

  /** The name the marquee shows, which is the first of its four copies. */
  const name = (): string =>
    fixture.debugElement
      .query(By.css('om-marquee .item .name'))
      .nativeElement.textContent.trim();

  /** The credit beside the name, when a Sound is held. */
  const credit = (): string | null => {
    const shown = fixture.debugElement.query(By.css('om-marquee .credit'));
    return shown ? shown.nativeElement.textContent.trim() : null;
  };

  const press = (text: string) => {
    reading(text).triggerEventHandler('click', {});
    fixture.detectChanges();
  };

  beforeEach(() => {
    FakeAudio.install();

    TestBed.configureTestingModule({
      providers: [
        { provide: PopUpService, useValue: { open: jest.fn() } },
        {
          provide: WinampService,
          useValue: {
            play: jest.fn(),
            pause: jest.fn(),
            prev: jest.fn(),
            stop: jest.fn(),
            next: jest.fn(),
            playbackState$: (playback$ = new Subject<PlaybackState>()),
          },
        },
        {
          provide: NowPlayingService,
          useValue: { nowPlaying$: (nowPlaying$ = new Subject()) },
        },
        AmbienceService,
      ],
    });

    fixture = TestBed.createComponent(MenuComponent);
    fixture.detectChanges();
    ambience = TestBed.inject(AmbienceService);
  });

  afterEach(() => {
    FakeAudio.restore();
  });

  it('builds the level from the same elements as the controls, so it is indented with them', () => {
    // system.css indents a row through ul[role=menu] > [role=menu-item] > a
    // (padding: 5px 20px), so a row without that anchor sits flush left.
    const row = levelRow();
    const control = reading('Play');

    expect(row.nativeElement.tagName).toBe(control.nativeElement.tagName);
    expect(row.children.length).toBe(control.children.length);
    expect(row.query(By.css('a'))).toBeTruthy();
  });

  /** The dropdown's own rows, in the order the listener reads them. */
  const menuRows = (): HTMLElement[] =>
    [
      ...submenu().query(By.css('ul[role="menu"]')).nativeElement.children,
    ] as HTMLElement[];

  it('leads with the level, breaks it with the dotted divider, and closes the name below the solid rule', () => {
    const rows = menuRows();
    const labels = rows.map((row) => row.textContent.trim() || row.tagName);
    const levelAt = labels.findIndex((text) => text.startsWith('Volume:'));
    const nameAt = rows.findIndex((row) => row.querySelector('om-marquee'));

    // The level opens the submenu, and its break is the library's dotted
    // divider row: the controls resume after it, so nothing suggests the level
    // is one of them.
    expect(levelAt).toBe(0);
    expect(rows[levelAt + 1].className).toContain('divider');
    expect(rows[levelAt + 1].querySelector('hr')).toBeFalsy();
    expect(labels[levelAt + 2]).toBe('Unmute');

    // The name closes the submenu, and the library's solid hr is what stands
    // between it and the controls.
    expect(rows[nameAt - 1].tagName).toBe('HR');
    expect(nameAt).toBe(rows.length - 1);

    // system.css has no disabled menu row, so the semantics say it instead.
    expect(levelRow().nativeElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('prints the level, and a press of Volume + or Volume − moves it one step while nothing plays', () => {
    expect(level()).toBe('Volume: 50%');
    expect(ambience.state().sound).toBeNull();

    press('Volume +');
    expect(level()).toBe('Volume: 60%');

    press('Volume -');
    expect(level()).toBe('Volume: 50%');
    expect(ambience.state().sound).toBeNull();
  });

  it('labels its mute item with the action pressing it performs, and that action is the audibility toggle', () => {
    expect(reading('Unmute')).toBeTruthy();

    press('Unmute');
    expect(reading('Mute')).toBeTruthy();
    expect(ambience.state()).toMatchObject({ playing: true, muted: false });
    const held = ambience.state().sound;

    press('Mute');
    expect(reading('Unmute')).toBeTruthy();
    expect(ambience.state().muted).toBe(true);

    press('Unmute');
    expect(ambience.state()).toMatchObject({
      playing: true,
      muted: false,
      sound: held,
    });
    // Two presses of the item, one Sound: the second resumed rather than drew.
    expect(FakeAudio.built).toHaveLength(1);
  });

  it('renders the three readings itself: a track as artist - title, the descriptor as the Station, and nothing tuned as the shared sentence', () => {
    // Nothing is tuned at startup, and there is no `Now Playing —` prefix:
    // the marquee is the whole readout.
    const rows = () =>
      fixture.debugElement
        .queryAll(By.css('li[role="menu-item"]'))
        .map((item) => item.nativeElement.textContent.trim());
    expect(rows()).not.toContain('Now Playing —');
    expect(bar()).toBe('Nothing playing');

    nowPlaying$.next({ artist: 'soma fm', title: 'Groove Salad' });
    fixture.detectChanges();
    expect(bar()).toBe('soma fm - Groove Salad');

    // A tuned Station with no track yet reads as the Station itself.
    nowPlaying$.next({ artist: 'Isekoi Radio', title: 'live' });
    fixture.detectChanges();
    expect(bar()).toBe('Isekoi Radio - live');

    // Untuned again, the bar says the sentence, never a placeholder.
    nowPlaying$.next(undefined);
    fixture.detectChanges();
    expect(bar()).toBe('Nothing playing');
  });

  it('dims the row whenever the player is not playing, and adds the pause glyph only when paused', () => {
    // Nothing tuned at startup: idle by default, but no pause to glyph.
    expect(nowPlayingRow().nativeElement.classList).toContain('idle');
    expect(bar()).toBe('Nothing playing');

    nowPlaying$.next({ artist: 'soma fm', title: 'Groove Salad' });
    playback$.next('paused');
    fixture.detectChanges();

    // The mark says the state on its own — the label keeps its place and the
    // marquee keeps its animation, so pausing never freezes a half-scrolled
    // title.
    expect(bar()).toBe('❚❚ soma fm - Groove Salad');
    expect(nowPlayingRow().nativeElement.classList).toContain('idle');
    expect(
      fixture.debugElement.query(By.css('#scroll-container om-marquee')),
    ).toBeTruthy();

    playback$.next('playing');
    fixture.detectChanges();
    expect(bar()).toBe('soma fm - Groove Salad');
    expect(nowPlayingRow().nativeElement.classList).not.toContain('idle');

    // Stopped collapses into untuned: dimmed again, and no pause to glyph.
    playback$.next('none');
    nowPlaying$.next(undefined);
    fixture.detectChanges();
    expect(bar()).toBe('Nothing playing');
    expect(nowPlayingRow().nativeElement.classList).toContain('idle');
  });

  it("dims Ambience's own marquee while it is stopped, and clears the dim once it plays", () => {
    // Nothing held and nothing playing at startup: the row reads as stopped.
    expect(ambienceRow().nativeElement.classList).toContain('stopped');

    press('Play');
    expect(ambienceRow().nativeElement.classList).not.toContain('stopped');

    press('Stop');
    expect(ambienceRow().nativeElement.classList).toContain('stopped');
  });

  it("shows the Sound's own name and who recorded it, and the same nothing-held text the Applet shows", () => {
    expect(name()).toBe('Nothing playing');
    // Nothing held, nothing to credit.
    expect(credit()).toBeNull();

    press('Unmute');
    expect(name()).toBe(ambience.state().sound?.name);
    expect(name()).not.toBe('Nothing playing');
    expect(credit()).toBe(`- ${ambience.state().sound?.creator}`);
  });

  it('keeps the playback toggle, Shuffle and Volume working against the published state, the toggle holding the Sound and naming the action it performs', () => {
    press('Shuffle');
    const held = ambience.state().sound!;
    expect(held).not.toBeNull();
    FakeAudio.last.currentTime = 42;
    // Running, so the one control offers the action that stops it.
    expect(reading('Stop')).toBeTruthy();

    press('Stop');
    expect(ambience.state()).toMatchObject({ sound: held, playing: false });
    // Stopped, so the same row now offers the action that starts it.
    expect(reading('Play')).toBeTruthy();

    press('Play');
    expect(ambience.state()).toMatchObject({ sound: held, playing: true });
    expect(FakeAudio.last.currentTime).toBe(0);
    expect(reading('Stop')).toBeTruthy();

    // Point the draw at a different Sound, so the assertion below fails for the
    // right reason instead of once in thirty runs.
    const elsewhere = ambienceSounds.filter(
      (sound) => sound.path !== held.path,
    );
    jest
      .spyOn(Math, 'random')
      .mockReturnValue(
        (ambienceSounds.indexOf(elsewhere[0]) + 0.5) / ambienceSounds.length,
      );

    press('Shuffle');
    expect(ambience.state().sound).toEqual(elsewhere[0]);
    expect(ambience.state().sound).not.toEqual(held);

    jest.restoreAllMocks();
  });
});
