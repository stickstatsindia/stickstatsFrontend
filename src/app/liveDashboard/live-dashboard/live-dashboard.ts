import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Match {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'Live' | 'Upcoming' | 'Finished';
  time: string;
}

@Component({
  selector: 'app-live-dashboard',
  standalone: true,
  imports: [CommonModule], // 
  templateUrl: './live-dashboard.html',
  styleUrls: ['./live-dashboard.css'] 
})
export class LiveDashboardComponent implements OnInit {
  matches: Match[] = [];
  selectedTab: 'Live' | 'Upcoming' | 'Finished' = 'Live';

  ngOnInit(): void {
    this.loadMatches();
    setInterval(() => this.loadMatches(), 30000);
  }

  loadMatches(): void {
    this.matches = [
      { teamA: 'Mumbai Blades', teamB: 'Delhi Defenders', scoreA: 2, scoreB: 1, status: 'Live', time: '28:45' },
      { teamA: 'Pune Panthers', teamB: 'Chennai Chargers', scoreA: 0, scoreB: 0, status: 'Upcoming', time: '17:00' },
      { teamA: 'Bangalore Bulls', teamB: 'Hyderabad Hawks', scoreA: 3, scoreB: 3, status: 'Finished', time: 'Full Time' }
    ];
  }

  filteredMatches(): Match[] {
    return this.matches.filter(match => match.status === this.selectedTab);
  }
}
