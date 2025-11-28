import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/api.config';

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private getTeamsUrl = environment.baseUrl + environment.endpoints.getTeams;

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.getTeamsUrl);
  }
}
