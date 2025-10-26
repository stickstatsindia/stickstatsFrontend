
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
  __v: number;
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
  viewers: number;
  goals: number;
}

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-management.html',
  styleUrls: ['./team-management.css']
})
export class TeamManagementComponent implements OnInit {
  tournamentId: string | null = null;
  tournamentData: Tournament | null = null;
  
  team: TeamDisplay = {
    name: '',
    logoUrl: 'https://via.placeholder.com/100x100.png?text=Team',
    startDate: '',
    endDate: '',
    location: '',
    format: '',
    category: '',
    matchType: '',
    totalMatches: 0,
    viewers: 0,
    goals: 0
  };
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        console.log('Tournament ID from route params:', id);
        this.tournamentId = id;
        this.loadTournamentData(id);
      } else {
        console.error('No tournament ID available');
        this.router.navigate(['/tournaments']);
      }
    });
  }

  loadTournamentData(tournamentId: string) {
    console.log('Loading data for tournament:', tournamentId);
    this.tournamentService.getTournamentById(tournamentId).subscribe({
      next: (response: any) => {
        this.tournamentData = response as Tournament;
        console.log('Tournament data received:', this.tournamentData);
        
        // Format dates for display
        const startDate = new Date(this.tournamentData.start_date).toLocaleDateString();
        const endDate = new Date(this.tournamentData.end_date).toLocaleDateString();
        
        // Update the team object with the received data
        this.team = {
          name: this.tournamentData.tournament_name,
          logoUrl: 'https://via.placeholder.com/100x100.png?text=Team',
          startDate: startDate,
          endDate: endDate,
          location: this.tournamentData.location,
          format: this.tournamentData.format,
          category: this.tournamentData.tournament_category,
          matchType: this.tournamentData.match_type,
          totalMatches: 0, // This will need to be calculated from matches data
          viewers: 0,      // This might come from a different API
          goals: 0         // This might come from a different API
        };
      },
      error: (error) => {
        console.error('Error loading tournament data:', error);
        this.router.navigate(['/tournaments']);
      }
    });
  }

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
    assists: 0,
    totalGoalScore: 0
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
        assists: 6,
        totalGoalScore: 15
      };
    }, 500);
  }
}

