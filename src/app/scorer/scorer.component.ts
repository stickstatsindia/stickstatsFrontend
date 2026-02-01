import { Component, NgModule } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf


import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { io, Socket } from "socket.io-client";
import { MembersService } from '../service/members/members-service';
import { MatchService } from '../match.service';

 
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
  matchId!: string;
  private autoSaveIntervalId: any = null;
  private socket!: Socket;

  minutes = 0;
  seconds = 0;
  displayMinutes = '00';
  displaySeconds = '00';
  private intervalId: any = null;
  interval: any;
  isPaused = false;
  private totalSeconds = 0;
  timerStarted = false;
  penaltyShootoutEnabled = false;
  matchTied = false;
  allQuartersCompleted = false;
  matchFinished = false;
 
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
  selectedPlayer: any = null;
  // keep separate arrays for each team's players
  team1Players: { player_id: string; player_name: string }[] = [];
  team2Players: { player_id: string; player_name: string }[] = [];
 
  matchEvents: any[] = [];
 
  penaltyShootoutTeam = '';
  penaltyShootoutPlayer: { player_id: string; player_name: string } | null = null;
  penaltyOutcome = '';



  constructor(private http: HttpClient, private memberService :MatchService,  private route: ActivatedRoute, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.socket = io("http://localhost:3000");

    this.route.paramMap.subscribe(params => {
      this.matchId = params.get('matchId')!; // ✅ dynamic matchId
      this.socket.emit("joinMatch", this.matchId);
      this.http.get<any>(`http://localhost:3000/api/matchlive/${this.matchId}`)
        .subscribe(data => {
          this.team1Name = data.team1_name;
          this.team2Name = data.team2_name;
          this.totalScore = { team1: data.team1_score, team2: data.team2_score };
          this.quarters = data.quarters;
          this.currentQuarter = data.current_quarter;

          // ✅ Load match status
          if (data.status === 'Finished') {
            this.matchFinished = true;
          }

          // Normalize players to string names and keep per-team lists
          const toNames = (arr: any[]) => (Array.isArray(arr) ? arr.map(p => typeof p === 'string' ? p : (p.name || p.user_id || 'Unknown')) : []);
          
          this.team1Players = data.team1_players || [];
          this.team2Players = data.team2_players || [];


          // Do not auto-select a team or player on load; user will choose explicitly

          this.matchEvents = data.match_events;

          // Timer
          this.totalSeconds = data.total_seconds;
          this.isPaused = data.is_paused;
          this.renderDisplay();

          // 👇 Auto-resume timer if it was running
          if (!this.isPaused && this.totalSeconds > 0) {
            this.startTimer();
          }
        });
      });
  }

  // Getter to return players for currently selected team (main event)
  get filteredPlayers() {
    if (this.selectedTeam === this.team1Name) return this.team1Players;
    if (this.selectedTeam === this.team2Name) return this.team2Players;
    return [];
  }

  // Getter to return players for penalty shootout selected team
  get penaltyFilteredPlayers() {
    if (this.penaltyShootoutTeam === this.team1Name) return this.team1Players;
    if (this.penaltyShootoutTeam === this.team2Name) return this.team2Players;
    return [];
  }

  onTeamSelect(team: string) {
    this.selectedTeam = team;
    // clear player selection; user must explicitly choose a player after selecting team
    this.selectedPlayer = '';
  }

  onPenaltyTeamSelect(team: string) {
    this.penaltyShootoutTeam = team;
    // clear penalty player selection; require explicit user selection
    this.penaltyShootoutPlayer = null;
  }

  ngOnDestroy(): void {
    // Clear timer interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear auto-save interval
    if (this.autoSaveIntervalId) {
      clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }

    // 🔧 ADD THIS: Disconnect socket and leave match room
    if (this.socket) {
      this.socket.emit("leaveMatch", this.matchId);
      this.socket.disconnect();
    }
  }


  // 🔧 ADD THIS: Method to broadcast complete match state
  private broadcastCompleteMatchState() {
    const matchState = {
      matchId: this.matchId,
      team1Name: this.team1Name,
      team2Name: this.team2Name,
      totalScore: this.totalScore,
      currentQuarter: this.currentQuarter,
      matchEvents: this.matchEvents,
      timer: {
        totalSeconds: this.totalSeconds,
        isPaused: this.isPaused,
        displayMinutes: this.displayMinutes,
        displaySeconds: this.displaySeconds
      }
    };

    this.socket.emit("matchStateUpdate", matchState);
  }

  
  // Enhanced penalty recording with socket emission
  recordPenalty() {
    if (!this.penaltyShootoutPlayer) {
      console.error('No penalty shootout player selected.');
      return;
    }
    
    // ✅ Prevent recording penalties if match is finished
    if (this.matchFinished) {
      alert('Cannot record events for a finished match.');
      return;
    }
    
    const event = {
      time: `${this.displayMinutes}:${this.displaySeconds}`,
      team: this.penaltyShootoutTeam,
      player_id: this.penaltyShootoutPlayer.player_id,
      player_name: this.penaltyShootoutPlayer.player_name,
      type: 'Penalty Shootout',
      quarter: this.currentQuarter,
      outcome: this.penaltyOutcome
    };
    
    this.matchEvents.push(event);

    // Save to database
    this.http.post(`http://localhost:3000/api/matches/${this.matchId}/events`, event)
      .subscribe({
        next: (updatedMatch) => console.log('✅ Penalty saved:', updatedMatch),
        error: (err) => console.error('❌ Error saving penalty:', err)
      });

    // 🔧 ADD THIS: Broadcast penalty event to all clients
    this.socket.emit("eventAdded", { matchId: this.matchId, event });

    // If penalty was scored, update score
    if (this.penaltyOutcome === 'Scored') {
      if (this.penaltyShootoutTeam === this.team1Name) this.totalScore.team1++;
      else if (this.penaltyShootoutTeam === this.team2Name) this.totalScore.team2++;

      this.http.post(`http://localhost:3000/api/matches/${this.matchId}/score`, { 
        teamName: this.penaltyShootoutTeam 
      }).subscribe({
        next: (updatedMatch) => console.log('Score saved:', updatedMatch),
        error: (err) => console.error('Error saving score:', err)
      });

      // Broadcast score update
      this.socket.emit("scoreUpdated", {
        matchId: this.matchId,
        team1_score: this.totalScore.team1,
        team2_score: this.totalScore.team2
      });
    }
  }

  // 🔧 ADD THIS: Method to broadcast quarter changes
  changeQuarter(newQuarter: string) {
    this.currentQuarter = newQuarter;
    
    // Save to database
    this.http.post(`http://localhost:3000/api/matches/${this.matchId}/quarter`, { 
      currentQuarter: newQuarter 
    }).subscribe({
      next: () => console.log('Quarter updated'),
      error: (err) => console.error('Error updating quarter:', err)
    });

    // Broadcast quarter change
    this.socket.emit("quarterChanged", {
      matchId: this.matchId,
      currentQuarter: newQuarter
    });
  }

  // 🔧 ADD THIS: Method to broadcast match status changes
  updateMatchStatus(status: string) {
    this.http.post(`http://localhost:3000/api/matches/${this.matchId}/status`, { 
      status: status 
    }).subscribe({
      next: () => {
        console.log('Match status updated');
        if (status === 'Finished') {
          this.matchFinished = true;
        }
      },
      error: (err) => console.error('Error updating match status:', err)
    });

    // Broadcast status change
    this.socket.emit("matchStatusChanged", {
      matchId: this.matchId,
      status: status
    });
  }

  // ✅ NEW: Enable penalty shootout when match is tied
  enablePenaltyShootout(): void {
    this.matchTied = true;
    this.penaltyShootoutEnabled = true;
    console.log('⚠️ Match is tied. Penalty shootout enabled!');
  }

  // ✅ NEW: Finish match and redirect to results
  finishMatch(): void {
   

    if (confirm('Are you sure you want to finish this match?')) {
      // this.updateMatchStatus('Finished');
      // setTimeout(() => {
      //   this.router.navigate(['/result', this.matchId]);
      // }, 500);

      this.memberService.updateMatchStatus(this.matchId, 'Finished').subscribe({
        next: () => {
          console.log('Match marked as Finished');   
          this.router.navigate(['/result', this.matchId]);
        },
        error: (err: any) => {
          console.error('Error finishing match:', err);
          alert('Failed to finish match');
        }
      });
    }
  }

  // ✅ NEW: Mark all quarters as completed
  completeAllQuarters(): void {
    this.allQuartersCompleted = true;
    console.log('✅ All quarters completed. Finish button is now enabled.');
  }


  private saveTimerState() {
    this.http.post(`http://localhost:3000/api/matches/${this.matchId}/timer`, {
      totalSeconds: this.totalSeconds,
      isPaused: this.isPaused
    }).subscribe({
      next: () => console.log('Timer state saved'),
      error: (err) => console.error('Error saving timer:', err)
    });

    // 👇 also broadcast immediately
    this.socket.emit("timerUpdate", {
      matchId: this.matchId,
      totalSeconds: this.totalSeconds,
      isPaused: this.isPaused,
      displayMinutes: this.displayMinutes,
      displaySeconds: this.displaySeconds
    });
  }



  format(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  // Update the MM:SS text from totalSeconds
  private renderDisplay(): void {
    const m = Math.floor(this.totalSeconds / 60);
    const s = this.totalSeconds % 60;
    this.displayMinutes = this.format(m);
    this.displaySeconds = this.format(s);
  }

  // Normalize inputs (coerce to numbers, clamp >= 0, fold seconds into minutes)
  private normalizeInputs(): void {
    const m = Number(this.minutes);
    const s = Number(this.seconds);
    this.minutes = Number.isFinite(m) && m > 0 ? Math.floor(m) : 0;
    this.seconds = Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;

    if (this.seconds >= 60) {
      this.minutes += Math.floor(this.seconds / 60);
      this.seconds = this.seconds % 60;
    }
  }

  // Called when user clicks “Set Time”
  setTime(): void {
    this.normalizeInputs();
    this.totalSeconds = this.minutes * 60 + this.seconds;
    this.renderDisplay();
  }

  // Start countdown
  startTimer(): void {
    // prevent multiple intervals
    if (this.intervalId) return;

    // If user didn’t click Set Time, compute once
    if (this.totalSeconds === 0) {
      this.setTime();
    }

    // Nothing to count
    if (this.totalSeconds <= 0) return;

    this.isPaused = false;    this.timerStarted = true; // ✅ Disable quarter dropdown
    this.intervalId = setInterval(() => {
      if (this.totalSeconds <= 0) {
        this.stopTimer();
        return;
      }
      this.totalSeconds -= 1;
      this.renderDisplay();
      this.cdr.detectChanges();   // 👈 manually trigger UI update
    }, 1000);

    // ✅ start auto-save every 5 seconds
    this.autoSaveIntervalId = setInterval(() => this.saveTimerState(), 5000);
  }

  // Pause
  pauseTimer(): void {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isPaused = true;
    this.timerStarted = false; // ✅ Allow quarter dropdown again

    // ✅ save immediately when paused
    this.saveTimerState();
  }

  // Resume
  resumeTimer(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.timerStarted = true; // ✅ Re-enable the running state
    this.startTimer(); // reuses guard
  }

  // Stop + reset
  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.autoSaveIntervalId) {
      clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }

    this.isPaused = false;
    this.timerStarted = false; // ✅ Allow quarter dropdown again
    this.minutes = 0;
    this.seconds = 0;
    this.totalSeconds = 0;
    this.renderDisplay();

    // ✅ save immediately when stopped
    this.saveTimerState();
  }

  addEvent(type: string) {
    if (!this.selectedPlayer) return;
    
    // ✅ Prevent recording events if match is finished
    if (this.matchFinished) {
      alert('Cannot record events for a finished match.');
      return;
    }

    const team = this.selectedTeam;
    const player_id = this.selectedPlayer.player_id;
    const player_name = this.selectedPlayer.player_name;
    const quarter = this.currentQuarter;
    const event = {
      time: `${this.displayMinutes}:${this.displaySeconds}`,
      team,
      player_id,
      player_name,
      type,
      quarter
    };
 
    this.matchEvents.push(event);

    this.http.post(`http://localhost:3000/api/matches/${this.matchId}/events`, event)
    .subscribe({
      next: (updatedMatch) => console.log('✅ Event saved in DB:', updatedMatch),
      error: (err) => console.error('❌ Error saving event:', err)
    });

    this.socket.emit("eventAdded", { matchId: this.matchId, event });

    if (type === 'Goal' || type === 'Penalty Corner Scored' || type === 'Penalty Stroke Scored') {
        if (team === this.team1Name) this.totalScore.team1++;
        else if (team === this.team2Name) this.totalScore.team2++;

      this.http.post(`http://localhost:3000/api/matches/${this.matchId}/score`, { teamName: team })
        .subscribe({
          next: (updatedMatch) => console.log('Score saved:', updatedMatch),
          error: (err) => console.error('Error saving score:', err)
        });

      this.socket.emit("scoreUpdated", {
        matchId: this.matchId,
        team1_score: this.totalScore.team1,
        team2_score: this.totalScore.team2
      });
    }
  }
}