import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from "socket.io-client";

// Import child components
import { PreviewComponent } from './components/preview.component';
import { BoxScoreComponent } from './components/boxscore.component';
import { TimelineComponent } from './components/timeline.component';
import { AnalysisComponent } from './components/analysis.component';
import { LeadersComponent } from './components/leaders.component';
import { PenaltyShootoutComponent } from './components/penaltyshootout.component';

// Define an interface for better type safety
interface MatchData {
  matchId: string;
  date: string;
  venue: string;
  tournament: string;
  teams: {
    home: { name: string; logo: string; players: any[]; stats: any };
    away: { name: string; logo: string; players: any[]; stats: any };
  };
  score: { home: number; away: number };
  status: string;
  events: any[];
  penaltyShootout?: any;
  eventsHome?: any[];
  eventsAway?: any[];
  home_team_name?: string;
  away_team_name?: string;
}

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, PreviewComponent, BoxScoreComponent, TimelineComponent, AnalysisComponent, LeadersComponent, PenaltyShootoutComponent],
  templateUrl: './result.html',
  styleUrls: ['./result.css']
})

export class Result implements OnInit, OnDestroy {
  matchData: MatchData | null = null;
  matchId!: string;
  private socket!: Socket;
  private apiUrl = 'http://localhost:3000/api/matches'; // Base URL for our API

  tabs = ['Preview', 'Box Score', 'Timeline', 'Analysis', 'Leaders'];
  selectedTab = 0;
  boxScoreStats = [
    { label: 'GS', key: 'GS' },
    { label: 'Goals Scored', key: 'GoalsScored' },
    { label: 'FGS', key: 'FGS' },
    { label: 'Field Goals Scored', key: 'FieldGoalsScored' },
    { label: 'PCS', key: 'PCS' },
    { label: 'Penalty Corners Scored', key: 'PenaltyCornersScored' },
    { label: 'PSS', key: 'PSS' },
    { label: 'Penalty Strokes Scored', key: 'PenaltyStrokesScored' },
    { label: 'PSM', key: 'PSM' },
    { label: 'Penalty Strokes Missed', key: 'PenaltyStrokesMissed' },
    { label: 'GRC', key: 'GRC' },
    { label: 'Green Cards', key: 'GreenCards' },
    { label: 'YLC', key: 'YLC' },
    { label: 'Yellow Cards', key: 'YellowCards' },
    { label: 'RDC', key: 'RDC' },
    { label: 'Red Cards', key: 'RedCards' }
  ];

