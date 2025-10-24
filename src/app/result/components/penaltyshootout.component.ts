import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-penaltyshootout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './penaltyshootout.component.html',
  styleUrls: ['./penaltyshootout.component.css']
})
export class PenaltyShootoutComponent implements OnChanges {
  @Input() data: any;
  homeShootoutScore = 0;
  awayShootoutScore = 0;

  ngOnChanges() {
    if (this.data && this.data.penaltyShootout) {
      this.homeShootoutScore = this.data.penaltyShootout.home.filter((s: any) => s.scored).length;
      this.awayShootoutScore = this.data.penaltyShootout.away.filter((s: any) => s.scored).length;
    }
  }
}
