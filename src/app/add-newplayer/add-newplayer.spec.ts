import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewplayer } from './add-newplayer';

describe('AddNewplayer', () => {
  let component: AddNewplayer;
  let fixture: ComponentFixture<AddNewplayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewplayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewplayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
