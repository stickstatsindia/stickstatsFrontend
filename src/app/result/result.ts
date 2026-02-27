import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from "socket.io-client";
import { environment } from '../config/api.config';

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
  tournamentId?: string;
  teams: {
    home: { name: string; id: string; logo: string; players: any[]; stats: any };
    away: { name: string; id: string; logo: string; players: any[]; stats: any };
  };
  score: { home: number; away: number };
  status: string;
  events: any[];
  penaltyShootout?: any;
  eventsHome?: any[];
  eventsAway?: any[];
  home_team_name?: string;
  away_team_name?: string;
  quarterScores?: {
    home: number[];
    away: number[];
  };
}

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterLink, PreviewComponent, BoxScoreComponent, TimelineComponent, AnalysisComponent, LeadersComponent, PenaltyShootoutComponent],
  templateUrl: './result.html',
  styleUrls: ['./result.css']
})
export class Result implements OnInit, OnDestroy {
  matchData: MatchData | null = null;
  matchId!: string;
  private socket!: Socket;
  private apiUrl = `${environment.baseUrl}/api/matches`; // Base URL for our API
  private isMainScoreLocked = false;
  private lockedMainScore: { home: number; away: number } | null = null;
  private isQuarterScoreLocked = false;
  private lockedQuarterScores: { home: number[]; away: number[] } | null = null;

  tabs = ['Preview', 'Box Score', 'Timeline', 'Analysis', 'Leaders'];
  selectedTab = 0;
  boxScoreStats = [
    { label: 'Goals Scored', key: 'GoalsScored' },
    { label: 'Field Goals Scored', key: 'FieldGoalsScored' },
    { label: 'Penalty Corners Scored', key: 'PenaltyCornersScored' },
    { label: 'Penalty Corner Earned', key: 'PenaltyCornersEarned' },
    { label: 'Penalty Strokes Scored', key: 'PenaltyStrokesScored' },
    { label: 'Penalty Stroke Earned', key: 'PenaltyStrokesEarned' },
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
    PenaltyCornersEarned: 0,
    PenaltyStrokesScored: 0,
    PenaltyStrokesEarned: 0,
    PenaltyStrokesMissed: 0,
    GreenCards: 0,
    YellowCards: 0,
    RedCards: 0
  };

