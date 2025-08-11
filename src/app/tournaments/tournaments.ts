import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  ngOnInit() {
    // Replace with actual API call
    // Example:
    // this.http.get<Tournament[]>('/api/tournaments').subscribe(data => {
    //   this.tournaments = data;
    // });
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
