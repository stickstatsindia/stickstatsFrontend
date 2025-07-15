import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScorerComponent } from './scorer.component'; // ✅ Correct import
import { FormsModule } from '@angular/forms';
//import { CommonModule } from '@angular/common'; // ✅ Important for *ngFor, *ngIf, etc.

describe('ScorerComponent', () => {
  let component: ScorerComponent;
  let fixture: ComponentFixture<ScorerComponent>;
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScorerComponent], // ✅ Use declarations not imports
      imports: [FormsModule], // Needed for [(ngModel)]
       //imports: [CommonModule] // ✅ Fix for *ngFor
    })
    .compileComponents();
 
    fixture = TestBed.createComponent(ScorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
 


