import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddnewTeam } from './addnew-team';

describe('AddnewTeam', () => {
  let component: AddnewTeam;
  let fixture: ComponentFixture<AddnewTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddnewTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddnewTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
