import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatchService } from '../../match.service';
import { SocketService } from '../../socket';
import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

interface Match {
  _id: string;
  match_id: string;
  status: 'Live' | 'Upcoming' | 'Finished';
  match_date?: string;
  match_time?: string;
  venue?: string;
  home_team_id?: string;
  away_team_id?: string;
  home_score?: number;
  away_score?: number;
  home_team_name?: string;
  away_team_name?: string;
}

@Component({
  selector: 'app-live-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-dashboard.html',
  styleUrls: ['./live-dashboard.css']
})


export class LiveDashboardComponent implements OnInit, OnDestroy {
  constructor(private socketService: SocketService, private matchService: MatchService) {}

  matches: Match[] = [];
  selectedTab: 'Live' | 'Upcoming' | 'Finished' = 'Live';
  
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    // 1. Fetch initial matches from the backend
    // This calls the API endpoint `/api/matches`
    this.matchService.getAllMatches().subscribe(
      matches => {
        this.matches = matches;
        console.log('Matches loaded:', this.matches);
      },
      error => {
        console.error('Error fetching matches:', error);
      }
    );

    // 2. Listen for real-time score updates
    this.subscriptions.add(
      this.socketService.onScoreUpdate().subscribe(data => {
        const matchToUpdate = this.matches.find(m => m.match_id === data.matchId);
        if (matchToUpdate) {
          matchToUpdate.home_score = data.homeScore;
          matchToUpdate.away_score = data.awayScore;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filteredMatches(): Match[] {
    return this.matches.filter(match => match.status === this.selectedTab);
  }

  // Method to handle tab switching
  selectTab(tab: 'Live' | 'Upcoming' | 'Finished'): void {
    this.selectedTab = tab;
  }
}


// export class LiveDashboardComponent implements OnInit, OnDestroy {

//   constructor(private socketService: SocketService, private matchService: MatchService) {}

//   matches: Match[] = [];
//   selectedTab: 'Live' | 'Upcoming' | 'Finished' = 'Live';

//   private subscriptions: Subscription = new Subscription();

//   selectedMatch: Match | null = null; // 🔹 Track selected match for modal

//   // Gauri's Code

//   // ngOnInit(): void {
//   //   this.loadMatches();
//   //   setInterval(() => this.loadMatches(), 30000);

//   //   this.socketService.onScoreBroadcast().subscribe((updatedScore: any) => {
//   //     this.updateMatchScore(updatedScore);
//   //   });

//   //   this.socketService.onTimerUpdate().subscribe((timerData: any) => {
//   //     this.updateMatchTimer(timerData);
//   //   });

//   // }

//   //For live

//   ngOnInit(): void {
//     // 1. Fetch initial matches from the backend
//     this.matchService.getAllMatches().subscribe(matches => {
//       this.matches = matches;
//     });

//     // 2. Listen for real-time score updates
//     this.subscriptions.add(
//       this.socketService.onScoreUpdate().subscribe(data => {
//         const matchToUpdate = this.matches.find(m => m.match_id === data.matchId);
//         if (matchToUpdate) {
//           matchToUpdate.home_score = data.homeScore;
//           matchToUpdate.away_score = data.awayScore;
//         }
//       })
//     );
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.unsubscribe();
//   }

//   // Gauri's Code

//   // loadMatches(): void {
//   //   const fetchedMatches: Match[] = [
//   //     { match_id: '1', match_date: '2023-10-01', match_time: '15:30', venue: 'StadiumA', status: 'Upcoming', away_team_id: 1, home_team_id: 2, home_score: 0, away_score: 0 },
//   //     { match_id: '2', match_date: '2023-10-01', match_time: '18:00', venue: 'StadiumB', status: 'Live', away_team_id: 3, home_team_id: 4, home_score: 2, away_score: 1 },
//   //     { match_id: '3', match_date: '2023-10-01', match_time: '20:30', venue: 'StadiumC', status: 'Finished', away_team_id: 5, home_team_id: 6, home_score: 1, away_score: 1 },
//   //     { match_id: '4', match_date: '2023-10-02', match_time: '16:00', venue: 'StadiumD', status: 'Upcoming', away_team_id: 7, home_team_id: 8, home_score: 0, away_score: 0 },
//   //     { match_id: '5', match_date: '2023-10-02', match_time: '19:00', venue: 'StadiumE', status: 'Live', away_team_id: 9, home_team_id: 10, home_score: 3, away_score: 2 },
//   //     { match_id: '6', match_date: '2023-10-02', match_time: '21:30', venue: 'StadiumF', status: 'Finished', away_team_id: 11, home_team_id: 12, home_score: 4, away_score: 3 }
//   //   ];


//   //   const teamMap = new Map<number, string>([
//   //     [1, 'Delhi Defenders'],
//   //     [2, 'Mumbai Blades'],
//   //     [3, 'Pune Panthers'],
//   //     [4, 'Chennai Chargers'],
//   //     [5, 'Bangalore Bulls'],
//   //     [6, 'Hyderabad Hawks'],
//   //     [7, 'Kolkata Knights'],
//   //     [8, 'Jaipur Jaguars'],
//   //     [9, 'Goa Gladiators'],
//   //     [10, 'Lucknow Lions'],
//   //     [11, 'Ahmedabad Avengers'],
//   //     [12, 'Nagpur Ninjas']
//   //   ]);

//   //   this.matches = fetchedMatches.map(match => ({
//   //     ...match,
//   //     home_team_name: teamMap.get(match.home_team_id ?? 0) || 'Team A',
//   //     away_team_name: teamMap.get(match.away_team_id ?? 0) || 'Team B'
//   //   }));
//   // }

//   // timers: { [match_id: string]: { minutes: number, seconds: number, interval?: any } } = {};

//   // updateMatchTimer(data: any) {
//   //   const matchId = data.match_id;

//   //   if (!this.timers[matchId]) {
//   //     this.timers[matchId] = { minutes: data.minutes, seconds: data.seconds };
//   //   } else {
//   //     clearInterval(this.timers[matchId].interval);
//   //     this.timers[matchId].minutes = data.minutes;
//   //     this.timers[matchId].seconds = data.seconds;
//   //   }

//   //   this.timers[matchId].interval = setInterval(() => {
//   //     const t = this.timers[matchId];
//   //     if (t.seconds === 0 && t.minutes === 0) {
//   //       clearInterval(t.interval);
//   //     } else {
//   //       if (t.seconds === 0) {
//   //         t.minutes--;
//   //         t.seconds = 59;
//   //       } else {
//   //         t.seconds--;
//   //       }
//   //     }
//   //   }, 1000);
//   // }

//   // format(value: number): string {
//   //   return value < 10 ? '0' + value : value.toString();
//   // }

//   // updateMatchScore(data: any): void {
//   //   const match = this.matches.find(
//   //     m =>
//   //       m.home_team_id === data.home_team_id &&
//   //       m.away_team_id === data.away_team_id &&
//   //       m.status === 'Live'
//   //   );

//   //   if (match) {
//   //     match.home_score = data.home_score;
//   //     match.away_score = data.away_score;
//   //   }
//   // }


//   filteredMatches(): Match[] {
//     return this.matches.filter(match => match.status === this.selectedTab);
//   }

//   openModal(match: Match): void {
//     this.selectedMatch = match;
//   }

//   closeModal(): void {
//     this.selectedMatch = null;
//   }
// }
