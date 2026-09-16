import '../../../testing/jsdom-globals';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { type Observable, firstValueFrom } from 'rxjs';

import { SurferComponent, type VideoData } from './surfer.component';
import { CHANNELS } from '../../services/archive/channels';

describe('SurferComponent', () => {
  let component: SurferComponent;
  let fixture: ComponentFixture<SurferComponent>;
  let httpMock: HttpTestingController;

  const SEARCH_URL = 'https://archive.org/advancedsearch.php';
  const METADATA_URL = 'https://archive.org/metadata';

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

  /** Flush the count/page/metadata requests one fetch produces. */
  const flushVideo = () => {
    const count = httpMock.expectOne(
      (r) => r.url === SEARCH_URL && r.params.get('rows') === '0',
    );
    count.flush({ response: { numFound: 1 } });
    const page = httpMock.expectOne(
      (r) => r.url === SEARCH_URL && r.params.get('rows') === '20',
    );
    page.flush({
      response: { docs: [{ identifier: 'item-1', format: ['h.264'] }] },
    });
    httpMock
      .expectOne(`${METADATA_URL}/item-1`)
      .flush({ metadata: {}, files: [{ name: 'a.mp4', format: 'h.264' }] });
  };

  it('walks the Channels in list order, wraps, and displays the held Channel name', async () => {
    // The template's async pipe sits inside the marquee's ng-template, which
    // jsdom never renders — subscribe to the stream the way the template does.
    const settle = (video$: Observable<VideoData> | null) =>
      video$ ? firstValueFrom(video$) : Promise.resolve(null);

    component.ngOnInit();
    const playing = settle(component.video$);
    flushVideo();
    await playing;

    const names = [component.currentChannel.name];
    for (let step = 0; step < CHANNELS.length; step++) {
      component.changeChannel();
      const next = settle(component.video$);
      flushVideo();
      await next;
      names.push(component.currentChannel.name);
    }

    // One step past the last Channel wraps to the first: the walked cycle is
    // exactly the list order plus its own head again.
    expect(names).toEqual([
      ...CHANNELS.map((channel) => channel.name),
      CHANNELS[0].name,
    ]);

    // The displayed name comes from the held Channel itself, not a copy.
    expect(component.currentChannel.name).toBe(CHANNELS[0].name);
    expect(component.getTooltip('T', 'U')).toBe(
      `Now Playing: T by U on the ${CHANNELS[0].name} channel.`,
    );
  });
});
