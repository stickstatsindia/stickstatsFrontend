




import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

interface Match {
  status: 'Live' | 'Upcoming' | 'Finished';
  match_date?: string;
  match_time?: string;
  venue?: string;
  home_team_id?: number;
  away_team_id?: number;
  home_score?: number;
  away_score?: number;
  home_team_name?: string;
  away_team_name?: string;
}

@Component({
  selector: 'app-live-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './live-dashboard.html',
  styleUrls: ['./live-dashboard.css']
})
export class LiveDashboardComponent implements OnInit {
  matches: Match[] = [];
  selectedTab: 'Live' | 'Upcoming' | 'Finished' = 'Live';

  selectedMatch: Match | null = null; // 🔹 Track selected match for modal

  ngOnInit(): void {
    this.loadMatches();
    setInterval(() => this.loadMatches(), 30000);
  }

  loadMatches(): void {
    const fetchedMatches: Match[] = [
      { match_date: '2023-10-01', match_time: '15:30', venue: 'StadiumA', status: 'Upcoming', away_team_id: 1, home_team_id: 2, home_score: 0, away_score: 0 },
      { match_date: '2023-10-01', match_time: '18:00', venue: 'StadiumB', status: 'Live', away_team_id: 3, home_team_id: 4, home_score: 2, away_score: 1 },
      { match_date: '2023-10-01', match_time: '20:30', venue: 'StadiumC', status: 'Finished', away_team_id: 5, home_team_id: 6, home_score: 1, away_score: 1 },
      { match_date: '2023-10-02', match_time: '16:00', venue: 'StadiumD', status: 'Upcoming', away_team_id: 7, home_team_id: 8, home_score: 0, away_score: 0 },
      { match_date: '2023-10-02', match_time: '19:00', venue: 'StadiumE', status: 'Live', away_team_id: 9, home_team_id: 10, home_score: 3, away_score: 2 },
      { match_date: '2023-10-02', match_time: '21:30', venue: 'StadiumF', status: 'Finished', away_team_id: 11, home_team_id: 12, home_score: 4, away_score: 3 }
    ];

    const teamMap = new Map<number, string>([
      [1, 'Delhi Defenders'],
      [2, 'Mumbai Blades'],
      [3, 'Pune Panthers'],
      [4, 'Chennai Chargers'],
      [5, 'Bangalore Bulls'],
      [6, 'Hyderabad Hawks'],
      [7, 'Kolkata Knights'],
      [8, 'Jaipur Jaguars'],
      [9, 'Goa Gladiators'],
      [10, 'Lucknow Lions'],
      [11, 'Ahmedabad Avengers'],
      [12, 'Nagpur Ninjas']
    ]);

    this.matches = fetchedMatches.map(match => ({
      ...match,
      home_team_name: teamMap.get(match.home_team_id ?? 0) || 'Team A',
      away_team_name: teamMap.get(match.away_team_id ?? 0) || 'Team B'
    }));
  }

  filteredMatches(): Match[] {
    return this.matches.filter(match => match.status === this.selectedTab);
  }

  openModal(match: Match): void {
    this.selectedMatch = match;
  }

  closeModal(): void {
    this.selectedMatch = null;
  }
}
