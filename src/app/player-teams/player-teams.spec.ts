import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTeams } from './player-teams';

describe('PlayerTeams', () => {
  let component: PlayerTeams;
  let fixture: ComponentFixture<PlayerTeams>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerTeams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerTeams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
