import '../../../testing/jsdom-globals';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AppletComponent } from './applet.component';
import {
  AmbienceService,
  type AmbienceState,
} from '../../services/ambience/ambience';
import { type Sound } from '../../services/ambience/sounds';
import { Feature } from '../../../assets/applets/applet-definitions';
import { WindowService } from '../../services/window/window.service';
import { WinampService } from '../../services/winamp/winamp.service';

const SOUND: Sound = {
  path: 'assets/audio/sounds/ARNO/some-recording.mp3',
  name: 'Macintosh Classic II — startup chime and floppy drive',
};

const AMBIENCE_OFF_ICON = 'assets/images/ambience_off.png';
const AMBIENCE_ON_ICON = 'assets/images/ambience_on.png';

describe('AppletComponent on Ambience', () => {
  const state = signal<AmbienceState>({
    sound: null,
    volume: 0.5,
    muted: false,
    playing: false,
  });
  const ambience = {
    state,
    toggle: jest.fn(),
    play: jest.fn(),
    stop: jest.fn(),
  };

  let fixture: ComponentFixture<AppletComponent>;

  /** Puts the applet in a state and re-renders it. */
  const show = (next: AmbienceState) => {
    state.set(next);
    fixture.detectChanges();
  };

  const button = () => fixture.debugElement.query(By.css('button'));
  const icon = () => button().query(By.css('img')).nativeElement.src;
  const label = () => button().nativeElement.title;

  beforeEach(() => {
    state.set({ sound: null, volume: 0.5, muted: false, playing: false });
    ambience.toggle.mockClear();
    ambience.stop.mockClear();

    TestBed.configureTestingModule({
      providers: [
        { provide: AmbienceService, useValue: ambience },
        { provide: WindowService, useValue: {} },
        { provide: WinampService, useValue: {} },
        { provide: 'appletIsMoving', useValue: () => {} },
        {
          provide: 'appletDragState',
          useValue: { isDragGesture: () => false, reset: () => {} },
        },
      ],
    });

    fixture = TestBed.createComponent(AppletComponent);
    fixture.componentInstance.selector = Feature.Ambience;
    fixture.componentInstance.title = 'Ambience';
    fixture.detectChanges();
  });

  it('reports OFF and names nothing held while it holds nothing', () => {
    expect(icon()).toContain(AMBIENCE_OFF_ICON);
    expect(label()).toBe('Nothing playing');
  });

  it('reports ON and names the Sound while the Sound is audible', () => {
    show({ sound: SOUND, volume: 0.5, muted: false, playing: true });

    expect(icon()).toContain(AMBIENCE_ON_ICON);
    expect(label()).toBe(SOUND.name);
  });

  it('reports OFF for silence by mute, keeps the name, and says which way the sound is going', () => {
    show({ sound: SOUND, volume: 0.5, muted: true, playing: true });

    expect(icon()).toContain(AMBIENCE_OFF_ICON);
    expect(label()).toBe(`Muted — ${SOUND.name}`);
  });

  it('reports OFF for silence by a stopped element, and still names the Sound', () => {
    show({ sound: SOUND, volume: 0.5, muted: false, playing: false });

    expect(icon()).toContain(AMBIENCE_OFF_ICON);
    expect(label()).toBe(SOUND.name);
  });

  it('clicks the audibility toggle, never the stop it used to be', () => {
    show({ sound: SOUND, volume: 0.5, muted: true, playing: true });

    button().triggerEventHandler('dblclick', {});

    expect(ambience.toggle).toHaveBeenCalledTimes(1);
    expect(ambience.stop).not.toHaveBeenCalled();
  });
});
