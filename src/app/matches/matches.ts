import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchService } from '../match.service';
import { ScheduleService } from '../service/schedule.service';
import { TournamentService } from '../service/tournament/tournament';
import { io, Socket } from 'socket.io-client';
import { environment } from '../config/api.config';

interface Match {
  matchId?: string;
  team1: string;
  team2: string;
  ground: string;
  city: string;
  matchDate?: string;
  matchTime?: string;
  status?: string;
  home_score?: number;
  away_score?: number;
  remaining_time?: string;
  events?: any[];
}

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.html',
  styleUrls: ['./matches.css']
})
export class Matches implements OnInit, OnDestroy {

  matches: Match[] = [];
  tournamentId: string | null = null;
  loading = false;

  private socket!: Socket;
  private socketReady = false;

  constructor(
    private router: Router,
    private matchService: MatchService,
    private scheduleService: ScheduleService,
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as any;
    this.tournamentId = state?.tournamentId || null;
  }

  ngOnInit() {
    this.initializeSocket();
    this.loadMatches();
  }

  private loadMatches() {
    if (!this.tournamentId) return;

    this.loading = true;

    this.tournamentService.getTournamentById(this.tournamentId).subscribe({
      next: (t: any) => {
        const name = t?.tournament_name || t?.name;

        const loader = name
          ? this.scheduleService.getMatchLivesByTournamentName(name)
          : this.scheduleService.getMatchesByTournament(this.tournamentId!);

        loader.subscribe({
          next: (data: any[]) => {
            this.matches = data.map(m => this.processMatch(m));
            this.loading = false;

            this.joinRoomsIfReady();

            this.cdr.detectChanges();
          },
          error: err => {
            console.error('❌ Match load failed:', err);
            this.loading = false;
          }
        });
      },
      error: err => {
        console.error('❌ Tournament load failed:', err);
        this.loading = false;
      }
    });
  }

  private initializeSocket() {
    if (this.socket) return;

    this.socket = io(environment.socketUrl, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      this.socketReady = true;
      this.joinRoomsIfReady();
    });

    // 🔥 SCORE UPDATE
    this.socket.on('scoreUpdated', (data: any) => {
      this.updateMatch(data.match_id || data.matchId, m => {
        m.home_score = data.team1_score ?? m.home_score;
        m.away_score = data.team2_score ?? m.away_score;
        m.status = this.normalizeStatus(data.status ?? m.status);
      });
    });

    // 🔥 EVENT ADDED - recalculate scores
    this.socket.on('eventAdded', (data: any) => {
      this.updateMatch(data.match_id || data.matchId, m => {
        if (data.event) {
          m.events = m.events || [];
          m.events.push(data.event);
          this.calculateScoreFromEvents(m);
        }
        if (data.team1_score !== undefined) m.home_score = data.team1_score;
        if (data.team2_score !== undefined) m.away_score = data.team2_score;
        if (data.status !== undefined) m.status = this.normalizeStatus(data.status);
      });
    });

    // 🔥 TIMER
    this.socket.on('timerUpdated', (data: any) => {
      this.updateMatch(data.match_id || data.matchId, m => {
        m.remaining_time = data.remaining_time ?? m.remaining_time;
        m.status = this.normalizeStatus(data.status ?? m.status);
      });
    });

    // 🔥 STATUS
    this.socket.on('matchStatusChanged', (data: any) => {
      this.updateMatch(data.match_id || data.matchId, m => {
        m.status = this.normalizeStatus(data.status);
      });
    });

