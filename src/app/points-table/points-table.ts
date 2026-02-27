import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';
import { ScheduleService } from '../service/schedule.service';
import { TournamentService } from '../service/tournament/tournament';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

interface PoolTeam {
  team_id?: string;
  team_name?: string;
  name?: string;
}

interface PoolData {
  name?: string;
  pool_name?: string;
  teams?: PoolTeam[];
}

interface TeamStanding {
  position: number;
  teamName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  scoredFor: number;
  scoredAgainst: number;
  goalDiff: number;
  points: number;
  results: string[];
}

interface PoolStandings {
  poolName: string;
  rows: TeamStanding[];
}

@Component({
  selector: 'app-points-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './points-table.html',
  styleUrls: ['./points-table.css']
})
export class PointsTable implements OnInit, OnChanges {
  @Input() tournamentIdInput = '';
  @Input() embedded = false;
  byOptions = ['Points', 'Wins', 'Goals'];
  selectedBy = this.byOptions[0];
  stageOptions = ['All', 'Group', 'Quarterfinal', 'Semifinal', 'Final'];
  selectedStage = this.stageOptions[0];
  tournamentId = '';
  loading = false;
  error: string | null = null;
  standingsByPool: PoolStandings[] = [];
  private pools: PoolData[] = [];
  private allMatches: any[] = [];
  private loadGuardTimer: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private poolService: PoolService,
    private scheduleService: ScheduleService,
    private tournamentService: TournamentService
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string } | undefined;
    this.tournamentId = state?.tournamentId || '';
  }

  ngOnInit(): void {
    this.resolveTournamentId();
    if (!this.tournamentId) {
      this.error = 'No tournament selected.';
      return;
    }
    this.loadPointsTableFromBackend();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['tournamentIdInput']) return;
    const nextId = this.normalizeTournamentId(this.tournamentIdInput);
    if (!nextId) return;
    if (nextId === this.tournamentId && (this.loading || this.standingsByPool.length > 0)) return;
    this.tournamentId = nextId;
    this.error = null;
    this.loadPointsTableFromBackend();
  }

  private resolveTournamentId(): void {
    const inputId = this.normalizeTournamentId(this.tournamentIdInput);
    if (inputId) {
      this.tournamentId = inputId;
      return;
    }
    const current = this.normalizeTournamentId(this.tournamentId);
    if (current) {
      this.tournamentId = current;
      return;
    }
    const historyState = (typeof history !== 'undefined' ? history.state : null) as { tournamentId?: string } | null;
    const fromState = this.normalizeTournamentId(historyState?.tournamentId);
    const fromQuery =
      this.normalizeTournamentId(this.route.snapshot.queryParamMap.get('tournamentId')) ||
      this.normalizeTournamentId(this.route.snapshot.queryParamMap.get('tournament_id'));
    const fromParam =
      this.normalizeTournamentId(this.route.snapshot.paramMap.get('tournament_id')) ||
      this.normalizeTournamentId(this.route.snapshot.paramMap.get('id'));
    const fromStorage =
      typeof window !== 'undefined' && window.localStorage
        ? this.normalizeTournamentId(localStorage.getItem('last_tournament_id'))
        : '';

    this.tournamentId =
      fromParam ||
      fromQuery ||
      fromState ||
      fromStorage ||
      '';
  }

  private normalizeTournamentId(value: any): string {
    const id = String(value ?? '').trim();
    if (!id) return '';
    const lower = id.toLowerCase();
    if (lower === 'undefined' || lower === 'null') return '';
    return id;
  }

  onFiltersChanged(): void {
    if (this.pools.length && this.allMatches.length) {
      this.rebuildStandings();
      return;
    }
    this.standingsByPool = this.standingsByPool.map((pool) => {
      const rows = [...pool.rows].sort((a, b) => this.sortRows(a, b));
      rows.forEach((row, idx) => (row.position = idx + 1));
      return { ...pool, rows };
    });
  }

  private loadPointsTable(): void {
    this.startLoadingGuard();
    this.loading = true;
    this.error = null;

    this.poolService.getPoolsByTournamentId(this.tournamentId).pipe(
      timeout(6000)
    ).subscribe({
      next: (poolRes: any) => {
        this.pools = Array.isArray(poolRes?.pools) ? poolRes.pools : [];
        this.loadMatchesForTournament();
      },
      error: (err: any) => {
        console.error('Failed to load pools', err);
        this.loading = false;
        this.error = 'Failed to load pool data.';
      }
    });
  }

  private loadPointsTableFromBackend(): void {
    this.startLoadingGuard();
    this.loading = true;
    this.error = null;

    this.tournamentService.getTournamentPointsTable(this.tournamentId).pipe(
      timeout(6000),
      catchError((err) => {
        console.error('Failed to load points table', err);
        this.error = 'Failed to load points table.';
        return of(null);
      }),
      finalize(() => {
        this.clearLoadingGuard();
        this.loading = false;
      })
    ).subscribe({
      next: (res: any) => {
        if (!res) {
          this.standingsByPool = [];
          return;
        }
        const pools = Array.isArray(res?.pools) ? res.pools : [];
        const backendStandings = this.mapBackendPoolsToStandings(pools);
        if (backendStandings.length) {
          this.standingsByPool = backendStandings.map((pool) => {
            const rows = [...pool.rows].sort((a, b) => this.sortRows(a, b));
            rows.forEach((row, idx) => (row.position = idx + 1));
            return { ...pool, rows };
          });
          return;
        }
        // No usable rows from backend -> stop loader and show empty state.
        this.standingsByPool = [];
      }
    });
  }

  private mapBackendPoolsToStandings(pools: any[]): PoolStandings[] {
    if (!Array.isArray(pools) || pools.length === 0) return [];

    return pools
      .map((pool: any) => {
        const rowsRaw = Array.isArray(pool?.teams) ? pool.teams : [];
        const rows: TeamStanding[] = rowsRaw.map((team: any, idx: number) => ({
          position: Number(team?.position ?? idx + 1) || idx + 1,
          teamName: String(team?.team_name || team?.teamName || team?.name || '').trim(),
          played: Number(team?.played ?? team?.matches_played ?? 0) || 0,
          won: Number(team?.won ?? team?.wins ?? 0) || 0,
          draw: Number(team?.draw ?? team?.draws ?? 0) || 0,
          lost: Number(team?.lost ?? team?.losses ?? 0) || 0,
          scoredFor: Number(team?.scored_for ?? team?.scoredFor ?? team?.goals_for ?? 0) || 0,
          scoredAgainst: Number(team?.scored_against ?? team?.scoredAgainst ?? team?.goals_against ?? 0) || 0,
          goalDiff: Number(team?.goal_diff ?? team?.goalDiff ?? 0) || 0,
          points: Number(team?.points ?? team?.pts ?? 0) || 0,
          results: Array.isArray(team?.results) ? team.results.map((r: any) => String(r)) : []
        })).filter((row: TeamStanding) => !!row.teamName);

        return {
          poolName: String(pool?.pool_name || pool?.name || 'Pool'),
          rows
        };
      })
      .filter((pool: PoolStandings) => pool.rows.length > 0);
  }

  private loadMatchesForTournament(): void {
    // Prefer direct tournamentId-based endpoints for predictable preload.
    this.loadMatchesByTournamentId();
  }

  private loadMatchesByTournamentId(): void {
    this.scheduleService.getMatchesByTournament(this.tournamentId).pipe(
      timeout(6000)
    ).subscribe({
      next: (matches: any[]) => {
        const list = Array.isArray(matches) ? matches : [];
        if (list.length > 0) {
          this.allMatches = list;
          this.safeRebuildAndComplete();
          return;
        }
        this.loadMatchesByTournamentIdLegacy();
      },
      error: (err: any) => {
        console.error('Failed to load matches', err);
        this.loadMatchesByTournamentIdLegacy();
      }
    });
  }

  private loadMatchesByTournamentIdLegacy(): void {
    this.scheduleService.getMatchesByTournamentLegacy(this.tournamentId).pipe(
      timeout(6000)
    ).subscribe({
      next: (matches: any[]) => {
        this.allMatches = Array.isArray(matches) ? matches : [];
        this.safeRebuildAndComplete();
      },
      error: (err: any) => {
        console.error('Failed to load legacy matches', err);
        this.clearLoadingGuard();
        this.loading = false;
        this.error = 'Failed to load match data.';
      }
    });
  }

  private safeRebuildAndComplete(): void {
    try {
      this.rebuildStandings();
      if (!this.error && !this.standingsByPool.length) {
        // Let template show "No pool data found..." instead of indefinite loader.
        this.error = null;
      }
    } catch (err) {
      console.error('Failed to build standings', err);
      this.error = 'Failed to build points table.';
    } finally {
      this.clearLoadingGuard();
      this.loading = false;
    }
  }

  private startLoadingGuard(): void {
    this.clearLoadingGuard();
    this.loadGuardTimer = setTimeout(() => {
      if (!this.loading) return;
      this.loading = false;
      this.error = 'Points table request timed out. Please try again.';
    }, 12000);
  }

  private clearLoadingGuard(): void {
    if (!this.loadGuardTimer) return;
    clearTimeout(this.loadGuardTimer);
    this.loadGuardTimer = null;
  }

  private rebuildStandings(): void {
    const teamPoolMap = new Map<string, string>();
    const standingsMap = new Map<string, Map<string, TeamStanding>>();

    for (const pool of this.pools) {
      const poolName = (pool?.name || pool?.pool_name || 'Pool').toString();
      const teamsMap = new Map<string, TeamStanding>();
      const teams = Array.isArray(pool?.teams) ? pool.teams : [];

      for (const team of teams) {
        const teamName = (team?.team_name || team?.name || '').toString().trim();
        if (!teamName) continue;
        const key = this.normalizeKey(teamName);
        teamPoolMap.set(key, poolName);
        teamsMap.set(key, this.createEmptyStanding(teamName));
      }

      standingsMap.set(poolName, teamsMap);
    }

    const playableMatches = this.allMatches
      .filter((m) => this.matchMatchesStage(m))
      .filter((m) => this.isCompletedMatch(m))
      .sort((a, b) => this.getMatchTimestamp(a) - this.getMatchTimestamp(b));

    for (const match of playableMatches) {
      const homeName = this.getHomeTeamName(match);
      const awayName = this.getAwayTeamName(match);
      const homeKey = this.normalizeKey(homeName);
      const awayKey = this.normalizeKey(awayName);
      const homePool = teamPoolMap.get(homeKey);
      const awayPool = teamPoolMap.get(awayKey);

      if (!homePool || !awayPool || homePool !== awayPool) {
        continue;
      }

      const baseHomeScore = this.toNumber(match?.home_score ?? match?.team1_score ?? match?.homeScore ?? match?.team1Score);
      const baseAwayScore = this.toNumber(match?.away_score ?? match?.team2_score ?? match?.awayScore ?? match?.team2Score);
      if (baseHomeScore === null || baseAwayScore === null) {
        continue;
      }

      const finalScore = this.resolveFinalMatchScore(match, homeName, awayName, baseHomeScore, baseAwayScore);
      const homeScore = finalScore.home;
      const awayScore = finalScore.away;

      const poolStandings = standingsMap.get(homePool);
      if (!poolStandings) continue;

      const homeStanding = poolStandings.get(homeKey) ?? this.createEmptyStanding(homeName);
      const awayStanding = poolStandings.get(awayKey) ?? this.createEmptyStanding(awayName);

      homeStanding.played += 1;
      awayStanding.played += 1;
      homeStanding.scoredFor += homeScore;
      homeStanding.scoredAgainst += awayScore;
      awayStanding.scoredFor += awayScore;
      awayStanding.scoredAgainst += homeScore;

      const matchOutcome = this.resolveMatchOutcome(homeScore, awayScore);

      if (matchOutcome === 'home') {
        homeStanding.won += 1;
        homeStanding.points += 2;
        awayStanding.lost += 1;
        homeStanding.results.push('W');
        awayStanding.results.push('L');
      } else if (matchOutcome === 'away') {
        awayStanding.won += 1;
        awayStanding.points += 2;
        homeStanding.lost += 1;
        homeStanding.results.push('L');
        awayStanding.results.push('W');
      } else {
        homeStanding.draw += 1;
        awayStanding.draw += 1;
        homeStanding.points += 1;
        awayStanding.points += 1;
        homeStanding.results.push('D');
        awayStanding.results.push('D');
      }

      homeStanding.goalDiff = homeStanding.scoredFor - homeStanding.scoredAgainst;
      awayStanding.goalDiff = awayStanding.scoredFor - awayStanding.scoredAgainst;
      poolStandings.set(homeKey, homeStanding);
      poolStandings.set(awayKey, awayStanding);
    }

    this.standingsByPool = Array.from(standingsMap.entries()).map(([poolName, teams]) => {
      const rows = Array.from(teams.values());
      rows.sort((a, b) => this.sortRows(a, b));
      rows.forEach((row, idx) => (row.position = idx + 1));
      return { poolName, rows };
    });
  }

  private createEmptyStanding(teamName: string): TeamStanding {
    return {
      position: 0,
      teamName,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      scoredFor: 0,
      scoredAgainst: 0,
      goalDiff: 0,
      points: 0,
      results: []
    };
  }

  private sortRows(a: TeamStanding, b: TeamStanding): number {
    const primary =
      this.selectedBy === 'Wins'
        ? b.won - a.won
        : this.selectedBy === 'Goals'
        ? b.scoredFor - a.scoredFor
        : b.points - a.points;
    if (primary !== 0) return primary;
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.scoredFor !== a.scoredFor) return b.scoredFor - a.scoredFor;
    if (b.won !== a.won) return b.won - a.won;
    return a.teamName.localeCompare(b.teamName);
  }

  private normalizeKey(name: string): string {
    return (name || '').trim().toLowerCase();
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  private getHomeTeamName(match: any): string {
    return (
      match?.home_team_name ??
      match?.team1_name ??
      match?.team1 ??
      match?.homeTeamName ??
      ''
    ).toString();
  }

  private getAwayTeamName(match: any): string {
    return (
      match?.away_team_name ??
      match?.team2_name ??
      match?.team2 ??
      match?.awayTeamName ??
      ''
    ).toString();
  }

  private getMatchTimestamp(match: any): number {
    const date = match?.match_date || match?.matchDate || '';
    const time = match?.match_time || match?.matchTime || '00:00';
    const stamp = Date.parse(`${date}T${time}`);
    return Number.isNaN(stamp) ? 0 : stamp;
  }

  private isCompletedMatch(match: any): boolean {
    const status = (match?.status || match?.match_status || '').toString().toLowerCase();
    if (status.includes('upcoming') || status.includes('scheduled') || status.includes('pending') || status.includes('cancel')) {
      return false;
    }
    if (
      status.includes('finish') ||
      status.includes('complete') ||
      status.includes('ended') ||
      status.includes('full time') ||
      status === 'ft'
    ) {
      return true;
    }
    if (
      status.includes('live') ||
      status.includes('progress') ||
      status.includes('penalty') ||
      status.includes('shootout') ||
      status.includes('tie')
    ) {
      return false;
    }
    const homeScore = this.toNumber(match?.home_score ?? match?.team1_score ?? match?.homeScore ?? match?.team1Score);
    const awayScore = this.toNumber(match?.away_score ?? match?.team2_score ?? match?.awayScore ?? match?.team2Score);
    return homeScore !== null && awayScore !== null;
  }

  private matchMatchesStage(match: any): boolean {
    if (this.selectedStage === 'All') return true;
    const stage = (match?.rounds || match?.stage || match?.match_type || '').toString().toLowerCase();
    if (this.selectedStage === 'Group') {
      if (!stage) return true;
      return stage.includes('group') || stage.includes('pool') || stage.includes('league');
    }
    if (this.selectedStage === 'Quarterfinal') return stage.includes('quarter');
    if (this.selectedStage === 'Semifinal') return stage.includes('semi');
    if (this.selectedStage === 'Final') return stage.includes('final') && !stage.includes('semi') && !stage.includes('quarter');
    return true;
  }

  private resolveMatchOutcome(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
    if (homeScore > awayScore) return 'home';
    if (homeScore < awayScore) return 'away';
    return 'draw';
  }

  private resolveFinalMatchScore(
    match: any,
    homeName: string,
    awayName: string,
    baseHomeScore: number,
    baseAwayScore: number
  ): { home: number; away: number } {
    const quarterTotals = this.readQuarterTotals(match);
    const shootout = this.readPenaltyShootoutScore(match, homeName, awayName);

    if (quarterTotals && shootout) {
      return {
        home: quarterTotals.home + shootout.home,
        away: quarterTotals.away + shootout.away
      };
    }

    if (quarterTotals) {
      return {
        home: quarterTotals.home,
        away: quarterTotals.away
      };
    }

    if (shootout) {
      // Fallback when quarter totals are unavailable.
      return {
        home: baseHomeScore + shootout.home,
        away: baseAwayScore + shootout.away
      };
    }

    return {
      home: baseHomeScore,
      away: baseAwayScore
    };
  }

  private readQuarterTotals(match: any): { home: number; away: number } | null {
    const quarterObj = match?.quarter_scores || match?.quarterScores;
    const homeArr =
      quarterObj?.home ||
      match?.team1_quarter_scores ||
      match?.team1QuarterScores;
    const awayArr =
      quarterObj?.away ||
      match?.team2_quarter_scores ||
      match?.team2QuarterScores;

    if (Array.isArray(homeArr) && Array.isArray(awayArr)) {
      const home = [0, 1, 2, 3].reduce((sum, i) => sum + (Number(homeArr[i] ?? 0) || 0), 0);
      const away = [0, 1, 2, 3].reduce((sum, i) => sum + (Number(awayArr[i] ?? 0) || 0), 0);
      return { home, away };
    }

    const homeFlat = [
      this.toNumber(match?.team1_q1 ?? match?.team1Q1 ?? match?.q1_home ?? match?.q1Home),
      this.toNumber(match?.team1_q2 ?? match?.team1Q2 ?? match?.q2_home ?? match?.q2Home),
      this.toNumber(match?.team1_q3 ?? match?.team1Q3 ?? match?.q3_home ?? match?.q3Home),
      this.toNumber(match?.team1_q4 ?? match?.team1Q4 ?? match?.q4_home ?? match?.q4Home)
    ];
    const awayFlat = [
      this.toNumber(match?.team2_q1 ?? match?.team2Q1 ?? match?.q1_away ?? match?.q1Away),
      this.toNumber(match?.team2_q2 ?? match?.team2Q2 ?? match?.q2_away ?? match?.q2Away),
      this.toNumber(match?.team2_q3 ?? match?.team2Q3 ?? match?.q3_away ?? match?.q3Away),
      this.toNumber(match?.team2_q4 ?? match?.team2Q4 ?? match?.q4_away ?? match?.q4Away)
    ];

    const hasAny = [...homeFlat, ...awayFlat].some((v) => v !== null);
    if (!hasAny) return null;

    const home = homeFlat.reduce((sum: number, v: number | null) => sum + (v ?? 0), 0);
    const away = awayFlat.reduce((sum: number, v: number | null) => sum + (v ?? 0), 0);
    return { home, away };
  }

  private readPenaltyShootoutScore(
    match: any,
    homeName: string,
    awayName: string
  ): { home: number; away: number } | null {
    const payload = match?.penaltyShootout ?? match?.penalty_shootout;
    if (payload) {
      const homeAttempts = Array.isArray(payload?.home) ? payload.home : [];
      const awayAttempts = Array.isArray(payload?.away) ? payload.away : [];
      const homeScore = this.toNumber(
        payload?.homeScore ??
          payload?.home_score ??
          payload?.team1_score ??
          payload?.team1Score ??
          homeAttempts.filter((s: any) => !!s?.scored).length
      );
      const awayScore = this.toNumber(
        payload?.awayScore ??
          payload?.away_score ??
          payload?.team2_score ??
          payload?.team2Score ??
          awayAttempts.filter((s: any) => !!s?.scored).length
      );
      if (homeScore !== null && awayScore !== null) {
        return { home: homeScore, away: awayScore };
      }
    }

    const homeFlat = this.toNumber(
      match?.ps_home ??
        match?.psHome ??
        match?.home_ps_score ??
        match?.homePenaltyScore ??
        match?.team1_ps_score ??
        match?.team1PenaltyScore
    );
    const awayFlat = this.toNumber(
      match?.ps_away ??
        match?.psAway ??
        match?.away_ps_score ??
        match?.awayPenaltyScore ??
        match?.team2_ps_score ??
        match?.team2PenaltyScore
    );
    if (homeFlat !== null && awayFlat !== null) {
      return { home: homeFlat, away: awayFlat };
    }

    const events = Array.isArray(match?.match_events)
      ? match.match_events
      : Array.isArray(match?.matchEvents)
      ? match.matchEvents
      : Array.isArray(match?.events)
      ? match.events
      : [];
    if (!events.length) return null;

    let home = 0;
    let away = 0;
    let hasShootoutEvent = false;
    const normalizedHome = this.normalizeKey(homeName);
    const normalizedAway = this.normalizeKey(awayName);

    for (const ev of events) {
      const type = String(ev?.type || '').trim().toLowerCase();
      if (!type.includes('penalty shootout')) continue;
      hasShootoutEvent = true;

      const scored = type.includes('goal') || type.includes('scored');
      if (!scored) continue;

      const team = this.normalizeKey(ev?.team);
      if (!team) continue;

      if (team === 'home' || team === 'team1' || team === 'team 1' || team === normalizedHome) {
        home += 1;
      } else if (team === 'away' || team === 'team2' || team === 'team 2' || team === normalizedAway) {
        away += 1;
      } else if (normalizedHome && team.includes(normalizedHome)) {
        home += 1;
      } else if (normalizedAway && team.includes(normalizedAway)) {
        away += 1;
      }
    }

    return hasShootoutEvent ? { home, away } : null;
  }
}
