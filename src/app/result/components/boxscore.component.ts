import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boxscore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boxscore.component.html',
  styleUrls: []
})
export class BoxScoreComponent {
  @Input() data: any;
  @Input() stats: any[] = [];
}