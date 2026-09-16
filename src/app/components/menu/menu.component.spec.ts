import '../../../testing/jsdom-globals';

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { MenuComponent } from './menu.component';
import { AmbienceService } from '../../services/ambience/ambience';
import { ambienceSounds } from '../../services/ambience/sounds';
import { PopUpService } from '../../services/pop-up/pop-up.service';
import { WinampService } from '../../services/winamp/winamp.service';
import { MetadataService } from '../../services/metadata/metadata.service';
import { FakeAudio } from '../../../testing/fake-audio';

describe('MenuComponent on Ambience', () => {
  let fixture: ComponentFixture<MenuComponent>;
  let ambience: AmbienceService;

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

  const level = (): string => {
    const found = items().find((item) =>
      item.nativeElement.textContent.trim().startsWith('Volume:'),
    );
    if (!found) throw new Error('the Ambience menu shows no level');
    return found.nativeElement.textContent.trim();
  };

  /** The name the marquee shows, which is the first of its four copies. */
  const name = (): string =>
    fixture.debugElement
      .query(By.css('om-marquee .item'))
      .nativeElement.textContent.trim();

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
          },
        },
        {
          provide: MetadataService,
          useValue: { currentTrack$: of({ artist: 'N', title: '/ A' }) },
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

  it("shows the Sound's own name, and the same nothing-held text the Applet shows", () => {
    expect(name()).toBe('Nothing playing');

    press('Unmute');
    expect(name()).toBe(ambience.state().sound?.name);
    expect(name()).not.toBe('Nothing playing');
  });

  it('keeps Play, Stop, Shuffle and Volume working against the published state, Stop holding the Sound for Play', () => {
    press('Shuffle');
    const held = ambience.state().sound!;
    expect(held).not.toBeNull();
    FakeAudio.last.currentTime = 42;

    press('Stop');
    expect(ambience.state()).toMatchObject({ sound: held, playing: false });

    press('Play');
    expect(ambience.state()).toMatchObject({ sound: held, playing: true });
    expect(FakeAudio.last.currentTime).toBe(0);

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
