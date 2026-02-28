import { CommonModule } from '@angular/common';
import { TournamentService } from '../service/tournament.service';
import { AddTeam } from '../service/team/add-team';
import { ScheduleService } from '../service/schedule.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { MembersService } from '../service/members/members-service';
// import { NgModelProvideForms } from '@angular/forms';


interface Team {
  id: string;
  name: string;
  shortName: string;
}

interface TournamentInfo {
  tournament_id?: string;
  _id?: string;
  id?: string;
  tournament_name?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
}

interface ScheduleMatchRequest {
  tournament_name: string;
  home_team_name: string;
  away_team_name: string;
  rounds: string;
  match_type: string;
  city: string;
  venue: string;
  match_date: string;
  scorer_name: string;
}

@Component({
  selector: 'app-schedule-match-team-selection',
   standalone: true, // ✅ very important
  // imports: [  NgModel], // ✅ include CommonModule here/
  imports: [ReactiveFormsModule, CommonModule], // use reactive forms
  templateUrl: './schedule-match-team-selection.html',
  styleUrl: './schedule-match-team-selection.css'
})
export class ScheduleMatchTeamSelection {

   teams: Team[] = [];
  tournaments: TournamentInfo[] = [];
  form!: FormGroup;
  tournamentId: string | null = null;
  resolvedTournamentName: string | null = null;
  tournamentStartDate: Date | null = null;
  tournamentEndDate: Date | null = null;
  team1Members: any[] = [];
  team2Members: any[] = [];
  // members are fetched and managed internally, no UI flags required

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private scheduleService: ScheduleService,
    private addTeamService: AddTeam,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private membersService: MembersService
  ) {
     const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string };
      this.tournamentId = state?.tournamentId || null;
  }

  setupTeamSelectionListeners() {
    const homeCtrl = this.form.controls['home_team'];
    const awayCtrl = this.form.controls['away_team'];

    homeCtrl.valueChanges.subscribe((team: any) => {
      const awayTeam = awayCtrl.value;
      if (team && awayTeam && team.id === awayTeam.id) {
        awayCtrl.setValue(null);
      }

      if (team && team.id) {
        this.loadTeam1Members(team.id);
      } else {
        this.team1Members = [];
      }
    });

    awayCtrl.valueChanges.subscribe((team: any) => {
      const homeTeam = homeCtrl.value;
      if (team && homeTeam && team.id === homeTeam.id) {
        homeCtrl.setValue(null);
      }

      if (team && team.id) {
        this.loadTeam2Members(team.id);
      } else {
        this.team2Members = [];
      }
    });
  }

  loadTeam1Members(teamId: string) {
    this.membersService.getMembers(teamId).subscribe({
      next: (members: any[]) => {
        this.team1Members = members || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load team1 members', err);
      }
    });
  }

  loadTeam2Members(teamId: string) {
    this.membersService.getMembers(teamId).subscribe({
      next: (members: any[]) => {
        this.team2Members = members || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load team2 members', err);
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
    this.fetchTournaments();
    this.fetchTeams();
    this.setupTeamSelectionListeners();
  }

  buildForm() {
    this.form = this.fb.group({
      tournament_name: [''],
      home_team: [null, Validators.required],
      away_team: [null, Validators.required],
      venue: ['', Validators.required],
      match_date: ['', [Validators.required, this.futureDateValidator(), this.tournamentDateRangeValidator()]],
      match_time: ['', Validators.required],
      // team member textareas removed; members are fetched from API
    }, { validators: this.differentTeamsValidator() });
  }

  get availableHomeTeams(): Team[] {
    const awayTeam = this.form?.controls['away_team']?.value;
    if (!awayTeam?.id) return this.teams;
    return this.teams.filter((team) => team.id !== awayTeam.id);
  }

  get availableAwayTeams(): Team[] {
    const homeTeam = this.form?.controls['home_team']?.value;
    if (!homeTeam?.id) return this.teams;
    return this.teams.filter((team) => team.id !== homeTeam.id);
  }

  private differentTeamsValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const home = control.get('home_team')?.value;
      const away = control.get('away_team')?.value;

      if (!home || !away) return null;
      return home.id === away.id ? { sameTeams: true } : null;
    };
  }

  private parseDateOnly(dateValue: string | null | undefined): Date | null {
    if (!dateValue) return null;
    const dateOnly = dateValue.split('T')[0];
    if (!dateOnly) return null;
    const parsed = new Date(`${dateOnly}T00:00:00`);
    if (isNaN(parsed.getTime())) return null;
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  // If tournament dates are available, range validator handles the rule (inclusive).
  // Otherwise, do not allow past dates.
  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      // Normalize dates to midnight so time parts don't affect comparison
      const input = this.parseDateOnly(val);
      if (!input) return { invalidDate: true };

      if (this.tournamentStartDate && this.tournamentEndDate) {
        return null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return input >= today ? null : { notFuture: true };
    };
  }

  private tournamentDateRangeValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val || !this.tournamentStartDate || !this.tournamentEndDate) return null;

      const input = this.parseDateOnly(val);
      if (!input) return { invalidDate: true };

      return input >= this.tournamentStartDate && input <= this.tournamentEndDate
        ? null
        : { outsideTournamentDates: true };
    };
  }


  fetchTeams(): void {
    const id = this.tournamentId;
    if (id) {
      this.addTeamService.getTeamsByTournamentId(id).subscribe({
        next: (data: any) => {
          if (Array.isArray(data)) {
            this.teams = data.map((t: any) => ({
              id: t.team_id || t._id || t.id || '',
              name: t.team_name || t.teamName || t.name || '',
              shortName: t.shortName || ''
            }));
             this.cdr.detectChanges();
          } else {
            console.warn('Unexpected teams payload', data);
            this.teams = [];
          }
        },
        error: (err: any) => console.error('Failed to load teams for tournament:', err)
      });
    } else {
      console.warn('No tournamentId; teams not fetched');
      this.teams = [];
    }
  }

  fetchTournaments(): void {
    this.tournamentService.getTournaments().subscribe({
      next: (data: TournamentInfo[]) => {
        this.tournaments = data || [];
        // if a tournamentId was passed, resolve its name early so submit doesn't race with async fetch
        if (this.tournamentId) {
          const found = this.tournaments.find((t: TournamentInfo) => t.tournament_id === this.tournamentId || t._id === this.tournamentId || t.id === this.tournamentId);
          if (found) {
            this.resolvedTournamentName = found.tournament_name || found.name || '';
            this.tournamentStartDate = this.parseDateOnly(found.start_date);
            this.tournamentEndDate = this.parseDateOnly(found.end_date);
            // populate form control so users see it (and submit will use it)
            if (this.form && this.form.controls['tournament_name']) {
              this.form.controls['tournament_name'].setValue(this.resolvedTournamentName);
            }
            // re-run match_date validator once tournament dates are available
            this.form.controls['match_date']?.updateValueAndValidity();
          }
        }
      },
      error: (err: any) => console.error('Failed to load tournaments:', err)
    });
  }

  goToPreviousStep(): void {
    this.router.navigate(['/matches', { state: { tournamentId: this.tournamentId } }]);
  }

  goToNextStep(): void {
    const vals = this.form.value;
    const home: Team = vals.home_team;
    const away: Team = vals.away_team;

    if (!home || !away || home.id === away.id) {
      alert('Select two different teams');
      return;
    }

    // prefer pre-resolved tournament name (set after tournaments load), fall back to form value or lookup
    let tournamentName = this.resolvedTournamentName || vals.tournament_name;
    if (!tournamentName) {
      const found = this.tournaments.find((t: TournamentInfo) => t.tournament_id === this.tournamentId || t._id === this.tournamentId || t.id === this.tournamentId);
      if (found) tournamentName = found.tournament_name || found.name;
    }

    if (!tournamentName) {
      alert('Tournament name not found');
      return;
    }

    // parse player lists (newline or comma separated)
    const parsePlayers = (raw: string) => raw ? raw.split(/\r?\n|,/) .map((s: string) => s.trim()).filter(Boolean) : [];

    // Validate match_date control explicitly (to produce a clear alert if invalid)
    const dateCtrl = this.form.controls['match_date'];
    if (dateCtrl.invalid) {
      if (dateCtrl.hasError('required')) {
        alert('Match date is required');
      } else if (dateCtrl.hasError('outsideTournamentDates')) {
        alert('Match date must be within the official tournament dates');
      } else if (dateCtrl.hasError('notFuture')) {
        alert('Match date cannot be in the past');
      } else {
        alert('Match date is invalid');
      }
      return;
    }

    const liveBody = {
      team1_name: home.name,
      team2_name: away.name,
      venue: vals.venue,
      match_date: vals.match_date,
      match_time: vals.match_time,
      team1_players: this.team1Members.map(m => (m.name || m.user_id || '').toString()),
      team2_players: this.team2Members.map(m => (m.name || m.user_id || '').toString())
    };

    this.scheduleService.addMatchLive(tournamentName, liveBody).subscribe({
      next: (res: any) => {
        alert('Live match scheduled successfully');
        this.router.navigate(['/matches'], { state: { tournamentId: this.tournamentId } });
      },
      error: (err: any) => {
        console.error('Schedule error', err);
        alert('Unable to schedule live match');
      }
    });
  }

}
