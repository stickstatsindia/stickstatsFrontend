import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tournament-dashboard.component',
  imports: [],
  templateUrl: './tournament-dashboard.component.html',
  styleUrl: './tournament-dashboard.component.css'
})
export class TournamentDashboardComponent {

  

  constructor(private router: Router) {}

  goToMyTournaments() {
    this.router.navigate(['/my-tournaments']); // Define this route pending
  }

  addNewTournament() {
    this.router.navigate(['/add-tournament']); 
  }

  

}
