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
      this.data.teams.home.players = res.players || res;
    });

    this.membersService.getMembers(awayId).subscribe(res => {
      this.data.teams.away.players = res.players || res;
    });
  }

  selectPlayer(team: 'home' | 'away', player: any) {
    this.selectedPlayer = { team, name: player.name };
  }
}
