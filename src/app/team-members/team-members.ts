import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MembersService } from '../service/members/members-service';
import { AddTeam } from '../service/team/add-team';

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
  teamName = '';
  teamHasStartedMatch = false;
  isLoading = false;
  error: string | null = null;
  showHeadCoachForm = false;
  headCoachName = '';
  headCoachInput = '';
  coachError: string | null = null;

  constructor(
    private memberService: MembersService,
    private teamService: AddTeam,
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
      this.loadTeamIdentityAndMatchLock();
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
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load team members';
        this.isLoading = false;
      }
    });
  }

  onAddPlayer() {
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

  onRemoveMember(event: MouseEvent, member: TeamMember): void {
    event.stopPropagation();

    if (!this.team_id) return;

    if (this.teamHasStartedMatch) {
      alert('Player removal is locked because this team has started a match.');
      return;
    }

    if (!confirm(`Remove "${member.name}" from this team?`)) return;

    this.memberService.removeMember(this.team_id, member).subscribe({
      next: () => {
        this.teamMembers = this.teamMembers.filter((m) => {
          if (member._id && m._id) return m._id !== member._id;
          return m.user_id !== member.user_id;
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to remove team member', err);
        if (err?.status === 404) {
          alert('Remove API route not found on backend (404). Please add member delete endpoint in server.');
          return;
        }
        const backendMessage =
          err?.error?.error ||
          err?.error?.message ||
          err?.message ||
          'Please try again.';
        alert(`Failed to remove player. ${backendMessage}`);
      }
    });
  }

  onMemberClick(member: TeamMember) {
    this.router.navigate(['player-profile', member.user_id], { state: { userId: member.user_id } });
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ').filter((part) => part.length > 0);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }

  get canRemovePlayers(): boolean {
    return !this.teamHasStartedMatch;
  }

  private loadHeadCoachName(): void {
    if (!this.team_id) return;
    this.headCoachName = localStorage.getItem(this.getCoachStorageKey(this.team_id)) || '';
  }

  private getCoachStorageKey(teamId: string): string {
    return `team_staff_head_coach_${teamId}`;
  }

  private loadTeamIdentityAndMatchLock(): void {
    if (!this.team_id) return;

    this.teamService.getTeamById(this.team_id).subscribe({
      next: (team: any) => {
        this.teamName = this.normalizeValue(team?.team_name || team?.name || '');
        this.evaluateTeamMatchLock();
      },
      error: () => {
        this.teamName = '';
        this.evaluateTeamMatchLock();
      }
    });
  }

  private evaluateTeamMatchLock(): void {
    if (!this.team_id) return;

    this.memberService.getAllMatches().subscribe({
      next: (matches: any) => {
        const list = Array.isArray(matches) ? matches : [];
        this.teamHasStartedMatch = list.some((match) => this.isTeamInStartedMatch(match));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to evaluate team match lock state', err);
      }
    });
  }

  private isTeamInStartedMatch(match: any): boolean {
    if (!this.isStartedMatch(match)) return false;

    const normalizedTeamId = this.normalizeValue(this.team_id);
    const normalizedTeamName = this.normalizeValue(this.teamName);

    const matchTeamIds = [
      match?.home_team_id,
      match?.away_team_id,
      match?.team1_id,
      match?.team2_id
    ].map((value: any) => this.normalizeValue(value));

    const matchTeamNames = [
      match?.home_team_name,
      match?.away_team_name,
      match?.team1_name,
      match?.team2_name,
      match?.team1,
      match?.team2,
      match?.homeTeamName,
      match?.awayTeamName
    ].map((value: any) => this.normalizeValue(value));

    const idMatched = !!normalizedTeamId && matchTeamIds.includes(normalizedTeamId);
    const nameMatched = !!normalizedTeamName && matchTeamNames.includes(normalizedTeamName);
    return idMatched || nameMatched;
  }

  private isStartedMatch(match: any): boolean {
    const status = this.normalizeValue(match?.status || match?.match_status);
    if (status.includes('live') || status.includes('progress') || status.includes('finish') || status.includes('complete')) {
      return true;
    }
    if (status.includes('upcoming') || status.includes('schedule') || status.includes('pending') || status.includes('cancel')) {
      return false;
    }

    const homeScore = Number(match?.home_score ?? match?.team1_score ?? match?.homeScore ?? match?.team1Score);
    const awayScore = Number(match?.away_score ?? match?.team2_score ?? match?.awayScore ?? match?.team2Score);
    return Number.isFinite(homeScore) && Number.isFinite(awayScore) && (homeScore > 0 || awayScore > 0);
  }

  private normalizeValue(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }
}