  constructor(private route: ActivatedRoute, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  get outcomeText(): string {
    if (!this.matchData) return '';
    const status = String(this.matchData.status || '').trim().toLowerCase();
    const isFinished =
      status.includes('finish') ||
      status.includes('complete') ||
      status.includes('ended') ||
      status.includes('full time') ||
      status === 'ft';
    if (!isFinished) return '';

    const homeName = this.matchData.teams?.home?.name || 'Home';
    const awayName = this.matchData.teams?.away?.name || 'Away';
    const homeRegular = Array.isArray(this.matchData.quarterScores?.home)
      ? this.matchData.quarterScores!.home.reduce((a, b) => a + (Number(b) || 0), 0)
      : Number(this.matchData.score?.home ?? 0) || 0;
    const awayRegular = Array.isArray(this.matchData.quarterScores?.away)
      ? this.matchData.quarterScores!.away.reduce((a, b) => a + (Number(b) || 0), 0)
      : Number(this.matchData.score?.away ?? 0) || 0;

    const ps = this.readPenaltyScores(this.matchData.penaltyShootout);
    if (ps) {
      const homeFinal = homeRegular + ps.home;
      const awayFinal = awayRegular + ps.away;
      if (homeFinal > awayFinal) return `${homeName} won`;
      if (homeFinal < awayFinal) return `${awayName} won`;
      return 'Match Draw';
    }

    if (homeRegular > awayRegular) return `${homeName} won`;
    if (homeRegular < awayRegular) return `${awayName} won`;
    return 'Match Draw';
  }

  private normalizeEvent(event: any): any {
    return {
      ...event,
      player: event?.player || event?.player_name || 'Unknown Player',
      type: event?.type || 'Unknown Event',
      time: event?.time || '',
      quarter: event?.quarter || '',
      team: event?.team || ''
    };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.matchId = params.get('matchId')!;
      this.selectedTab = 0;
      this.isMainScoreLocked = false;
      this.lockedMainScore = null;
      this.isQuarterScoreLocked = false;
      this.lockedQuarterScores = null;
      console.log('🎯 Match ID from URL:', this.matchId);

      // Fetch the initial match data from the API
      this.fetchMatchData(this.matchId);

      // Initialize Socket.IO connection
      this.socket = io(environment.socketUrl);
      this.socket.emit("joinMatch", this.matchId);
      console.log('🔌 Joined match room:', this.matchId);

      // Single listener for score updates
      this.socket.on("scoreUpdated", (data) => {
        const socketMatchId = data?.match_id || data?.matchId;
        if (data && socketMatchId === this.matchId && this.matchData) {
          this.matchData.status = data.status || this.matchData.status;
          this.syncQuarterScoresFromPayload(this.matchData, data);
          this.syncPenaltyShootoutFromPayload(this.matchData, data);
          this.syncTotalScoreFromPayload(this.matchData, data);
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
        const socketMatchId = data?.match_id || data?.matchId;
        if (!data || socketMatchId !== this.matchId) return;

        if (this.matchData) {
          const rawEvent =
            data?.event ||
            data?.match_event ||
            data?.matchEvent ||
            (Array.isArray(data?.match_events) ? data.match_events[data.match_events.length - 1] : null) ||
            (Array.isArray(data?.matchEvents) ? data.matchEvents[data.matchEvents.length - 1] : null);

          if (!rawEvent) {
            this.syncQuarterScoresFromPayload(this.matchData, data);
            this.syncPenaltyShootoutFromPayload(this.matchData, data);
            this.cdr.detectChanges();
            return;
          }

          const incomingEvent = this.normalizeEvent(rawEvent);
          const isDuplicate = (this.matchData.events || []).some((ev: any) => this.isSameEvent(ev, incomingEvent));
          if (isDuplicate) return;

          // push event
          this.matchData.events = this.matchData.events || [];
          this.matchData.events.push(incomingEvent);

          // Recalculate stats for both teams after adding the event
          this.calculateBoxScoreStats(this.matchData);

          // Sync total score from backend payload if present, else fallback from events/quarters
          this.syncQuarterScoresFromPayload(this.matchData, data);
          this.syncPenaltyShootoutFromPayload(this.matchData, data);
          this.syncTotalScoreFromPayload(this.matchData, data);

          // Reflect changes in UI
          this.cdr.detectChanges();
        }
      });

      // Optional: listeners for other events (quarterChanged, matchStatusChanged, matchStateUpdated)
      this.socket.on("matchStatusChanged", (data) => {
        const socketMatchId = data?.match_id || data?.matchId;
        if (data && socketMatchId === this.matchId && this.matchData) {
          this.matchData.status = data.status;
          this.syncPenaltyShootoutFromPayload(this.matchData, data);
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
          this.syncQuarterScoresFromPayload(this.matchData, newState);
          this.syncPenaltyShootoutFromPayload(this.matchData, newState);
          this.syncTotalScoreFromPayload(this.matchData, newState);
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
        resolvedTarget.PenaltyCornersEarned++;
      } else if (evType.includes('penalty stroke') && (evType.includes('earned') || evType.includes('won'))) {
        resolvedTarget.PenaltyStrokesEarned++;
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

  private syncQuarterScoresFromPayload(target: MatchData, payload: any): void {
    if (!target) return;
    target.quarterScores = target.quarterScores || { home: [0, 0, 0, 0], away: [0, 0, 0, 0] };

    if (this.isQuarterScoreLocked && this.lockedQuarterScores) {
      target.quarterScores = {
        home: [...this.lockedQuarterScores.home],
        away: [...this.lockedQuarterScores.away]
      };
      return;
    }

    const fromArrays = this.readQuarterArrays(payload);
    if (fromArrays) {
      target.quarterScores = fromArrays;
      return;
    }

    const fromFlatKeys = this.readQuarterFlatKeys(payload);
    if (fromFlatKeys) {
      target.quarterScores = fromFlatKeys;
      return;
    }

    const fromEvents = this.readQuarterScoresFromEvents(target);
    if (fromEvents) {
      target.quarterScores = fromEvents;
      return;
    }

    // Fallback for live socket event payloads (same flow as total score updates)
    if (payload?.event && this.isScoringEvent(payload.event)) {
      const quarterIndex = this.getQuarterIndex(payload.event.quarter);
      const teamType = this.getEventTeamType(payload.event.team, target);
      if (quarterIndex !== null && teamType) {
        target.quarterScores[teamType][quarterIndex] += 1;
      }
    }
  }

  private readQuarterArrays(payload: any): { home: number[]; away: number[] } | null {
    const homeRaw =
      payload?.quarter_scores?.home ||
      payload?.quarterScores?.home ||
      payload?.team1_quarter_scores ||
      payload?.team1QuarterScores;
    const awayRaw =
      payload?.quarter_scores?.away ||
      payload?.quarterScores?.away ||
      payload?.team2_quarter_scores ||
      payload?.team2QuarterScores;

    if (!Array.isArray(homeRaw) || !Array.isArray(awayRaw)) return null;
    return {
      home: [0, 1, 2, 3].map(i => Number(homeRaw[i] ?? 0) || 0),
      away: [0, 1, 2, 3].map(i => Number(awayRaw[i] ?? 0) || 0)
    };
  }

  private readQuarterFlatKeys(payload: any): { home: number[]; away: number[] } | null {
    const home = [
      Number(payload?.team1_q1 ?? payload?.team1Q1 ?? payload?.q1_home ?? payload?.q1Home),
      Number(payload?.team1_q2 ?? payload?.team1Q2 ?? payload?.q2_home ?? payload?.q2Home),
      Number(payload?.team1_q3 ?? payload?.team1Q3 ?? payload?.q3_home ?? payload?.q3Home),
      Number(payload?.team1_q4 ?? payload?.team1Q4 ?? payload?.q4_home ?? payload?.q4Home)
    ];
    const away = [
      Number(payload?.team2_q1 ?? payload?.team2Q1 ?? payload?.q1_away ?? payload?.q1Away),
      Number(payload?.team2_q2 ?? payload?.team2Q2 ?? payload?.q2_away ?? payload?.q2Away),
      Number(payload?.team2_q3 ?? payload?.team2Q3 ?? payload?.q3_away ?? payload?.q3Away),
      Number(payload?.team2_q4 ?? payload?.team2Q4 ?? payload?.q4_away ?? payload?.q4Away)
    ];

    const hasAny = [...home, ...away].some(v => Number.isFinite(v));
    if (!hasAny) return null;

    return {
      home: home.map(v => (Number.isFinite(v) ? v : 0)),
      away: away.map(v => (Number.isFinite(v) ? v : 0))
    };
  }

  private readQuarterScoresFromEvents(data: MatchData): { home: number[]; away: number[] } | null {
    const events = Array.isArray(data?.events) ? data.events : [];
    if (!events.length) return null;

    const home = [0, 0, 0, 0];
    const away = [0, 0, 0, 0];

    for (const ev of events) {
      if (!this.isScoringEvent(ev)) continue;
      const qIdx = this.getQuarterIndex(ev?.quarter);
      const team = this.getEventTeamType(ev?.team, data);
      if (qIdx === null || !team) continue;
      if (team === 'home') home[qIdx] += 1;
      if (team === 'away') away[qIdx] += 1;
    }

    return { home, away };
  }

  private syncPenaltyShootoutFromPayload(target: MatchData, payload: any): void {
    if (!target) return;

    const payloadShootout = payload?.penaltyShootout || payload?.penalty_shootout;
    if (payloadShootout) {
      const homeAttempts = Array.isArray(payloadShootout?.home) ? payloadShootout.home : [];
      const awayAttempts = Array.isArray(payloadShootout?.away) ? payloadShootout.away : [];
      target.penaltyShootout = {
        home: homeAttempts,
        away: awayAttempts,
        homeScore: Number(payloadShootout?.homeScore) || homeAttempts.filter((s: any) => !!s?.scored).length,
        awayScore: Number(payloadShootout?.awayScore) || awayAttempts.filter((s: any) => !!s?.scored).length
      };
      return;
    }

    const status = String(target.status || payload?.status || '').toLowerCase();
    const isPenaltyPhase = status.includes('penalty');
    const events = Array.isArray(target.events) ? target.events : [];
    const psEvents = events.filter((ev: any) =>
      String(ev?.type || '').toLowerCase().includes('penalty shootout')
    );

    if (!psEvents.length && !isPenaltyPhase) return;

    if (!this.isMainScoreLocked) {
      this.lockedMainScore = {
        home: Number(target?.score?.home ?? 0) || 0,
        away: Number(target?.score?.away ?? 0) || 0
      };
      this.isMainScoreLocked = true;
    }

    if (!this.isQuarterScoreLocked) {
      const source = target.quarterScores || { home: [0, 0, 0, 0], away: [0, 0, 0, 0] };
      this.lockedQuarterScores = {
        home: [...source.home],
        away: [...source.away]
      };
      this.isQuarterScoreLocked = true;
    }

    const home: any[] = [];
    const away: any[] = [];

    for (const ev of psEvents) {
      const teamType = this.getEventTeamType(ev?.team, target);
      if (!teamType) continue;
      const typeText = String(ev?.type || '').toLowerCase();
      const scored = typeText.includes('goal') || typeText.includes('scored');
      const shot = {
        player: ev?.player || ev?.player_name || 'Unknown',
        scored
      };
      if (teamType === 'home') home.push(shot);
      else away.push(shot);
    }

    target.penaltyShootout = {
      home,
      away,
      homeScore: home.filter((s: any) => !!s?.scored).length,
      awayScore: away.filter((s: any) => !!s?.scored).length
    };
  }

  private syncTotalScoreFromPayload(target: MatchData, payload: any): void {
    if (!target) return;
    target.score = target.score || { home: 0, away: 0 };

    if (this.isMainScoreLocked && this.lockedMainScore) {
      target.score.home = this.lockedMainScore.home;
      target.score.away = this.lockedMainScore.away;
      return;
    }

    const homeRaw = payload?.team1_score ?? payload?.team1Score ?? payload?.home_score ?? payload?.homeScore;
    const awayRaw = payload?.team2_score ?? payload?.team2Score ?? payload?.away_score ?? payload?.awayScore;
    const homeNum = Number(homeRaw);
    const awayNum = Number(awayRaw);

    if (Number.isFinite(homeNum) && Number.isFinite(awayNum)) {
      target.score.home = homeNum;
      target.score.away = awayNum;
      return;
    }

    const quarterHome = Array.isArray(target.quarterScores?.home) ? target.quarterScores!.home.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
    const quarterAway = Array.isArray(target.quarterScores?.away) ? target.quarterScores!.away.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
    const psHome = Number(target.penaltyShootout?.homeScore ?? 0) || 0;
    const psAway = Number(target.penaltyShootout?.awayScore ?? 0) || 0;

    target.score.home = quarterHome + psHome;
    target.score.away = quarterAway + psAway;
  }

  private getQuarterIndex(quarter: any): number | null {
    const q = String(quarter || '').trim().toLowerCase();
    if (!q) return null;
    if (q === 'q1' || q === '1' || q.includes('1st')) return 0;
    if (q === 'q2' || q === '2' || q.includes('2nd')) return 1;
    if (q === 'q3' || q === '3' || q.includes('3rd')) return 2;
    if (q === 'q4' || q === '4' || q.includes('4th')) return 3;
    return null;
  }

  private isScoringEvent(event: any): boolean {
    const t = String(event?.type || '').trim().toLowerCase();
    if (!t) return false;
    if (t === 'goal' || t === 'field goal' || t === 'fg') return true;
    if (t.includes('penalty corner') && (t.includes('scored') || t.includes('goal') || t.includes('converted'))) return true;
    if (t.includes('penalty stroke') && (t.includes('scored') || t.includes('goal') || t.includes('converted') || t === 'penalty stroke')) return true;
    return false;
  }

  private getEventTeamType(team: any, data: MatchData): 'home' | 'away' | null {
    const e = String(team || '').trim().toLowerCase();
    const home = String(data?.teams?.home?.name || '').trim().toLowerCase();
    const away = String(data?.teams?.away?.name || '').trim().toLowerCase();
    if (!e) return null;
    if (e === 'home' || e === 'team1' || e === 'team 1' || e === home) return 'home';
    if (e === 'away' || e === 'team2' || e === 'team 2' || e === away) return 'away';
    if (home && e.includes(home)) return 'home';
    if (away && e.includes(away)) return 'away';
    return null;
  }

  private isSameEvent(a: any, b: any): boolean {
    const norm = (v: any) => String(v ?? '').trim().toLowerCase();
    return (
      norm(a?.time) === norm(b?.time) &&
      norm(a?.quarter) === norm(b?.quarter) &&
      norm(a?.team) === norm(b?.team) &&
      norm(a?.type) === norm(b?.type) &&
      norm(a?.player) === norm(b?.player)
    );
  }

  private readPenaltyScores(penaltyShootout: any): { home: number; away: number } | null {
    if (!penaltyShootout) return null;

    const homeAttempts = Array.isArray(penaltyShootout?.home) ? penaltyShootout.home : [];
    const awayAttempts = Array.isArray(penaltyShootout?.away) ? penaltyShootout.away : [];
    const home = Number(penaltyShootout?.homeScore ?? penaltyShootout?.home_score);
    const away = Number(penaltyShootout?.awayScore ?? penaltyShootout?.away_score);

    const homeScore = Number.isFinite(home) ? home : homeAttempts.filter((s: any) => !!s?.scored).length;
    const awayScore = Number.isFinite(away) ? away : awayAttempts.filter((s: any) => !!s?.scored).length;

    return { home: homeScore, away: awayScore };
  }

  /**
   * Fetches the initial match data from the backend API.
   */
  private fetchMatchData(matchId: string): void {
    const url = `${this.apiUrl}/${matchId}`;
    console.log(`📡 Fetching match data from: ${url}`);

    this.http.get<any>(url).subscribe({
      next: (data) => {
        console.log('📥 Raw match data received:', data);
        // Map the flattened API response to the structured MatchData interface
        const mappedData: MatchData = {
          matchId: data.match_id,
          date: data.match_date || '',
          venue: data.venue || '',
          tournament: data.tournament_name || 'Default Tournament',
          tournamentId: data.tournament_id || data.tournamentId || data.id || '',
          status: data.status || 'Upcoming',
          score: {
            home: Number(data.team1_score ?? data.team1Score ?? data.home_score ?? data.homeScore ?? 0) || 0,
            away: Number(data.team2_score ?? data.team2Score ?? data.away_score ?? data.awayScore ?? 0) || 0
          },
          events: (data.match_events || []).map((ev: any) => this.normalizeEvent(ev)),
          penaltyShootout: data.penaltyShootout,
          eventsHome: data.eventsHome,
          eventsAway: data.eventsAway,
          teams: {
            home: {
              name: data.team1_name || 'Home Team',
              id: data.team1_id || '',
              logo: data.home_team_logo_url || 'path/to/default/home/logo.svg',
              players: data.home_players || [],
              stats: { ...this.statsTemplate } // initialize safely
            },
            away: {
              name: data.team2_name || 'Away Team',
              id: data.team2_id || '',
              logo: data.away_team_logo_url || 'path/to/default/away/logo.svg',
              players: data.away_players || [],
              stats: { ...this.statsTemplate } // initialize safely
            }
          },
          home_team_name: data.team1_name,
          away_team_name: data.team2_name,
          quarterScores: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] }
        };

        this.matchData = mappedData;
        this.selectedTab = 0;
        this.syncQuarterScoresFromPayload(this.matchData, data);
        this.syncPenaltyShootoutFromPayload(this.matchData, data);
        this.syncTotalScoreFromPayload(this.matchData, data);

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




