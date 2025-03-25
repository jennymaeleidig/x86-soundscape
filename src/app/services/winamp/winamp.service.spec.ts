import { TestBed } from '@angular/core/testing';

import { WinampService } from './winamp.service';

describe('WinampService', () => {
  let service: WinampService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WinampService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
