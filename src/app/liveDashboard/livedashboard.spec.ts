import { TestBed } from '@angular/core/testing';

import { Livedashboard } from './livedashboard';

describe('Livedashboard', () => {
  let service: Livedashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Livedashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
