import { Injectable } from '@angular/core';
import { environment } from '../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  constructor(private http:HttpClient) { }
    addMemberUrl: string = environment.baseUrl + environment.endpoints.addplayer;
    getMembersUrl: string = environment.baseUrl + environment.endpoints.getPlayersByTeamId;
    getAllMatchesUrl: string = environment.baseUrl + environment.endpoints.getALlMatches;
    addMember(memberData: any): Observable<any> {
      // Replace :team_id in the URL with the actual teamId from memberData
      const url = this.addMemberUrl.replace(':team_id', memberData.teamId);
      return this.http.post(url, memberData);
    }

    getMembers(teamId: string): Observable<any> {
      // Replace :team_id in the URL with the actual teamId
      const url = this.getMembersUrl.replace(':team_id', teamId);
      return this.http.get(url);
    }

    getAllMatches():Observable<any>{
      return this.http.get(this.getAllMatchesUrl);
    }
    
}
