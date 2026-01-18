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
    getTeamsUrl: string = environment.baseUrl + environment.endpoints.getTeamsByTournamentId;
    addTeam(teamData: any): Observable<any> {
      // Replace :tournament_id in the URL with the actual tournamentId from teamData
      const url = environment.baseUrl + environment.endpoints.addTeam.replace(':tournament_id', teamData.tournamentId);
      return this.http.post(url, teamData);
    }
    getTeamsByTournamentId(tournamentId: string): Observable<any> {
      const url = environment.baseUrl + environment.endpoints.getTeamsByTournamentId.replace(':tournament_id', tournamentId);
      return this.http.get(url);
    }
    // Get a single team by id
    getTeamById(teamId: string): Observable<any> {
      const url = `${environment.baseUrl}/api/team/${teamId}`;
      return this.http.get(url);
    }

    updateTeam(teamId: string, teamData: any): Observable<any> {
      const url = environment.baseUrl + environment.endpoints.updateTeam.replace(':team_id', teamId);
      return this.http.put(url, teamData);
    }

    deleteTeam(teamId: string): Observable<any> {
      const url = environment.baseUrl + environment.endpoints.deleteTeam.replace(':team_id', teamId);
      return this.http.delete(url);
    }

  }