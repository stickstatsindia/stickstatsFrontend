import { Component, Input, OnChanges, OnDestroy, OnInit, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatchService, Match } from '../../match.service';
import { ScheduleService } from '../../service/schedule.service';

@Component({
  selector: 'app-live-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './live-dashboard.html',
  styleUrls: ['./live-dashboard.css']
})
export class LiveDashboardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() tournamentIdInput = '';
  @Input() embedded = false;
  @Input() dashboardTitleInput = '';
  matches: Match[] = [];
  visibleMatches: Match[] = [];
  selectedTab: 'Live' | 'Upcoming' | 'Finished' = 'Live';
  tournamentId = '';
  dashboardTitle = 'Matches Dashboard';

  private subscriptions = new Subscription();
  private matchesLoadSub?: Subscription;
  private initialized = false;

  constructor(
    private matchService: MatchService,
    private scheduleService: ScheduleService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initialized = true;
    if (this.tournamentIdInput || this.dashboardTitleInput || this.embedded) {
      this.tournamentId = (this.tournamentIdInput || '').trim();
      const tournamentName = (this.dashboardTitleInput || '').trim();
      this.dashboardTitle = tournamentName ? `${tournamentName} - Matches Dashboard` : 'Matches Dashboard';
      this.loadMatches();
    } else {
      this.subscriptions.add(
        this.route.queryParamMap.subscribe(params => {
          this.tournamentId = (params.get('tournamentId') || '').trim();
          const tournamentName = (params.get('tournamentName') || '').trim();
          this.dashboardTitle = tournamentName ? `${tournamentName} - Matches Dashboard` : 'Matches Dashboard';
          this.loadMatches();
        })
      );
    }

    this.subscriptions.add(
      this.matchService.onMatchUpdates().subscribe(patch => {
        if (!patch.matchId) return;

        const idx = this.matches.findIndex(m => m.matchId === patch.matchId);

        if (idx === -1) {
          if (this.tournamentId) return;

          this.matchService.getMatch(patch.matchId).subscribe(full => {
            this.matches = [...this.matches, full];
            this.refreshVisibleMatches();
            this.cdr.detectChanges();
          });
          return;
        }

        const curr = this.matches[idx];
        const merged: Match = {
          ...curr,
          ...(pickDefined<Match>(patch))
        };

        if (patch.matchEvents && patch.matchEvents.length > 0) {
          merged.matchEvents = [...(curr.matchEvents ?? []), ...patch.matchEvents];
        }

        this.matches = [
          ...this.matches.slice(0, idx),
          merged,
          ...this.matches.slice(idx + 1)
        ];

        this.refreshVisibleMatches();
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.matchesLoadSub?.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;
    const tournamentChanged = !!changes['tournamentIdInput'];
    const titleChanged = !!changes['dashboardTitleInput'];
    if (!tournamentChanged && !titleChanged) return;

    this.tournamentId = (this.tournamentIdInput || '').trim();
    const name = (this.dashboardTitleInput || '').trim();
    this.dashboardTitle = name ? `${name} - Matches Dashboard` : 'Matches Dashboard';
    this.loadMatches();
  }

  selectTab(tab: 'Live' | 'Upcoming' | 'Finished'): void {
    this.selectedTab = tab;
    this.refreshVisibleMatches();
  }

  private loadMatches(): void {
    this.matchesLoadSub?.unsubscribe();

    if (this.tournamentId) {
      this.matchesLoadSub = 
        this.scheduleService.getMatchesByTournament(this.tournamentId).subscribe({
          next: (matches: any[]) => {
            const list = Array.isArray(matches) ? matches : [];
            if (list.length > 0) {
              this.matches = list.map((m: any) => this.mapTournamentMatch(m));
              this.ensureVisibleTabHasData();
              this.refreshVisibleMatches();
              this.cdr.detectChanges();
              return;
            }

            this.loadTournamentMatchesFallback();
          },
          error: (error) => {
            console.error('Error fetching tournament matches:', error);
            this.loadTournamentMatchesFallback();
          }
        });
      return;
    }

    this.matchesLoadSub =
      this.matchService.getAllMatches().subscribe({
        next: (matches) => {
          this.matches = matches;
          this.ensureVisibleTabHasData();
          this.refreshVisibleMatches();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching matches:', error);
        }
      });
  }

  private loadTournamentMatchesFallback(): void {
    if (!this.tournamentId) return;
    this.scheduleService.getMatchesByTournamentLegacy(this.tournamentId).subscribe({
      next: (matches: any[]) => {
        this.matches = (Array.isArray(matches) ? matches : []).map((m: any) => this.mapTournamentMatch(m));
        this.ensureVisibleTabHasData();
        this.refreshVisibleMatches();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Fallback endpoint failed for tournament matches:', error);
        this.matches = [];
        this.refreshVisibleMatches();
        this.cdr.detectChanges();
      }
    });
  }

  private refreshVisibleMatches(): void {
    this.visibleMatches = this.matches.filter(
      (match) => this.normalizeStatus(match?.status, match) === this.selectedTab
    );
  }

  private ensureVisibleTabHasData(): void {
    const hasLive = this.matches.some((m) => this.normalizeStatus(m?.status, m) === 'Live');
    const hasUpcoming = this.matches.some((m) => this.normalizeStatus(m?.status, m) === 'Upcoming');
    const hasFinished = this.matches.some((m) => this.normalizeStatus(m?.status, m) === 'Finished');

    if (this.selectedTab === 'Live' && !hasLive) {
      this.selectedTab = hasUpcoming ? 'Upcoming' : hasFinished ? 'Finished' : 'Live';
      return;
    }
    if (this.selectedTab === 'Upcoming' && !hasUpcoming) {
      this.selectedTab = hasLive ? 'Live' : hasFinished ? 'Finished' : 'Upcoming';
      return;
    }
    if (this.selectedTab === 'Finished' && !hasFinished) {
      this.selectedTab = hasLive ? 'Live' : hasUpcoming ? 'Upcoming' : 'Finished';
    }
  }

  private normalizeStatus(status: any, match?: any): 'Live' | 'Upcoming' | 'Finished' {
    const normalized = String(status || '').trim().toLowerCase();

    if (
      normalized.includes('live') ||
      normalized.includes('progress') ||
      normalized.includes('running') ||
      normalized.includes('ongoing') ||
      normalized.includes('penalty') ||
      normalized.includes('shootout') ||
      normalized.includes('tie')
    ) {
      return 'Live';
    }

    if (
      normalized.includes('finish') ||
      normalized.includes('complete') ||
      normalized.includes('ended') ||
      normalized.includes('full time') ||
      normalized === 'ft'
    ) {
      return 'Finished';
    }

    const homeScore = Number(match?.team1Score ?? match?.team1_score ?? match?.home_score);
    const awayScore = Number(match?.team2Score ?? match?.team2_score ?? match?.away_score);
    const hasValidScores = Number.isFinite(homeScore) && Number.isFinite(awayScore);
    if (hasValidScores && !normalized.includes('upcoming') && !normalized.includes('schedule') && !normalized.includes('pending')) {
      return 'Finished';
    }

    return 'Upcoming';
  }

  private mapTournamentMatch(match: any): Match {
    const status = this.normalizeStatus(match?.status || match?.match_status, match);

    return {
      matchId: (match?.match_id || match?.matchId || '').toString(),
      team1Name: (match?.team1_name || match?.home_team_name || match?.team1 || 'Team 1').toString(),
      team2Name: (match?.team2_name || match?.away_team_name || match?.team2 || 'Team 2').toString(),
      venue: (match?.venue || '').toString(),
      matchDate: (match?.match_date || match?.matchDate || '').toString(),
      matchTime: (match?.match_time || match?.matchTime || '').toString(),
      status,
      team1Score: Number(match?.team1_score ?? match?.home_score ?? match?.team1Score ?? 0) || 0,
      team2Score: Number(match?.team2_score ?? match?.away_score ?? match?.team2Score ?? 0) || 0,
      quarters: Array.isArray(match?.quarters) ? match.quarters : [],
      currentQuarter: (match?.current_quarter || '').toString(),
      team1Players: Array.isArray(match?.team1_players) ? match.team1_players : [],
      team2Players: Array.isArray(match?.team2_players) ? match.team2_players : [],
      totalSeconds: Number(match?.total_seconds ?? 0) || 0,
      isPaused: Boolean(match?.is_paused),
      matchEvents: Array.isArray(match?.match_events) ? match.match_events : [],
      updatedAt: (match?.updated_at || '').toString()
    };
  }
}

function pickDefined<T>(obj: Partial<T>): Partial<T> {
  const out: Partial<T> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined) (out as any)[k] = v;
  });
  return out;
}
