
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
import { RouterModule, Router } from '@angular/router';
import { TournamentService } from '../service/tournament/tournament';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-player-profile',
  standalone: true, // ✅ very important
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule], // ✅ include CommonModule here
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {
  user: any;
  isEditMode = false;
  editForm: any = {};

  constructor(private router: Router, private tournamentService: TournamentService, private route: ActivatedRoute) {}

  ngOnInit() {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (userId) {
      this.fetchUserDetails(userId);
    }
  }

  fetchUserDetails(userId: string) {
    this.tournamentService.getUserById(userId).subscribe({
      next: (user: any) => {
        this.user = user;
        console.log('User details:', this.user);
        this.editForm = {
          full_name: user.full_name,
          phone_number: user.phone_number
        };
        // Update profile with user data
        this.profile.name = user.full_name;
        this.profile.imageUrl = user.profile_pic || '👤';
        // Add other fields if available
        if (user.position) this.profile.battingStyle = user.position; // assuming position is batting style
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/team-members']);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveProfile() {
    // Since no PUT endpoint, just update locally for now
    this.user.full_name = this.editForm.full_name;
    this.user.phone_number = this.editForm.phone_number;
    this.isEditMode = false;
    // TODO: Add PUT API call when backend supports it
  }

  profile = {
    name: '',
    location: 'Baramulla',
    views: 7,
    isPro: true,
    battingStyle: 'Right Hand',
    imageUrl: '👤',
    matches: 1,
    runs: 0,
    wickets: 0
  };

  stats = {
    totalMatches: 0,
    pc: 0,
    ps: 0,
    redCards: 0,
    greenCards: 0,
    yellowCards: 0,
    fieldGoals: 0,
    assists: 0,
    totalGoalScore: 0
  };

  menu = ['MATCHES', 'STATS', 'AWARDS', 'BADGES', 'TEAMS', 'PHOTOS', 'CONNECTIONS', 'PROFILE'];
  selectedTab = 'MATCHES';

  onTabSelect(tab: string) {
    this.selectedTab = tab;
    if (tab === 'STATS') {
      this.fetchStatsFromBackend();
    }
  }

  fetchStatsFromBackend() {
    // Simulate backend API call
    setTimeout(() => {
      this.stats = {
        totalMatches: 12,
        pc: 5,
        ps: 3,
        redCards: 1,
        greenCards: 2,
        yellowCards: 4,
        fieldGoals: 7,
        assists: 6,
        totalGoalScore: 15
      };
    }, 500);
    // Replace above with real API call in production
  }

  getTabRoute(tab: string): string {
    // Map tab names to routes (customize as needed)
    switch (tab) {
      case 'MATCHES': return '/player/matches';
      case 'STATS': return '/player/stats';
      case 'AWARDS': return '/player/awards';
      case 'BADGES': return '/player/badges';
      case 'TEAMS': return '/player/teams';
      case 'PHOTOS': return '/player/photos';
      case 'CONNECTIONS': return '/player/connections';
      case 'PROFILE': return '/player/profile';
      default: return '/player/profile';
    }
  }
}
 