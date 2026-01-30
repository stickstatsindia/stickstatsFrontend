import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

import { TournamentService } from '../service/tournament/tournament';
import { MembersService } from '../service/members/members-service';
import { Awards } from '../awards/awards';
import { PlayerMatches } from '../player-matches/player-matches';
import { PlayetTeams } from '../playet-teams/playet-teams';

interface PlayerUser {
  id: string;
  full_name: string;
  phone_number: string;
  profile_pic?: string;
  position?: string;
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
  imports: [CommonModule, RouterModule, FormsModule, PlayetTeams, PlayerMatches, ReactiveFormsModule, Awards],
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {

  user!: PlayerUser;
  isEditMode = false;
  editForm: any = {};

  profile = {
    name: '',
    views: 7,
    isPro: true,
    battingStyle: '',
    imageUrl: '👤',
    matches: 0,
    runs: 0,
    wickets: 0
  };

  stats: PlayerStats = {
    totalMatches: 0,
    goals: 0,
    pc: 0,
    ps: 0,
    redCards: 0,
    greenCards: 0,
    yellowCards: 0,
    fieldGoals: 0,
    assists: 0,
    totalGoalScore: 0
  };

  menu = ['MATCHES', 'STATS', 'AWARDS', 'TEAMS'];
  selectedTab = 'MATCHES';

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private route: ActivatedRoute,
    private membersService: MembersService,
    private cdr: ChangeDetectorRef
  ) {}

  // ngOnInit(): void {
  //   const userId = this.route.snapshot.queryParamMap.get('userId');
  //   if (userId) {
  //     this.loadProfileData(userId);
  //   }
  // }

  ngOnInit(): void {
  const userId = this.route.snapshot.queryParamMap.get('userId');
  if (userId) {
    this.tournamentService.getUserById(userId).subscribe({
     next: (user: PlayerUser)  => {
        this.user = user;
        this.cdr.detectChanges();
        // set profile data
        this.profile.name = user.full_name;
        this.profile.imageUrl = user.profile_pic || '👤';
        this.profile.battingStyle = user.position || '';
        this.cdr.detectChanges();
        // now fetch matches and calculate stats
        this.membersService.getAllMatches().subscribe({
          next: (matches: any[]) => {
            const calculatedStats = this.calculatePlayerStats(matches, user.full_name);
            this.stats = { ...calculatedStats };
            this.profile.matches = calculatedStats.totalMatches;
            this.profile.runs = calculatedStats.goals;

            this.cdr.detectChanges(); // ensures Angular updates the UI
          },
          error: err => console.error('Error fetching matches:', err)
        });
      },
      error: err => console.error('Error fetching user:', err)
    });
  }
}


  loadProfileData(userId: string): void {
    forkJoin({
      user: this.tournamentService.getUserById(userId) as Observable<PlayerUser>,
      matches: this.membersService.getAllMatches() as Observable<any[]>
    }).subscribe({
      next: ({ user, matches }) => {
        this.user = user;

        // Set profile info
        this.profile.name = user.full_name;
        this.profile.imageUrl = user.profile_pic || '👤';
        this.profile.battingStyle = user.position || '';
        this.cdr.detectChanges();

        // Calculate stats
        const calculatedStats = this.calculatePlayerStats(matches, user.full_name);
        this.stats = { ...calculatedStats };
        this.profile.matches = calculatedStats.totalMatches;
        this.profile.runs = calculatedStats.goals;
        window.location.reload();
        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
      }
    });
  }

  calculatePlayerStats(matches: any[], playerName: string): PlayerStats {
    const stats: PlayerStats = {
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

    matches.forEach(match => {
      const played =
        match.team1_players?.includes(playerName) ||
        match.team2_players?.includes(playerName);

      if (played) stats.totalMatches++;

      match.match_events?.forEach((event: any) => {
        if (event.player !== playerName) return;

        switch (event.type) {
          case 'Goal':
            stats.goals++;
            stats.fieldGoals++;
            break;
          case 'Penalty Corner Scored':
            stats.pc++;
            break;
          case 'Penalty Stroke Scored':
            stats.ps++;
            break;
          case 'Red Card':
            stats.redCards++;
            break;
          case 'Yellow Card':
            stats.yellowCards++;
            break;
          case 'Green Card':
            stats.greenCards++;
            break;
        }
      });
    });

    stats.totalGoalScore = stats.goals + stats.pc + stats.ps;
    return stats;
  }

onTabSelect(tab: string): void {
  this.selectedTab = tab;
}



  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  saveProfile(): void {
    this.user.full_name = this.editForm.full_name;
    this.user.phone_number = this.editForm.phone_number;
    this.isEditMode = false;
  }

  goBack(): void {
    this.router.navigate(['/team-members']);
  }
}
