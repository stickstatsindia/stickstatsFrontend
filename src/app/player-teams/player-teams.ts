import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-teams',
  imports: [],
  templateUrl: './player-teams.html',
  styleUrl: './player-teams.css'
})
export class PlayerTeams {
@Input() userId!: string;
}
