import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class Tournament {
  addTournamentUrl = environment.baseUrl + environment.endpoints.addTournament;
  getTournamentUrl = environment.baseUrl + environment.endpoints.getTournaments;
  constructor(private http: HttpClient) {
    console.log('Add Tournament URL:', this.addTournamentUrl);
    console.log('Get Tournaments URL:', this.getTournamentUrl);
  }

  addTournament(data: any) {
    console.log('Sending data to add tournament:', data);
    // Ensure the data is in the correct format
    console.log(this.addTournamentUrl);
    return this.http.post(this.addTournamentUrl, data);
  }

  // getTournaments() {
  //   return this.http.get(this.getTournamentUrl);
  // }
}
