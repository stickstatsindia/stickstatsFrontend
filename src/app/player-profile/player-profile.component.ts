import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  goals: number;
  fieldGoals: number;
  pc: number;
  ps: number;
  assists: number;
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

  user!: PlayerUser;

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
    goals: 0,
    fieldGoals: 0,
    pc: 0,
    ps: 0,
    assists: 0,
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
    return this.http.get<any>(`http://localhost:3000/api/player-stats/${userId}`);
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
        this.profile.runs = this.stats.goals;
      },
      error: (err) => {
        console.error('Error fetching player profile', err);
      }
    });

    this.getPlayerStats(userId).subscribe(stats => {
      console.log('Player stats:', stats); // 🔴 keep this temporarily

      this.stats = {
        totalMatches: stats.totalMatches || 0,
        goals: stats.goals || 0,
        fieldGoals: stats.goals || 0,
        pc: stats.pc || 0,
        ps: stats.ps || 0,
        assists: 0,
        redCards: stats.redCards || 0,
        yellowCards: stats.yellowCards || 0,
        greenCards: stats.greenCards || 0,
        totalGoalScore: stats.totalGoalScore || 0
      };

      this.profile.matches = this.stats.totalMatches;
      this.profile.runs = this.stats.goals;
       this.cdr.detectChanges();
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
