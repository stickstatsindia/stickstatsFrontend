import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/api.config';
import { Observable } from 'rxjs';

export interface ScheduleMatchRequest {
  tournament_name: string;
  home_team_name: string;
  away_team_name: string;
  rounds: string;
  match_type: string;
  city: string;
  venue: string;
  match_date: string;
  scorer_name: string;
}

export interface AddMatchLiveRequest {
  team1_name: string;
  team2_name: string;
  venue: string;
  match_date: string; // YYYY-MM-DD
  match_time: string; // HH:mm
  team1_players: string[];
  team2_players: string[];
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private url = environment.baseUrl + '/api/match';
  constructor(private http: HttpClient) {}

  // NOTE: legacy `scheduleMatch` removed in favor of tournament-scoped `addMatchLive` which writes to match-live collection
  // Use: addMatchLive(tournamentName, body)
  addMatchLive(tournamentname: string, body: AddMatchLiveRequest): Observable<any> {
    // POST to /api/:tournamentname/addMatchLive endpoint with server-side validation
    const endpoint = `${environment.baseUrl}/api/${tournamentname}/addMatchLive`;
    return this.http.post<any>(endpoint, body);
  }

  // GET match-lives for a specific tournament by tournament name
  getMatchLivesByTournamentName(tournamentname: string): Observable<any[]> {
    const endpoint = `${environment.baseUrl}/api/${tournamentname}/matchlives`;
    return this.http.get<any[]>(endpoint);
  }

  // Get matches for a specific tournament
  getMatchesByTournament(tournamentId: string): Observable<any[]> {
    const endpoint = `${environment.baseUrl}/api/tournamentId/${tournamentId}/matches`;
    return this.http.get<any[]>(endpoint);
  }

  // Fallback endpoint used by tournament details matches tab
  getMatchesByTournamentLegacy(tournamentId: string): Observable<any[]> {
    const endpoint = `${environment.baseUrl}/api/tournament/${tournamentId}/matches1`;
    return this.http.get<any[]>(endpoint);
  }
}
