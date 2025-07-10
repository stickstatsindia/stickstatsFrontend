import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewRoundsComponent } from './add-new-rounds.component';

import { CommonModule } from '@angular/common'; // ✅ Important for *ngFor, *ngIf, etc.
 
describe('AddNewRounds', () => {
  let component: AddNewRoundsComponent;
  let fixture: ComponentFixture<AddNewRoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewRoundsComponent]
      //imports: [CommonModule] // ✅ Fix for *ngFor
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewRoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
