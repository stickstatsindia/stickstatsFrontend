import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerProfileComponent } from './player-profile.component';
import { CommonModule } from '@angular/common'; // ✅ Important for *ngFor, *ngIf, etc.
 
describe('PlayerProfileComponent', () => {
  let component: PlayerProfileComponent;
  let fixture: ComponentFixture<PlayerProfileComponent>;
 
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerProfileComponent],
      imports: [CommonModule] // ✅ Fix for *ngFor
    }).compileComponents();
 
    fixture = TestBed.createComponent(PlayerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});