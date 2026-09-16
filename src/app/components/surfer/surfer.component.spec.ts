import '../../../testing/jsdom-globals';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { type Observable, firstValueFrom } from 'rxjs';

import { SurferComponent, type VideoData } from './surfer.component';
import { flushOneVideo } from '../../../testing/archive-http';

describe('SurferComponent', () => {
  let component: SurferComponent;
  let fixture: ComponentFixture<SurferComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SurferComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(SurferComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('walks the Surfer cycle in list order, wraps, and shows the held Channel name', async () => {
    // The template's async pipe sits inside the marquee's ng-template, which
    // jsdom never renders — subscribe to the stream the way the template does.
    const settle = (video$: Observable<VideoData> | null) =>
      video$ ? firstValueFrom(video$) : Promise.resolve(null);

    component.ngOnInit();
    const playing = settle(component.video$);
    flushOneVideo(httpMock);
    await playing;

    const names = [component.currentChannel.name];
    for (let step = 0; step < 5; step++) {
      component.changeChannel();
      const next = settle(component.video$);
      flushOneVideo(httpMock);
      await next;
      names.push(component.currentChannel.name);
    }

    // One step past Kids Korner wraps back to the head of the list.
    expect(names).toEqual([
      'Somewhat Commercial',
      'VHS Vault',
      'Anime All Access',
      'Gamer Nation',
      'Kids Korner',
      'Somewhat Commercial',
    ]);

    // The tooltip prints the held Channel's name — the literal wording, so a
    // stale label fails this test rather than passing tautologically.
    expect(component.getTooltip('T', 'U')).toBe(
      'Now Playing: T by U on the Somewhat Commercial channel.',
    );
  });
});