  constructor(private route: ActivatedRoute, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // ngOnInit(): void {
  //   // Initialize Socket.IO connection
  //   this.socket = io("http://localhost:3000");

  //   // Get matchId from URL params
  //   this.route.paramMap.subscribe(params => {
  //     this.matchId = params.get('matchId')!;
  //     console.log('🎯 Match ID from URL:', this.matchId);
      
  //     // Join the specific match room
  //     this.socket.emit("joinMatch", this.matchId);
  //     console.log('🔌 Joined match room:', this.matchId);
  //   });

  //   // Listen for real-time score updates
  //   this.socket.on("scoreUpdated", (data) => {
  //     console.log('📊 Score Update Received:', data);
      
  //     // Check if this update is for our match
  //     if (data.match_id === this.matchId) {
  //       console.log('✅ Score update for current match:', {
  //         matchId: data.match_id,
  //         team1Score: data.team1_score,
  //         team2Score: data.team2_score,
  //         status: data.status
  //       });
        
  //       // Update the score in matchData
  //       if (this.matchData) {
  //         this.matchData.score.home = data.team1_score;
  //         this.matchData.score.away = data.team2_score;
  //         this.matchData.status = data.status || this.matchData.status;
  //       }
  //     }
  //   });

  //   // Listen for timer updates
  //   this.socket.on("timerUpdated", (data) => {
  //     console.log('⏱️ Timer Update Received:', data);
      
  //     if (data.match_id === this.matchId) {
  //       console.log('✅ Timer update for current match:', {
  //         matchId: data.match_id,
  //         totalSeconds: data.total_seconds,
  //         isPaused: data.is_paused,
  //         displayMinutes: data.display_minutes,
  //         displaySeconds: data.display_seconds,
  //         status: data.status
  //       });
  //     }
  //   });

  //   // Listen for new events
  //   this.socket.on("eventAdded", (data) => {
  //     console.log('🎯 Event Added Received:', data);
      
  //     if (data.match_id === this.matchId) {
  //       console.log('✅ Event added for current match:', {
  //         matchId: data.match_id,
  //         event: data.event,
  //         status: data.status
  //       });
        
  //       // Add the new event to matchData events if needed
  //       if (this.matchData && data.event) {
  //         this.matchData.events.push({
  //           minute: data.event.time,
  //           team: data.event.team,
  //           type: data.event.type,
  //           player: data.event.player
  //         });
  //       }
  //     }
  //   });

  //   // Listen for quarter changes
  //   this.socket.on("quarterChanged", (data) => {
  //     console.log('🔄 Quarter Changed Received:', data);
      
  //     if (data.match_id === this.matchId) {
  //       console.log('✅ Quarter changed for current match:', {
  //         matchId: data.match_id,
  //         currentQuarter: data.current_quarter,
  //         status: data.status
  //       });
  //     }
  //   });

  //   // Listen for match status changes
  //   this.socket.on("matchStatusChanged", (data) => {
  //     console.log('📝 Match Status Changed Received:', data);
      
  //     if (data.match_id === this.matchId) {
  //       console.log('✅ Match status changed for current match:', {
  //         matchId: data.match_id,
  //         status: data.status
  //       });
        
  //       if (this.matchData) {
  //         this.matchData.status = data.status;
  //       }
  //     }
  //   });

  //   // Listen for complete match state updates
  //   this.socket.on("matchStateUpdated", (data) => {
  //     console.log('🔄 Complete Match State Update Received:', data);
      
  //     if (data.matchId === this.matchId) {
  //       console.log('✅ Complete state update for current match:', data);
  //     }
  //   });

  //   this.matchData = {
  //     matchId: '03dc760e-55e4-11f0-a2ea-29cee7c0ffc0',
  //     date: '2025-07-17',
  //     venue: 'Bangkok Stadium',
  //     tournament: "Women's U18 Asia Cup 2025",
  //     teams: {
  //       home: {
  //         name: 'Japan',
  //         logo: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg',
  //         players: [
  //           { name: 'Yuki Tanaka', age: 17 },
  //           { name: 'Mio Suzuki', age: 18 }
  //         ],
  //         stats: {
  //           GS: 2, GoalsScored: 2, FGS: 1, FieldGoalsScored: 1, PCS: 1, PenaltyCornersScored: 1,
  //           PSS: 0, PenaltyStrokesScored: 0, PSM: 0, PenaltyStrokesMissed: 0, GRC: 1, GreenCards: 1,
  //           YLC: 0, YellowCards: 0, RDC: 0, RedCards: 0
  //         }
  //       },
  //       away: {
  //         name: 'China',
  //         logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
  //         players: [
  //           { name: 'Li Wei', age: 17 },
  //           { name: 'Wang Fang', age: 18 }
  //         ],
  //         stats: {
  //           GS: 1, GoalsScored: 1, FGS: 1, FieldGoalsScored: 1, PCS: 0, PenaltyCornersScored: 0,
  //           PSS: 0, PenaltyStrokesScored: 0, PSM: 0, PenaltyStrokesMissed: 0, GRC: 0, GreenCards: 0,
  //           YLC: 1, YellowCards: 1, RDC: 0, RedCards: 0
  //         }
  //       }
  //     },
  //     score: { home: 2, away: 1 },
  //     status: 'FT',
  //     events: [
  //       { minute: 12, team: 'Japan', type: 'Goal', player: 'Yuki Tanaka' },
  //       { minute: 34, team: 'China', type: 'Goal', player: 'Li Wei' },
  //       { minute: 56, team: 'Japan', type: 'Goal', player: 'Mio Suzuki' }
  //     ],
  //     penaltyShootout: {
  //       home: [
  //         { player: 'SHAHEER Muhammad', scored: true },
  //         { player: 'LATIF Zubair', scored: true },
  //         { player: 'AWAN Abdullah', scored: true },
  //         { player: 'HANZALA Ali', scored: false },
  //         { player: 'HAMZA Ali', scored: true }
  //       ],
  //       away: [
  //         { player: 'A Aferullsyah', scored: true },
  //         { player: 'M Muhammad', scored: false },
  //         { player: 'M Rahuul', scored: true },
  //         { player: 'M Harieq', scored: false },
  //         { player: 'AZRUL Izz Ilhan', scored: false }
  //       ]
  //     },
  //     eventsHome: [
  //       { type: 'Yellow', player: 'ADEEL', minute: '56:22' },
  //       { type: 'Yellow', player: 'AWAN Abdullah', minute: '55:22' },
  //       { type: 'Green', player: 'SHAHBAZ Hassan', minute: '47:17' },
  //       { type: 'Goal', player: 'SHAHBAZ Hassan', minute: '39:19' },
  //       { type: 'Goal', player: 'SHAHBAZ Hassan', minute: '34:17' },
  //       { type: 'Goal', player: 'SHAHBAZ Hassan', minute: '07:34' },
  //       { type: 'PC', player: '07:32', minute: '' },
  //       { type: 'Goal', player: 'AWAN Abdullah', minute: '04:27' }
  //     ],
  //     eventsAway: [
  //       { type: 'Yellow', player: 'M Muhammad', minute: '56:29' },
  //       { type: 'PC', player: '', minute: '51:19' },
  //       { type: 'PC', player: 'Muhammad Safwan', minute: '27:29' },
  //       { type: 'PC', player: '', minute: '27:26' },
  //       { type: 'PC', player: '', minute: '20:22' },
  //       { type: 'PC', player: 'Muhammad Safwan', minute: '17:19' },
  //       { type: 'PC', player: '', minute: '17:17' },
  //       { type: 'PC', player: 'Muhammad Safwan', minute: '09:42' }
  //     ]
  //   };
  // }


  ngOnInit(): void {
    // 1. Get matchId from URL params and fetch initial data
    this.route.paramMap.subscribe(params => {
      this.matchId = params.get('matchId')!;
      console.log('🎯 Match ID from URL:', this.matchId);
      
      // Fetch the initial match data from the API
      this.fetchMatchData(this.matchId);

      // 2. Initialize Socket.IO connection only after matchId is known
      this.socket = io("http://localhost:3000");

      // Join the specific match room
      this.socket.emit("joinMatch", this.matchId);
      console.log('🔌 Joined match room:', this.matchId);
    
      //   // Listen for real-time score updates
    this.socket.on("scoreUpdated", (data) => {
      console.log('📊 Score Update Received:', data);
      
      // Check if this update is for our match
      if (data.match_id === this.matchId) {
        console.log('✅ Score update for current match:', {
          matchId: data.match_id,
          team1Score: data.team1_score,
          team2Score: data.team2_score,
          status: data.status
        });
        
        // Update the score in matchData
        if (this.matchData && data.match_id === this.matchId) {
          this.matchData.score.home = data.team1_score;
          this.matchData.score.away = data.team2_score;
          this.matchData.status = data.status || this.matchData.status;

          this.cdr.detectChanges();
        }
      }
    });
    // ... all other socket listeners (timerUpdated, eventAdded, etc.) ...

    // Listen for timer updates
    this.socket.on("timerUpdated", (data) => {
      console.log('⏱️ Timer Update Received:', data);
      
      if (data.match_id === this.matchId) {
        console.log('✅ Timer update for current match:', {
          matchId: data.match_id,
          totalSeconds: data.total_seconds,
          isPaused: data.is_paused,
          displayMinutes: data.display_minutes,
          displaySeconds: data.display_seconds,
          status: data.status
        });

        // Update the score in matchData
        if (this.matchData && data.match_id === this.matchId) {
          
          this.matchData.status = data.status || this.matchData.status;

          this.cdr.detectChanges();
        }
      }
    });

    // this.socket.on("eventAdded", (data) => {
    //   if (this.matchData && data.match_id === this.matchId && data.event) {
    //     this.matchData.events.push({
    //       minute: data.event.time,
    //       team: data.event.team,
    //       type: data.event.type,
    //       player: data.event.player
    //     });
    //   }
    // });

    // Listen for new events
    this.socket.on("eventAdded", (data) => {
      console.log('🎯 Event Added Received:', data);
      
      if (data.match_id === this.matchId) {
        console.log('✅ Event added for current match:', {
          matchId: data.match_id,
          event: data.event,
          status: data.status
        });
        
        // Add the new event to matchData events if needed
        if (this.matchData && data.match_id === this.matchId && data.event) {
          this.matchData.events.push({
            time: data.event.time,
            team: data.event.team,
            type: data.event.type,
            player: data.event.player,
            quarter: data.event.quarter
          });
          console.log('Updated match events:', this.matchData.events);
          this.cdr.detectChanges();
        }
      }
    });
    
    
    
    
    });

    //   // Listen for real-time score updates
    this.socket.on("scoreUpdated", (data) => {
      console.log('📊 Score Update Received:', data);
      
      // Check if this update is for our match
      if (data.match_id === this.matchId) {
        console.log('✅ Score update for current match:', {
          matchId: data.match_id,
          team1Score: data.team1_score,
          team2Score: data.team2_score,
          status: data.status
        });
        
        // Update the score in matchData
        if (this.matchData && data.match_id === this.matchId) {
          this.matchData.score.home = data.team1_score;
          this.matchData.score.away = data.team2_score;
          this.matchData.status = data.status || this.matchData.status;

          this.cdr.detectChanges();
        }
      }
    });
    // ... all other socket listeners (timerUpdated, eventAdded, etc.) ...

    // Listen for timer updates
    this.socket.on("timerUpdated", (data) => {
      console.log('⏱️ Timer Update Received:', data);
      
      if (data.match_id === this.matchId) {
        console.log('✅ Timer update for current match:', {
          matchId: data.match_id,
          totalSeconds: data.total_seconds,
          isPaused: data.is_paused,
          displayMinutes: data.display_minutes,
          displaySeconds: data.display_seconds,
          status: data.status
        });

        // Update the score in matchData
        if (this.matchData && data.match_id === this.matchId) {
          
          this.matchData.status = data.status || this.matchData.status;

          this.cdr.detectChanges();
        }
      }
    });

    // this.socket.on("eventAdded", (data) => {
    //   if (this.matchData && data.match_id === this.matchId && data.event) {
    //     this.matchData.events.push({
    //       minute: data.event.time,
    //       team: data.event.team,
    //       type: data.event.type,
    //       player: data.event.player
    //     });
    //   }
    // });

    // Listen for new events
    this.socket.on("eventAdded", (data) => {
      console.log('🎯 Event Added Received:', data);
      
      if (data.match_id === this.matchId) {
        console.log('✅ Event added for current match:', {
          matchId: data.match_id,
          event: data.event,
          status: data.status
        });
        
        // Add the new event to matchData events if needed
        if (this.matchData && data.match_id === this.matchId && data.event) {
          this.matchData.events.push({
            time: data.event.time,
            team: data.event.team,
            type: data.event.type,
            player: data.event.player,
            quarter: data.event.quarter
          });
          console.log('Updated match events:', this.matchData.events);
          this.cdr.detectChanges();
        }
      }
    });

    this.socket.on("quarterChanged", (data) => {
      // Handle quarter change logic
    });

    this.socket.on("matchStatusChanged", (data) => {
      if (this.matchData && data.match_id === this.matchId) {
        this.matchData.status = data.status;
      }
    });

    this.socket.on("matchStateUpdated", (data) => {
      if (data.matchId === this.matchId) {
        // You might want to fully replace this.matchData here with the new state
        this.matchData = data as MatchData; 
      }
    });
  }

  /**
   * Fetches the initial match data from the backend API.
   * @param matchId The ID of the match to fetch.
   */
  private fetchMatchData(matchId: string): void {
    const url = `${this.apiUrl}/${matchId}`;
    console.log(`📡 Fetching match data from: ${url}`);

    this.http.get<any>(url).subscribe({
      next: (data) => {
        // Map the flattened API response to the structured MatchData interface
        const mappedData: MatchData = {
          matchId: data.match_id, 
          date: data.match_date || '', 
          venue: data.venue || '',
          tournament: data.tournament || 'Default Tournament', 
          status: data.status || 'Upcoming',
          
          // Assuming your API response has home_score/away_score
          score: { home: data.team1_score || 0, away: data.team2_score || 0 }, 
          events: data.match_events || [],
          penaltyShootout: data.penaltyShootout,
          eventsHome: data.eventsHome,
          eventsAway: data.eventsAway,

          // Use the fetched team names and provide placeholders for other data
          teams: {
            home: { 
              name: data.team1_name || 'Home Team',
              logo: data.home_team_logo_url || 'path/to/default/home/logo.svg', 
              players: data.home_players || [], 
              stats: data.home_stats || {}
            },
            away: { 
              name: data.team2_name || 'Away Team',
              logo: data.away_team_logo_url || 'path/to/default/away/logo.svg', 
              players: data.away_players || [], 
              stats: data.away_stats || {}
            }
          },
          home_team_name: data.team1_name,
          away_team_name: data.team2_name,
        };

        this.matchData = mappedData;
        console.log('✅ Match data loaded successfully:', this.matchData);
      },
      error: (err) => {
        console.error('❌ Error fetching match data:', err);
        this.matchData = null; 
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up socket connection
    if (this.socket && this.matchId) {
      this.socket.emit("leaveMatch", this.matchId);
      this.socket.disconnect();
      console.log('🔌 Disconnected from socket and left match room:', this.matchId);
    }
  }
}
