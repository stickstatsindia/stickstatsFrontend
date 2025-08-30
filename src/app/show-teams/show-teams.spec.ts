import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTeams } from './show-teams';

describe('ShowTeams', () => {
  let component: ShowTeams;
  let fixture: ComponentFixture<ShowTeams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowTeams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowTeams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
