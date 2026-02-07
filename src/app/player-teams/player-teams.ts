import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-player-teams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-teams.html',
  styleUrls: ['./player-teams.css']
})
export class PlayerTeams {

  private _userId!: string;

  @Input()
  set userId(value: string) {
    if (!value) return;

    // prevent refetch if same id
    if (this._userId === value) return;

    this._userId = value;
    this.fetchTeams();
  }

  teams: {
    teamName: string;
    matches: number;
    wins: number;
    losses: number;
    draws: number;
  }[] = [];

  loading = true;

  constructor(private http: HttpClient) {}

  private fetchTeams(): void {
    this.loading = true;
    this.teams = [];

    this.http
      .get<any[]>(`http://localhost:3000/api/player/${this._userId}/teams`)
      .subscribe({
        next: (data) => {
          this.teams = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load player teams', err);
          this.loading = false;
        }
      });
  }

  trackByTeam(_: number, team: any) {
    return team.teamName;
  }
}
