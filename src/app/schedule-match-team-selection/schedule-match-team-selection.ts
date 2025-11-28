import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TournamentService } from '../service/tournament.service';
import { AddTeam } from '../service/team/add-team';
import { ScheduleService } from '../service/schedule.service';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { NgModelProvideForms } from '@angular/forms';


interface Team {
  id: string;
  name: string;
  shortName: string;
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
  referee_name_one: string;
  referee_name_two: string;
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
  tournaments: any[] = [];
  form!: FormGroup;
  tournamentId: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tournamentService: TournamentService,
    private scheduleService: ScheduleService,
    private addTeamService: AddTeam,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
     const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string };
      this.tournamentId = state?.tournamentId || null;
  }

  ngOnInit(): void {
    this.buildForm();
    this.fetchTournaments();
    this.fetchTeams();
  }

  buildForm() {
    this.form = this.fb.group({
      tournament_name: [''],
      home_team: [null, Validators.required],
      away_team: [null, Validators.required],
      rounds: [''],
      match_type: ['', Validators.required],
      city: [''],
      venue: [''],
      match_date: [''],
      referee_name_one: [''],
      referee_name_two: [''],
      scorer_name: ['']
    });
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
      next: (data: any) => this.tournaments = data,
      error: (err: any) => console.error('Failed to load tournaments:', err)
    });
  }

  goToPreviousStep(): void {
    this.router.navigate(['/select-round']);
  }

  goToNextStep(): void {
    const vals = this.form.value;
    const home: Team = vals.home_team;
    const away: Team = vals.away_team;

    if (!home || !away || home.id === away.id) {
      alert('Select two different teams');
      return;
    }

    let tournamentName = vals.tournament_name;
    if (!tournamentName) {
      const found = this.tournaments.find((t: any) => t.tournament_id === this.tournamentId);
      if (found) tournamentName = found.tournament_name;
    }

    const body: ScheduleMatchRequest = {
      tournament_name: tournamentName,
      home_team_name: home.name,
      away_team_name: away.name,
      rounds: vals.rounds,
      match_type: vals.match_type,
      city: vals.city,
      venue: vals.venue,
      match_date: vals.match_date,
      referee_name_one: vals.referee_name_one,
      referee_name_two: vals.referee_name_two,
      scorer_name: vals.scorer_name
    };
    this.scheduleService.scheduleMatch(body).subscribe({
      next: (res: any) => {
        alert('Match scheduled successfully');
        this.router.navigate(['/match-details'], { state: { match: res.match } });
      },
      error: (err: any) => {
        console.error('Schedule error', err);
        alert('Unable to schedule match');
      }
    });
  }

}
