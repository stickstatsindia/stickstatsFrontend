import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-matches',
  imports: [],
  templateUrl: './player-matches.html',
  styleUrl: './player-matches.css'
})
export class PlayerMatches {
@Input() userId!: string;
}
