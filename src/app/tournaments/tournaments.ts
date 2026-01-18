import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../service/tournament/tournament';
import { filter, Subscription } from 'rxjs';
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
  __v: number;
}

@Component({
  selector: 'app-tournaments',
  imports: [FormsModule, CommonModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css'],
})
export class Tournaments implements OnInit, OnDestroy {
  tournaments: Tournament[] = [];
  settingsOpenIndex: number | null = null;
  private routerSub!: Subscription;

  constructor(
    private tournamentService: TournamentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // load initially
    this.loadTournaments();

    // reload whenever we navigate back to /tournaments
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects.includes('/tournaments')) {
          this.loadTournaments();
          this.cdr.detectChanges(); 
        }
      });
  }
  

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  loadTournaments() {
    this.tournamentService.getTournaments().subscribe({
      next: (data: any) => {
        this.tournaments = data as Tournament[];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load tournaments:', err);
      },
    });
  }

  addTournament() {
    this.router.navigate(['/add-tournament']);
  }

 editTournament(index: string) {
  this.router.navigate(
    ['/edit-tournament', index],
    { state: { isEdit: true, tournamentId: index } }
  );
}

  deleteTournament(tournamentId: string) {
    if (confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      this.tournamentService.deleteTournament(tournamentId)
        .subscribe({
          next: () => {
            alert('Tournament deleted successfully');
            this.loadTournaments(); // Reload the list
          },
          error: (err: any) => {
            alert('Failed to delete tournament: ' + (err.error?.error || 'Unknown error'));
          }
        });
    }
  }

  openSettings(index: number) {
    this.settingsOpenIndex = this.settingsOpenIndex === index ? null : index;
  }

  goToTeams(tournamentId: string) {
    this.settingsOpenIndex = null;
    this.router.navigate(['/show-teams'], { state: { tournamentId } });
  }

  goToGroups(tournamentId: string) {
    this.settingsOpenIndex = null;
    this.router.navigate(['/group-list'], { state: { tournamentId } });
  }

  goToMatches(tournamentId: string) {
    this.settingsOpenIndex = null;
    this.router.navigate(['/matches'], { state: { tournamentId } });
  }

  goToTeamManagement(tournamentId: string, event: Event) {
    event.preventDefault();
    console.log('Tournament ID:', tournamentId);
    if (!tournamentId) {
      return;
    }
    this.router.navigate(['/tournament-details', tournamentId]);
  }
}
