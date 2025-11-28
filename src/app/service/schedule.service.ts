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
  referee_name_one: string;
  referee_name_two: string;
  scorer_name: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private url = environment.baseUrl + '/api/match';
  constructor(private http: HttpClient) {}

  scheduleMatch(body: ScheduleMatchRequest): Observable<any> {
    return this.http.post<any>(this.url, body);
  }
}
