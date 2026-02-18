import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersService } from '../../service/members/members-service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements OnInit {

  @Input() data: any;

  selectedPlayer: { team: 'home' | 'away'; name: string } | null = null;

  constructor(private membersService: MembersService) {}

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers() {
    const homeId = this.data.teams.home.id;
    const awayId = this.data.teams.away.id;

    this.membersService.getMembers(homeId).subscribe(res => {
      this.data.teams.home.players = this.normalizePlayers(res);
      this.data.teams.home.staff = {
        headCoach: this.resolveHeadCoachName(res, homeId)
      };
    });

    this.membersService.getMembers(awayId).subscribe(res => {
      this.data.teams.away.players = this.normalizePlayers(res);
      this.data.teams.away.staff = {
        headCoach: this.resolveHeadCoachName(res, awayId)
      };
    });
  }

  selectPlayer(team: 'home' | 'away', player: any) {
    this.selectedPlayer = { team, name: player.name };
  }

  private normalizePlayers(response: any): any[] {
    const rawPlayers = Array.isArray(response) ? response : (response?.players || []);
    if (!Array.isArray(rawPlayers)) return [];

    return rawPlayers.map((player: any) => ({
      ...player,
      name: player?.name || player?.player_name || player?.full_name || 'Unknown Player'
    }));
  }

  private resolveHeadCoachName(response: any, teamId: string): string {
    const fromResponse = response?.head_coach_name || response?.headCoachName;
    if (fromResponse) return fromResponse;
    return localStorage.getItem(`team_staff_head_coach_${teamId}`) || 'Not provided';
  }
}