    this.socket.on('disconnect', () => {
      this.socketReady = false;
    });
  }

  private joinRoomsIfReady() {
    if (!this.socketReady || !this.matches.length) return;

    this.matches.forEach(m => {
      if (!m.matchId) return;

      const id = m.matchId.toString().trim();
      this.socket.emit('joinMatch', id);
    });
  }

  private updateMatch(matchId: any, updater: (m: Match) => void) {
    if (!matchId) return;

    const id = matchId.toString().trim();

    const match = this.matches.find(
      m => m.matchId?.toString().trim() === id
    );

    if (!match) {
      return;
    }

    updater(match);

    this.cdr.detectChanges();
  }

  private processMatch(m: any): Match {
    const match: Match = {
      matchId: (m.match_id || m._id)?.toString().trim(),
      team1: m.home_team_name || m.team1_name || '',
      team2: m.away_team_name || m.team2_name || '',
      ground: m.venue || m.ground || '',
      city: m.city || '',
      matchDate: m.match_date || '',
      matchTime: m.match_time || '',
      status: this.normalizeStatus(m.status || m.match_status || 'Scheduled'),
      home_score: m.home_score ?? 0,
      away_score: m.away_score ?? 0,
      remaining_time: m.remaining_time || '',
      events: m.match_events || m.events || []
    };

    // Calculate score from events if available
    if (match.events && match.events.length > 0) {
      this.calculateScoreFromEvents(match);
    }

    return match;
  }

  /**
   * Calculate score from events for a match
   */
  private calculateScoreFromEvents(match: Match): void {
    if (!match.events || match.events.length === 0) return;

    let homeScore = 0;
    let awayScore = 0;

    const team1Lower = (match.team1 || '').toLowerCase().trim();
    const team2Lower = (match.team2 || '').toLowerCase().trim();

    for (const event of match.events) {
      const eventType = (event.type || '').toLowerCase().trim();
      const eventTeam = (event.team || '').toLowerCase().trim();

      // Check if event is a goal/score
      if (eventType === 'goal' || eventType === 'field goal' || eventType === 'fg' ||
          (eventType.includes('penalty corner') && eventType.includes('scored')) ||
          (eventType.includes('penalty stroke') && (eventType.includes('scored') || eventType.includes('goal')))) {
        
        // Determine which team scored
        if (eventTeam.includes(team1Lower) || eventTeam === 'team1' || eventTeam === 'home') {
          homeScore++;
        } else if (eventTeam.includes(team2Lower) || eventTeam === 'team2' || eventTeam === 'away') {
          awayScore++;
        }
      }
    }

    // Update match scores if events indicate a score
    if (homeScore > 0 || awayScore > 0) {
      match.home_score = homeScore;
      match.away_score = awayScore;
     }
  }

  private normalizeStatus(status: any): 'Live' | 'Upcoming' | 'Finished' {
    const normalized = String(status || '').trim().toLowerCase();

    if (
      normalized.includes('live') ||
      normalized.includes('progress') ||
      normalized.includes('running') ||
      normalized.includes('ongoing') ||
      normalized.includes('penalty') ||
      normalized.includes('shootout') ||
      normalized.includes('tie')
    ) {
      return 'Live';
    }

    if (
      normalized.includes('finish') ||
      normalized.includes('complete') ||
      normalized.includes('ended') ||
      normalized.includes('full time') ||
      normalized === 'ft'
    ) {
      return 'Finished';
    }

    return 'Upcoming';
  }

  scheduleMatch() {
    this.router.navigate(['/schedule-match'], {
      state: { tournamentId: this.tournamentId }
    });
  }

  startScoring(match: Match) {
    if (!match.matchId) return;

    this.matchService.updateMatchStatus(match.matchId, 'Live').subscribe({
      next: () => {
        match.status = 'Live';

        // Update match date & time when starting
        this.matchService.updateMatchTime(match.matchId).subscribe({
          next: (updated: any) => {
            match.matchDate = updated.match_date;
            match.matchTime = updated.match_time;
            this.cdr.detectChanges();

            this.router.navigate(['/scorer', match.matchId], {
              state: {
                matchId: match.matchId,
                team1: match.team1,
                team2: match.team2,
                tournamentId: this.tournamentId
              }
            });
          },
          error: (err: any) => {
            console.error('❌ Failed to update match time:', err);
            this.router.navigate(['/scorer', match.matchId], {
              state: {
                matchId: match.matchId,
                team1: match.team1,
                team2: match.team2,
                tournamentId: this.tournamentId
              }
            });
          }
        });
      },
      error: (err: any) => {
        console.error('❌ Failed to update match status:', err);
      }
    });
  }

  viewScoring(match: Match) {
    if (!match.matchId) return;
    this.router.navigate(['/result', match.matchId]);
  }

  deleteMatch(index: number) {
    const m = this.matches[index];
    if (!m.matchId) return;

    if (confirm(`Delete match: ${m.team1} vs ${m.team2}?`)) {
      this.matchService.deleteMatch(m.matchId).subscribe({
        next: () => {
          this.matches.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('❌ Delete failed:', err);
        }
      });
    }
  }

  resumeScoring(match: Match) {
    if (!match.matchId) return;

    this.router.navigate(['/scorer', match.matchId], {
      state: {
        matchId: match.matchId,
        team1: match.team1,
        team2: match.team2,
        tournamentId: this.tournamentId
      }
    });
  }

  ngOnDestroy() {
    this.socket?.disconnect();
  }
}
