// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
 
// @Component({
//   selector: 'app-scorer',
//   standalone: true, // ✅ very important
//   imports: [CommonModule,FormsModule], // ✅ include CommonModule here
//   templateUrl: './scorer.component.html',
//   styleUrls: ['./scorer.component.css']
// })
// export class ScorerComponent {
//   timerInterval: any;
//   timerSet: string = "00:00";
//   displayTime: string = "00:00";
//   seconds: number = 0;
//   isRunning = false;
 
//   // Set Time
//   setMinutes: number = 0;
//   setSeconds: number = 0;
 
//   // Match Events
//   teams: string[] = ['Team A', 'Team B'];
//   players: { [key: string]: string[] } = {
//     'Team A': ['Player A1', 'Player A2'],
//     'Team B': ['Player B1', 'Player B2']
//   };
//   quarters = [1, 2, 3, 4];
 
//   eventTeam = '';
//   eventPlayer = '';
//   selectedQuarter = 1;
//   matchEvents: string[] = [];
 
//   // Penalty Shootout
//   penaltyTeam = '';
//   penaltyPlayer = '';
//   penaltyShootouts: string[] = [];
 
//   startTimer() {
//     if (this.isRunning) return;
//     this.isRunning = true;
//     this.timerInterval = setInterval(() => {
//       this.seconds++;
//       this.updateDisplayTime();
//     }, 1000);
//   }
 
//   pauseTimer() {
//     clearInterval(this.timerInterval);
//     this.isRunning = false;
//   }
 
//   resumeTimer() {
//     if (!this.isRunning) this.startTimer();
//   }
 
//   stopTimer() {
//     clearInterval(this.timerInterval);
//     this.isRunning = false;
//     this.seconds = 0;
//     this.updateDisplayTime();
//   }
 
//   setTime() {
//     this.seconds = this.setMinutes * 60 + this.setSeconds;
//     this.updateDisplayTime();
//   }
 
//   updateDisplayTime() {
//     const min = Math.floor(this.seconds / 60);
//     const sec = this.seconds % 60;
//     this.displayTime = `${this.pad(min)}:${this.pad(sec)}`;
//   }
 
//   pad(num: number): string {
//     return num < 10 ? '0' + num : num.toString();
//   }
 
//   onTeamChange() {
//     this.eventPlayer = '';
//   }
 
//   addEvent(eventType: string) {
//     const team = this.eventTeam;
//     const player = this.eventPlayer;
//     const event = player
//       ? `${eventType} by ${player} (Q${this.selectedQuarter})`
//       : `${eventType} (Q${this.selectedQuarter})`;
//     this.matchEvents.push(`${team}: ${event}`);
//   }
 
//   recordPenalty() {
//     if (this.penaltyTeam && this.penaltyPlayer) {
//       this.penaltyShootouts.push(`${this.penaltyTeam}: Shootout by ${this.penaltyPlayer}`);
//     }
//   }
// }
 

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
  minutes = 0;
  seconds = 0;
  displayMinutes = '00';
  displaySeconds = '00';
  interval: any;
  isPaused = false;
 
  team1Name = 'Team A';
  team2Name = 'Team B';
 
  totalScore = {
    team1: 0,
    team2: 0
  };
 
  quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  currentQuarter = 'Q1';
 
  selectedTeam = '';
  selectedPlayer = '';
  players = ['Player 1', 'Player 2', 'Player 3'];
 
  matchEvents: any[] = [];
 
  penaltyShootoutTeam = '';
  penaltyShootoutPlayer = '';
 
  setTime() {
    this.displayMinutes = this.format(this.minutes);
    this.displaySeconds = this.format(this.seconds);
  }
 
  format(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
 
  startTimer() {
    this.interval = setInterval(() => {
      if (this.seconds === 0 && this.minutes === 0) {
        this.stopTimer();
      } else {
        if (this.seconds === 0) {
          this.minutes--;
          this.seconds = 59;
        } else {
          this.seconds--;
        }
        this.setTime();
      }
    }, 1000);
  }
 
  pauseTimer() {
    clearInterval(this.interval);
    this.isPaused = true;
  }
 
  resumeTimer() {
    if (this.isPaused) {
      this.startTimer();
      this.isPaused = false;
    }
  }
 
  stopTimer() {
    clearInterval(this.interval);
    this.minutes = 0;
    this.seconds = 0;
    this.setTime();
  }
 
  addEvent(type: string) {
    const team = this.selectedTeam;
    const player = this.selectedPlayer;
    const quarter = this.currentQuarter;
    const event = {
      time: `${this.displayMinutes}:${this.displaySeconds}`,
      team,
      player,
      type,
      quarter
    };
 
    this.matchEvents.push(event);
 
    if (type === 'Goal' || type === 'PC Scored') {
      if (team === this.team1Name) this.totalScore.team1++;
      else if (team === this.team2Name) this.totalScore.team2++;
    }
  }
 
  recordPenalty() {
    const event = {
      time: `${this.displayMinutes}:${this.displaySeconds}`,
      team: this.penaltyShootoutTeam,
      player: this.penaltyShootoutPlayer,
      type: 'Penalty Shootout'
    };
    this.matchEvents.push(event);
  }
}