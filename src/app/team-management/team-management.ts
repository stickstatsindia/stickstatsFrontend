import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TournamentService } from '../service/tournament/tournament';
import { PointsTable } from '../points-table/points-table';
import { LiveDashboardComponent } from '../liveDashboard/live-dashboard/live-dashboard';

interface Tournament {
  _id: string;
  tournament_id: string;
  tournament_name: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_id: string;
  format: string;
  tournament_category: string;
  match_type: string;
}

interface TeamDisplay {
  name: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  location: string;
  format: string;
  category: string;
  matchType: string;
  totalMatches: number;
  goals: number;
}

interface TournamentStats {
  totalMatches: number;
  fieldGoals: number;

  pcEarned: number;
  pcScored: number;

  psEarned: number;
  psScored: number;

  penaltyShootout: number;

  redCards: number;
  yellowCards: number;
  greenCards: number;

  totalGoalScore: number;
}

// Add these interfaces at the top
interface MatchDisplay {
  match_id: string;
  match_date: string;
  match_time: string;
  venue: string;
  status: string;
  team1_name: string;
  team2_name: string;
  team1_score: number;
  team2_score: number;
  current_quarter: string;
}

interface TeamInfo {
  team_id: string;
  team_name: string;
  location: string;
  logo_url: string;
  pool?: { name: string; type: string };
}

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, PointsTable, LiveDashboardComponent],
  templateUrl: './team-management.html',
  styleUrls: ['./team-management.css']
})
export class TeamManagementComponent implements OnInit {
  tournamentId!: string;
  tournamentData!: Tournament;

  // Add these properties inside the class
  matches: MatchDisplay[] = [];
  teams: TeamInfo[] = [];
  loadingMatches = false;
  loadingTeams = false;

  team: TeamDisplay = {
    name: '',
    logoUrl: 'https://via.placeholder.com/100x100.png?text=Tournament',
    startDate: '',
    endDate: '',
    location: '',
    format: '',
    category: '',
    matchType: '',
    totalMatches: 0,
    goals: 0
  };

  stats: TournamentStats = {
    totalMatches: 0,
    fieldGoals: 0,

    pcEarned: 0,
    pcScored: 0,

    psEarned: 0,
    psScored: 0,

    penaltyShootout: 0,

    redCards: 0,
    yellowCards: 0,
    greenCards: 0,

    totalGoalScore: 0
  };

  menu = ['MATCHES', 'STATS', 'TEAMS', 'POINTS TABLE', 'MATCH SCHEDULE'];
  selectedTab = 'MATCHES';

  loadingStats = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (!id) {
        this.router.navigate(['/tournaments']);
        return;
      }

      this.tournamentId = id;
      this.loadTournament();
    });
  }

  loadTournament(): void {
    this.tournamentService.getTournamentById(this.tournamentId).subscribe({
      next: (tournament: any) => {
        this.tournamentData = tournament;

        this.team = {
          name: tournament.tournament_name,
          logoUrl: 'https://via.placeholder.com/100x100.png?text=Tournament',
          startDate: new Date(tournament.start_date).toLocaleDateString(),
          endDate: new Date(tournament.end_date).toLocaleDateString(),
          location: tournament.location,
          format: tournament.format,
          category: tournament.tournament_category,
          matchType: tournament.match_type,
          totalMatches: 0,
          goals: 0
        };
        this.fetchTournamentMatches();
        this.fetchTournamentStats();
      },
      error: () => {
        this.router.navigate(['/tournaments']);
      }
    });
  }

  // Update your onTabSelect method
  onTabSelect(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'STATS') this.fetchTournamentStats();
    if (tab === 'MATCHES') this.fetchTournamentMatches();
    if (tab === 'TEAMS') this.fetchTournamentTeams();
  }

  // Add these methods
  fetchTournamentMatches(): void {
    this.loadingMatches = true;
    this.http.get<MatchDisplay[]>(`http://localhost:3000/api/tournament/${this.tournamentId}/matches1`)
      .subscribe({
        next: (matches) => {
          this.matches = matches;
          this.loadingMatches = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load matches', err);
          this.loadingMatches = false;
        }
      });
  }

  fetchTournamentTeams(): void {
    this.loadingTeams = true;
    this.http.get<TeamInfo[]>(`http://localhost:3000/api/tournament/${this.tournamentId}/teams`)
      .subscribe({
        next: (teams) => {
          this.teams = teams;
          this.loadingTeams = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load teams', err);
          this.loadingTeams = false;
        }
      });
  }

  fetchTournamentStats(): void {
    this.loadingStats = true;

    this.http
      .get<TournamentStats>(`http://localhost:3000/api/tournament/${this.tournamentId}/stats`)
      .subscribe({
        next: (stats) => {
          console.log('Tournament stats received:', stats);

          this.stats = stats;
          this.team.totalMatches = stats.totalMatches;
          this.team.goals = stats.totalGoalScore;

          this.loadingStats = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load tournament stats', err);
          this.loadingStats = false;
          this.cdr.detectChanges();
        }
      });
  }
  openMatchResult(match: MatchDisplay): void {
    const matchId = match?.match_id?.toString().trim();
    if (!matchId) return;
    this.router.navigate(['/result', matchId]);
  }

  openTeamMembers(team: TeamInfo): void {
    const teamId = team?.team_id?.toString().trim();
    if (!teamId) return;
    this.router.navigate(['/team-members'], {
      queryParams: {
        teamId,
        tournamentId: this.tournamentId,
        view: 'list'
      },
      state: {
        teamId,
        tournamentId: this.tournamentId,
        readOnly: true
      }
    });
  }
}
