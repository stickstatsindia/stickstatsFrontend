import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
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
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private poolService = inject(PoolService);
  private teamService = inject(AddTeam);

  poolForm = this.fb.group({
    pool_name: ['', [Validators.required]],
    pool_type: ['', [Validators.required]],
    tournament_id: [null as string | null]
  });

  selectedTeams: number[] = [];
  isEditing = false;
  originalPool: any = null;
  tournamentId: string | null = null;

  poolTypes = ['League', 'Knockout'];
  pools: Team[] = [];

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { pool?: any };
    const state1 = nav?.extras.state as { tournamentId?: string };
    this.tournamentId = state1?.tournamentId || null;

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
              .map((p: Team, i: number) => this.originalPool.teams.includes(p.team_name) ? i : null)
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
      this.selectedTeams = this.selectedTeams.filter((i: number) => i !== index);
    } else {
      this.selectedTeams = [...this.selectedTeams, index];
    }
  }

  savePool(): void {
    if (this.poolForm.invalid || !this.selectedTeams.length) {
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

    if (this.isEditing && this.originalPool) {
      this.poolService.updatePool(this.originalPool._id, formData).subscribe({
        next: (response: any) => {
          console.log('Pool updated successfully:', response);
          alert('Pool updated successfully!');
          this.router.navigate(['/group-list']);
        },
        error: (error: any) => {
          console.error('Error updating pool:', error);
          alert('Error updating pool. Please try again.');
        }
      });
    } else {
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
    }
  }

  cancel(): void {
    this.router.navigate(['/group-list']);
  }
}