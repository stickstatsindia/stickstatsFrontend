import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';
import { AddTeam } from '../service/team/add-team';

interface Team {
  _id: string;
  team_id: string;
  team_name: string;
}

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-group.html'
})
export class AddGroupComponent implements OnInit {

  selectedTeams: number[] = [];
  isEditing = false;
  originalPool: any = null;
  tournamentId: string | null = null;
  pools: Team[] = [];
  poolTypes = ['League', 'Knockout'];

  poolForm: FormGroup;

  constructor(
    private teamService: AddTeam,
    private fb: FormBuilder,
    private router: Router,
    private poolService: PoolService
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { pool?: any; tournamentId?: string };
    this.tournamentId = state?.tournamentId || null;

    this.poolForm = this.fb.group({
      pool_name: ['', [Validators.required]],
      pool_type: ['', [Validators.required]],
      tournament_id: [this.tournamentId, [Validators.required]]
    });

    if (state?.pool) {
      this.isEditing = true;
      this.originalPool = state.pool;
      this.poolForm.patchValue({
        pool_name: state.pool.name,
        pool_type: state.pool.type,
        tournament_id: this.tournamentId
      });
    }
  }

  ngOnInit(): void {
    if (this.tournamentId) {
      this.teamService.getTeamsByTournamentId(this.tournamentId).subscribe({
        next: (teams: Team[]) => {
          this.pools = teams;
          console.log('Fetched teams:', teams);

          if (this.isEditing && this.originalPool?.teams) {
            this.selectedTeams = this.pools
              .map((team: Team, index: number) =>
                this.originalPool.teams.some((t: any) => t.team_name === team.team_name) ? index : null
              )
              .filter((i): i is number => i !== null);
          }
        },
        error: (error) => {
          console.error('Error fetching teams:', error);
        }
      });
    }
  }

  toggleTeamSelection(index: number): void {
    if (this.selectedTeams.includes(index)) {
      this.selectedTeams = this.selectedTeams.filter((i) => i !== index);
    } else {
      this.selectedTeams.push(index);
    }
  }

  savePool(): void {
    if (this.poolForm.invalid || this.selectedTeams.length === 0) {
      alert('Please fill all fields and select at least one team.');
      return;
    }

    const selectedTeams = this.selectedTeams.map((i: number) => {
      const team = this.pools[i];
      return {
        team_id: team.team_id,
        team_name: team.team_name,
        _id: team._id
      };
    });

    const formData = {
      ...this.poolForm.value,
      teams: selectedTeams
    };

    // if (this.isEditing && this.originalPool) {
    //   this.poolService.updatePool(this.originalPool._id, formData).subscribe({
    //     next: (response: any) => {
    //       console.log('Pool updated successfully:', response);
    //       alert('Pool updated successfully!');
    //       this.router.navigate(['/group-list']);
    //     },
    //     error: (error: any) => {
    //       console.error('Error updating pool:', error);
    //       alert('Error updating pool. Please try again.');
    //     }
    //   });
    // } else {
      this.poolService.addPool(formData).subscribe({
        next: (response: any) => {
          console.log('Pool added successfully:', response);
          alert('Pool added successfully!');
          this.router.navigate(['/group-list']);
        },
        error: (error: any) => {
          console.error('Error adding pool:', error);
          alert('Error adding pool. Please try again.');
        }
      });
    // }
  }

  cancel(): void {
    this.router.navigate(['/group-list']);
  }
}