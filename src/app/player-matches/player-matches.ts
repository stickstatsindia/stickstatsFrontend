import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
      .get<any[]>(`http://localhost:3000/api/player/${this.userId}/matches`)
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
    if (match.team1_score > match.team2_score) return 'WIN';
    if (match.team1_score < match.team2_score) return 'LOSS';
    return 'DRAW';
  }

  getResultClass(match: any): string {
    const r = this.getResult(match);
    return r === 'WIN' ? 'win' : r === 'LOSS' ? 'loss' : 'draw';
  }
}
