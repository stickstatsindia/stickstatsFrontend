import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/api.config';

@Component({
  selector: 'app-player-matches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-matches.html',
  styleUrls: ['./player-matches.css']
})
export class PlayerMatches implements OnInit {

  @Input() userId!: string;
  matches: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http
      .get<any[]>(`${environment.baseUrl}/api/player/${this.userId}/matches`)
      .subscribe({
        next: data => {
          this.matches = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: err => {
          console.error(err);
          this.loading = false;
        }
      });
      this.cdr.markForCheck();
  }

  getResult(match: any): string {
    const team1 = Number(match?.team1_score ?? match?.home_score ?? 0) || 0;
    const team2 = Number(match?.team2_score ?? match?.away_score ?? 0) || 0;
    const ps = this.readPenaltyScores(match);

    if (ps) {
      const team1Final = team1 + ps.team1;
      const team2Final = team2 + ps.team2;
      if (team1Final > team2Final) return 'WIN';
      if (team1Final < team2Final) return 'LOSS';
      return 'DRAW';
    }

    if (team1 > team2) return 'WIN';
    if (team1 < team2) return 'LOSS';

    return 'DRAW';
  }

  getResultClass(match: any): string {
    const r = this.getResult(match);
    return r === 'WIN' ? 'win' : r === 'LOSS' ? 'loss' : 'draw';
  }

  private readPenaltyScores(match: any): { team1: number; team2: number } | null {
    const ps = match?.penaltyShootout || match?.penalty_shootout;
    if (ps) {
      const home = Number(ps?.homeScore ?? ps?.home_score ?? ps?.team1_score);
      const away = Number(ps?.awayScore ?? ps?.away_score ?? ps?.team2_score);
      const homeAttempts = Array.isArray(ps?.home) ? ps.home : [];
      const awayAttempts = Array.isArray(ps?.away) ? ps.away : [];
      const team1 = Number.isFinite(home) ? home : homeAttempts.filter((s: any) => !!s?.scored).length;
      const team2 = Number.isFinite(away) ? away : awayAttempts.filter((s: any) => !!s?.scored).length;
      return { team1, team2 };
    }

    const team1Flat = Number(match?.team1_ps_score ?? match?.home_ps_score ?? match?.ps_home);
    const team2Flat = Number(match?.team2_ps_score ?? match?.away_ps_score ?? match?.ps_away);
    if (Number.isFinite(team1Flat) && Number.isFinite(team2Flat)) {
      return { team1: team1Flat, team2: team2Flat };
    }

    return null;
  }
}
