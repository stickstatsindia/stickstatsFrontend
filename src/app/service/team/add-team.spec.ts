import { TestBed } from '@angular/core/testing';

import { AddTeam } from './add-team';

describe('AddTeam', () => {
  let service: AddTeam;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddTeam);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
