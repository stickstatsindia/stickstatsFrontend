import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-penaltyshootout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './penaltyshootout.component.html',
  styleUrls: ['./penaltyshootout.component.css']
})
export class PenaltyShootoutComponent {
  @Input() data: any;
  
  get homeShootoutScore(): number {
    const shots = this.data?.penaltyShootout?.home;
    if (!Array.isArray(shots)) return 0;
    return shots.filter((s: any) => !!s?.scored).length;
  }

  get awayShootoutScore(): number {
    const shots = this.data?.penaltyShootout?.away;
    if (!Array.isArray(shots)) return 0;
    return shots.filter((s: any) => !!s?.scored).length;
  }
}
