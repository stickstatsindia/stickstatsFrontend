import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-points-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './points-table.html',
  styleUrls: ['./points-table.css']
})
export class PointsTable {
  byOptions = ['Points', 'Wins', 'Goals'];
  selectedBy = this.byOptions[0];
  stageOptions = ['Group', 'Quarterfinal', 'Semifinal', 'Final'];
  selectedStage = this.stageOptions[0];
}
