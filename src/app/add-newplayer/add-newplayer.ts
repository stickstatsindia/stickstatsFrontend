import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MembersService } from '../service/members/members-service';
import { TournamentService } from '../service/tournament/tournament';
import { Router } from '@angular/router';
import { AddTeam } from '../service/team/add-team';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-newplayer',
  templateUrl: './add-newplayer.html',
  styleUrls: ['./add-newplayer.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AddNewplayerComponent {
  // Remove other tabs and just keep phone number entry
  selectedTab = 0; // Since we only have one tab now
  playerForm: FormGroup;
  team_id: string | null = null;
  tournamentId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(
    private fb: FormBuilder,
    private memeberService: MembersService,
    private tournamentService: TournamentService,
    private teamService: AddTeam,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    console.log('Navigation State:', nav?.extras.state);
    const state = nav?.extras.state as { teamId?: string; tournamentId?: string };
    console.log('Extracted State:', state);
    this.team_id = state?.teamId || null;
    this.tournamentId = state?.tournamentId || null;
    this.playerForm = this.fb.group({
      playerName: ['', Validators.required],
      phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    // Listen for phone number changes to auto-fetch player name
    this.playerForm.get('phone_number')?.valueChanges.subscribe(() => {
      this.fetchPlayerByPhone();
    });
  }

  selectTab(idx: number) {
    this.selectedTab = idx;
  }

  // Fetch player name when phone entered
  fetchPlayerByPhone(): void {
    const phone = this.playerForm.get('phone_number')?.value;
    if (!phone || this.playerForm.get('phone_number')?.invalid) {
      this.errorMessage = null;
      this.successMessage = null;
      this.messageType = null;
      return;
    }

    this.tournamentService.getUserByPhone(phone).subscribe({
      next: (user: any) => {
        console.log("✅ User found:", user);
        const playerName = user.full_name || user.name || '';
        this.playerForm.patchValue({ playerName: playerName });
        this.errorMessage = null;
      },
      error: () => {
        console.error("❌ No user found with phone:", phone);
        this.errorMessage = "No user found with this phone number. User must register first!";
        this.successMessage = null;
        this.messageType = 'error';
        this.playerForm.patchValue({ playerName: '' });
      }
    });
  }

  teamtId:string=""; // Example team ID
  addTeam() {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    if (!this.team_id) {
      this.errorMessage = 'Team not found. Please reopen from team list.';
      this.successMessage = null;
      this.messageType = 'error';
      return;
    }

    const phone = this.normalizePhone(this.playerForm.get('phone_number')?.value);
    if (!phone) {
      this.errorMessage = 'Valid phone number is required.';
      this.successMessage = null;
      this.messageType = 'error';
      return;
    }

    this.playerAlreadyInTournament(phone).subscribe({
      next: (alreadyExists: boolean) => {
        if (alreadyExists) {
          this.errorMessage = 'This player is already added in another team of this tournament.';
          this.successMessage = null;
          this.messageType = 'error';
          return;
        }

        const teamData = {
          ...this.playerForm.value,
          teamId: this.team_id
        };
        this.memeberService.addMember(teamData).subscribe({
          next: (response: any) => {
            console.log('Player added successfully:', response);
            this.successMessage = response.message || 'Player added successfully!';
            this.errorMessage = null;
            this.messageType = 'success';

            setTimeout(() => {
              this.router.navigate(['/team-members'], { state: { teamId: this.team_id } });
            }, 2000);
          },
          error: (err: any) => {
            console.error('Error adding player:', err);
            this.errorMessage = err.error?.error || 'Error adding player. Please try again.';
            this.successMessage = null;
            this.messageType = 'error';
          }
        });
      },
      error: (err) => {
        console.error('Error validating player assignment:', err);
        this.errorMessage = 'Unable to validate player assignment. Please try again.';
        this.successMessage = null;
        this.messageType = 'error';
      }
    });
  }

  private playerAlreadyInTournament(phone: string): Observable<boolean> {
    if (!this.team_id) return of(false);

    const tournamentId$ = this.tournamentId
      ? of(this.tournamentId)
      : this.teamService.getTeamById(this.team_id).pipe(
          map((team: any) => team?.tournament_id || team?.tournamentId || null),
          catchError(() => of(null))
        );

    return tournamentId$.pipe(
      switchMap((tournamentId: string | null) => {
        if (!tournamentId) return of(false);
        this.tournamentId = tournamentId;
        return this.teamService.getTeamsByTournamentId(tournamentId).pipe(
          switchMap((teams: any[]) => {
            const list = Array.isArray(teams) ? teams : [];
            if (!list.length) return of(false);

            const memberChecks = list.map((team: any) => {
              const id = team?.team_id || team?._id || team?.id;
              if (!id) return of(false);

              return this.memeberService.getMembers(id).pipe(
                map((resp: any) => {
                  const members = this.extractMembers(resp);
                  return members.some((m: any) => this.normalizePhone(m?.phone_number) === phone);
                }),
                catchError(() => of(false))
              );
            });

            return forkJoin(memberChecks).pipe(
              map((exists: boolean[]) => exists.some(Boolean))
            );
          }),
          catchError(() => of(false))
        );
      })
    );
  }

  private extractMembers(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.players)) return response.players;
    return [];
  }

  private normalizePhone(value: any): string {
    return String(value || '').replace(/\D/g, '');
  }
}

