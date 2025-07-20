import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewComponent } from './components/preview.component';
import { BoxScoreComponent } from './components/boxscore.component';
import { TimelineComponent } from './components/timeline.component';
import { AnalysisComponent } from './components/analysis.component';
import { LeadersComponent } from './components/leaders.component';
import { PenaltyShootoutComponent } from './components/penaltyshootout.component';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, PreviewComponent, BoxScoreComponent, TimelineComponent, AnalysisComponent, LeadersComponent, PenaltyShootoutComponent],
  templateUrl: './result.html',
  styleUrls: ['./result.css']
})
export class Result {
  matchData: any;
  tabs = ['Preview', 'Box Score', 'Timeline', 'Analysis', 'Leaders'];
  selectedTab = 0;
  boxScoreStats = [
    { label: 'GS', key: 'GS' },
    { label: 'Goals Scored', key: 'GoalsScored' },
    { label: 'FGS', key: 'FGS' },
    { label: 'Field Goals Scored', key: 'FieldGoalsScored' },
    { label: 'PCS', key: 'PCS' },
    { label: 'Penalty Corners Scored', key: 'PenaltyCornersScored' },
    { label: 'PSS', key: 'PSS' },
    { label: 'Penalty Strokes Scored', key: 'PenaltyStrokesScored' },
    { label: 'PSM', key: 'PSM' },
    { label: 'Penalty Strokes Missed', key: 'PenaltyStrokesMissed' },
    { label: 'GRC', key: 'GRC' },
    { label: 'Green Cards', key: 'GreenCards' },
    { label: 'YLC', key: 'YLC' },
    { label: 'Yellow Cards', key: 'YellowCards' },
    { label: 'RDC', key: 'RDC' },
    { label: 'Red Cards', key: 'RedCards' }
  ];

  ngOnInit(): void {
    this.matchData = {
      matchId: '03dc760e-55e4-11f0-a2ea-29cee7c0ffc0',
      date: '2025-07-17',
      venue: 'Bangkok Stadium',
      tournament: "Women's U18 Asia Cup 2025",
      teams: {
        home: {
          name: 'Japan',
          logo: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg',
          players: [
            { name: 'Yuki Tanaka', age: 17 },
            { name: 'Mio Suzuki', age: 18 }
          ],
          stats: {
            GS: 2, GoalsScored: 2, FGS: 1, FieldGoalsScored: 1, PCS: 1, PenaltyCornersScored: 1,
            PSS: 0, PenaltyStrokesScored: 0, PSM: 0, PenaltyStrokesMissed: 0, GRC: 1, GreenCards: 1,
            YLC: 0, YellowCards: 0, RDC: 0, RedCards: 0
          }
        },
        away: {
          name: 'China',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_China.svg',
          players: [
            { name: 'Li Wei', age: 17 },
            { name: 'Wang Fang', age: 18 }
          ],
          stats: {
            GS: 1, GoalsScored: 1, FGS: 1, FieldGoalsScored: 1, PCS: 0, PenaltyCornersScored: 0,
            PSS: 0, PenaltyStrokesScored: 0, PSM: 0, PenaltyStrokesMissed: 0, GRC: 0, GreenCards: 0,
            YLC: 1, YellowCards: 1, RDC: 0, RedCards: 0
          }
        }
      },
      score: { home: 2, away: 1 },
      status: 'FT',
      events: [
        { minute: 12, team: 'Japan', type: 'Goal', player: 'Yuki Tanaka' },
        { minute: 34, team: 'China', type: 'Goal', player: 'Li Wei' },
        { minute: 56, team: 'Japan', type: 'Goal', player: 'Mio Suzuki' }
      ],
      penaltyShootout: {
        home: [
          { player: 'SHAHEER Muhammad', scored: true },
          { player: 'LATIF Zubair', scored: true },
          { player: 'AWAN Abdullah', scored: true },
          { player: 'HANZALA Ali', scored: false },
          { player: 'HAMZA Ali', scored: true }
        ],
        away: [
          { player: 'A Aferullsyah', scored: true },
          { player: 'M Muhammad', scored: false },
          { player: 'M Rahuul', scored: true },
          { player: 'M Harieq', scored: false },
          { player: 'AZRUL Izz Ilhan', scored: false }
        ]
      },
      eventsHome: [
        { type: 'Yellow', player: 'ADEEL', minute: '56:22' },
        { type: 'Yellow', player: 'AWAN Abdullah', minute: '55:22' },
        { type: 'Green', player: 'SHAHBAZ Hassan', minute: '47:17' },
        { type: 'Goal', player: 'SHAHBAZ Hassan', minute: '39:19' },
        { type: 'Goal', player: 'SHAHBAZ Hassan', minute: '34:17' },
        { type: 'Goal', player: 'SHAHBAZ Hassan', minute: '07:34' },
        { type: 'PC', player: '07:32', minute: '' },
        { type: 'Goal', player: 'AWAN Abdullah', minute: '04:27' }
      ],
      eventsAway: [
        { type: 'Yellow', player: 'M Muhammad', minute: '56:29' },
        { type: 'PC', player: '', minute: '51:19' },
        { type: 'PC', player: 'Muhammad Safwan', minute: '27:29' },
        { type: 'PC', player: '', minute: '27:26' },
        { type: 'PC', player: '', minute: '20:22' },
        { type: 'PC', player: 'Muhammad Safwan', minute: '17:19' },
        { type: 'PC', player: '', minute: '17:17' },
        { type: 'PC', player: 'Muhammad Safwan', minute: '09:42' }
      ]
    };
  }
}
