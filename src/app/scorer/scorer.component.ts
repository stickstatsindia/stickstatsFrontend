import { Component, NgModule } from '@angular/core';

import { SocketService } from '../socket';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';


 
@Component({
  selector: 'app-scorer',
  standalone: true, // ✅ very important
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatFormFieldModule
  ],
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

  goal = 'Goal';
  saved = 'Saved'
 
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
  penaltyOutcome = '';

  //For live scores

  constructor(private socketService: SocketService) {}

  updateScore(teamA: number, teamB: number) {
    this.socketService.emitScoreUpdate({
      match_id: 'match123',
      home_team_id: 4,
      away_team_id: 3,
      home_score: 3,
      away_score: 2,
      timestamp: new Date()
    });
  }

    sendFakeUpdates() {
    this.socketService.emitScoreUpdate({
      match_id: 'match123',
      home_team_id: 4,
      away_team_id: 3,
      home_score: 3,
      away_score: 2,
      timestamp: new Date()
    });
  }

  //Live scores end

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

        this.socketService.emitTimerUpdate({
          match_id: '2', // use actual match ID
          minutes: this.minutes,
          seconds: this.seconds
        });
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