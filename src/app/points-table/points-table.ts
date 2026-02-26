import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';
import { ScheduleService } from '../service/schedule.service';
import { TournamentService } from '../service/tournament/tournament';

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
    const nextId = (this.tournamentIdInput || '').toString().trim();
    if (!nextId || nextId === this.tournamentId) return;
    this.tournamentId = nextId;
    this.error = null;
    this.loadPointsTableFromBackend();
  }

  private resolveTournamentId(): void {
    if (this.tournamentIdInput) {
      this.tournamentId = this.tournamentIdInput;
      return;
    }
    if (this.tournamentId) return;
    this.tournamentId =
      this.route.snapshot.queryParamMap.get('tournamentId') ||
      this.route.snapshot.queryParamMap.get('tournament_id') ||
      '';
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
    this.loading = true;
    this.error = null;

    this.poolService.getPoolsByTournamentId(this.tournamentId).subscribe({
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
    this.loading = true;
    this.error = null;

    this.tournamentService.getTournamentPointsTable(this.tournamentId).subscribe({
      next: (res: any) => {
        const pools = Array.isArray(res?.pools) ? res.pools : [];
        if (!pools.length) {
          this.loadPointsTable();
          return;
        }

        this.standingsByPool = pools.map((pool: any) => {
          const rows = (Array.isArray(pool?.teams) ? pool.teams : []).map((t: any, idx: number) => ({
            position: Number(t?.position) || idx + 1,
            teamName: (t?.team_name || t?.teamName || '').toString(),
            played: Number(t?.played) || 0,
            won: Number(t?.won) || 0,
            draw: Number(t?.draw) || 0,
            lost: Number(t?.lost) || 0,
            scoredFor: Number(t?.scored_for) || 0,
            scoredAgainst: Number(t?.scored_against) || 0,
            goalDiff: Number(t?.goal_diff) || 0,
            points: (Number(t?.won) || 0) * 2 + (Number(t?.draw) || 0),
            results: Array.isArray(t?.results) ? t.results.map((r: any) => String(r)) : []
          })) as TeamStanding[];

          rows.sort((a, b) => this.sortRows(a, b));
          rows.forEach((row: TeamStanding, idx: number) => (row.position = idx + 1));

          return {
            poolName: (pool?.pool_name || pool?.name || 'Pool').toString(),
            rows
          };
        });

        this.loading = false;
      },
      error: () => {
        this.loadPointsTable();
      }
    });
  }

  private loadMatchesForTournament(): void {
    this.tournamentService.getTournamentById(this.tournamentId).subscribe({
      next: (t: any) => {
        const tournamentName = t?.tournament_name || t?.name || '';
        if (!tournamentName) {
          this.loadMatchesByTournamentId();
          return;
        }
        this.scheduleService.getMatchLivesByTournamentName(tournamentName).subscribe({
          next: (matches: any[]) => {
            this.allMatches = Array.isArray(matches) ? matches : [];
            this.rebuildStandings();
            this.loading = false;
          },
          error: () => {
            this.loadMatchesByTournamentId();
          }
        });
      },
      error: () => {
        this.loadMatchesByTournamentId();
      }
    });
  }

  private loadMatchesByTournamentId(): void {
    this.scheduleService.getMatchesByTournament(this.tournamentId).subscribe({
      next: (matches: any[]) => {
        this.allMatches = Array.isArray(matches) ? matches : [];
        this.rebuildStandings();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load matches', err);
        this.loading = false;
        this.error = 'Failed to load match data.';
      }
    });
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

      const homeScore = this.toNumber(match?.home_score ?? match?.team1_score ?? match?.homeScore ?? match?.team1Score);
      const awayScore = this.toNumber(match?.away_score ?? match?.team2_score ?? match?.awayScore ?? match?.team2Score);
      if (homeScore === null || awayScore === null) {
        continue;
      }

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

      if (homeScore > awayScore) {
        homeStanding.won += 1;
        homeStanding.points += 2;
        awayStanding.lost += 1;
        homeStanding.results.push('W');
        awayStanding.results.push('L');
      } else if (homeScore < awayScore) {
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
    if (status.includes('live') || status.includes('progress')) {
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
}
