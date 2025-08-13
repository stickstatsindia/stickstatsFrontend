
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-management',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './team-management.html',
  styleUrls: ['./team-management.css']
})
export class TeamManagementComponent {
  team = {
    name: 'Baramulla Hockey Club',
    logoUrl: 'https://via.placeholder.com/100x100.png?text=Team',
    startDate: '2025-08-01',
    endDate: '2025-08-15',
    location: 'Baramulla',
    totalMatches: 10,
    viewers: 1200,
    goals: 0
  };

  menu = ['MATCHES', 'STATS', 'AWARDS', 'BADGES', 'TEAMS', 'PHOTOS', 'CONNECTIONS', 'PROFILE'];
  selectedTab = 'MATCHES';

  stats = {
    totalMatches: 0,
    pc: 0,
    ps: 0,
    psGoal: 0,
    redCards: 0,
    greenCards: 0,
    yellowCards: 0,
    fieldGoals: 0,
    assists: 0
  
  };

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
        pc: 3,
        ps: 2,
        psGoal: 4,
        redCards: 1,
        greenCards: 2,
        yellowCards: 4,
        fieldGoals: 7,
        assists: 6
        
      };
    }, 500);
    // Replace above with real API call in production
  }
}

