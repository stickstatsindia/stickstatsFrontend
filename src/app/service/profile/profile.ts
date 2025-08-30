import { Injectable } from '@angular/core';
import { environment } from '../../config/api.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Profile {

  addUserUrl = environment.baseUrl + environment.endpoints.addUser;
  // getUserUrl = environment.baseUrl + environment.endpoints.getUsers;
  constructor(private http: HttpClient) {
    // console.log('Add Tournament URL:', this.addTournamentUrl);
    // console.log('Get Tournaments URL:', this.getTournamentUrl);
  }

  addUser(data: any) {
    return this.http.post(this.addUserUrl, data);
  }
}
