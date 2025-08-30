import { TestBed } from '@angular/core/testing';

import { Pool } from './pool';

describe('Pool', () => {
  let service: Pool;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pool);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
