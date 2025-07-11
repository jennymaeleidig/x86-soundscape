import { TestBed } from '@angular/core/testing';

import { Ambience } from './ambience';

describe('Ambience', () => {
  let service: Ambience;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ambience);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
