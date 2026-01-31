import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';
import { AddTeam } from '../service/team/add-team';

interface Team {
  _id: string;
  team_id: string;
  team_name: string;
  pool?: {
    name: string;
    type: string;
  };
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
    private poolService: PoolService,
    private cdr: ChangeDetectorRef
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
  // Helper method to convert string to title case
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  ngOnInit(): void {
    if (this.tournamentId) {
      this.teamService.getTeamsByTournamentId(this.tournamentId).subscribe({
        next: (teams: Team[]) => {
          this.pools = teams;
          if (this.isEditing && this.originalPool) {
            // Pre-select teams that are in the current pool
            this.selectedTeams = this.pools
              .map((team, index) => ({ team, index }))
              .filter(({ team }) => team.pool?.name === this.originalPool.name)
              .map(({ index }) => index);
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching teams:', error);
        }
      });
    }

      this.poolForm.get('pool_name')?.valueChanges.subscribe(value => {
      if (value) {
        const titleCased = this.toTitleCase(value);
        this.poolForm.get('pool_name')?.setValue(titleCased, { emitEvent: false });
      }
    });
  }

  toggleTeamSelection(index: number): void {
    const team = this.pools[index];
    if (this.isTeamInPool(team)) {
      return;
    }

    if (this.selectedTeams.includes(index)) {
      this.selectedTeams = this.selectedTeams.filter((i) => i !== index);
    } else {
      this.selectedTeams.push(index);
    }
  }

  savePool(): void {
    if (this.poolForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }
    if (this.selectedTeams.length < 2) {
      alert('Please select at least two teams for the pool.');
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
          this.router.navigate(['/group-list'], { state: { tournamentId: this.tournamentId } });;
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

  isTeamInPool(team: Team): boolean {
    return team.pool !== undefined && team.pool !== null && Object.keys(team.pool).length > 0 && (!this.isEditing || team.pool?.name !== this.originalPool?.name);
  }

  hasMinimumTeams(): boolean {
    return this.selectedTeams.length >= 2;
  }
}