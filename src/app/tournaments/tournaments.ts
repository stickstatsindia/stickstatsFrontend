import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TournamentService } from '../service/tournament/tournament';

interface Tournament {
  name: string;
  fromDate: string;
  toDate: string;
}

@Component({
  selector: 'app-tournaments',
  imports: [FormsModule,CommonModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css']
})
export class Tournaments implements OnInit {
  tournaments: Tournament[] = [];

  constructor(private tournamentService: TournamentService) {
  }
  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.tournamentService.getTournaments().subscribe((data: any) => {
      this.tournaments = data as Tournament[];
    });
  }


  addTournament() {
    alert('Add tournament clicked!');
  }

  editTournament(index: number) {
    alert(`Edit tournament: ${this.tournaments[index].name}`);
  }

  deleteTournament(index: number) {
    if (confirm('Are you sure you want to delete this tournament?')) {
      this.tournaments.splice(index, 1);
    }
  }

  openSettings(index: number) {
    alert(`Settings for: ${this.tournaments[index].name}
Options: Teams, Rounds, Groups, Matches`);
  }
}
