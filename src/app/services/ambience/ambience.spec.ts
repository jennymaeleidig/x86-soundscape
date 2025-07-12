import { TestBed } from '@angular/core/testing';

import { AmbienceService } from './ambience';

describe('Ambience', () => {
  let service: AmbienceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmbienceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
