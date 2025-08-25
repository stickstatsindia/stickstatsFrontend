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
    addMember(memberData: any): Observable<any> {
      // Replace :team_id in the URL with the actual teamId from memberData
      const url = environment.baseUrl + environment.endpoints.addplayer.replace(':team_id', memberData.teamId);
      return this.http.post(url, memberData);
    }
    
}
