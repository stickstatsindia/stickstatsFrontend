import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-playet-teams',
  imports: [],
  templateUrl: './playet-teams.html',
  styleUrl: './playet-teams.css'
})
export class PlayetTeams {
@Input() userId!: string;
}
