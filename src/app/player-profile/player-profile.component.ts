
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
 
@Component({
  selector: 'app-player-profile',
  standalone: true, // ✅ very important
  imports: [CommonModule], // ✅ include CommonModule here
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent {
  profile = {
    name: 'evejeet singh',
    location: 'Baramulla',
    views: 7,
    isPro: true,
    battingStyle: 'Right Hand',
    imageUrl: 'https://via.placeholder.com/100x100.png?text=Profile',
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
 