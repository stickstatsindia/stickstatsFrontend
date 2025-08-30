import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  __v: number;
}

@Component({
  selector: 'app-tournaments',
  imports: [FormsModule,CommonModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css']
})
export class Tournaments implements OnInit {
  tournaments: Tournament[] = [];
  settingsOpenIndex: number | null = null;

  constructor(private tournamentService: TournamentService, private router: Router) {
  }
  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.tournamentService.getTournaments().subscribe((data: any) => {
      this.tournaments = data as Tournament[];
      console.log('Tournaments loaded:', this.tournaments);
    });
  }

  addTournament() {
    alert('Add tournament clicked!');
  }

  editTournament(index: number) {
    alert(`Edit tournament: ${this.tournaments[index].tournament_name}`);
  }

  deleteTournament(index: number) {
    if (confirm('Are you sure you want to delete this tournament?')) {
      this.tournaments.splice(index, 1);
    }
  }

  openSettings(index: number) {
    this.settingsOpenIndex = this.settingsOpenIndex === index ? null : index;
    console.log('Settings opened for index:', index);
  }

  goToTeams(tournamentId: string) {
    this.settingsOpenIndex = null;
    this.router.navigate(['/show-teams'], { state: { tournamentId } });
  }

  goToGroups() {
    this.settingsOpenIndex = null;
    // Implement navigation to groups if needed
    alert('Groups clicked!');
  }
}
