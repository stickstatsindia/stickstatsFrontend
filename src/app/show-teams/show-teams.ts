import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Team {
  name: string;
  members: number;
}

@Component({
  selector: 'app-show-teams',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './show-teams.html',
  styleUrls: ['./show-teams.css']
})
export class ShowTeamsComponent {
  teams: Team[] = [];
  rowsPerPageOptions = [5, 10, 25];
  rowsPerPage = 10;
  currentPage = 1;
  tournamentId: string | null = null;

  constructor(private router: Router) {
    // Get tournamentId from navigation state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string };
    this.tournamentId = state?.tournamentId || null;
  }

  ngOnInit() {
    this.fetchTeams();
  }

  fetchTeams() {
    // Simulate backend fetch
    this.teams = [
      { name: 'Team1', members: 5 },
      { name: 'Team2', members: 1 },
      // Add more teams as needed
    ];
  }

  get startRow() {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endRow() {
    return Math.min(this.startRow + this.rowsPerPage, this.teams.length);
  }

  get pagedTeams() {
    return this.teams.slice(this.startRow, this.endRow);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.endRow < this.teams.length) {
      this.currentPage++;
    }
  }

  onAddTeam() {
    this.router.navigate(['/addnew-team'], { state: { tournamentId: this.tournamentId } });
  }

  onEditTeam(team: Team) {
    // Edit team logic
    alert('Edit ' + team.name);
  }

  onDeleteTeam(team: Team) {
    // Delete team logic
    if (confirm('Delete ' + team.name + '?')) {
      this.teams = this.teams.filter(t => t !== team);
    }
  }

  onViewMembers(team: Team) {
    // View members logic
    alert('View members of ' + team.name);
  }
}


