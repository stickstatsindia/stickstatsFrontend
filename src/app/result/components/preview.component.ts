import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MembersService } from '../../service/members/members-service';
import { TournamentService } from '../../service/tournament/tournament';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit, OnChanges {

  @Input() data: any;
  private lastLoadedKey = '';

  selectedPlayer: { team: 'home' | 'away'; name: string } | null = null;

  constructor(
    private membersService: MembersService,
    private tournamentService: TournamentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.tryLoadPlayers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['data']) return;
    this.tryLoadPlayers();
  }

  private tryLoadPlayers(): void {
    const homeId = this.resolveTeamId(this.data?.teams?.home);
    const awayId = this.resolveTeamId(this.data?.teams?.away);
    if (!homeId || !awayId) return;

    const nextKey = `${homeId}::${awayId}`;
    if (nextKey === this.lastLoadedKey) return;
    this.lastLoadedKey = nextKey;

    this.loadPlayers(homeId, awayId);
  }

  loadPlayers(homeId: string, awayId: string) {
    if (!this.data?.teams?.home || !this.data?.teams?.away) return;

    this.membersService.getMembers(homeId).subscribe(res => {
      const players = this.normalizePlayers(res);
      this.hydrateJerseyNumbers(players).subscribe((hydrated) => {
        this.data.teams.home.players = hydrated;
      });
      this.data.teams.home.staff = {
        headCoach: this.resolveHeadCoachName(res, homeId)
      };
    }, () => {
      this.data.teams.home.players = [];
      this.data.teams.home.staff = { headCoach: this.resolveHeadCoachName(null, homeId) };
    });

    this.membersService.getMembers(awayId).subscribe(res => {
      const players = this.normalizePlayers(res);
      this.hydrateJerseyNumbers(players).subscribe((hydrated) => {
        this.data.teams.away.players = hydrated;
      });
      this.data.teams.away.staff = {
        headCoach: this.resolveHeadCoachName(res, awayId)
      };
    }, () => {
      this.data.teams.away.players = [];
      this.data.teams.away.staff = { headCoach: this.resolveHeadCoachName(null, awayId) };
    });
  }

  selectPlayer(team: 'home' | 'away', player: any) {
    this.selectedPlayer = { team, name: player.name };
  }

  getPlayerProfileId(player: any): string | null {
    return player?.user_id || player?.player_id || player?.id || null;
  }

  openPlayerProfile(player: any): void {
    const playerId = this.getPlayerProfileId(player);
    if (!playerId) return;
    this.router.navigate(['/player-profile', playerId]);
  }

  private normalizePlayers(response: any): any[] {
    const rawPlayers = Array.isArray(response) ? response : (response?.players || []);
    if (!Array.isArray(rawPlayers)) return [];

    return rawPlayers.map((player: any) => ({
      ...player,
      name: player?.name || player?.player_name || player?.full_name || 'Unknown Player',
      jersey_number: this.resolveJerseyNumber(player)
    }));
  }

  private resolveJerseyNumber(player: any): string {
    // Priority: user/profile jersey first (original behavior), then member-level fallbacks.
    const candidates = [
      player?.user?.jersey_number,
      player?.user?.jerseyNumber,
      player?.profile?.jersey_number,
      player?.profile?.jerseyNumber,
      player?.match_jersey_number,
      player?.team_jersey_number,
      player?.playing_jersey_number,
      player?.playing_jersey_no,
      player?.member_jersey_number,
      player?.member_jersey_no,
      player?.jersey_number,
      player?.jersey_no,
      player?.jerseyNumber,
      player?.jerseyNo,
      player?.user?.match_jersey_number,
      player?.user?.team_jersey_number
    ];

    for (const c of candidates) {
      const value = String(c ?? '').trim();
      if (value) return value;
    }
    return '';
  }

  private hydrateJerseyNumbers(players: any[]): Observable<any[]> {
    if (!Array.isArray(players) || players.length === 0) {
      return of([]);
    }

    const requests = players.map((player) => {
      const existing = this.resolveJerseyNumber(player);
      if (existing) {
        return of({ ...player, jersey_number: existing });
      }

      const playerId = this.getPlayerProfileId(player);
      if (!playerId) return of(player);

      return this.tournamentService.getUserById(playerId).pipe(
        map((user: any) => {
          const jersey = this.resolveJerseyNumber(user);
          return { ...player, jersey_number: jersey || '' };
        }),
        catchError(() => of(player))
      );
    });

    return forkJoin(requests);
  }

  private resolveHeadCoachName(response: any, teamId: string): string {
    const fromResponse = response?.head_coach_name || response?.headCoachName;
    if (fromResponse) return fromResponse;
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`team_staff_head_coach_${teamId}`) || 'Not provided';
    }
    return 'Not provided';
  }

  private resolveTeamId(team: any): string {
    return String(team?.id || team?.team_id || team?._id || '').trim();
  }
}
