import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgModel} from '@angular/forms';
// import { NgModelProvideForms } from '@angular/forms';


interface Team {
  id: string;
  name: string;
  shortName: string;
}

@Component({
  selector: 'app-schedule-match-team-selection',
   standalone: true, // ✅ very important
  // imports: [  NgModel], // ✅ include CommonModule here/
  imports: [FormsModule], // ✅ correct here
  templateUrl: './schedule-match-team-selection.html',
  styleUrl: './schedule-match-team-selection.css'
})
export class ScheduleMatchTeamSelection {

   teams: Team[] = [];
  selectedTeamA!: Team;
  selectedTeamB!: Team;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchTeams();
  }

  fetchTeams(): void {
    this.http.get<Team[]>('/api/teams').subscribe({
      next: (data) => this.teams = data,
      error: (err) => console.error('Failed to load teams:', err)
    });
  }

  goToPreviousStep(): void {
    this.router.navigate(['/select-round']);
  }

  goToNextStep(): void {
    if (this.selectedTeamA && this.selectedTeamB && this.selectedTeamA.id !== this.selectedTeamB.id) {
      // Pass selected teams via service or route state
      this.router.navigate(['/match-details'], {
        state: {
          teamA: this.selectedTeamA,
          teamB: this.selectedTeamB
        }
      });
    } else {
      alert('Please select two different teams.');
    }
  }

}
