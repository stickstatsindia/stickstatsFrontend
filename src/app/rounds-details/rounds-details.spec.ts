import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundsDetails } from './rounds-details';

describe('RoundsDetails', () => {
  let component: RoundsDetails;
  let fixture: ComponentFixture<RoundsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
