
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { PoolService } from '../service/pool/pool';

// @Component({
//   selector: 'app-add-pool',
//   imports: [CommonModule, FormsModule],
//   templateUrl: './add-group.html',
// })
// export class AddGroupComponent {
//   poolName = '';
//   selectedPoolType = '';
//   selectedTeams: number[] = []; // ✅ track multiple indexes

//   poolTypes = ['League', 'Knockout'];

//   pools = [
//     { initials: 'AB', name: 'Abbb', bg: 'bg-danger' },
//     { initials: 'AB', name: 'Abc', bg: 'bg-danger' },
//     { initials: 'AD', name: 'advvds', bg: 'bg-secondary' },
//     { initials: 'RC', name: 'RCB', bg: 'bg-primary' }
//   ];

//   constructor(private router: Router, private poolService: PoolService) {}

//   toggleTeamSelection(index: number) {
//     if (this.selectedTeams.includes(index)) {
//       this.selectedTeams = this.selectedTeams.filter(i => i !== index);
//     } else {
//       this.selectedTeams.push(index);
//     }
//   }

//   addPool() {
//     if (!this.poolName || !this.selectedPoolType || this.selectedTeams.length === 0) {
//       alert('Please fill all fields and select at least one team.');
//       return;
//     }

//     const selectedTeamNames = this.selectedTeams.map(i => this.pools[i].name);

//     const newPool = {
//       name: this.poolName,
//       type: this.selectedPoolType,
//       teams: selectedTeamNames
//     };

//     this.poolService.addPool(newPool);

//     alert('Pool added successfully!');
//     this.router.navigate(['/group-list']);
//   }

//   cancel() {
//     this.poolName = '';
//     this.selectedPoolType = '';
//     this.selectedTeams = [];
//   }

//   goBack() {
//     this.router.navigate(['/group-list']);
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-group.html',
})
export class AddGroupComponent {
  poolName = '';
  selectedPoolType = '';
  selectedTeams: number[] = [];
  isEditing = false;
  originalPool: any = null;

  poolTypes = ['League', 'Knockout'];

  pools = [
    { initials: 'AB', name: 'Abbb', bg: 'bg-danger' },
    { initials: 'AB', name: 'Abc', bg: 'bg-danger' },
    { initials: 'AD', name: 'advvds', bg: 'bg-secondary' },
    { initials: 'RC', name: 'RCB', bg: 'bg-primary' },
  ];

  constructor(private router: Router, private poolService: PoolService) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { pool?: any };

    if (state?.pool) {
      this.isEditing = true;
      this.originalPool = state.pool;
      this.poolName = state.pool.name;
      this.selectedPoolType = state.pool.type;
      this.selectedTeams = this.pools
        .map((p, i) => (state.pool.teams.includes(p.name) ? i : null))
        .filter((i) => i !== null) as number[];
    }
  }

  toggleTeamSelection(index: number) {
    if (this.selectedTeams.includes(index)) {
      this.selectedTeams = this.selectedTeams.filter((i) => i !== index);
    } else {
      this.selectedTeams.push(index);
    }
  }

  savePool() {
    if (!this.poolName || !this.selectedPoolType || this.selectedTeams.length === 0) {
      alert('Please fill all fields and select at least one team.');
      return;
    }

    const selectedTeamNames = this.selectedTeams.map((i) => this.pools[i].name);

    const newPool = {
      name: this.poolName,
      type: this.selectedPoolType,
      teams: selectedTeamNames,
    };

    if (this.isEditing) {
      this.poolService.updatePool(this.originalPool, newPool);
      alert('Pool updated successfully!');
    } else {
      this.poolService.addPool(newPool);
      alert('Pool added successfully!');
    }

    this.router.navigate(['/group-list']);
  }

  cancel() {
    this.router.navigate(['/group-list']);
  }
}
