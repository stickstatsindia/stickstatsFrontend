import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rounds-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rounds-details.html',
  styleUrls: ['./rounds-details.css']
})
export class RoundsDetailsComponent {
  rounds = [
    { name: 'Round 1' },
    { name: 'Round 2' },
    { name: 'Round 3' }
  ];
  currentPage = 1;

  deleteRound(round: any) {
    this.rounds = this.rounds.filter(r => r !== round);
  }
  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage() {
    this.currentPage++;
  }
}
