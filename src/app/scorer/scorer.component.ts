import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Important for *ngFor, *ngIf, etc.
 
@Component({
  selector: 'app-scorer',
  standalone: true, // ✅ very important
  imports: [CommonModule, FormsModule], // ✅ include CommonModule here
  templateUrl: './scorer.component.html',
  styleUrls: ['./scorer.component.css']
})
export class ScorerComponent {
  scoreA = 1;
  scoreB = 1;
  currentQuarter = 'Q4';
  displayTime = '00:00';
  timerSet = '15:00';
  timer: any;
  timeSeconds = 0;
 
  quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  teams = ['Japan', 'China'];
  players: any = {
    Japan: ['Player A', 'Player B'],
    China: ['Player 1', 'Player 2']
  };
 
  eventTeam = 'Japan';
  eventPlayer = 'Player A';
  eventQuarter = 'Q1';
  eventTime = '';
  eventType = 'Goal';
 
  matchEvents: any[] = [];
 
  psTeam = 'Japan';
  psPlayer = 'Player A';
  psResult = 'Scored';
  psTime = '';
  shootoutEvents: any[] = [];
 
  onTeamChange() {
    this.eventPlayer = this.players[this.eventTeam][0];
  }
 
  setQuarter(q: string) {
    this.currentQuarter = q;
  }
 
  startTimer() {
    this.timeSeconds = 0;
    this.timer = setInterval(() => {
      this.timeSeconds++;
      const mins = Math.floor(this.timeSeconds / 60).toString().padStart(2, '0');
      const secs = (this.timeSeconds % 60).toString().padStart(2, '0');
      this.displayTime = `${mins}:${secs}`;
    }, 1000);
  }
 
  pauseTimer() {
    clearInterval(this.timer);
  }
 
  resumeTimer() {
    this.startTimer();
  }
 
  stopTimer() {
    clearInterval(this.timer);
    this.displayTime = '00:00';
  }
 
  addMatchEvent() {
    this.matchEvents.push({
      team: this.eventTeam,
      player: this.eventType === 'PC Earned' ? '' : this.eventPlayer,
      quarter: this.eventQuarter,
      time: this.eventTime,
      type: this.eventType
    });
  }
 
  addShootoutEvent() {
    this.shootoutEvents.push({
      team: this.psTeam,
      player: this.psPlayer,
      result: this.psResult,
      time: this.psTime
    });
  }
}
 