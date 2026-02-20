// 




import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './team-members.html',
  styleUrls: ['./team-members.css']
})
export class TeamMembersComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  team_id: string | null = null;
  tournamentId: string | null = null;
  isLoading = false;
  error: string | null = null;
  showHeadCoachForm = false;
  headCoachName = '';
  headCoachInput = '';
  coachError: string | null = null;

  constructor(
    private memberService: MembersService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { teamId?: string; tournamentId?: string };
    this.team_id = state?.teamId || this.route.snapshot.queryParamMap.get('teamId');
    this.tournamentId = state?.tournamentId || this.route.snapshot.queryParamMap.get('tournamentId');
  }

  ngOnInit() {
    if (this.team_id) {
      this.loadTeamMembers();
      this.loadHeadCoachName();
      this.cdr.detectChanges();
    } else {
      this.error = 'No team ID provided.';
      console.error('No team ID provided (state/query params missing).');
    }
  }

  loadTeamMembers() {
    if (!this.team_id) return;

    this.isLoading = true;
    this.memberService.getMembers(this.team_id).subscribe({
      next: (members: TeamMember[]) => {
        this.teamMembers = members;
        this.isLoading = false; // âœ… FIXED
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load team members';
        this.isLoading = false;
      }
    });
  }

  onAddPlayer() {
    // âœ… FIXED: use team_id not teamId
    this.router.navigate(['/addnew-player'], {
      state: {
        teamId: this.team_id,
        tournamentId: this.tournamentId
      }
    });
  }

  onAddHeadCoachName(): void {
    if (this.headCoachName) {
      this.coachError = 'Head coach is already selected for this team.';
      return;
    }
    this.coachError = null;
    this.showHeadCoachForm = true;
    this.headCoachInput = this.headCoachName || '';
  }

  onSaveHeadCoachName(): void {
    if (!this.team_id) return;
    if (this.headCoachName) {
      this.coachError = 'Only one head coach is allowed per team.';
      this.showHeadCoachForm = false;
      return;
    }
    const value = (this.headCoachInput || '').trim();
    if (!value) {
      this.coachError = 'Head coach name is required.';
      return;
    }
    localStorage.setItem(this.getCoachStorageKey(this.team_id), value);
    this.headCoachName = value;
    this.showHeadCoachForm = false;
    this.coachError = null;
  }

  onCancelHeadCoachName(): void {
    this.showHeadCoachForm = false;
    this.headCoachInput = this.headCoachName || '';
    this.coachError = null;
  }

  private loadHeadCoachName(): void {
    if (!this.team_id) return;
    this.headCoachName = localStorage.getItem(this.getCoachStorageKey(this.team_id)) || '';
  }

  private getCoachStorageKey(teamId: string): string {
    return `team_staff_head_coach_${teamId}`;
  }

  onMemberClick(member: TeamMember) {
    // Navigate to player profile with user_id as query param
    this.router.navigate(['player-profile' , member.user_id],   { state: {userId: member.user_id } }) ;
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}
