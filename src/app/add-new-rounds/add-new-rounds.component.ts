
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
import { Component } from '@angular/core';
 
@Component({
  selector: 'app-add-new-rounds',
  standalone: true, // ✅ very important
  imports: [CommonModule], // ✅ include CommonModule here
  templateUrl: './add-new-rounds.component.html',
  styleUrls: ['./add-new-rounds.component.css']
})
export class AddNewRoundsComponent {
  selectedRounds: Set<string> = new Set();
 
  roundRobinRounds: string[] = [
    'League Matches', 'Pre Quarter Final', 'Quarter Final', 'Semi Final', 'Final',
    'Super League', 'Super Eight', 'Super Ten', 'Super Six', 'Super Four',
    'Super Three', 'Qualifier 1', 'Eliminator', 'Qualifier 2',
    'Third Position', 'Fourth Position', 'Fifth Position', 'Warm up Match',
    'Seven Position', 'Nine Position', 'Eleven Position',
    'Relegation Matches', 'Super Division Matches',
    'Gold Final', 'Silver Final', 'Platinum Final'
  ];
 
  knockOutRounds: string[] = [
    'Super Knockout', 'Round One', 'Round Two', 'Round Three', 'Round Four',
    'Round Five', 'Pre Quarter Final', 'Quarter Final', 'Semi Final', 'Final',
    'Super League', 'Super Six', 'Third Position', 'Fourth Position', 'Fifth Position',
    'Warm up Match', 'Seven Position', 'Nine Position', 'Eleven Position',
    'Deciding Match'
  ];
 
  toggleRound(round: string): void {
    if (this.selectedRounds.has(round)) {
      this.selectedRounds.delete(round);
    } else {
      this.selectedRounds.add(round);
    }
  }
 
  isSelected(round: string): boolean {
    return this.selectedRounds.has(round);
  }
}