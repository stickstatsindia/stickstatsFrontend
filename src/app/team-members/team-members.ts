import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MembersService } from '../service/members/members-service';

interface TeamMember {
  _id: string;
  team_id: string;
  user_id: string;
  phone_number: string;
  role: string;
  name: string;
  __v?: number;
}

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-members.html',
  styleUrls: ['./team-members.css']
})
export class TeamMembersComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  teamId: string | null = null;
  tournamentId: string | null = null;
  isLoading = false;
  error: string | null = null;
    team_id:string | null=null;
  constructor(
    private memberService: MembersService,
    private router: Router,
    private route: ActivatedRoute
    
  ) {
    console.log('TeamMembersComponent initialized');
    const nav = this.router.getCurrentNavigation();
    console.log('Navigation State:', nav?.extras.state);
    const state = nav?.extras.state as { teamId?: string };
    console.log('Extracted State:', state);
    this.team_id= state?.teamId || null;
  }

  ngOnInit() {
    
      
      if (this.team_id) {
        this.loadTeamMembers();
      } else {
        this.error = 'No team ID provided';
        console.error('No team ID in query params');
      }
    ;
  }

  loadTeamMembers() {
    
    if (!this.team_id) return;

    this.isLoading = true;
      this.memberService.getMembers(this.team_id).subscribe({
      next: (members: TeamMember[]) => {
        console.log('Team members loaded:', members);
        this.teamMembers = members;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading team members:', err);
        this.error = 'Failed to load team members';
        this.isLoading = false;
      }
    });
  }

  onAddPlayer() {
    // Navigate to add player page with teamId
    this.router.navigate(['/add-newplayer'], {
      state: {
        teamId: this.teamId,
        tournamentId: this.tournamentId
      }
    });
  }
}
