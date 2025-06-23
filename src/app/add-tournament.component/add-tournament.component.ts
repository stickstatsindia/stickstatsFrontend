import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-tournament',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-tournament.component.html',
  styleUrls: ['./add-tournament.component.css']
})
export class AddTournamentComponent {
  tournamentCategory: string[] = ['OPEN', 'CORPORATE', 'COMMUNITY', 'SCHOOL', 'OTHER', 'SERIES', 'COLLEGE', 'UNIVERSITY'];
  selectedCategories: string[] = [];

  groundTypes: string[] = ['ASTROTURF', 'GRASS'];
  selectedGroundType: string = '';

  matchTypes: string[] = ['7-A SIDE', '11-A SIDE', '5-A SIDE'];
  selectedMatchType: string = '';

  lastBatterRule = false;
  needMoreTeams = false;
  needOfficials = false;

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  registerTournament() {
    const data = {
      categories: this.selectedCategories,
      groundType: this.selectedGroundType,
      matchType: this.selectedMatchType,
      lastBatterRule: this.lastBatterRule,
      needMoreTeams: this.needMoreTeams,
      needOfficials: this.needOfficials
    };
    console.log('Tournament Registered:', data);
    alert('Tournament submitted!');
  }
}
