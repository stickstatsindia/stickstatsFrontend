import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
 
@Component({
  selector: 'app-scorer',
  standalone: true, // ✅ very important
  imports: [CommonModule,FormsModule], // ✅ include CommonModule here
  templateUrl: './scorer.component.html',
  styleUrls: ['./scorer.component.css']
})
export class ScorerComponent {
  timerInterval: any;
  timerSet: string = "00:00";
  displayTime: string = "00:00";
  seconds: number = 0;
  isRunning = false;
 
  // Set Time
  setMinutes: number = 0;
  setSeconds: number = 0;
 
  // Match Events
  teams: string[] = ['Team A', 'Team B'];
  players: { [key: string]: string[] } = {
    'Team A': ['Player A1', 'Player A2'],
    'Team B': ['Player B1', 'Player B2']
  };
  quarters = [1, 2, 3, 4];
 
  eventTeam = '';
  eventPlayer = '';
  selectedQuarter = 1;
  matchEvents: string[] = [];
 
  // Penalty Shootout
  penaltyTeam = '';
  penaltyPlayer = '';
  penaltyShootouts: string[] = [];
 
  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.updateDisplayTime();
    }, 1000);
  }
 
  pauseTimer() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
  }
 
  resumeTimer() {
    if (!this.isRunning) this.startTimer();
  }
 
  stopTimer() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.seconds = 0;
    this.updateDisplayTime();
  }
 
  setTime() {
    this.seconds = this.setMinutes * 60 + this.setSeconds;
    this.updateDisplayTime();
  }
 
  updateDisplayTime() {
    const min = Math.floor(this.seconds / 60);
    const sec = this.seconds % 60;
    this.displayTime = `${this.pad(min)}:${this.pad(sec)}`;
  }
 
  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
 
  onTeamChange() {
    this.eventPlayer = '';
  }
 
  addEvent(eventType: string) {
    const team = this.eventTeam;
    const player = this.eventPlayer;
    const event = player
      ? `${eventType} by ${player} (Q${this.selectedQuarter})`
      : `${eventType} (Q${this.selectedQuarter})`;
    this.matchEvents.push(`${team}: ${event}`);
  }
 
  recordPenalty() {
    if (this.penaltyTeam && this.penaltyPlayer) {
      this.penaltyShootouts.push(`${this.penaltyTeam}: Shootout by ${this.penaltyPlayer}`);
    }
  }
}
 

