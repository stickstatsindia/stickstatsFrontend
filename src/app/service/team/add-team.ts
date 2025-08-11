import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddTeam {

    constructor(private http: HttpClient) { }
  
    addTeam() {
      this.http.get('https://api.example.com/teams')
        .subscribe(response => {
          console.log('Teams fetched successfully:', response);
        }, error => {
          console.error('Error fetching teams:', error);
        });
    }
  }

