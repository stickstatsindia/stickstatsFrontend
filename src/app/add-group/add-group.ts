// import { Component } from '@angular/core';
// import { CommonModule, Location } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-add-group',
//   imports: [CommonModule,FormsModule],
//   templateUrl: './add-group.html',
// })
// export class AddGroupComponent {
//   groupName = '';
//   selectedGroupType = '';
//   selectedGroupIndex: number | null = null;

//   groupTypes = ['Group Stage', 'Knockout', 'Quarter Final', 'Semi Final'];

//   groups = [
//     { initials: 'AB', name: 'Abbb', bg: 'bg-danger' },
//     { initials: 'AB', name: 'Abc', bg: 'bg-danger' },
//     { initials: 'AD', name: 'advvds', bg: 'bg-secondary' },
//     { initials: 'RC', name: 'RCB', bg: 'bg-primary' }
//   ];

//   constructor(private location: Location) {}

//   selectGroup(index: number) {
//     this.selectedGroupIndex = index;
//   }

//   addGroup() {
//     if (!this.groupName || !this.selectedGroupType || this.selectedGroupIndex === null) {
//       alert('Please fill all fields and select a team.');
//       return;
//     }
//     // Add group logic here (e.g., send data to backend)
//     console.log('Group Added:', {
//       name: this.groupName,
//       type: this.selectedGroupType,
//       team: this.selectedGroupIndex,
//     });
//     alert('Group added successfully!');
//   }

//   cancel() {
//     this.groupName = '';
//     this.selectedGroupType = '';
//     this.selectedGroupIndex = null;
//   }

//   goBack() {
//     this.location.back();
//   }
// }
import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-group',
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

  constructor(private location: Location) {}

 selectPool(index: number) {
  this.selectedPoolIndex = index;
  console.log("Selected pool/team index:", index, this.pools[index]);
}

  addPool() {
    if (!this.poolName || !this.selectedPoolType || this.selectedPoolIndex === null) {
      alert('Please fill all fields and select a team.');
      return;
    }
    // Add pool logic here (e.g., send data to backend)
    console.log('Pool Added:', {
      name: this.poolName,
      type: this.selectedPoolType,
      team: this.selectedPoolIndex,
    });
    alert('Pool added successfully!');
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
