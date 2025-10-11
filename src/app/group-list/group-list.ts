import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';

interface Team {
  team_id: string;
  team_name: string;
}

interface Pool {
  name: string;
  type: string;
  teams: Team[];
}

interface TournamentPools {
  tournament_id: string;
  pools: Pool[];
  all_teams: Array<Team & { pool: { name?: string; type?: string } }>;
}

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-list.html',
})
export class GroupListComponent implements OnInit {
  pools: Pool[] = [];
  allTeams: Array<Team & { pool: { name?: string; type?: string } }> = [];
  rowsPerPage = 5;
  tournamentId: string = '';
  isLoading = false;
  error: string | null = null;

  constructor(
    private poolService: PoolService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
     const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { pool?: any; tournamentId?: string };
    this.tournamentId = state?.tournamentId || '';
  }

  ngOnInit() {
    this.loadPools();
    this.cdr.detectChanges();
  }

  private loadPools() {
    this.isLoading = true;
    this.error = null;

    this.poolService.getPoolsByTournamentId(this.tournamentId).subscribe({
      next: (response: TournamentPools) => {
        this.pools = response.pools;
        this.allTeams = response.all_teams;
        this.cdr.detectChanges();
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.error = 'Failed to load pools. Please try again.';
        this.isLoading = false;
        console.error('Error loading pools:', error);
      }
    });
  }

  addNewGroup() {
    this.router.navigate(['/add-group'], { 
      state: { tournamentId: this.tournamentId } 
    });
  }

  editGroup(pool: Pool) {
    this.router.navigate(['/add-group'], { 
      state: { 
        pool,
        tournamentId: this.tournamentId 
      } 
    });
  }

  deleteGroup(pool: Pool) {
    if (confirm(`Delete pool "${pool.name}"?`)) {
      this.isLoading = true;
      this.poolService.deletePool(pool.name).subscribe({
        next: () => {
          this.loadPools();
          this.isLoading = false;
        },
        error: (error: Error) => {
          alert('Failed to delete pool. Please try again.');
          this.isLoading = false;
          console.error('Error deleting pool:', error);
        }
      });
    }
  }
}