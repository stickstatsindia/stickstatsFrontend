import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchService } from '../match.service';
import { ScheduleService } from '../service/schedule.service';
import { TournamentService } from '../service/tournament/tournament';

interface Match {
  matchId?: string;
  team1: string;
  team2: string;
  ground: string;
  city: string;
  matchDate?: string; // ISO date
  matchTime?: string; // formatted string
  status?: string;
  home_score?: number;
  away_score?: number;
  remaining_time?: string;
}

@Component({
  selector: 'app-matches',
  imports: [CommonModule,FormsModule],
  templateUrl: './matches.html',
  styleUrls: ['./matches.css']
})
export class Matches implements OnInit {
  matches: Match[] = [];
  tournamentId: string | null = null;
  loading = false;

  ngOnInit() {
     this.cdr.detectChanges();
    this.loading = true;
    if (this.tournamentId) {
      // Resolve tournament name from id and fetch match-lives by tournament name
      this.tournamentService.getTournamentById(this.tournamentId)
        .subscribe({
          next: (t: any) => {
            const tournamentName = t?.tournament_name || t?.name;
            if (!tournamentName) {
              // fallback to existing tournamentId-based endpoint
              this.loadMatchesByTournamentId();
              return;
            }

            this.scheduleService.getMatchLivesByTournamentName(tournamentName).subscribe({
              next: (data: any[]) => {
                this.matches = data.map((m: any) => ({
                  matchId: m.match_id || m._id,
                  team1: m.home_team_name || m.team1_name || '',
                  team2: m.away_team_name || m.team2_name || '',
                  ground: m.venue || m.ground || '',
                  city: m.city || '',
                  matchDate: m.match_date || m.matchDate,
                  matchTime: m.match_time || m.matchTime || '',
                  status: m.status,
                  home_score: typeof m.home_score !== 'undefined' ? m.home_score : m.home_score || 0,
                  away_score: typeof m.away_score !== 'undefined' ? m.away_score : m.away_score || 0,
                  remaining_time: m.remaining_time || m.remainingTime || ''
                }));
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: (err: any) => {
                console.warn('Failed to load match lives by tournament name, falling back:', err);
                this.loadMatchesByTournamentId();
              }
            });
          },
          error: (err: any) => {
            console.warn('Failed to fetch tournament details, falling back to id-based matches', err);
            this.loadMatchesByTournamentId();
          }
        });
    }
  }

  private loadMatchesByTournamentId() {
    if (!this.tournamentId) {
      this.loading = false;
      return;
    }
    this.scheduleService.getMatchesByTournament(this.tournamentId).subscribe({
      next: (data: any[]) => {
        this.matches = data.map((m: any) => ({
          matchId: m.match_id || m._id,
          team1: m.home_team_name || m.team1_name || '',
          team2: m.away_team_name || m.team2_name || '',
          ground: m.venue || m.ground || '',
          city: m.city || '',
          matchDate: m.match_date || m.matchDate,
          matchTime: m.match_time || m.matchTime || '',
          status: m.status,
          home_score: typeof m.home_score !== 'undefined' ? m.home_score : m.home_score || 0,
          away_score: typeof m.away_score !== 'undefined' ? m.away_score : m.away_score || 0,
          remaining_time: m.remaining_time || m.remainingTime || ''
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load tournament matches', err);
        this.loading = false;
      }
    });
  }
  constructor(private router: Router, private matchService: MatchService, private cdr: ChangeDetectorRef, private scheduleService: ScheduleService, private tournamentService: TournamentService) {
     const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as {tournamentId?: string };
    this.tournamentId = state?.tournamentId || '';
  }

  scheduleMatch() {
    this.router.navigate(['/schedule-match'] , { state: { tournamentId: this.tournamentId } });
  }

  editMatch(index: number) {
    alert(`Edit match between: ${this.matches[index].team1} vs ${this.matches[index].team2}`);
  }

  deleteMatch(index: number) {
    const match = this.matches[index];
    if (!match.matchId) {
      alert('Match ID not found!');
      return;
    }
    if (confirm(`Are you sure you want to delete the match between "${match.team1}" and "${match.team2}"?`)) {
      this.matchService.deleteMatch(match.matchId).subscribe({
        next: () => {
          alert('Match deleted successfully');
          this.matches.splice(index, 1);
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Delete failed', err);
          alert('Failed to delete match: ' + (err.error?.error || 'Unknown error'));
        }
      });
    }
  }

  openSettings(index: number) {
    alert(`Settings for match: ${this.matches[index].team1} vs ${this.matches[index].team2}`);
  }

  startScoring(match: Match) {
  if (!match.matchId) {
    alert('Match ID not found!');
    return;
  }

  // Update match status to 'In Progress'
  this.matchService.updateMatchStatus(match.matchId, 'In Progress').subscribe({
    next: () => {
      console.log('Match status updated to In Progress');
      // Update local match status
      match.status = 'In Progress';
      this.cdr.detectChanges();
      // Navigate to scorer
      this.router.navigate(
        ['/scorer/' + match.matchId],
        {
          state: {
            matchId: match.matchId,
            team1: match.team1,
            team2: match.team2,
            tournamentId: this.tournamentId
          }
        }
      );
    },
    error: (err: any) => {
      console.error('Error updating match status:', err);
      alert('Failed to update match status');
    }
  });
}

resumeScoring(match: Match) {
  if (!match.matchId) {
    alert('Match ID not found!');
    return;
  }

  this.router.navigate(
    ['/scorer/' + match.matchId],
    {
      state: {
        matchId: match.matchId,
        team1: match.team1,
        team2: match.team2,
        tournamentId: this.tournamentId
      }
    }
  );
}

viewScoring(match: Match) {
  if (!match.matchId) {
    alert('Match ID not found!');
    return;
  }

  this.router.navigate(['/results', match.matchId]);
}

}

