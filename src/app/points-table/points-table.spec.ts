import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsTable } from './points-table';

describe('PointsTable', () => {
  let component: PointsTable;
  let fixture: ComponentFixture<PointsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
