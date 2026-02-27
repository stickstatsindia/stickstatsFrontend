import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/api.config';

import { TournamentService } from '../service/tournament/tournament';
import { Awards } from '../awards/awards';
import { PlayerMatches } from '../player-matches/player-matches';
import { PlayerTeams } from '../player-teams/player-teams';

interface PlayerUser {
  user_id: string;
  full_name: string;
  phone_number?: string;
  profile_pic?: string;
  position?: string;
  player_stats?: PlayerStats;
}

interface PlayerStats {
  totalMatches: number;

  fieldGoals: number;

  pcEarned: number;
  pcScored: number;

  psEarned: number;
  psScored: number;

  penaltyShootout: number;
  penaltyShootoutMissed: number;

  redCards: number;
  yellowCards: number;
  greenCards: number;

  totalGoalScore: number;
}


@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    Awards,
    PlayerMatches,
    PlayerTeams
  ],
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {

  user: PlayerUser = {
    user_id: '',
    full_name: ''
  };

  profile = {
    name: '',
    isPro: true,
    position: '-',
    imageUrl: '👤',
    matches: 0,
    runs: 0
  };

  stats: PlayerStats = {
    totalMatches: 0,

    fieldGoals: 0,

    pcEarned: 0,
    pcScored: 0,

    psEarned: 0,
    psScored: 0,

    penaltyShootout: 0,
    penaltyShootoutMissed: 0,

    redCards: 0,
    yellowCards: 0,
    greenCards: 0,

    totalGoalScore: 0
  };

  menu = ['MATCHES', 'STATS', 'AWARDS', 'TEAMS'];
  selectedTab = 'MATCHES';

  isEditMode = false;
  editForm: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // const userId = this.route.snapshot.paramMap.get('userId');
     this.route.params.subscribe(params => {
      const userId = params['user_id'];
      if (!userId) {
        console.error('No userId found in route');
        return;
      }
      this.fetchUserProfile(userId);
      this.cdr.detectChanges();
     });
  }

  getPlayerStats(userId: string) {
    return this.http.get<any>(`${environment.baseUrl}/api/player-stats/${userId}`);
  }

  fetchUserProfile(userId: string): void {
    this.tournamentService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;

        // Profile info
        this.profile.name = user.full_name;
        this.profile.position = user.position || '-';
        this.profile.imageUrl = user.profile_pic || '👤';

        // Stats (from backend)
        // const ps = user.player_stats || {};

        // this.stats = {
        //   totalMatches: ps.totalMatches || 0,
        //   goals: ps.goals || 0,
        //   fieldGoals: ps.fieldGoals || 0,
        //   pc: ps.pc || 0,
        //   ps: ps.ps || 0,
        //   assists: ps.assists || 0,
        //   redCards: ps.redCards || 0,
        //   yellowCards: ps.yellowCards || 0,
        //   greenCards: ps.greenCards || 0,
        //   totalGoalScore: ps.totalGoalScore || 0
        // };

        this.profile.matches = this.stats.totalMatches;
        this.profile.runs = this.stats.totalGoalScore;
      },
      error: (err) => {
        console.error('Error fetching player profile', err);
      }
    });

    this.getPlayerStats(userId).subscribe(stats => {
      const baseGoalScore = Number(stats.totalGoalScore || 0) || 0;
      const shootoutGoals = Number(stats.penaltyShootout || 0) || 0;

      this.stats = {
        totalMatches: stats.totalMatches || 0,

        fieldGoals: stats.fieldGoals || 0,

        pcEarned: stats.pcEarned || 0,
        pcScored: stats.pcScored || 0,

        psEarned: stats.psEarned || 0,
        psScored: stats.psScored || 0,

        penaltyShootout: stats.penaltyShootout || 0,
        penaltyShootoutMissed:
          stats.penaltyShootoutMissed ||
          stats.penalty_shootout_missed ||
          stats.psMissed ||
          stats.ps_missed ||
          0,

        redCards: stats.redCards || 0,
        yellowCards: stats.yellowCards || 0,
        greenCards: stats.greenCards || 0,

        totalGoalScore: baseGoalScore + shootoutGoals
      };


      console.log('Fetched player stats:', this.stats);

      this.profile.matches = this.stats.totalMatches;
      this.profile.runs = this.stats.totalGoalScore;

      // Fallback: if backend doesn't provide penalty shootout missed,
      // derive it from player's match events.
      if (!this.stats.penaltyShootoutMissed) {
        this.loadPenaltyShootoutMissedFromMatches(userId);
      }

      this.cdr.detectChanges();
    });

  }

  private loadPenaltyShootoutMissedFromMatches(userId: string): void {
    this.http.get<any[]>(`${environment.baseUrl}/api/matches`).subscribe({
      next: (matches) => {
        const list = Array.isArray(matches) ? matches : [];
        let missed = 0;

        for (const match of list) {
          const events = Array.isArray(match?.match_events)
            ? match.match_events
            : Array.isArray(match?.matchEvents)
            ? match.matchEvents
            : Array.isArray(match?.events)
            ? match.events
            : [];
          if (!events.length) continue;

          for (const ev of events) {
            const type = String(ev?.type ?? '').trim().toLowerCase();
            const eventPlayerId = String(ev?.player_id ?? ev?.user_id ?? '').trim();
            if (!type.includes('penalty shootout') || !type.includes('miss')) continue;

            // Count only this player's missed shootouts.
            if (eventPlayerId === userId) {
              missed += 1;
            }
          }
        }

        if (missed > 0) {
          this.stats.penaltyShootoutMissed = missed;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Keep backend value if fallback fetch fails.
      }
    });
  }

  onTabSelect(tab: string): void {
    this.selectedTab = tab;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  saveProfile(): void {
    // optional future API call
    this.isEditMode = false;
  }

  goBack(): void {
    this.router.navigate(['/team-members']);
  }
}
