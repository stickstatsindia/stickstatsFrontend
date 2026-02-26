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
    this.router.navigate(['/tournaments'], { queryParams: { mine: '1' } });
  }

  addNewTournament() {
    this.router.navigate(['/add-tournament']); 
  }

  

}
