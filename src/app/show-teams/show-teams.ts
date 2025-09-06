import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AddTeam } from '../service/team/add-team';
import { MembersService } from '../service/members/members-service';
import { ChangeDetectorRef } from '@angular/core';

interface Team {
  _id: string;
  team_id: string;
  team_name: string;
  city: string;
  logo?: string;
  memberCount?: number;
}

@Component({
  selector: 'app-show-teams',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './show-teams.html',
  styleUrls: ['./show-teams.css']
})
export class ShowTeamsComponent implements OnInit {
  teams: Team[] = [];
  rowsPerPageOptions = [5, 10, 25];
  rowsPerPage = 10;
  currentPage = 1;
  tournamentId: string | null = null;

  constructor(
    private router: Router,
    private teamservice: AddTeam,
    private memberService: MembersService,
    private cdr: ChangeDetectorRef
  ) {
    // Get tournamentId from navigation state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string };
    this.tournamentId = state?.tournamentId || null;
  }

  ngOnInit() {
    this.fetchTeams();
    this.cdr.detectChanges();
  }

  fetchTeams() {
    if (this.tournamentId) {
      this.teamservice.getTeamsByTournamentId(this.tournamentId).subscribe((data: any) => {
        this.teams = data as Team[];
         this.cdr.detectChanges();
        console.log('Teams loaded:', this.teams);

        // fetch member count for each team
        this.teams.forEach(team => {
          this.memberService.getMembers(team.team_id).subscribe({
            next: (members: any[]) => {
              team.memberCount = members.length;
               this.cdr.detectChanges();
            },
            error: (err) => {
              console.error(`Error fetching members for ${team.team_name}`, err);
              team.memberCount = 0;
            }
          });
        });
      });
    } else {
      this.teams = [];
      console.warn('No tournamentId provided, teams not loaded.');
    }
  }

  // ✅ pagination helpers
  get startRow() {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endRow() {
    return Math.min(this.startRow + this.rowsPerPage, this.teams.length);
  }

  get pagedTeams() {
    return this.teams.slice(this.startRow, this.endRow);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.endRow < this.teams.length) {
      this.currentPage++;
    }
  }

  onRowsPerPageChange() {
    this.currentPage = 1; // reset to first page when rows per page changes
  }

  // ✅ navigation + actions
  onAddTeam() {
    this.router.navigate(['/addnew-team'], { state: { tournamentId: this.tournamentId } });
  }

  onEditTeam(team: Team) {
    this.router.navigate(['/edit-team'], {
      queryParams: {
        teamId: team._id,
        tournamentId: this.tournamentId
      }
    });
  }

  onDeleteTeam(team: Team) {
    if (confirm(`Delete team ${team.team_name}?`)) {
      this.teams = this.teams.filter(t => t !== team);
    }
  }
get displayedEndRow() {
  return Math.min(this.currentPage * this.rowsPerPage, this.teams.length);
}
  onMembersAction(team: Team) {
    console.log('Team selected for members action:', team);
    if (!team.memberCount || team.memberCount === 0) {
      this.router.navigate(['/addnew-player'], {
        state: {
          teamId: team.team_id,
          tournamentId: this.tournamentId
        }
      });
    } else {
      this.router.navigate(['/team-members'], {
        state: {
          teamId: team.team_id,
          tournamentId: this.tournamentId
        }
      });
    }
  }
}
