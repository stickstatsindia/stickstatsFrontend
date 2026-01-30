import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayetTeams } from './playet-teams';

describe('PlayetTeams', () => {
  let component: PlayetTeams;
  let fixture: ComponentFixture<PlayetTeams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayetTeams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayetTeams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
