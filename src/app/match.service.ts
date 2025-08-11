import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAllMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/matches`);
  }

  getMatch(matchId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/matches/${matchId}`);
  }

  updateScore(matchId: string, teamName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/matches/${matchId}/score`, { teamName });
  }
}