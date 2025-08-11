import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMatchTeamSelection } from './schedule-match-team-selection';

describe('ScheduleMatchTeamSelection', () => {
  let component: ScheduleMatchTeamSelection;
  let fixture: ComponentFixture<ScheduleMatchTeamSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleMatchTeamSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleMatchTeamSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
