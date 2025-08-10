import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Match {
  team1: string;
  team2: string;
  ground: string;
  city: string;
  matchTime: string; // formatted string from API
}

@Component({
  selector: 'app-matches',
  imports: [CommonModule,FormsModule],
  templateUrl: './matches.html',
  styleUrls: ['./matches.css']
})
export class Matches implements OnInit {
  matches: Match[] = [];

  ngOnInit() {
    // Replace with actual API call
    // Example:
    // this.http.get<Match[]>('/api/matches').subscribe(data => {
    //   this.matches = data;
    // });
  }

  scheduleMatch() {
    alert('Schedule match clicked!');
  }

  editMatch(index: number) {
    alert(`Edit match between: ${this.matches[index].team1} vs ${this.matches[index].team2}`);
  }

  deleteMatch(index: number) {
    if (confirm('Are you sure you want to delete this match?')) {
      this.matches.splice(index, 1);
    }
  }

  openSettings(index: number) {
    alert(`Settings for match: ${this.matches[index].team1} vs ${this.matches[index].team2}`);
  }
}
