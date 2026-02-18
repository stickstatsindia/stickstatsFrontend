import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/api.config';

export interface Tournament {
  tournament_id: string;
  tournament_name: string;
  start_date?: string;
  end_date?: string;
}

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private url = environment.baseUrl + environment.endpoints.getTournaments;
  constructor(private http: HttpClient) {}

  getTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.url);
  }
}
