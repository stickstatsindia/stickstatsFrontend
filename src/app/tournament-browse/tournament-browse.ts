import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TournamentService } from '../service/tournament/tournament';

interface Tournament {
  _id: string;
  tournament_id: string;
  tournament_name: string;
  start_date: string;
  end_date: string;
  location: string;
  organizer_id: string;
  format: string;
  tournament_category: string;
  match_type: string;
  ground_type: string;
  __v: number;
}

@Component({
  selector: 'app-tournament-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tournament-browse.html',
  styleUrls: ['./tournament-browse.css'],
})
export class TournamentBrowse implements OnInit {

  allTournaments: Tournament[] = [];
  filteredTournaments: Tournament[] = [];

  searchQuery: string = '';
  searching = false;
  hasSearched = false;

  constructor(
    private tournamentService: TournamentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ✅ Load all tournaments on page load
  ngOnInit(): void {
    this.loadTournaments();
  }

  // ✅ Fetch all tournaments
  loadTournaments(): void {
    this.searching = true;

    this.tournamentService.getTournaments().subscribe({
      next: (data: any) => {
        this.allTournaments = Array.isArray(data) ? (data as Tournament[]) : [];
        this.filteredTournaments = [...this.allTournaments];
        this.searching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load tournaments:', err);
        this.allTournaments = [];
        this.filteredTournaments = [];
        this.searching = false;
      },
    });
  }

  // ✅ Search tournaments (frontend filtering)
  searchTournaments(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredTournaments = [...this.allTournaments];
      this.hasSearched = false;
      this.cdr.detectChanges();
      return;
    }

    this.hasSearched = true;

    this.filteredTournaments = this.allTournaments.filter((tournament) =>
      tournament.tournament_name.toLowerCase().includes(query)
    );
  }

  // ✅ Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.hasSearched = false;
    this.filteredTournaments = [...this.allTournaments];
  }

  // ✅ Navigate to details page
  viewTournamentDetails(tournament: Tournament): void {
    this.router.navigate(['/tournament-details', tournament.tournament_id], {
      state: { tournamentId: tournament.tournament_id }
    });
  }

  // ✅ Format date
  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}