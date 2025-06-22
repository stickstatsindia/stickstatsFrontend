import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTournament } from './admin-tournament';

describe('AdminTournament', () => {
  let component: AdminTournament;
  let fixture: ComponentFixture<AdminTournament>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTournament]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTournament);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
