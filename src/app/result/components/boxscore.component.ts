import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-boxscore',
  standalone: true,
  templateUrl: './boxscore.component.html',
  styleUrls: []
})
export class BoxScoreComponent {
  @Input() data: any;
  @Input() stats: any[] = [];
}
