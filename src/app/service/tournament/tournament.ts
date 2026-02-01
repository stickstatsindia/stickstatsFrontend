import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  addTournamentUrl = environment.baseUrl + environment.endpoints.addTournament;
  getTournamentUrl = environment.baseUrl + environment.endpoints.getTournaments;
  getUserByPhoneUrl = environment.baseUrl + environment.endpoints.getUserByPhone;
  getUserByIdUrl = environment.baseUrl + environment.endpoints.getUserById;
  getTournamentByIdUrl = environment.baseUrl + environment.endpoints.getTournamentById;
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

  getTournaments() {
    return this.http.get(this.getTournamentUrl);
  }

  getUserByPhone(phone: string) {
    const url = this.getUserByPhoneUrl.replace(':phone', phone);
    return this.http.get(url);
  }

  getUserById(userId: string):Observable<any> {
    const url = this.getUserByIdUrl.replace(':user_id', userId);
    return this.http.get(url);
  }

getTournamentById(tournamentId: string) {
    const url = this.getTournamentByIdUrl.replace(':tournament_id', tournamentId);
    return this.http.get(url);
  }

 editTournament(tournamentId: string, data: any) {
    const url = environment.baseUrl + environment.endpoints.editTournament.replace(':tournament_id', tournamentId);
    return this.http.put(url, data);
  }

  deleteTournament(tournamentId: string) {
    const url = environment.baseUrl + environment.endpoints.editTournament.replace(':tournament_id', tournamentId);
    return this.http.delete(url);
  }
}
