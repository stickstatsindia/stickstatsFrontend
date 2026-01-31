import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerMatches } from './player-matches';

describe('PlayerMatches', () => {
  let component: PlayerMatches;
  let fixture: ComponentFixture<PlayerMatches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerMatches]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerMatches);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
