import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddTeam {

    constructor(private http: HttpClient) { }
  addTeamUrl: string = environment.baseUrl + environment.endpoints.addTeam;
    addTeam(teamData: any): Observable<any> {
      // Replace :tournament_id in the URL with the actual tournamentId from teamData
      const url = environment.baseUrl + environment.endpoints.addTeam.replace(':tournament_id', teamData.tournamentId);
      return this.http.post(url, teamData);
    }
  }

