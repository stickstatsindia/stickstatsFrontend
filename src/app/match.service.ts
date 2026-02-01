import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { io, Socket } from 'socket.io-client';

// Frontend-friendly interface (camelCase)
export interface Match {
  matchId: string;
  team1Name: string;
  team2Name: string;
  venue: string;
  matchDate: string;
  matchTime: string;
  status: 'Live' | 'Upcoming' | 'Finished';
  team1Score: number;
  team2Score: number;
  quarters: string[];
  currentQuarter: string;
  team1Players: string[];
  team2Players: string[];
  totalSeconds: number;   // countdown in seconds
  isPaused: boolean;
  matchEvents: {
    time: string;
    team: string;
    player: string;
    type: string;
    quarter: string;
  }[];
  updatedAt: string; // ISO string from backend
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private readonly baseUrl = 'http://localhost:3000/api';
  private socket!: Socket;   // ✅ socket.io client

  constructor(private http: HttpClient) {
    // connect once when service is created
    this.socket = io('http://localhost:3000');

    // listen for updates from backend
    this.socket.on('matchUpdated', (data: any) => {
      console.log('📡 Received live update:', data);
      const match = this.toCamelCase(data);
    });
  }

  // ✅ live updates combined
  onMatchUpdates(): Observable<Partial<Match>> {
    return new Observable(observer => {
      this.socket.on('scoreUpdated', (d: any) => {
        observer.next({
          matchId: d.match_id,
          team1Score: d.team1_score,
          team2Score: d.team2_score,
          status: 'Live'
        });
      });

      this.socket.on('timerUpdated', (d: any) => {
        observer.next({
          matchId: d.match_id,
          totalSeconds: d.total_seconds,
          isPaused: d.is_paused,
          status: 'Live'
        });
      });

      this.socket.on('eventAdded', (d: any) => {
        observer.next({
          matchId: d.match_id,
          // server sends a small array with the new event(s)
          matchEvents: d.match_events,
          status: 'Live'
        });
      });

      ['scoreUpdated', 'timerUpdated', 'eventAdded'].forEach(event => {
        this.socket.on(event, (data: any) => {
          console.log("📥 Dashboard received:", event, data);  // <--- debug log
          observer.next(this.toCamelCase({ ...data, status: 'Live' }));
        });
      });

    });
  }

  // Convert backend -> frontend (snake_case → camelCase)
  private toCamelCase(match: any): Match {
    return {
      matchId: match.match_id,
      team1Name: match.team1_name,
      team2Name: match.team2_name,
      venue: match.venue,
      matchDate: match.match_date,
      matchTime: match.match_time,
      status: match.status,
      team1Score: match.team1_score,
      team2Score: match.team2_score,
      quarters: match.quarters,
      currentQuarter: match.current_quarter,
      team1Players: match.team1_players,
      team2Players: match.team2_players,
      totalSeconds: match.total_seconds,
      isPaused: match.is_paused,
      matchEvents: match.match_events,
      updatedAt: match.updated_at
    };
  }

  // Convert frontend -> backend (camelCase → snake_case)
  private toSnakeCase(match: Partial<Match>): any {
    return {
      match_id: match.matchId,
      team1_name: match.team1Name,
      team2_name: match.team2Name,
      venue: match.venue,
      match_date: match.matchDate,
      match_time: match.matchTime,
      status: match.status,
      team1_score: match.team1Score,
      team2_score: match.team2Score,
      quarters: match.quarters,
      current_quarter: match.currentQuarter,
      team1_players: match.team1Players,
      team2_players: match.team2Players,
      total_seconds: match.totalSeconds,
      is_paused: match.isPaused,
      match_events: match.matchEvents,
      updated_at: match.updatedAt
    };
  }

  // Get all matches
  getAllMatches(): Observable<Match[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/matches`)
      .pipe(map(matches => matches.map(m => this.toCamelCase(m))));
  }

  // Get single match
  getMatch(matchId: string): Observable<Match> {
    return this.http
      .get<any>(`${this.baseUrl}/matchlive/${matchId}`)
      .pipe(map(m => this.toCamelCase(m)));
  }

  // Update score (backend should know how to increment)
  updateScore(matchId: string, team: 'team1' | 'team2'): Observable<Match> {
    const body = { team }; // just send which team scored
    return this.http
      .put<any>(`${this.baseUrl}/matches/${matchId}/score`, body)
      .pipe(map(m => this.toCamelCase(m)));
  }

  // Create a new match
  createMatch(match: Match): Observable<Match> {
    return this.http
      .post<any>(`${this.baseUrl}/matches`, this.toSnakeCase(match))
      .pipe(map(m => this.toCamelCase(m)));
  }

  // Update a whole match
  updateMatch(matchId: string, match: Match): Observable<Match> {
    return this.http
      .put<any>(`${this.baseUrl}/matches/${matchId}`, this.toSnakeCase(match))
      .pipe(map(m => this.toCamelCase(m)));
  }

  // Delete a match
  deleteMatch(matchId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/matches/${matchId}`);
  }

  // ✅ NEW: Update match status
  updateMatchStatus(matchId: string, status: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/matches/${matchId}/status`, { status });
  }
}
