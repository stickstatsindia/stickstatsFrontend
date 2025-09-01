import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddTeam } from '../service/team/add-team';
import { CommonModule } from '@angular/common';
import { MembersService } from '../service/members/members-service';

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
export class ShowTeamsComponent {
  teams: Team[] = [];
  rowsPerPageOptions = [5, 10, 25];
  rowsPerPage = 10;
  currentPage = 1;
  tournamentId: string | null = null;

  constructor(private router: Router,private teamservice:AddTeam, private memberService:MembersService) {
    // Get tournamentId from navigation state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string };
    this.tournamentId = state?.tournamentId || null;


  }

  ngOnInit() {
    this.fetchTeams();
  }

  // fetchTeams() {
  //   // Simulate backend fetch
  //   if (this.tournamentId) {
  //     this.teamservice.getTeamsByTournamentId(this.tournamentId).subscribe((data: any) => {
  //       this.teams = data as Team[];
  //       console.log('Teams loaded:', this.teams);
  //     });
  //   } else {
  //     this.teams = [];
  //     console.warn('No tournamentId provided, teams not loaded.');
  //   }
  // }
fetchTeams() {
  if (this.tournamentId) {
    this.teamservice.getTeamsByTournamentId(this.tournamentId).subscribe((data: any) => {
      this.teams = data as Team[];
      console.log('Teams loaded:', this.teams);

      // ✅ Fetch members count for each team
      this.teams.forEach(team => {
        this.memberService.getMembers(team.team_id).subscribe({
          next: (members: any[]) => {
            team.memberCount = members.length;
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

  onViewMembers(team: Team) {
    this.router.navigate(['/team-members'], { 
      queryParams: { 
        teamId: team._id,
        tournamentId: this.tournamentId
      }
    });
  }

  onMembersAction(team: Team) {
    console.log('Team selected for members action:', team);
  if (!team.memberCount || team.memberCount === 0) {
    // 👉 No members → go to add player form
   this.router.navigate(['/addnew-player'], { 
      state: { 
        teamId: team.team_id,
        tournamentId: this.tournamentId
      }
    });
    // this.router.navigate(['/addnew-player'], { 
    //   queryParams: { 
    //     teamId: team.team_id,
    //     tournamentId: this.tournamentId
    //   }
    // });
  } else {
    // 👉 Members exist → go to members list
     this.router.navigate(['/team-members'], { 
      state: { 
        teamId: team.team_id,
        tournamentId: this.tournamentId
      }
    });
  }
}


  getMembers(team: Team) {
    this.memberService.getMembers(team._id).subscribe({
      next: (members) => {
        console.log('Members of team', team.team_name, members);
      },
      error: (err) => {
        console.error('Error fetching members for team', team.team_name, err);
      }
    });
}
}

