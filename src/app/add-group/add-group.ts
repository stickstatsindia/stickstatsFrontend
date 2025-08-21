import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PoolService } from '../service/pool/pool';

@Component({
  selector: 'app-add-pool',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-group.html',
})
export class AddGroupComponent {
  poolName = '';
  selectedPoolType = '';
  selectedPoolIndex: number | null = null;

  poolTypes = ['League', 'Knockout'];

  pools = [
    { initials: 'AB', name: 'Abbb', bg: 'bg-danger' },
    { initials: 'AB', name: 'Abc', bg: 'bg-danger' },
    { initials: 'AD', name: 'advvds', bg: 'bg-secondary' },
    { initials: 'RC', name: 'RCB', bg: 'bg-primary' }
  ];

  constructor(private location: Location, private poolService: PoolService) {}

  selectPool(index: number) {
    this.selectedPoolIndex = index;
  }

  addPool() {
  if (!this.poolName || !this.selectedPoolType || this.selectedPoolIndex === null) {
    alert('Please fill all fields and select a team.');
    return;
  }

  const selectedTeam = this.pools[this.selectedPoolIndex];

  const newPool = {
    name: this.poolName,
    type: this.selectedPoolType,
    teams: [selectedTeam.name]
  };

  this.poolService.addPool(newPool);

  alert('Pool added successfully!');
  this.goBack(); // still works
}


  cancel() {
    this.poolName = '';
    this.selectedPoolType = '';
    this.selectedPoolIndex = null;
  }

  goBack() {
    this.location.back();
  }
}
