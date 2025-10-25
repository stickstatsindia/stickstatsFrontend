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
    { label: 'Goals Scored', key: 'GoalsScored' },
    { label: 'Field Goals Scored', key: 'FieldGoalsScored' },
    { label: 'Penalty Corners Scored', key: 'PenaltyCornersScored' },
    { label: 'Penalty Strokes Scored', key: 'PenaltyStrokesScored' },
    { label: 'Penalty Strokes Missed', key: 'PenaltyStrokesMissed' },
    { label: 'Green Cards', key: 'GreenCards' },
    { label: 'Yellow Cards', key: 'YellowCards' },
    { label: 'Red Cards', key: 'RedCards' }
  ];

  // Template for stats - use this to initialize both team stats
  private readonly statsTemplate = {
    GoalsScored: 0,
    FieldGoalsScored: 0,
    PenaltyCornersScored: 0,
    PenaltyStrokesScored: 0,
    PenaltyStrokesMissed: 0,
    GreenCards: 0,
    YellowCards: 0,
    RedCards: 0
  };

  constructor(private route: ActivatedRoute, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.matchId = params.get('matchId')!;
      console.log('🎯 Match ID from URL:', this.matchId);

      // Fetch the initial match data from the API
      this.fetchMatchData(this.matchId);

      // Initialize Socket.IO connection
      this.socket = io("http://localhost:3000");
      this.socket.emit("joinMatch", this.matchId);
      console.log('🔌 Joined match room:', this.matchId);

      // Single listener for score updates
      this.socket.on("scoreUpdated", (data) => {
        if (data && data.match_id === this.matchId && this.matchData) {
          this.matchData.score.home = data.team1_score ?? this.matchData.score.home;
          this.matchData.score.away = data.team2_score ?? this.matchData.score.away;
          this.matchData.status = data.status || this.matchData.status;
          this.cdr.detectChanges();
        }
      });

      // Timer updates (single listener)
      this.socket.on("timerUpdated", (data) => {
        if (data && data.match_id === this.matchId && this.matchData) {
          this.matchData.status = data.status || this.matchData.status;
          this.cdr.detectChanges();
        }
      });

      // When a new event is added — push it into matchData.events and recalc stats
      this.socket.on("eventAdded", (data) => {
        if (!data || data.match_id !== this.matchId) return;

        if (this.matchData && data.event) {
          // Normalize incoming event to the same shape you use in your fetch
          const incomingEvent = {
            time: data.event.time,
            team: data.event.team,
            type: data.event.type,
            player: data.event.player,
            quarter: data.event.quarter
          };

          // push event
          this.matchData.events = this.matchData.events || [];
          this.matchData.events.push(incomingEvent);

          // Recalculate stats for both teams after adding the event
          this.calculateBoxScoreStats(this.matchData);

          // If the backend also sends updated scores in the event payload, update them:
          if (data.team1_score !== undefined) this.matchData.score.home = data.team1_score;
          if (data.team2_score !== undefined) this.matchData.score.away = data.team2_score;

          // Reflect changes in UI
          this.cdr.detectChanges();
        }
      });

      // Optional: listeners for other events (quarterChanged, matchStatusChanged, matchStateUpdated)
      this.socket.on("matchStatusChanged", (data) => {
        if (data && data.match_id === this.matchId && this.matchData) {
          this.matchData.status = data.status;
          this.cdr.detectChanges();
        }
      });

      this.socket.on("matchStateUpdated", (data) => {
        // If server sends a full match state, replace and recalc
        if (data && (data.matchId === this.matchId || data.match_id === this.matchId)) {
          // server might send different shapes; ensure it matches MatchData interface
          const newState = (data as any);
          // make sure teams have stats initialized (prevents undefined access in template)
          newState.teams = newState.teams || {
            home: { name: 'Home', logo: '', players: [], stats: { ...this.statsTemplate } },
            away: { name: 'Away', logo: '', players: [], stats: { ...this.statsTemplate } }
          };
          this.matchData = newState as MatchData;
          this.calculateBoxScoreStats(this.matchData);
          this.cdr.detectChanges();
        }
      });
    });
  }

  /**
   * Compute boxscore stats for both teams based on data.events (in-place update).
   */
  calculateBoxScoreStats(data: MatchData): MatchData {
    // ensure data and teams exist
    if (!data) return data;
    data.teams = data.teams || {
      home: { name: 'Home', logo: '', players: [], stats: { ...this.statsTemplate } },
      away: { name: 'Away', logo: '', players: [], stats: { ...this.statsTemplate } }
    };

    // Start from fresh copies to avoid stale totals
    const homeStats = { ...this.statsTemplate };
    const awayStats = { ...this.statsTemplate };

    const homeName = (data.teams.home?.name || '').toString().trim().toLowerCase();
    const awayName = (data.teams.away?.name || '').toString().trim().toLowerCase();

    const pickTarget = (eventTeam?: string) => {
      if (!eventTeam) return null;
      const e = eventTeam.toString().trim().toLowerCase();
      // exact match or 'home'/'away'
      if (e === homeName || e === 'home') return homeStats;
      if (e === awayName || e === 'away') return awayStats;
      // partial match (team name may include club suffix/prefix)
      if (homeName && e.includes(homeName)) return homeStats;
      if (awayName && e.includes(awayName)) return awayStats;
      return null;
    };

    for (const event of data.events || []) {
      const evType = (event.type || '').toString().trim().toLowerCase();
      let resolvedTarget = pickTarget(event.team);

      // If pickTarget couldn't resolve, try heuristics to map to home/away
      if (!resolvedTarget) {
        const e = (event.team || '').toString().trim().toLowerCase();
        if (e === 'team1' || e === 'team 1') {
          // assume team1 is home
          resolvedTarget = homeStats;
        } else if (e === 'team2' || e === 'team 2') {
          resolvedTarget = awayStats;
        } else {
          // skip unknown team
          continue;
        }
      }

      // Count events (handle common synonyms)
      if (evType === 'goal' || evType === 'field goal' || evType === 'fg') {
        resolvedTarget.GoalsScored++;
        resolvedTarget.FieldGoalsScored++;
      } else if (evType.includes('penalty corner') && (evType.includes('scored') || evType.includes('goal') || evType.includes('converted'))) {
        resolvedTarget.PenaltyCornersScored++;
        resolvedTarget.GoalsScored++;
      } else if (evType.includes('penalty corner') && (evType.includes('earned') || evType.includes('won'))) {
        // penalty corner earned — doesn't increment goals, maybe track separately later
      } else if (evType.includes('penalty stroke') && (evType.includes('scored') || evType.includes('goal') || evType.includes('converted') || evType === 'penalty stroke')) {
        resolvedTarget.PenaltyStrokesScored++;
        resolvedTarget.GoalsScored++;
      } else if (evType.includes('penalty stroke') && evType.includes('miss')) {
        resolvedTarget.PenaltyStrokesMissed++;
      } else if (evType === 'green card' || evType.includes('green')) {
        resolvedTarget.GreenCards++;
      } else if (evType === 'yellow card' || evType.includes('yellow')) {
        resolvedTarget.YellowCards++;
      } else if (evType === 'red card' || evType.includes('Red')) {
        resolvedTarget.RedCards++;
      } else {
        // unhandled event type — you can add more mappings here if needed
      }
    }

    // assign computed stats back to the teams
    data.teams.home.stats = homeStats;
    data.teams.away.stats = awayStats;

    return data;
  }

  /**
   * Fetches the initial match data from the backend API.
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
          score: { home: data.team1_score || 0, away: data.team2_score || 0 },
          events: data.match_events || [],
          penaltyShootout: data.penaltyShootout,
          eventsHome: data.eventsHome,
          eventsAway: data.eventsAway,
          teams: {
            home: {
              name: data.team1_name || 'Home Team',
              logo: data.home_team_logo_url || 'path/to/default/home/logo.svg',
              players: data.home_players || [],
              stats: { ...this.statsTemplate } // initialize safely
            },
            away: {
              name: data.team2_name || 'Away Team',
              logo: data.away_team_logo_url || 'path/to/default/away/logo.svg',
              players: data.away_players || [],
              stats: { ...this.statsTemplate } // initialize safely
            }
          },
          home_team_name: data.team1_name,
          away_team_name: data.team2_name
        };

        this.matchData = mappedData;

        // Compute stats based on initial events
        this.calculateBoxScoreStats(this.matchData);

        // Provide label rows to the child BoxScore component
        // (your BoxScore child expects `stats` array for rendering labels)
        // e.g. <app-boxscore [data]="matchData" [stats]="boxScoreStats"></app-boxscore>
        this.cdr.detectChanges();

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
