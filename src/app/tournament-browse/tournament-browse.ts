import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../service/tournament/tournament';
import { ChangeDetectorRef } from '@angular/core';

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
  imports: [FormsModule, CommonModule],
  templateUrl: './tournament-browse.html',
  styleUrls: ['./tournament-browse.css'],
})
export class TournamentBrowse implements OnInit, OnDestroy {
  tournaments: Tournament[] = [];
  filteredTournaments: Tournament[] = [];
  loading = false;
  searching = false;
  searchQuery: string = '';
  hasSearched = false; // Track if user has performed a search

  constructor(
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Don't load tournaments initially - wait for user search
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  /**
   * Search tournaments by name from backend API
   */
  searchTournaments() {
    const query = this.searchQuery.trim();

    if (!query) {
      // Clear results if search is empty
      this.filteredTournaments = [];
      this.hasSearched = false;
      this.cdr.detectChanges();
      return;
    }

    this.searching = true;
    this.hasSearched = true;

    // Call backend search API with tournament name query
    this.tournamentService.searchTournamentsByName(query).subscribe({
      next: (data: any) => {
        this.filteredTournaments = data as Tournament[];
        this.searching = false;
        console.log(`✅ Found ${this.filteredTournaments.length} tournaments`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Search failed:', err);
        this.filteredTournaments = [];
        this.searching = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Clear search and reset to initial state
   */
  clearSearch() {
    this.searchQuery = '';
    this.filteredTournaments = [];
    this.hasSearched = false;
    this.cdr.detectChanges();
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
