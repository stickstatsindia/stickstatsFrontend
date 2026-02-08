import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TournamentService } from '../service/tournament/tournament';

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

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './team-management.html',
  styleUrls: ['./team-management.css']
})
export class TeamManagementComponent implements OnInit {
  tournamentId!: string;
  tournamentData!: Tournament;

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

  menu = ['MATCHES', 'STATS', 'TEAMS'];
  selectedTab = 'MATCHES';

  loadingStats = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private http: HttpClient
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
      },
      error: () => {
        this.router.navigate(['/tournaments']);
      }
    });
  }

  onTabSelect(tab: string): void {
    this.selectedTab = tab;
    if (tab === 'STATS') {
      this.fetchTournamentStats();
    }
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
        },
        error: (err) => {
          console.error('Failed to load tournament stats', err);
          this.loadingStats = false;
        }
      });
  }
}
